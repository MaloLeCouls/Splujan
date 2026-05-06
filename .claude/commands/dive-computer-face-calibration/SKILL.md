---
name: dive-computer-face-calibration
description: Calibrate a dive computer watch face into a structured JSON specification that drives a separate renderer. Use this skill whenever the user uploads paired images of a dive computer (one with a clean/empty screen, one with content shown), wants to map screen fields, place text on a watch image, build a dive simulator or training tool where the watch face evolves over time, or extract screen states from a dive computer manual. Trigger this even when the user mentions a specific dive computer (Suunto Zoop / Vyper / D-series, Aqualung i200/i300/i550, Mares Puck/Smart, Cressi Leonardo/Giotto, Oceanic Geo, Shearwater Peregrine/Perdix, etc.) in a simulation, training, or visualization context — even if they don't say the word "calibrate". Also trigger if a user mentions wanting to overlay text on watch face images, simulate dive-computer screens, or produce screen state presets from a manual PDF.
---

# Dive Computer Face Calibration

Convert paired images of a dive computer (clean face + filled face) into a structured JSON specification that any renderer can consume. The spec pairs a background image with named, positioned fields and their rendering attributes — fonts, sizes, alignment, color — so a separate renderer can produce arbitrary dive states by injecting values.

This skill produces specs only. Renderer code is out of scope; build it as a separate task once the spec is good.

## Mental model

A dive computer face is **one fixed background** + **N positioned fields**. Each field has stable geometry (where it is, what font, what size) and variable content (the value at a given moment). Calibration is the process of locking down the geometry so the content becomes scriptable.

Two-image diff is the foundation: any pixel that is empty in the clean image but dark in the filled image is a candidate field location. The skill formalizes that diff into a structured spec.

## Inputs

**Required:**
1. `clean_image` — watch with the LCD screen empty, front-on, minimal perspective distortion.
2. `filled_image` — same watch in the same pose with content visible. The more populated, the better.

**Optional:**
3. `manual_pdf` — used only to extract screen states as presets (Step 6). Not used for field positioning.
4. `watch_model` — free-text model name; goes into spec metadata.

If only the filled image is supplied, ask for the clean version. Calibration without the pair is unreliable. If the user genuinely cannot supply a clean image, proceed but flag every coordinate as low-confidence and explain why.

## Output

The generated spec is written to `docs/computers/<slug>/<slug>.spec.json` (see **File organisation** below). Plus a short markdown summary in chat. Call `present_files` on the JSON.

The JSON must contain:
- `model` — watch identifier
- `image_size` — `[w, h]` of the clean image in pixels (so coordinates are unambiguous)
- `background` — relative path/filename of the clean image
- `screen_bbox` — `[x, y, w, h]` of the LCD area
- `fields` — object mapping canonical field names to render parameters
- `presets` (optional) — named states populated from the manual
- `notes` — free-text caveats and uncertainty flags

**Do not auto-build a renderer in the same turn.** Specs and renderers stay decoupled by design. If the user asks for a renderer after reviewing the spec, build it then.

## File organisation

Each dive computer's assets live together under `docs/computers/<slug>/` using this naming convention:

```
docs/computers/<slug>/
  <slug>_clean.<ext>               # required — empty screen image
  <slug>_filled_<variant>.<ext>    # one or more — screen with content visible
  <slug>_manual[_<lang>].<ext>     # primary user manual (PDF or images)
  <slug>_manual_<topic>.<ext>      # additional manuals (algorithm, service, etc.)
  <slug>_<anything>.<ext>          # any other relevant reference material
  <slug>.spec.json                 # generated calibration spec (OUTPUT)
```

- `<slug>` matches the spec's `slug` field (e.g., `suunto-zoop-novo`).
- `<variant>` is a short descriptor: `dive_ok`, `deco`, `surface`, `logbook`, `post_dive`, etc.
- `<lang>` suffix for non-English manuals: `_fr`, `_en`, `_de`, etc.
- Multiple filled images and multiple manuals are fine — name them descriptively.
- Subfolders (`images/`, `manuals/`) are allowed if the user prefers but are not required.

When the user uploads files, suggest moving and renaming them according to this convention before calibration begins. This makes re-calibration, manual lookups, and multi-language support unambiguous.

## Workflow

Calibration always finishes with the user reviewing coordinates. The skill exists to make the first pass fast and consistent across watches.

### Step 1 — Verify inputs

- Confirm both images show the same watch from the same angle. Flag any perspective mismatch.
- Read pixel dimensions of the clean image. **All coordinates in the spec are in clean-image pixel space.**
- If the filled image is a different size, mentally rescale before comparing.

### Step 2 — Locate the screen bounding box

Identify the LCD area on the clean image — the rectangle within which all fields will live. Emit as `screen_bbox: [x, y, w, h]`.

For round LCDs, still emit a rectangular bbox; it's a placement reference, not a clipping region.

### Step 3 — Diff the two images

Compare clean vs. filled. Every region that gained dark pixels in the filled image is a candidate field. Note also segment indicators (ascent rate bars, tissue saturation bars, alarm icons) — they are filled-segment fields, not text fields, but still belong in `fields`.

### Step 3b — Identify icons from the manual (mandatory before Step 4)

**Never infer an icon's meaning from its visual shape.** A 3-arc pattern can mean alarm, bluetooth, wireless, sonar, or speaker depending on the manufacturer. An arc + dot can be NFC or dive alarm. Segment bars can be ascent rate, tissue loading, or battery — shape alone does not tell you which.

Before naming any icon or indicator field, do the following:

1. **Locate the icon table** in the device manual (typically a page titled "Symbols", "Indicators", or "Display elements"). For Suunto devices this is usually in the first few pages (e.g., Zoop Novo p.8 §2.3 — 8 icons listed with numeric IDs).
2. **Match by documented meaning**, not by appearance. Cross-reference the manual's description with canonical names in `references/field_vocabulary.md`.
3. If the manual is unavailable, name every unidentified icon `<slug>_icon_<sequence>` (e.g., `zoop_icon_1`), set `"confidence": "low"`, and document the shape in `notes` so the user can identify it.

**Suunto-specific known confusions:**
- The 3-arc buzzer shape = "Alarme de plongée" (icône #2) → `dive_alarm_indicator`. Active during dive when dive alarm function is on.
- The "AC" text rendered on screen = "Contacts d'eau actifs" (icône #6, §3.26) → `ac_indicator`. This is a text field, not an arc icon. These two are completely different fields.

### Step 4 — Identify each visible element

For each piece of content visible on the filled image, determine:

1. **Canonical field name** — pick from `references/field_vocabulary.md`. Do NOT invent new names if a canonical one fits. Only invent if the watch has a feature truly outside the vocabulary, and document it in `notes`. For icon-shaped elements, apply Step 3b first.
2. **`bbox: [x, y, w, h]`** — clean-image pixel coordinates.
3. **`font`** — see `references/fonts_guide.md`. Most common: `dseg7` (large 7-segment numerals), `dseg14` (alphanumeric), `dot_matrix` (pixel-style labels), `segments` (custom shaped indicators).
4. **`size`** — pixel height of a glyph (cap height for text, full height for segments).
5. **`align`** — `left`, `right`, or `center`. **7-segment numeric displays are almost always right-aligned** because digits grow leftward.
6. **`color`** — usually `#000` over the LCD greenish background. Capture if it differs.
7. **`label`** (optional) — small dot-matrix text near the field naming it ("DIVE TIME", "NO DEC TIME"). If the label is screen-printed on the bezel rather than rendered on the LCD, put it in `static_labels` instead — or omit if it's already part of the background image.
8. **`suffix`** / **`prefix`** (optional) — units like "m", "ft", "%" rendered next to the value at smaller size. These render relative to the value's bbox.

### Step 5 — Confidence scoring

For each field, internally rate confidence (high/medium/low) based on how cleanly the diff isolated it and how confident the font assignment is. Add `"confidence": "low"` to any field that should be reviewed first. Surface low-confidence fields in the chat summary.

### Step 5b — Extract button map and interactions (mandatory when manual is available)

This step is **non-optional when a manual is provided**. The application goal is to simulate a dive — a spec without button actions cannot drive an interactive simulation.

Locate the "Controls", "Buttons", or "Operating your computer" section of the manual (typically within the first few sections). For each physical button:

1. Identify its **shape** and **position** on the watch body (front/side, round/rect).
2. Record its **bezel label** if any.
3. Record every documented action per operating mode: surface, diving (safe and deco), menu, logbook, freedive, post-dive.
4. Record **long-press** behaviors if documented separately.
5. If the manual uses a lettered or numbered diagram (common in Suunto manuals), cross-reference the diagram identifier to the physical button.

Emit the `buttons` object in the spec following `references/button_vocabulary.md`.

If a button's behavior is not documented for a given mode, **omit that mode key** (unknown ≠ does nothing). If the entire manual section is missing, create placeholder entries with `"actions": {}` and `"confidence": "low"`, and document what is needed in `notes`.

If no manual is available, still create placeholder buttons from the clean/filled images — visible bezel labels and button positions can usually be read even without documentation.

### Step 6 — Optional: extract presets from the manual

If a manual PDF is provided, scan it for screen illustrations and tables describing display states, **and** for operating-mode flow diagrams that show which button press leads to which state. The Suunto Zoop manual, for example, documents:

- surface view, active dive view (Air / Nitrox / Gauge / Free)
- decompression required (with `ASC TIME` and `CEILING`)
- safety stop, deep stop
- error state (`ER` algorithm lock)
- no-fly state, battery low
- logbook pages

For each documented state, emit a preset under `presets`: a partial map of field-name → value, plus `visible_fields` listing which fields are shown and which are hidden in that state.

This is what lets a renderer simulate "the watch over time" — the runtime transitions between presets and interpolates numeric fields between them.

**Do not invent values not present in the manual.** If a state is described qualitatively only ("the screen flashes"), emit it with a `flags` field rather than guessing numbers.

For each preset/state, also note which button press triggers the transition into it. Add `triggered_by` if known:
```json
"triggered_by": { "button": "top_right", "action": "start_dive" }
```
Omit `triggered_by` when the state is entered automatically (depth threshold, timeout, etc.) rather than by an explicit button press.

If the manual page you are scanning to extract presets is also the icon-table page (or adjacent to it), use that opportunity to complete Step 3b — cross-check every icon in `visible_fields` against the manual's documented meaning before committing the preset.

### Step 7 — Write, summarize, present

1. Write the spec to `/mnt/user-data/outputs/<slug>.spec.json`.
2. Verify it parses and conforms to `references/spec_schema.md`.
3. Write a brief summary in chat:
   - 2-3 sentences on what was detected.
   - A bulleted list of low-confidence items to verify.
   - One concrete next step (e.g., "open the spec, scroll to `fields.depth`, sanity-check the bbox against your image").
4. Call `present_files` on the spec.

## Coordinate sanity checks

Before emitting the JSON, run these mentally:

- Every field's bbox is fully inside `screen_bbox`. If not, recheck.
- Right-aligned 7-segment fields: `x + w` aligns with the right edge of the largest expected value (e.g., "888.8"), not the rendered shorter text.
- Sibling fields on the same visual row (e.g., `time` and `dive_time`) share a `y` coordinate within ~5 px.
- Suffixes are just to the right of their value: `suffix.x ≈ value.x + value.w + small_gap`.
- The depth field on a dive computer is usually the largest font on the screen — if your `size` for `depth` isn't the largest, something's off.

## Iteration loop

After presenting the spec, expect at least one round of human adjustment. Common requests and how to handle them:

- *"The depth box is shifted 12 px"* → apply offset, re-emit full spec.
- *"You missed the dive alarm icon"* → check the manual icon table, confirm the canonical name, add the field, re-emit.
- *"`DIVE TIME` is screen-printed on the bezel"* → move it from `fields` to `static_labels`, or remove if it's already in the background image.
- *"This font is wrong, it's not 7-seg, look closer"* → revise the font assignment, re-emit.

**Always re-emit the full spec, never a diff.** The spec file is the single source of truth — partial edits invite drift.

## What this skill does NOT do

- Does not produce the renderer (HTML/SVG/Canvas code). Separate task.
- Does not achieve pixel-perfect coordinates from vision alone. Aim for ±5-10 px; user finishes the job.
- Does not generate watch images. If the user has no clean image, suggest photographing the watch on a white background with the screen empty (or rendering one).
- Does not handle animated states directly. Encode them as flags on the field (`"blink": true`, `"flash_alarm": true`) and let the renderer interpret.
- Does not produce code or scripts. Output is JSON + chat summary only.

## References

- `references/spec_schema.md` — full JSON schema with every field documented and an example.
- `references/field_vocabulary.md` — canonical field names. **Read this before naming any field.**
- `references/button_vocabulary.md` — button shapes, positions, mode keys, and action names. **Read this before writing the `buttons` section.**
- `references/fonts_guide.md` — font type definitions, when to use each, free font sources.
