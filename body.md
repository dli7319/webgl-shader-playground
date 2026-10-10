# design 10/10: Soft Calm — gentle pastel neumorphism-lite (exploration, do not merge)

## Identity / mood

**Soft Calm** is a plush, tactile UI where nothing is separated by hard lines or
different fills — the page *is* the panel, and every surface is raised or
recessed purely by a diffused dual shadow (warm white light from the top-left,
cool gray shade from the bottom-right). Rounded 14px panels and 999px pill
buttons in Nunito give it a friendly, rounded voice, while a calm teal accent
(the only saturated color in the app) carries the single primary action with a
soft colored glow. Inputs are inset wells you want to press into; buttons
actually depress into an inset shadow on `:active` so the material feels
physical. Both schemes are the same material — the dark scheme is simply the
moonlit version of it.

## Token table

| Token | Light | Dark |
|---|---|---|
| `--bg` (page + panel fill) | `#e9edf3` | `#1e2430` |
| `--panel` (shadow-defined, same as bg) | `#e9edf3` | `#1e2430` |
| `--text` | `#2e3a4d` | `#d7dee9` |
| `--muted` (secondary text) | `#55627a` | `#a5b0c2` |
| `--accent` (teal — one accent per scheme) | `#0f766e` | `#2dd4bf` |
| `--on-accent` (text on filled accent) | `#ffffff` | `#062824` |
| `--border` (hairline definition) | `#d3dae4` | `#2c3546` |
| `--danger` (destructive only) | `#c62828` | `#f87171` |
| `--success` (status dot) | `#1e8e3e` | `#4ade80` |
| `--error` (status dot) | `#d32f2f` | `#f87171` |
| `--danger-bg/-border/-ink` (error banners) | `#fdecea` / `#f5c2c0` / `#b3261e` | `#3a2226` / `#6e3438` / `#fecaca` |
| `--warn-bg/-border/-ink` (warning banners) | `#fff4e5` / `#ffd591` / `#8c4a00` | `#3a3020` / `#6b5a2e` / `#fde68a` |

**Shadows** (the whole design language):
- raised: `6px 6px 12px rgba(163,177,198,.45), -6px -6px 12px rgba(255,255,255,.8)` (light) / `6px 6px 12px rgba(0,0,0,.45), -6px -6px 12px rgba(255,255,255,.05)` (dark)
- inset wells: the same pair, `inset`
- Run Shader glow: `0 10px 22px rgba(20,184,166,.35), …` (light) / `rgba(45,212,191,.22)` (dark)

**Deliberate deviations from the brief hexes** (both required by the WCAG gate,
both verified below): the light accent is deepened from `#14b8a6` to `#0f766e`
(the mint at `#14b8a6` measured only 2.49:1 with white text and 2.12:1 against
the surface — it stays alive as the glow/glow-soft tint, where no text sits on
it), and the light danger is deepened from `#ef4444` to `#c62828`
(`#ef4444` measured 3.20:1 on the surface, below the 4.5:1 text gate). Dark
scheme values are exactly as briefed.

## Measured contrast ratios (computed, both schemes)

| Pair | Light | Dark | Gate |
|---|---|---|---|
| body text on surface | **9.77:1** (`#2e3a4d`/`#e9edf3`) | **11.49:1** (`#d7dee9`/`#1e2430`) | 4.5 |
| muted text on surface | **5.23:1** | **7.10:1** | 4.5 |
| filled button text on accent fill | **5.47:1** (`#ffffff`/`#0f766e`) | **8.44:1** (`#062824`/`#2dd4bf`) | 4.5 |
| accent fill vs surface | **4.66:1** | **8.36:1** | 3.0 |
| danger text on surface | **4.78:1** (`#c62828`) | **5.62:1** (`#f87171`) | 4.5 |
| error banner ink on tint | **5.72:1** | **10.10:1** | 4.5 |
| warn banner ink on tint | **6.24:1** | **10.39:1** | 4.5 |
| success dot vs surface | **3.58:1** | **8.93:1** | 3.0 |
| error dot vs surface | **4.24:1** | **5.62:1** | 3.0 |

Text on filled controls always uses `--on-accent`, never a literal `#fff`.

## What changed per surface

- **`public/index.html`** — Google Fonts: Nunito 400/600/700 (display/body) +
  JetBrains Mono 400/500 (code), with `ui-rounded`/`ui-monospace` fallback
  stacks; theme-color follows the light surface.
- **`src/styles/tailwind.css`** — full token set for both schemes (above),
  neumorphic shadow pairs, Nunito body type, soft rounded scrollbars, mint
  text selection; `@layer components` classes: `.surface-panel` (14px raised
  panel), `.surface-card`, `.surface-well`/`.pill-island` (inset well / pill
  island), `.text-muted`, `.section-label`.
- **`src/ui/Button.tsx`** — every button is a 999px pill of one box height;
  quiet buttons are raised with a hairline `--border` and *press into* an inset
  shadow on `:active`; `contained` is the teal fill with the soft colored glow;
  the danger tone uses the `--danger` token (replacing the old literal
  `#ed6c02`) and is only used for destructive actions (Reset, Delete, Discard)
  plus the pre-existing red "Stop recording" state, which follows the universal
  red-recording convention (wiring untouched).
- **`src/ui/TextField.tsx`** — inputs are inset wells (inset shadow pair,
  no border), floating label on `--muted`, focus deepens the inset + teal
  outline.
- **`src/ui/Switch.tsx`** — accent-colored native switch, spacing polish.
- **`src/ShaderPlayground.tsx`** — top toolbar is a floating pill island;
  draft banner is a raised 14px panel; main split gutter widened.
- **`src/EditorPane.tsx`** — Monaco sits in a raised panel and now uses custom
  `soft-calm-light`/`soft-calm-dark` editor themes whose background equals
  `--bg` (the code surface is the same material) with JetBrains Mono via the
  allowed `fontFamily` editor option; the control block is a raised card;
  **Run Shader is the only filled action in the pane** (teal pill + glow,
  slightly taller); Undo/Redo/Reset/Download/Save are quiet pills; "Pick
  tDiffuse Image" is no longer a second filled accent chip — it's a quiet pill
  with the same box height as its row siblings.
- **`src/PreviewPane.tsx`** — canvas gets rounded corners + raised shadow
  (inline sizing styles untouched); zoom controls are a floating pill island;
  the screenshot row is a raised card with inset-well inputs; compile/texture/
  screenshot banners use theme-aware `--danger-*`/`--warn-*` tints (the old
  hardcoded light-only colors were invisible-on-cream in dark mode).
- **`src/StatusBar.tsx`** — floating pill island; semantic `--success`/`--error`
  dot with a soft glow; label in ink, secondary facts in `--muted`.
- **`src/ToastHost.tsx`** — toasts are raised 14px panels (the hard black drop
  shadow is gone; elevation is the dual-shadow pair now).
- **`src/SettingsDialog.tsx`** — dialog is a raised panel over a soft blurred
  scrim; number input is an inset well; theme/Close stay filled teal pills.
- **`src/ShaderHistory.tsx`** — raised card, quiet pills, Delete in `--danger`.

## Not changing

Visual only. No behavior, no reducer/state logic, no DOM structure tests rely
on. Every asserted string survives exactly: `Run Shader (Ctrl+Enter)`,
`Screenshot!`, `Settings`, `Undo`, `Redo`, `Fit`, `Zoom in`, `Zoom out`,
`Compiled`, `Save shader`, `Load`, `Delete`, `Reset to default shader`,
`Download Shader (Ctrl+S)`, `Record (WebM)`, `Pick tDiffuse Image`,
`Dark theme`/`Light theme`. The `max-[900px]` responsive stacking is kept
(restyled), preview canvas inline sizing is untouched, and the 148-test unit
suite passes unmodified. The only non-`tailwind.css` code touches are class
strings, two new visual-only Monaco themes, and widening the editor `options`
type with the allowed `fontFamily` field.

## Type

Nunito (400/600/700) for everything human, JetBrains Mono (400/500) for code
(Monaco + error `pre` blocks) — loaded from Google Fonts with fallback stacks.
