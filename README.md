# DiveSim

Simulateur pédagogique d'ordinateur de plongée, destiné aux moniteurs FFESSM pour enseigner la lecture des instruments en classe.

## Fonctionnalités

- **Moteur Bühlmann ZH-L16C** — calcul NDL, paliers de décompression, plafond, taux de saturation des compartiments tissulaires
- **Simulation temps réel** — lecture d'un profil de plongée seconde par seconde, scrubbing sur la timeline, vitesses ×0.5 à ×20
- **Skin Suunto Zoop Novo** — rendu SVG fidèle avec 4 modes d'affichage (surface, plongée OK, déco, post-plongée)
- **Éditeur de profils** — création de scénarios par segments (descente, palier, remontée) avec événements (panique, rupture de gaz, remontée rapide…)
- **Mode classe** — plein écran sans distractions, raccourci Espace / ←→ / Échap

## Stack

| Couche | Techno |
|--------|--------|
| Build | Vite 5 + TypeScript strict |
| UI | React 18 + Tailwind CSS |
| State | Zustand (persist localStorage) |
| Tests | Vitest |
| Fonts LCD | DSEG7Modern, DSEG14Modern (`.woff2` dans `public/fonts/`) |

## Démarrage rapide

```bash
npm install
npm run dev       # http://localhost:5173
npm run test:run  # tests moteur (Bühlmann)
npm run build     # vérif TS + build prod
```

> **PowerShell** : préfixer avec `cmd /c npm` si la politique d'exécution bloque.

## Architecture

```
src/
├── engine/          # Moteur pur TypeScript (Bühlmann, profil, simulateur)
├── computers/       # BDD cross-ordinateurs (specs, field registry, state mapper)
│   └── specs/       # Un fichier par modèle d'ordi (Zoop Novo, …)
├── store/           # Zustand store (profils, persistence)
├── scenarios/       # Scénarios de démonstration prédéfinis
└── ui/
    ├── computers/   # Rendus SVG des ordinateurs + ui-registry
    ├── controls/    # Timeline, vitesse, playback
    ├── editor/      # Éditeur de profils
    └── pages/       # HomePage, EditorPage, SimulationPage
```

### Ajouter un nouvel ordinateur

1. Créer `src/computers/specs/<slug>.ts` — spec JSON (fields + presets depuis le manuel)
2. Créer `src/ui/computers/<Slug>/<Slug>.tsx` — composant SVG
3. Deux lignes dans `src/computers/computer-registry.ts` et `src/ui/computers/ui-registry.ts`

## Documents de référence

| Fichier | Contenu |
|---------|---------|
| `docs/spec-v1-divesim.md` | Spécification V1 complète (algorithme, UI/UX, jalons) |
| `docs/Suunto_ZoopNovo_UserGuide_FR.pdf` | Manuel utilisateur Zoop Novo |
| `docs/MN90.pdf` | Tables MN90 (sanity-check NDL) |
| `docs/Clearing up the confusion about the deepstops.pdf` | Erik C. Baker — gradient factors |
| `inputs/dive-computer.html` | Prototype HTML standalone (Claude Design) |

## Skill Claude Code

Le dossier `.claude/commands/dive-computer-face-calibration/` contient un skill de calibration d'écran d'ordinateur de plongée : il produit un spec JSON à partir de deux photos (écran vide + écran rempli) utilisable par n'importe quel renderer.

---

*Dédié à ma maman d'amour. 🤿*
