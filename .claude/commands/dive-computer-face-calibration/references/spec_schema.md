# Spec schema reference

Full JSON schema for the calibration spec, with every field documented and a worked example.

## Top-level structure

```json
{
  "model": "string — watch model identifier, human-readable",
  "version": "string — spec version, '1.0' for now",
  "image_size": [width, height],
  "background": "string — filename of the clean watch image",
  "screen_bbox": [x, y, w, h],
  "fields": { /* see below */ },
  "static_labels": { /* see below, optional */ },
  "presets": { /* see below, optional */ },
  "notes": "string — free-text caveats"
}
```

All coordinates are in **clean-image pixel space**, origin top-left, x→right, y→down.

## `fields` — the heart of the spec

Object mapping canonical field name → field descriptor. Each descriptor:

```json
{
  "bbox": [x, y, w, h],
  "font": "dseg7 | dseg14 | dot_matrix | segments | icon",
  "size": 80,
  "align": "left | right | center",
  "color": "#000",
  "label": { "text": "DIVE TIME", "position": "below | above | left | right", "font": "dot_matrix", "size": 14 },
  "suffix": { "text": "m", "size": 28, "gap": 4 },
  "prefix": { "text": "...", "size": 20, "gap": 4 },
  "blink": false,
  "confidence": "high | medium | low",
  "value_type": "number | time | string | bool | enum",
  "value_format": "string — printf-style or token, e.g. '%.1f', '%02d:%02d'",
  "max_chars": 4
}
```

Required: `bbox`, `font`, `size`, `align`.
Recommended: `value_type`, `value_format`, `max_chars`, `confidence`.
Optional: everything else.

### Notes per attribute

- **`bbox`**: for right-aligned 7-segment fields, `x + w` is the **fixed right edge** where digits anchor; the left edge moves as digits are added. Set `w` to fit the maximum expected value (e.g., "888.8").
- **`font`**: see `fonts_guide.md`.
- **`size`**: pixel cap height for text fonts, full glyph height for segments/icons.
- **`color`**: hex string. Most LCDs render as near-black `#000` or `#0a1a14` (dark on greenish).
- **`label`**: only for labels that appear on the LCD when the field is rendered (i.e., they belong to the dynamic display). For labels screen-printed on the bezel/background, use `static_labels` instead.
- **`suffix` / `prefix`**: rendered relative to the value's bbox. `gap` is the pixel space between value and suffix.
- **`blink`**: hint for the renderer; the spec does not animate.
- **`value_type`** + **`value_format`**: lets a renderer accept typed input. `time` with format `"%02d:%02d"` accepts `[14, 27]` and renders `"14:27"`.

## `static_labels` — bezel-printed text

Optional. For text physically printed on the watch bezel (e.g., "SELECT", "MODE", "DOWN", "UP" on the Suunto Zoop). If those are already part of the clean image, omit this section. Use only if you want to overlay the labels at render time (useful for retouched/clean renders).

```json
{
  "select_button": { "text": "SELECT", "bbox": [x, y, w, h], "font": "sans_serif", "size": 18, "color": "#fff" }
}
```

## `presets` — named display states

Optional. Each preset is a snapshot of the display in a particular situation, populated from the manual or from observation.

```json
{
  "surface_after_dive": {
    "description": "Surface view after a successful dive",
    "visible_fields": ["depth", "surf_time", "no_fly", "time", "date"],
    "values": {
      "depth": 0.0,
      "surf_time": "00:15",
      "no_fly": "14:28",
      "time": "14:35",
      "date": "01.05"
    },
    "flags": []
  },
  "deco_required": {
    "description": "Decompression required, ascent in progress",
    "visible_fields": ["depth", "ceiling", "asc_time", "time", "dive_time"],
    "values": {
      "depth": 18.5,
      "ceiling": 3.0,
      "asc_time": 9,
      "time": "14:42",
      "dive_time": 25
    },
    "flags": ["asc_arrow_up"]
  }
}
```

`visible_fields` matters: a renderer hides fields not listed. This is how the same spec covers many different screens.

`flags` are free-text hints the renderer interprets (e.g., `"asc_arrow_up"`, `"er_lock"`, `"battery_low"`, `"alarm_blinking"`).

## Worked example — partial Suunto Zoop spec

```json
{
  "model": "Suunto Zoop Novo",
  "version": "1.0",
  "image_size": [1240, 1240],
  "background": "zoop_novo_clean.png",
  "screen_bbox": [340, 280, 560, 680],
  "fields": {
    "depth": {
      "bbox": [420, 320, 360, 130],
      "font": "dseg7",
      "size": 110,
      "align": "right",
      "color": "#000",
      "suffix": { "text": "m", "size": 36, "gap": 8 },
      "value_type": "number",
      "value_format": "%.1f",
      "max_chars": 5,
      "confidence": "high"
    },
    "ac_indicator": {
      "bbox": [770, 290, 60, 24],
      "font": "dot_matrix",
      "size": 18,
      "align": "left",
      "color": "#000",
      "value_type": "bool",
      "confidence": "medium"
    },
    "ndl": {
      "bbox": [560, 480, 240, 110],
      "font": "dseg7",
      "size": 90,
      "align": "right",
      "color": "#000",
      "label": { "text": "NO DEC TIME", "position": "below", "font": "dot_matrix", "size": 14 },
      "value_type": "number",
      "value_format": "%d",
      "max_chars": 3,
      "confidence": "high"
    },
    "time": {
      "bbox": [380, 700, 220, 60],
      "font": "dseg7",
      "size": 50,
      "align": "right",
      "color": "#000",
      "label": { "text": "TIME", "position": "below", "font": "dot_matrix", "size": 14 },
      "value_type": "time",
      "value_format": "%02d:%02d",
      "confidence": "high"
    },
    "dive_time": {
      "bbox": [660, 700, 160, 60],
      "font": "dseg7",
      "size": 50,
      "align": "right",
      "color": "#000",
      "label": { "text": "DIVE TIME", "position": "below", "font": "dot_matrix", "size": 14 },
      "value_type": "number",
      "value_format": "%d",
      "max_chars": 3,
      "confidence": "high"
    },
    "ascent_rate_bar": {
      "bbox": [820, 380, 18, 200],
      "font": "segments",
      "size": 200,
      "align": "left",
      "color": "#000",
      "value_type": "enum",
      "value_format": "0..5",
      "confidence": "medium"
    }
  },
  "presets": {
    "diving_15m_safe": {
      "description": "At 15m, well within NDL, normal dive",
      "visible_fields": ["depth", "ac_indicator", "ndl", "time", "dive_time"],
      "values": {
        "depth": 15.0,
        "ac_indicator": true,
        "ndl": 53,
        "time": "14:27",
        "dive_time": 18
      },
      "flags": []
    }
  },
  "notes": "Coordinates measured from a 1240x1240 clean render. Ascent-rate bar is a single field with discrete segment levels 0-5; renderer fills bottom-up."
}
```

## Validation checklist

Before emitting:
- [ ] `image_size` matches the clean image's actual dimensions.
- [ ] Every field's bbox is fully inside `screen_bbox`.
- [ ] At least `depth` (or equivalent main display) is present.
- [ ] Every field has `bbox`, `font`, `size`, `align`.
- [ ] No invented field names (cross-check `field_vocabulary.md`).
- [ ] Presets reference only field names that exist in `fields`.
- [ ] JSON parses (mental check: balanced braces, commas, quotes).
