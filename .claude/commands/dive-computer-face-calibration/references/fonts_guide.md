# Fonts guide

Dive computers use four distinct rendering styles. Picking the right one matters because using a generic sans-serif for a 7-segment LCD is the single biggest "this doesn't look like a dive computer" mistake.

## The four font types

### `dseg7` — 7-segment LCD numerals

Used for: depth, time (HH:MM), dive time, NDL, ascent time, ceiling, temperature.

The classic calculator/digital-watch style. Each digit is composed of up to 7 line segments.

**How to recognize on the image:** digits look blocky, with visible gaps between segments. Diagonal strokes are absent — only horizontal and vertical segments. Numbers like 1, 4, 7 have characteristic silhouettes.

**Free font to render with:** [DSEG by keshikan](https://www.keshikan.net/fonts-e.html) — open-source SIL OFL license. Use `DSEG7-Classic` regular or bold.

**Spec convention:** `"font": "dseg7"`, almost always `"align": "right"`. Width should accommodate the maximum value (e.g., for depth on a recreational computer, "999.9" or "888.8" worth of glyphs).

### `dseg14` — 14-segment alphanumeric LCD

Used for: short status words rendered on the LCD ("DIVE", "ER", "SLOW", "STOP", "AIR", "NITROX", "PLAN", "MEM").

7-segment can't render letters legibly, so dive computers use 14-segment (or 16-segment) cells for short alphanumerics on the LCD. They're chunky and somewhat ugly — that's correct.

**How to recognize:** letters look blocky and "broken" with visible inner segments. The letter "E" looks like three stacked horizontal bars; "M" has visible diagonals. Compare with screen-printed bezel labels (which are smooth sans-serif) — they're clearly different styles.

**Free font:** `DSEG14-Classic` from the same DSEG family.

**Spec convention:** `"font": "dseg14"`, alignment depends on context (often left or center).

### `dot_matrix` — small pixel-grid labels

Used for: small labels rendered on the LCD next to fields ("NO DEC TIME", "DIVE TIME", "TIME", "Surf t.", "AVG", "MAX"), and for menu/settings text.

Made of small dots arranged on a grid (typically 5×7 or 7×9 pixels per character). Sharper than DSEG, more readable, but still visibly digital.

**How to recognize:** zoom in mentally — letters are made of discrete square dots, not smooth curves. Lowercase letters are possible (unlike DSEG7).

**Free fonts to render with:** any pixel/bitmap font. Good options: `Press Start 2P` (Google Fonts), `VT323`, `Pixelify Sans`, or BDF/PCF bitmap fonts. Match the dot grid size to the original by tweaking font-size and letter-spacing.

**Spec convention:** `"font": "dot_matrix"`, alignment varies. Usually small `size` (12-20 px).

### `segments` — custom shaped indicators

Used for: ascent-rate bars, tissue-saturation bars, oxygen-loading bars, anything that's drawn from a few pre-defined filled shapes rather than text.

These are not really fonts — they're discrete graphical primitives the LCD turns on or off. The Suunto Zoop ascent bar, for example, is a vertical stack of ~5 segments where the bottom segments fill green and top segments turn red as ascent rate increases.

**How to render:** SVG paths, drawn rectangles, or sprite atlases. Treat the field's `value` as an integer level and the renderer fills `value` segments.

**Spec convention:** `"font": "segments"`, `"value_type": "enum"` with `"value_format": "0..N"` describing the level range. The `bbox` is the full bar area; the renderer subdivides.

### `icon` — pictograms

Used for: airplane (no-fly), bell (alarm), warning triangle, bookmark, battery silhouette, BLE chip, water-drop, etc.

Single fixed graphics, on or off. No size variation per state.

**How to render:** SVG sprites or PNG sprites positioned via `bbox`. Or a custom icon font.

**Spec convention:** `"font": "icon"`, `"value_type": "bool"` (visible/hidden), or `"enum"` if the icon has states (e.g., battery: full/half/low/empty).

## Sizing heuristics

| Field type | Typical glyph height (recreational computer, ~1200 px wide image) |
|---|---|
| Primary depth display | 100-130 px |
| Secondary numerics (NDL, ASC TIME) | 70-100 px |
| Tertiary (TIME, DIVE TIME) | 40-60 px |
| Mode word ("AIR", "NITROX") | 30-50 px |
| Dot-matrix labels | 12-20 px |
| Bezel labels (sans-serif on plastic) | 16-24 px |

These are starting points. Always cross-check against the actual filled image.

## Color

Most LCDs render dark glyphs on a greenish or grey background. Use:

- `"#000000"` — safe default, looks "off" only if the LCD is very saturated.
- `"#0a1a14"` — slightly green-tinted black, good for greenish LCDs.
- `"#1a1a1a"` — soft black for high-contrast LCDs.

Some computers (Shearwater Peregrine, etc.) have color OLED screens with white-on-black or white-on-color rendering. For those, `color` is white and the renderer composites differently — flag in `notes`.

## When you're unsure

If you cannot tell whether something is `dseg14` or `dot_matrix` from the image alone (close call for short status words), set `"font": "dseg14"` with `"confidence": "low"` and call it out in the summary. The user has the watch in hand and can correct in one round.

## Source attribution

DSEG fonts: keshikan, https://www.keshikan.net/fonts-e.html, SIL OFL 1.1.
Press Start 2P: codeman38, OFL.
VT323: Peter Hull, OFL.

All free for commercial and educational use under their respective licenses.
