# design 04/10: **Brutalist Block** — unapologetic contrast, structure made visible, weight = hierarchy

An exploration redesign of the WebGL Shader Playground. **Do not merge** — one of
ten parallel design explorations; the user picks a winner.

## Identity / mood

Raw web brutalism with precision: thick 3px frames, hard offset shadows
(`4px 4px 0`), zero border radius (2px only on inputs), shouty uppercase display
type, and structure made visible — every pane is a stacked block, every section
label is a filled slab of text. Hierarchy comes from weight and fill, not color
noise: the yellow **Run Shader** block is the only filled action in the editor
pane and physically "presses" on hover (translate 2px, shadow collapses). Type:
Space Grotesk 500/700 for everything (buttons uppercase 700), JetBrains Mono for
code/status readouts, both loaded from Google Fonts with system fallbacks.

## Tokens (both schemes)

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `--bg` | `#f5f2e9` | `#101010` | app background (paper / ink) |
| `--panel` | `#ffffff` | `#1b1b1b` | secondary surfaces, button rest fill |
| `--text` | `#101010` | `#f5f2e9` | body text, frames |
| `--accent` | `#ffd400` | `#ffd400` | highlight yellow — FILL with black text only |
| `--border` | `#101010` | `#f5f2e9` | 2–3px frames + hard offset shadows |
| `--danger` | `#e03131` | `#ff6b6b` | destructive only (Reset, Delete, Discard) |
| `--on-accent` | `#101010` | `#101010` | text on accent fill (never literal `#fff`) |
| `--on-danger` | `#ffffff` | `#101010` | text on danger hover fill |
| `--success` | `#2e7d32` | `#4caf50` | status dot: compiled |
| `--error` | `#d32f2f` | `#ff6b6b` | status dot: error, compile-error banner |

## Measured contrast ratios (computed, not guessed)

| Pair | Light | Dark |
| --- | --- | --- |
| Body text on `--bg` | **17.00:1** | **17.00:1** |
| Body text on `--panel` | **19.03:1** | **15.39:1** |
| Run button text on accent fill | **13.29:1** | **13.29:1** |
| Danger button text on panel fill (rest) | **4.51:1** (AA) | **6.21:1** |
| Danger button text on danger fill (hover) | **4.51:1** (AA) | **6.86:1** |
| Section-label text on its filled block | **17.00:1** | **17.00:1** |
| Status success dot vs `--bg` (graphic) | **4.58:1** | **6.85:1** |
| Status error dot vs `--bg` (graphic) | **4.45:1** | **6.86:1** |
| Frame `--border` vs `--bg` (graphic) | **17.00:1** | **17.00:1** |
| Accent fill vs `--bg` (graphic) | 1.28:1 | **13.29:1** |

All text-on-fill pairs pass WCAG AA. Note on the light accent: `#ffd400` on the
paper `#f5f2e9` is a 1.28:1 highlighter-on-paper pairing by design, so every
accent fill is enclosed by a 3px `#101010` frame that provides 17:1 non-text
boundary contrast against the surface — the ≥3:1 distinguishability requirement
is met by the frame, and the yellow is never used for text or thin graphics.
Light danger text sits at 4.51:1 (passes AA ≥4.5) and only ever on the white
panel fill, never on the paper background.

## What changed per surface

- **`src/styles/tailwind.css`** — full light/dark token schemes (incl.
  `--danger/--on-accent/--on-danger/--success/--error`), Space Grotesk/JetBrains
  Mono stacks, `.btn`/`.btn-primary`/`.btn-danger` (press-on-hover interaction),
  `.section-label` (filled slab headings), `.surface-panel` (3px frame + hard
  offset shadow), thick dotted offset `:focus-visible` ring, yellow `::selection`.
- **`src/ui/Button.tsx`** — zero-radius 3px-framed uppercase 700 buttons, hard
  shadow collapsing on hover/active; `contained` = the yellow block; `tone
  "warning"` = destructive (paper fill, red frame/text, fills red on hover).
- **`src/ui/TextField.tsx`** — boxed fields (2px frame, 2px radius, small hard
  shadow) with bold uppercase floating labels.
- **`src/ui/Switch.tsx`** — bold uppercase label, enlarged checkbox with accent.
- **`src/ShaderPlayground.tsx`** — brutalist masthead (aria-hidden decorative
  wordmark + mono kicker), same-height toolbar row, draft banner as a framed
  panel, wider block gutters; `max-[900px]` stacking kept.
- **`src/PreviewPane.tsx`** — "OUTPUT · PREVIEW" slab, canvas framed (3px border
  + 6px hard shadow; inline sizing styles untouched), mono status-adjacent zoom
  row, "SCREENSHOT" panel block; error banners rebuilt as framed blocks (red
  frame for shader errors, yellow frame for warnings) with mono `<pre>`.
- **`src/EditorPane.tsx`** — "SOURCE · FRAGMENT SHADER" slab, Monaco wrapped in
  a framed panel with JetBrains Mono `fontFamily`, "CONTROLS" block where **Run
  Shader (Ctrl+Enter)** is the single yellow filled full-width action, "EXPORT"
  panel; Pick tDiffuse Image demoted to a secondary framed control.
- **`src/StatusBar.tsx`** — mono uppercase strip in a 2px frame with hard shadow;
  status dot is a hard square using `--success`/`--error` semantics.
- **`src/ToastHost.tsx`** — toasts as heavy framed slabs (3px + 5px shadow),
  uppercase bold text.
- **`src/SettingsDialog.tsx`** — 8px hard-shadow dialog, "SETTINGS" slab header,
  boxed inputs, selected theme shown as the yellow block.
- **`src/ShaderHistory.tsx`** — "SAVED SHADERS" panel block with framed rows.
- **`src/theme.ts`** — body background follows the new `--bg` tokens.
- **`public/index.html`** — Google Fonts (Space Grotesk 500/700, JetBrains Mono
  400/500) with system fallbacks; `theme-color` `#101010`.

## Not changing

Behavior is untouched: no reducer/state logic, DOM structure tests rely on,
button/link text, or aria-labels/roles changed — every asserted string (`Run
Shader (Ctrl+Enter)`, `Screenshot!`, `Settings`, `Undo`, `Redo`, `Fit`, `Zoom
in`, `Zoom out`, `Compiled`, `Save shader`, `Load`, `Delete`, `Reset to default
shader`, `Download Shader (Ctrl+S)`, `Record (WebM)`, `Pick tDiffuse Image`,
`Dark theme`/`Light theme`, …) survives exactly. No test expectations needed
updating. The `max-[900px]` responsive stacking and the preview canvas' inline
sizing styles are preserved.

## Verification

`npm run build:css && npx tsc --noEmit && npx eslint . && npm test && npm run
build` — all green (148/148 unit tests). Computed styles additionally verified
in a real browser in both themes (fonts, frames, shadows, token flips).
