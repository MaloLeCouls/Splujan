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

| Canonical name | Description |
|---|---|
| `ac_indicator` | "AC" — water contacts active / dive mode triggered |
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
| `tissue_bar` | Tissue saturation bar graph |
| `n2_bar` | Nitrogen loading bar |
| `o2_bar` | Oxygen loading bar |

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
