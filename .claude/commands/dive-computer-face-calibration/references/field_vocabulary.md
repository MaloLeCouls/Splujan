# Field vocabulary

Canonical names for fields across dive computers. **Use these names whenever the field exists, even if the watch labels it differently.** Cross-watch consistency is the whole point — a runtime built for one spec should work on another.

If a watch has a feature truly outside this list, invent a snake_case name and document it in the spec's `notes`.

## Primary dive data

| Canonical name | Description | Common labels on watch |
|---|---|---|
| `depth` | Current depth | (often unlabeled, largest digits) |
| `max_depth` | Max depth this dive | "MAX" |
| `avg_depth` | Average depth this dive | "AVG" |
| `dive_time` | Elapsed dive time | "DIVE TIME", "DT" |
| `time` | Wall clock time | "TIME" |
| `date` | Calendar date | "DATE" |
| `temperature` | Water temperature | "°C" / "°F" |

## Decompression / ascent

| Canonical name | Description |
|---|---|
| `ndl` | No-decompression limit (time remaining without deco). "NO DEC TIME" on Suunto. |
| `asc_time` | Total ascent time required (deco mode). "ASC TIME" on Suunto. |
| `ceiling` | Decompression ceiling depth |
| `floor` | Decompression floor depth |
| `safety_stop_time` | Safety stop countdown. "STOP" + countdown. |
| `deep_stop_time` | Deep stop countdown. "DEEPSTOP" on Suunto. |
| `ascent_rate_bar` | Visual ascent-rate indicator (segments). |
| `tts` | Time to surface (Shearwater-style) |

## Surface interval / post-dive

| Canonical name | Description |
|---|---|
| `surf_time` | Time spent at surface since last dive. "SURF T." on Suunto. |
| `no_fly` | No-fly countdown. "NO FLY" + airplane icon. |
| `desat_time` | Desaturation time remaining |

## Gas / Nitrox

| Canonical name | Description |
|---|---|
| `o2_percent` | Oxygen percentage in mix. "O2%" or just "21%". |
| `po2` | Partial pressure of oxygen |
| `mod` | Maximum operating depth for current mix |
| `olf_percent` | Oxygen limit fraction. "OLF%" on Suunto. |
| `gas_index` | Active gas slot (1, 2, 3) for multi-gas computers |
| `tank_pressure` | Tank pressure (air-integrated computers only) |

## Mode / status

| Canonical name | Description |
|---|---|
| `mode` | Current mode string: "AIR" / "NITROX" / "GAUGE" / "FREE" / "OFF" |
| `dive_number` | Sequential dive number in the series |
| `altitude_setting` | Altitude adjustment level (0/1/2) |
| `personal_setting` | Personal/conservatism setting (0/1/2) |

## Indicators / icons

> **`segment_colors` note**: any bar or segmented field may include `"segment_colors": ["#hex", ...]` in its spec — one hex per segment level ordered low-to-high. The renderer uses these to color individual segments. Omit for monochrome displays; required for computers with red/green/orange color zones. Example for a 5-level ascent rate bar: `["#00cc44", "#00cc44", "#ffaa00", "#ff4400", "#ff0000"]`.

| Canonical name | Description |
|---|---|
| `dive_alarm_indicator` | Dive alarm active — rendered as 3-arc buzzer/speaker icon. **Never identify from shape alone — always confirm in the manual icon table.** (Suunto Zoop Novo: icône #2 "Alarme de plongée", p.8.) |
| `ac_indicator` | **"AC" text** visible on screen — water contacts active (Suunto Zoop Novo: icône #6 "Contacts d'eau actifs" §3.26). This is a rendered text field, NOT an arc/shape icon. |
| `battery_icon` | Battery state indicator |
| `battery_low` | Low battery warning |
| `alarm_icon` | Generic warning triangle |
| `bookmark_icon` | Bookmark added during dive |
| `backlight_icon` | Backlight active |
| `bluetooth_icon` | BLE connection active |
| `bell_icon` | Daily/dive alarm enabled |
| `airplane_no` | "No fly" airplane-with-cross icon |
| `down_arrow` | Descend instruction |
| `up_arrow` | Ascend instruction |
| `ascent_rate_bar` | Visual ascent-rate indicator (segmented bar). Use `segment_colors` for green/orange/red zones. |
| `ceiling_bar` | Colored depth-range bar shown during deco — typically red at the top (ceiling), green below (safe zone). Vertical bar; `value_type: "number"` holds ceiling depth. |
| `tissue_bar` | Tissue saturation bar graph (monochrome) |
| `tissue_bar_colored` | Tissue saturation bar with color zones (green → yellow → red as saturation rises). Use `segment_colors`. |
| `n2_bar` | Nitrogen loading bar |
| `o2_bar` | Oxygen loading bar (OTU) |
| `gradient_bar` | Multi-zone horizontal or vertical bar, e.g. GF visualization on Shearwater computers. Use `segment_colors` and `orientation: "horizontal" | "vertical"`. |
| `cursor` | Moveable needle or line indicator — pointer on a depth scale, target depth marker, etc. `value_type: "number"` holds the pointed-to value. |
| `highlight_box` | Filled rectangle that inverts or highlights the active field during menu navigation. `value_type: "string"` holds the ID of the highlighted field. |

> **Icon identification rule — MANDATORY**: Visual shape alone is never sufficient to name an icon. A 3-arc pattern could be a speaker, an alarm, a wireless signal, or a sonar ping depending on the manufacturer. Before assigning any canonical name to an icon-shaped field, read the device manual's icon table and match by documented meaning, not appearance. If the manual is not available, name it `<slug>_icon_unidentified` and flag `"confidence": "low"`.

## Display theme

These two properties belong at the **spec root level** (not inside `fields`). They define the display's base appearance; individual fields override via their own `color` property.

| Property | Description |
|---|---|
| `screen_background_color` | `#hex` of the LCD/OLED background. `#000000` for black OLED (Shearwater, Garmin), `#7fbf5e` for classic green LCD (Suunto Zoop, Cressi), `#c8b400` for yellow LCD, etc. |
| `default_text_color` | `#hex` default ink color for all rendered text and icons. On black screens: white `#ffffff`, cyan `#00e5ff`, or amber `#ffaa00`. On green LCD: dark green `#1b2b08` or near-black. |

If both are omitted, the renderer falls back to its own defaults. Always populate them when calibrating a computer with a non-standard color scheme.

## Free-dive specific

| Canonical name | Description |
|---|---|
| `apnea_timer` | Apnea cycle countdown |
| `vent_time` | Ventilation time |
| `surface_countdown` | Surface interval countdown for next dive |
| `apnea_depth_alarm` | Depth notification level |

## Status / error

| Canonical name | Description |
|---|---|
| `error_code` | "ER" / "Er" / numeric error code |
| `slow_indicator` | "SLOW" warning (excessive ascent rate) |
| `stop_indicator` | "STOP" indicator (stop required) |
| `attention_icon` | Attention triangle |

## Logbook / memory views

| Canonical name | Description |
|---|---|
| `log_index` | Log entry number |
| `log_date` | Date of logged dive |
| `log_max_depth` | Max depth of logged dive |
| `log_dive_time` | Duration of logged dive |
| `log_profile_graph` | Depth-over-time profile sparkline |

## Naming rules

- **snake_case**, lowercase.
- Singular nouns where possible (`depth` not `depths`).
- Prefix `log_` for logbook-mode fields that mirror live fields.
- For watch-specific fields not in this list, use `<watch_slug>_<descriptor>` (e.g., `shearwater_gf_setting`) and document in `notes`.

## When in doubt

Pick the closest canonical name and document the mapping in `notes`. A close match plus a note is always better than a one-off invented name — the runtime can adapt.
