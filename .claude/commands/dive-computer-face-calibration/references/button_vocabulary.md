# Button vocabulary

Canonical definitions for physical buttons on dive computers. Used in the `buttons` section of a calibration spec.

## Button shapes

| Shape key | Description |
|---|---|
| `round` | Circular push button, typically front-mounted on the watch face (e.g., Suunto Zoop right-side button, Shearwater Perdix surface buttons). |
| `rect_h` | Horizontally-elongated rectangle — typically on the top or bottom edge of the case. |
| `rect_v` | Vertically-elongated rectangle — typically on the left or right edge of the case. The most common shape for dive computer side buttons. |

## Button positions

| Position key | Location |
|---|---|
| `front_top_left` | Face of watch, top-left corner |
| `front_top_right` | Face of watch, top-right corner |
| `front_bottom_left` | Face of watch, bottom-left corner |
| `front_bottom_right` | Face of watch, bottom-right corner |
| `side_left_top` | Left edge, upper button |
| `side_left_bottom` | Left edge, lower button |
| `side_right_top` | Right edge, upper button |
| `side_right_bottom` | Right edge, lower button |
| `side_top_left` | Top edge, left button |
| `side_top_right` | Top edge, right button |
| `side_bottom_left` | Bottom edge, left button |
| `side_bottom_right` | Bottom edge, right button |

If none of the above matches (e.g., a single centered crown), use a free-text description and document it in `notes`.

## Button spec object

```json
{
  "shape": "round | rect_h | rect_v",
  "position": "<position_key>",
  "label": "SELECT",
  "bbox_on_image": [x, y, w, h],
  "confidence": "high | medium | low",
  "actions": {
    "<mode_key>": "<action_name> | null"
  }
}
```

- **`shape`** — one of the shape keys above.
- **`position`** — one of the position keys above.
- **`label`** — text printed on or near the button (bezel label). `null` if none.
- **`bbox_on_image`** — bounding box of the button in the clean image, pixel coordinates. Used by the UI to render a clickable overlay.
- **`confidence`** — how certain the button identification is. Set `"low"` when extracted without a manual.
- **`actions`** — map of mode → action name. See mode keys and action names below.

## Mode keys

| Mode key | When active |
|---|---|
| `surface` | Watch at surface, no recent dive |
| `surface_long` | Long press at surface |
| `diving_safe` | Underwater, within NDL |
| `diving_safe_long` | Long press underwater (NDL) |
| `diving_deco` | Underwater, deco obligation active |
| `diving_deco_long` | Long press underwater (deco) |
| `diving_gauge` | Gauge mode (no deco calculation) |
| `freedive` | Free-dive / apnea mode |
| `post_dive` | Surface immediately after dive |
| `menu` | Settings/menu navigation |
| `logbook` | Logbook review |
| `logbook_long` | Long press in logbook |

Use `null` as the value when a button is documented as doing nothing in that mode.
Omit a mode key entirely when the manual does not document the button's behavior for it (treat as unknown, not as "does nothing").

## Action names

Action names are snake_case strings extracted from the manual — use the manual's own terminology translated to snake_case where possible.

Common cross-brand action names:

| Action name | Meaning |
|---|---|
| `start_dive` | Begin dive / activate dive mode |
| `confirm` | Confirm selection / enter |
| `cancel` | Cancel / back |
| `scroll_up` | Navigate up in menu or logbook |
| `scroll_down` | Navigate down in menu or logbook |
| `enter_menu` | Open the settings/mode menu |
| `exit_menu` | Close menu, return to previous screen |
| `set_bookmark` | Mark a point in the dive log |
| `toggle_light` | Toggle backlight |
| `toggle_ascent_alarm` | Enable/disable ascent rate alarm |
| `activate_safety_stop` | Manually start safety stop timer |
| `switch_gas` | Switch to next gas mix (multi-gas) |
| `change_mode` | Cycle through operating modes (AIR/NITROX/GAUGE/FREE) |
| `view_ndl` | Switch NDL/deco display |
| `view_logbook` | Open logbook |

If the manual names an action differently (e.g., "Mode button activates the dive"), translate it: `activate_dive_mode`. Document the original wording in `notes` if it is ambiguous.

## Example

```json
"buttons": {
  "top_right": {
    "shape": "round",
    "position": "front_top_right",
    "label": "SELECT",
    "bbox_on_image": [820, 280, 40, 40],
    "confidence": "high",
    "actions": {
      "surface": "enter_menu",
      "surface_long": "toggle_light",
      "diving_safe": "set_bookmark",
      "diving_deco": null,
      "menu": "confirm"
    }
  },
  "bottom_right": {
    "shape": "rect_v",
    "position": "side_right_bottom",
    "label": null,
    "bbox_on_image": [930, 500, 18, 60],
    "confidence": "high",
    "actions": {
      "surface": "scroll_down",
      "diving_safe": "toggle_ascent_alarm",
      "menu": "scroll_down"
    }
  }
}
```

## Naming the button keys

Use a short, descriptive snake_case key that identifies the button by its role or position — whichever is more stable:

- Prefer role when it is unambiguous: `mode_button`, `select_button`, `up_button`.
- Prefer position when the role varies heavily: `top_right`, `side_left`.
- If the manual assigns a letter or number to each button (common in Suunto manuals), use that: `button_a`, `button_1`.

The key is internal to the spec; consistency within a spec matters more than cross-spec standardization.
