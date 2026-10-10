# design 03/10: Phosphor Terminal — a CRT terminal for shaders

**Exploration PR — do not merge.** One of ten parallel redesigns; the user picks a winner.

## Identity / mood

A green-phosphor CRT terminal rebuilt as a shader workbench: phosphor-green ink
on near-black glass with a faint 3px scanline texture, square 2px rules, and
utilitarian `[ BRACKETED ]` section labels. The light scheme is its "printout"
counterpart — warm paper, dark green ink, hairline dotted rules, no scanlines.
Type is VT323 (display/headings/buttons, uppercase, wide tracking) against
IBM Plex Mono 400/600 for body and labels; the Monaco editor gets its own
phosphor themes and the same IBM Plex Mono stack. Distinct through texture and
type, not layout gymnastics — layout is unchanged.

## Tokens

| Token | Dark (CRT) | Light (printout) |
| --- | --- | --- |
| `--bg` | `#0a0f0a` | `#f3f0e7` |
| `--panel` | `#0f1a10` | `#e9e5d8` |
| `--text` | `#b8f5c0` | `#22301f` |
| `--accent` | `#33ff66` | `#1d6b35` |
| `--border` | `#1e4d2b` | `#b9b39e` |
| `--danger` (destructive only) | `#ffb347` | `#b3261e` |
| `--on-accent` (text on fills) | `#05140a` | `#f3f0e7` |
| `--dot-success` | `#33ff66` | `#2e7d32` |
| `--dot-error` | `#ff5f56` | `#c62828` |
| rule width / style | `2px solid` | `1px dotted` |
| scanlines | `rgba(0,0,0,0.07)` 3px | none |

## Measured contrast ratios (WCAG AA verified, computed not guessed)

Dark scheme:

| Pair | Ratio |
| --- | --- |
| body text `#b8f5c0` on bg `#0a0f0a` | 15.53:1 |
| body text `#b8f5c0` on panel `#0f1a10` | 14.34:1 |
| accent text `#33ff66` on bg / panel | 14.40:1 / 13.30:1 |
| **filled-button text** `#05140a` on accent fill `#33ff66` | 14.08:1 |
| danger text `#ffb347` on bg / panel | 10.86:1 / 10.03:1 |
| danger-hover text `#05140a` on danger fill `#ffb347` | 10.61:1 |
| accent fill vs surface (non-text) | 14.40:1 |
| success / error dot vs panel (non-text) | 13.30:1 / 5.97:1 |

Light scheme:

| Pair | Ratio |
| --- | --- |
| body text `#22301f` on bg `#f3f0e7` | 12.20:1 |
| body text `#22301f` on panel `#e9e5d8` | 11.03:1 |
| accent text `#1d6b35` on bg / panel | 5.75:1 / 5.20:1 |
| **filled-button text** `#f3f0e7` on accent fill `#1d6b35` | 5.75:1 |
| danger text `#b3261e` on bg / panel | 5.74:1 / 5.19:1 |
| danger-hover text `#f3f0e7` on danger fill `#b3261e` | 5.74:1 |
| accent fill vs surface (non-text) | 5.75:1 |
| success / error dot vs panel (non-text) | 4.07:1 / 4.46:1 |

Every text-on-surface and text-on-fill pair is ≥ 4.5:1 (AA) in both schemes;
accent fills are ≥ 3:1 against their surface. Text on filled controls always
uses `--on-accent`, never a literal white. Panel rules (`--border`) are
decorative structure at 1.98:1 / 1.84:1; control boundaries themselves use the
accent border (≥ 3:1) so every control is identifiable.

## What changed per surface

- **`src/styles/tailwind.css`** — full token rewrite for both schemes
  (incl. `--danger`, `--on-accent`, dot semantics, glow, rule width/style),
  VT323 + IBM Plex Mono type setup, dark-only `body::before` scanline overlay
  (3px repeating-linear-gradient, very low opacity), `@layer components`
  classes: `.edge/.edge-accent/.edge-danger` (2px square rules), `.surface-panel`,
  `.section-label` (bracketed VT323 uppercase label, decorative only),
  `.micro-label`, `.glow` (faint accent text-shadow, dark only), `.error-box`.
- **`public/index.html`** — Google Fonts (VT323 + IBM Plex Mono 400/600,
  `display=swap`), theme-color + page background per scheme.
- **`src/ui/Button.tsx`** — square 2px borders (`radius 2px`), VT323 uppercase
  with wide tracking, uniform 36px box height; contained = solid phosphor
  block with `--on-accent` text; outlined = accent border/text that inverts to
  filled-green/dark-text on hover; `tone="danger"` (destructive only) and
  `tone="live"` (recording state) replace the old `warning` tone.
- **`src/ui/TextField.tsx`** — square field chrome, mono floating label that
  shrinks to an uppercase micro-label, accent focus border + glow ring.
- **`src/ui/Switch.tsx`** — uppercase tracked mono label, accent checkbox.
- **`src/ShaderPlayground.tsx`** — bracketed `PHOSPHOR TERMINAL` masthead
  (aria-hidden decorative), draft banner as `surface-panel`, Discard = danger
  tone, recording button = `live` tone while recording.
- **`src/EditorPane.tsx`** — Run Shader is the single filled primary; Undo/Redo
  and the file picker are secondary bordered controls in the same box language
  (the picker label restyled from filled to outlined to preserve the one-primary
  hierarchy); `[ EXPORT ]` section label; Monaco `fontFamily` set to the
  IBM Plex Mono stack.
- **`src/MonacoGlslEditor.tsx`** — custom `phosphor-dark` / `phosphor-print`
  Monaco themes (editor bg `#0f1a10` / `#f3f0e7`, phosphor cursor/line
  numbers/keywords) replacing stock `vs-dark`/`light`.
- **`src/PreviewPane.tsx`** — `CRT PREVIEW` bracket label, canvas gains the
  2px square frame (inline sizing styles untouched), `[ CAPTURE ]` panel,
  error/warning banners rebuilt as `.error-box` with theme danger token.
- **`src/StatusBar.tsx`** — status dots on `--dot-success`/`--dot-error`
  tokens with a faint glow.
- **`src/ToastHost.tsx`** — toast as square `surface-panel` with accent glow.
- **`src/SettingsDialog.tsx`** — panel dialog, VT323 heading, micro-labels;
  Light/Dark act as a segmented active-state pair (filled only when selected),
  Close is secondary.
- **`src/ShaderHistory.tsx`** — `ARCHIVE` bracket label panel; Delete is the
  only danger-toned control here.

## Not changing

Behavior is untouched: no state/reducer logic, keyboard shortcuts, or
download/screenshot/record flows were modified, and no button/link text,
aria-label, or role changed (all asserted strings like `Run Shader
(Ctrl+Enter)`, `Screenshot!`, `Settings`, `Undo`, `Redo`, `Fit`, `Zoom in`,
`Zoom out`, `Compiled`, `Save shader`, `Load`, `Delete`, `Reset to default
shader`, `Download Shader (Ctrl+S)`, `Record (WebM)`, `Pick tDiffuse Image`,
`Dark theme`/`Light theme` survive exactly). `max-[900px]` responsive stacking
and the preview canvas inline sizing styles are preserved. Visual-only class
and CSS-variable changes; bracket glyphs are CSS pseudo-content on aria-hidden
decorative labels only, so accessible names are unaffected.

## Verification

`npm run build:css && npx tsc --noEmit && npx eslint . && npm test && npm run build`
— all green (148/148 unit tests pass; no test expectations needed updating).
Rendered both themes in Chrome and confirmed: VT323/IBM Plex Mono loading,
single filled primary, uniform button row heights, scanlines in dark only.
