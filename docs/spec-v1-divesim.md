# Spec V1 — Simulateur pédagogique d'ordinateur de plongée

> **Nom de travail :** DiveSim (à renommer)
> **Cible :** moniteurs FFESSM enseignant aux N1/N2/N3
> **Public secondaire :** élèves en révision

---

## 1. Vision

Un outil web qui permet à un moniteur de plongée de **rejouer une plongée virtuelle devant ses élèves**, avec un écran d'ordinateur de plongée fidèle qui évolue en temps réel (ou accéléré), pour enseigner la lecture des paramètres et les procédures de sécurité — ce qui est aujourd'hui impossible à sec.

**Différenciation vs e-Plouf** (le concurrent direct) :
- 100% web (pas d'Excel) → tout device, zéro install, partageable par URL
- Skins d'ordis fidèles aux vrais modèles
- UX moderne, prête pour vidéoprojection en classe

---

## 2. Périmètre V1

### Inclus

- **1 ordinateur simulé** : Suunto Zoop Novo (le plus répandu en formation FR)
- **Édition de profils** : descente / palier / remontée segmentés
- **Moteur de décompression** : Bühlmann ZH-L16C + Gradient Factors
- **Lecture temporelle** : play/pause, vitesse ×1 / ×10 / ×60 / ×300, timeline scrubbable
- **Bibliothèque de scénarios pédagogiques** prédéfinis (4-5)
- **Événements injectables** pendant la simulation : essoufflement, panne d'air, remontée rapide
- **Persistance locale** des profils (localStorage)
- **Import/export JSON** des profils (pour partage entre moniteurs)
- **Mode présentation** plein écran pour vidéoprojection

### Hors scope V1 (V2+)

- Autres ordis (Mares Puck, Aqualung, Shearwater, Cressi)
- Modèle RGBM exact
- Air intégré / transmetteur de pression
- Trimix, multi-gaz pendant la plongée
- Mode quiz / évaluation élève
- Mode multi-écrans (comparer 2 ordis simultanément)
- Compte utilisateur / synchro cloud
- PWA / wrapper Android
- Internationalisation (FR uniquement en V1)

---

## 3. Personas et cas d'usage

### Persona 1 — Le moniteur en préparation de cours

> *« Je veux préparer une démo qui montre ce qui se passe quand un élève fait une remontée rapide à 25 min de fond à 25 m. »*

**Parcours :**
1. Ouvre l'app
2. Clique "Nouveau profil"
3. Édite : descente à 25 m en 2 min, fond 25 min, remontée
4. Ajoute un événement "remontée rapide" à T+25 min
5. Sauvegarde sous le nom "Démo remontée rapide N2"
6. Lance la simulation pour vérifier
7. Ferme l'app

### Persona 2 — Le moniteur en classe

> *« Je suis devant 6 élèves, vidéoprojecteur branché, je veux leur montrer 3 scénarios et les faire commenter l'écran. »*

**Parcours :**
1. Ouvre l'app, charge le profil préparé
2. Active "mode présentation" (plein écran, écran de l'ordi grossi, contrôles minimalistes)
3. Lance la simulation à ×60
4. Met en pause aux moments clés pour questionner les élèves
5. Recule la timeline pour rejouer un passage

### Persona 3 — L'élève en révision (V2 mais à anticiper)

Pas implémenté en V1 — mais l'archi doit le permettre.

---

## 4. Spécifications fonctionnelles

### 4.1 Modèle de données : le profil de plongée

Un **profil** est une séquence de **segments** + des **paramètres globaux** + des **événements**.

```typescript
type DiveProfile = {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;

  // Paramètres globaux
  gas: { o2Fraction: number };  // 0.21 pour air, 0.32 pour Nx32, etc.
  surfacePressure: number;       // bar, défaut 1.013
  startingTankPressure: number;  // bar, défaut 200
  tankVolume: number;            // L, défaut 12
  sac: number;                   // L/min en surface, défaut 20

  // Plongée précédente (pour successive)
  previousDive?: {
    surfaceIntervalMinutes: number;  // depuis la fin de la précédente
    finalCompartments: number[];     // 16 valeurs N2 finales
  };

  // Profil temporel
  segments: DiveSegment[];
  events: DiveEvent[];

  // Réglages moteur
  gradientFactors: { low: number; high: number };  // ex: { low: 30, high: 85 }
};

type DiveSegment =
  | { type: "descent";  toDepth: number; durationSec: number }
  | { type: "constant"; depth: number;   durationSec: number }
  | { type: "ascent";   toDepth: number; durationSec: number };

type DiveEvent = {
  id: string;
  triggerAtSec: number;       // timestamp dans la plongée
  type: "panic" | "ooa" | "rapid_ascent" | "skip_stop" | "sac_change";
  params?: Record<string, any>;  // ex: { newSac: 35 } pour essoufflement
};
```

### 4.2 Moteur de simulation

**Responsabilité :** prendre un `DiveProfile` et produire, pour n'importe quel instant `t`, un `DiveState` complet.

```typescript
type DiveState = {
  timeSec: number;              // temps depuis le début de la plongée
  depth: number;                // m
  maxDepth: number;             // m, depuis le début
  ascentRate: number;           // m/min (négatif si descente)
  tankPressure: number;         // bar
  waterTemp: number;            // °C, V1 = constant
  gas: { o2Fraction: number };

  // Décompression
  compartments: number[];        // 16 valeurs N2 en bar
  ndlMinutes: number | null;     // null si en obligation de palier
  ceilingDepth: number;          // profondeur min autorisée (m)
  decoStops: { depth: number; durationSec: number }[];
  totalAscentTimeSec: number;    // DTR

  // États
  inDecompression: boolean;
  ascentRateAlarm: "ok" | "warning" | "danger";
  isPostDive: boolean;           // si remonté en surface
  noFlyTimeMinutes: number;      // après plongée
  desaturationTimeMinutes: number;

  // GPS / azote résiduel (post-dive uniquement)
  gpsLetter?: string;            // A, B, C... pour comparaison MN90
};
```

**Architecture du moteur :**

- `engine/buhlmann.ts` : algo pur, pas de notion de temps. Méthodes : `updateCompartments(state, deltaTimeSec, ambientPressure, fN2)`, `computeNDL(compartments, fN2, gf)`, `computeCeiling(compartments, gf)`, `computeFirstStop(compartments, gf)`.
- `engine/profile.ts` : utilitaires sur `DiveProfile` (durée totale, profondeur max théorique, etc.).
- `engine/simulator.ts` : la classe `Simulator` qui maintient l'état au fil du temps.
- `engine/events.ts` : applique les événements au state au bon moment.

**Le moteur ne sait rien du DOM, de React, ni du temps réel.** Il est interrogeable à n'importe quel `t`. C'est le composant React qui orchestre l'horloge.

**Constantes Bühlmann ZH-L16C (à mettre dans `engine/constants.ts`) :**

```typescript
// Demi-vies N2 (minutes) pour les 16 compartiments
export const N2_HALFTIMES = [4.0, 8.0, 12.5, 18.5, 27.0, 38.3, 54.3, 77.0,
                              109.0, 146.0, 187.0, 239.0, 305.0, 390.0, 498.0, 635.0];

// Coefficients a (bar)
export const N2_A = [1.2599, 1.0000, 0.8618, 0.7562, 0.6200, 0.5043, 0.4410, 0.4000,
                     0.3750, 0.3500, 0.3295, 0.3065, 0.2835, 0.2610, 0.2480, 0.2327];

// Coefficients b
export const N2_B = [0.5050, 0.6514, 0.7222, 0.7825, 0.8126, 0.8434, 0.8693, 0.8910,
                     0.9092, 0.9222, 0.9319, 0.9403, 0.9477, 0.9544, 0.9602, 0.9653];

export const PH2O = 0.0627;  // bar, pression vapeur d'eau dans les poumons
export const WATER_DENSITY = 10;  // 1 m d'eau = 0.1 bar (eau salée 1.025 ≈ 10 m/bar approx)
```

**Formule de mise à jour d'un compartiment (Schreiner pour profondeur variable, Haldane pour profondeur constante) :**

Pour profondeur constante (Haldane) :
```
k = ln(2) / halftime
P_new = P_inspired + (P_old - P_inspired) * exp(-k * dt)
```

Avec `P_inspired = (P_ambient - PH2O) * fN2`.

Pour profondeur variable (Schreiner — formule légèrement plus complexe) : utiliser de petits pas de temps (1 sec) et appliquer Haldane à chaque pas. Approximation tout à fait acceptable pour un usage pédagogique.

**M-value avec gradient factors :**
```
M_surface = a + (1.0 / b)  // pression tolérée en surface
M_at_depth = a + (P_ambient / b)
P_max_tolerated = P_ambient + GF * (M_at_depth - P_ambient)
```

**NDL :** dichotomie ou itération — combien de minutes peut-on rester à la profondeur courante avant que `max(P_compartment) > M_surface_with_GF_high` ?

### 4.3 Visualisation : skin Suunto Zoop Novo

**Composant :** `<DiveComputerScreen model="zoop-novo" state={DiveState} />`

**Responsabilité :** afficher l'état courant à la manière d'un Zoop Novo.

**Modes d'affichage** (selon le `DiveState`) :
- **Mode surface (avant plongée)** : heure, "DIVE", température, batterie
- **Mode plongée OK (en NDL)** : profondeur, NDL, durée, max, temp, vitesse remontée
- **Mode plongée en obligation de palier** : profondeur, "STOP" + profondeur palier, durée palier, DTR, durée
- **Mode alarme remontée rapide** : "SLOW" clignotant + indicateur vitesse
- **Mode post-plongée (surface)** : heure de sortie, intervalle surface, désat, no-fly, GPS letter

**Implémentation :**
- SVG inline dans React (pas d'image)
- Polices LCD : utiliser **DSEG7Modern-Bold** pour les gros chiffres et **DSEG14Modern-Regular** pour les segments alphanumériques (cf. ressources externes)
- Approche "structure statique + valeurs dynamiques" : la grille SVG ne change pas, seules les `<text>` injectent les valeurs depuis `state`
- Le mode "alarme" est un wrapper qui ajoute une animation CSS (clignotement)

**À ne PAS faire en V1 :** simuler les boutons cliquables qui changent les écrans menu (heure / horaires / log). On affiche seulement le mode plongée et ses dérivés.

### 4.4 Contrôles de lecture

Composant `<PlaybackControls />` au-dessus ou en-dessous de l'écran d'ordi.

- Bouton **Play / Pause**
- Bouton **Reset** (retour à T=0)
- Sélecteur de **vitesse** : ×1, ×10, ×60, ×300
- **Timeline scrubbable** : barre horizontale représentant la durée totale du profil (incluant les paliers calculés). Un curseur déplaçable. Cliquer ou drag → seek. Affiche timestamps "MM:SS" aux extrémités et au curseur.
- **Marqueurs d'événements** sur la timeline (petits triangles colorés)

**Sous-titre live** sous la timeline : un petit affichage texte "T+22:14 · 18.2 m · descente" pour debug et pour l'enseignant.

### 4.5 Éditeur de profil

**Vue dédiée** accessible depuis le menu principal.

**UI :**
- Champ nom + description
- Paramètres globaux (gaz, pression surface, bouteille)
- **Liste de segments éditables** : chaque ligne = type (descente/fond/remontée) + profondeur cible + durée
- Bouton "ajouter un segment"
- **Aperçu graphique** : un mini-graphe profondeur/temps (chart simple en SVG, ~150 px de haut)
- **Liste d'événements** : ajout/suppression, choix du type, timing, paramètres
- Boutons : Sauvegarder, Sauvegarder sous, Annuler, Supprimer

**Validation :**
- Pas de profondeur négative
- Durée > 0 sur chaque segment
- Cohérence : un segment "constant" doit avoir la même profondeur que la fin du précédent (auto-correction proposée)

### 4.6 Bibliothèque de scénarios pédagogiques

Livrer **4-5 scénarios prédéfinis** dans `src/scenarios/presets.ts`. Ces scénarios apparaissent sur l'écran d'accueil avec une vignette et une description.

Liste suggérée :

1. **« Plongée N2 standard »** — Descente 20 m (2 min), fond 30 min, remontée 9 m/min, palier 3 min à 3 m. Ne déclenche aucun palier obligatoire. Pour montrer la lecture normale.
2. **« Première plongée à la limite »** — 25 m / 35 min. Frôle la fin de courbe, montre le NDL qui descend, palier de sécurité conseillé.
3. **« Plongée avec palier obligatoire »** — 30 m / 30 min. Sort de la courbe, paliers à 3 m. Montre l'apparition du "STOP".
4. **« Remontée rapide »** — Profil normal 20 m / 25 min, événement "remontée rapide" à T+25:00. Montre l'alarme et l'extension auto du palier de sécurité.
5. **« Plongée successive »** — Reprend les compartiments d'une plongée précédente, intervalle 1h30, replongée à 18 m. Montre l'impact de l'azote résiduel sur le NDL.

### 4.7 Persistance et partage

- **localStorage** : sauvegarde automatique de tous les profils de l'utilisateur sous une clé `divesim:profiles`
- **Pas de backend en V1**
- **Export JSON** : bouton qui télécharge le profil courant en `.json` (le moniteur peut le partager par mail / Drive)
- **Import JSON** : input file qui charge un `.json` et l'ajoute aux profils
- **Reset** : option dans les paramètres pour vider le localStorage (avec confirmation)

### 4.8 Mode présentation

Bouton **« Mode classe »** depuis la page de simulation.
- Cache le menu, les paramètres, l'éditeur
- Agrandit l'écran d'ordi (centre, grand)
- Garde uniquement : play/pause, vitesse, timeline, scénario en cours
- Plein écran via Fullscreen API du navigateur
- Touche ESC pour sortir
- Espace pour play/pause, flèches gauche/droite pour seek de ±30 s

---

## 5. Architecture technique

### 5.1 Stack

- **Build** : Vite
- **Langage** : TypeScript (strict mode)
- **Framework** : React 18+
- **Styling** : Tailwind CSS
- **Routing** : React Router (3 pages : accueil, éditeur, simulation)
- **State management** : Zustand (léger, parfait pour cette taille)
- **Tests** : Vitest (intégré à Vite) + Testing Library
- **Hébergement** : Vercel (déploiement automatique depuis GitHub à chaque push)

### 5.2 Structure du projet

```
divesim/
├── public/
│   └── fonts/                    # DSEG fonts (.woff2)
├── src/
│   ├── engine/                   # Moteur pur, ZÉRO dépendance React
│   │   ├── constants.ts
│   │   ├── buhlmann.ts
│   │   ├── profile.ts
│   │   ├── simulator.ts
│   │   ├── events.ts
│   │   └── __tests__/
│   ├── ui/
│   │   ├── computers/
│   │   │   ├── ZoopNovo/
│   │   │   │   ├── ZoopNovo.tsx
│   │   │   │   ├── modes/
│   │   │   │   │   ├── DiveModeOK.tsx
│   │   │   │   │   ├── DiveModeStop.tsx
│   │   │   │   │   ├── SurfaceMode.tsx
│   │   │   │   │   └── PostDiveMode.tsx
│   │   │   │   └── styles.css
│   │   │   └── types.ts          # Interface commune skin (pour V2+)
│   │   ├── controls/
│   │   │   ├── PlaybackControls.tsx
│   │   │   ├── Timeline.tsx
│   │   │   └── SpeedSelector.tsx
│   │   ├── editor/
│   │   │   ├── ProfileEditor.tsx
│   │   │   ├── SegmentList.tsx
│   │   │   ├── EventList.tsx
│   │   │   └── ProfilePreview.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── EditorPage.tsx
│   │   │   └── SimulationPage.tsx
│   │   └── components/           # boutons, modals, etc.
│   ├── scenarios/
│   │   └── presets.ts
│   ├── storage/
│   │   ├── localStorage.ts
│   │   └── importExport.ts
│   ├── store/
│   │   └── useStore.ts           # Zustand
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                 # Tailwind imports + DSEG @font-face
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── vite.config.ts
```

### 5.3 Boucle de simulation côté React

```typescript
// Dans SimulationPage.tsx
const [currentTime, setCurrentTime] = useState(0);
const [isPlaying, setIsPlaying] = useState(false);
const [speed, setSpeed] = useState(1);
const simulator = useMemo(() => new Simulator(profile), [profile]);
const state = useMemo(() => simulator.getStateAt(currentTime), [simulator, currentTime]);

useEffect(() => {
  if (!isPlaying) return;
  let raf: number;
  let lastTs = performance.now();
  const tick = (ts: number) => {
    const dt = (ts - lastTs) / 1000;
    lastTs = ts;
    setCurrentTime(t => Math.min(t + dt * speed, simulator.totalDurationSec));
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}, [isPlaying, speed, simulator]);
```

Le `Simulator` peut soit recalculer depuis 0 à chaque appel `getStateAt(t)` (simple, OK jusqu'à 60 min de plongée), soit memoizer une frame par seconde dans une `Map<number, DiveState>` (recommandé). Cache invalidé au changement de profil.

---

## 6. Algorithme de décompression — détails d'implémentation

**Vue d'ensemble du tick à `dt = 1 sec` :**

1. Calculer `P_ambient = surfacePressure + depth / 10`
2. Calculer `P_inspired_N2 = (P_ambient - PH2O) * (1 - fO2)`
3. Pour chaque compartiment `i` :
   - `k = ln(2) / halftime[i]`
   - `P_new[i] = P_inspired_N2 + (P_old[i] - P_inspired_N2) * exp(-k * dt / 60)` *(dt en secondes, halftime en minutes)*
4. Calculer le **plafond** (ceiling) : pour chaque compartiment, `ceiling_i = (P[i] - a[i] * GF) / (GF / b[i] + 1.0 - GF)`. Le plafond global est le max. Convertir en mètres : `ceiling_m = max(0, (ceiling - surfacePressure) * 10)`.
5. Calculer le **NDL** : itérer en simulation virtuelle "et si on restait à la profondeur courante" jusqu'à ce que ceiling > 0. Le NDL est le temps de cette simulation (cap à 99 min).
6. Calculer les **paliers** : si ceiling > 0, déterminer les profondeurs (multiples de 3 m) et durées requises pour remonter en respectant le ceiling à chaque instant.

**Initialisation des compartiments en surface :**
```
P[i] = (surfacePressure - PH2O) * 0.79  // équilibre avec air à 79% N2
```

**Pour la plongée successive** : reprendre les `compartments` finaux de la plongée précédente, et appliquer la décroissance pendant `surfaceIntervalMinutes` à `P_inspired_surface`.

**GPS letter (MN90, pour comparaison pédagogique)** : table de mapping entre tension du compartiment 120-min et lettre A→P. Pas urgent pour V1, peut être stub.

---

## 7. UI/UX — règles générales

- **Sobre, lisible, adapté à la projection.** Fonts ≥ 14 px, contrastes élevés.
- **Couleurs :**
  - Fond app : neutre clair ou sombre (toggle)
  - Écran ordi : couleurs réalistes du Zoop (LCD vert-jaune-olive, texte noir)
  - Alertes : rouge pour danger, orange pour warning
- **Mobile-friendly mais pas optimisé** : doit être utilisable sur tablette par un moniteur. Pas besoin que ce soit parfait sur smartphone en V1.
- **Pas de splash, pas de tutoriel intrusif.** Un petit "?" en haut à droite avec une modal d'aide.

---

## 8. Plan de livraison incrémental

Découpe en **6 jalons**. À chaque jalon, on a quelque chose qui marche end-to-end.

### Jalon 1 — Setup & moteur minimal (~1-2 jours)
- Init Vite + React + TS + Tailwind
- Implémenter `engine/buhlmann.ts` avec tests unitaires (cas connus depuis tables MN90 ou Subsurface)
- Implémenter `Simulator` qui produit un `DiveState` à n'importe quel `t` pour un profil simple

### Jalon 2 — Premier rendu Zoop Novo (~2-3 jours)
- SVG du boîtier + écran
- Composant `DiveModeOK` qui prend un `DiveState` et affiche profondeur, NDL, durée, max, temp
- Intégrer la police DSEG
- Test manuel : passer un state hardcodé, vérifier le rendu

### Jalon 3 — Démo intégrée (~1 jour)
- Page unique : un profil hardcodé (descente 20 m, fond 25 min, remontée), boucle d'horloge, écran qui s'anime
- **C'est ici qu'on est "vivant" pour la première fois** — moment psychologique important
- Ajouter play/pause et sélecteur de vitesse minimaliste

### Jalon 4 — Contrôles complets + modes écran (~2-3 jours)
- Timeline scrubbable
- Mode "STOP" (palier obligatoire)
- Mode alarme remontée rapide
- Mode post-plongée

### Jalon 5 — Éditeur de profil + scénarios (~2-3 jours)
- ProfileEditor avec liste de segments
- Bibliothèque des 4-5 scénarios prédéfinis
- Sauvegarde localStorage
- Import/export JSON

### Jalon 6 — Événements + mode présentation + polish (~2 jours)
- Système d'événements (essoufflement, panne d'air, remontée rapide forcée)
- Mode présentation plein écran
- Petites finitions UX, doc d'aide
- Déploiement Vercel

**Total estimé : ~10-15 jours dev solo à temps partiel.**

---

## 9. Tests

**Critique : les tests du moteur.** Le reste peut être testé manuellement en V1.

Cas de tests à coder dans `engine/__tests__/buhlmann.test.ts` :
- Plongée 20 m / 40 min : NDL conforme aux tables MN90 (vérifier que ZH-L16C donne ~résultat similaire ; pas identique mais cohérent)
- Plongée 30 m / 25 min : palier 3 min à 3 m attendu
- Plongée 40 m / 20 min : paliers à 6 m et 3 m attendus
- Initialisation surface : tous les compartiments à `(P_surf - PH2O) * 0.79`
- Désaturation : après 24h en surface, tous les compartiments revenus à l'équilibre

**Référence pour vérifier les valeurs** : croiser avec un calculateur Bühlmann existant (par exemple celui de Subsurface en mode "deco planner") ou un autre simulateur reconnu.

---

## 10. Ce qui doit être documenté à la livraison

- README technique (setup dev, structure)
- Petit guide utilisateur en markdown (1 page) pour les moniteurs
- Mention claire en pied de page : **« Outil pédagogique uniquement. Ne jamais utiliser pour planifier une plongée réelle. »** (légalement et éthiquement essentiel)

---

## Annexes

### A. Références algorithme

- Bühlmann, A.A. *Tauchmedizin* (1995) — la source originale ZH-L16
- Erik C. Baker, *« Clearing Up The Confusion About 'Deep Stops' »* — papier de référence sur les gradient factors
- Erik C. Baker, *« Understanding M-values »* — explication accessible des M-values

### B. Hypothèses simplificatrices V1 assumées

- Eau salée, densité = 1.025 → on approxime 10 m = 1 bar
- Température eau constante (paramètre de profil, pas de stratification)
- SAC constant (sauf événement essoufflement)
- Pas de variation de la consommation avec la profondeur (à corriger en V2 pour réalisme : `consommation_réelle = SAC × P_ambient`)
- Pas de transmission air sans fil (pression bouteille calculée par le moteur, pas mesurée)

### C. Équivalences Suunto RGBM ⇄ Bühlmann + GF

Approximation pédagogique. Pour ressembler au comportement conservateur d'un Suunto :
- GF = 30/85 → "Suunto par défaut"
- GF = 20/85 → "Suunto +1 niveau de conservatisme"
- GF = 50/85 → "moins conservateur, type ordi technique"

À documenter et exposer comme **"niveau de conservatisme"** dans l'UI plutôt que GF pur, pour rester accessible aux moniteurs.
