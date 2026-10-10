# design 02/10: Aurora Glass — frosted glass panels floating over a soft aurora gradient

**Exploration PR — please do not merge.** Ten designs are being evaluated in parallel.

## Identity / mood

Aurora Glass is the maximalist counterpoint to flat design: frosted glass panels
float in layers over a fixed aurora gradient mesh (deep indigo → violet night sky
with a soft cyan glow in dark mode; pale sky → lilac daybreak in light mode).
Depth comes from blur + translucency + soft colored halos, not from hard borders —
the single filled action ("Run Shader") glows like a small neon pill, and the live
recording state pulses with the same halo (static under `prefers-reduced-motion`).
Type is Plus Jakarta Sans (400/600/700) for UI, JetBrains Mono for code, on
soft 16px glass radii with fully pill-shaped buttons.

## Token table

| Token | Light | Dark |
| --- | --- | --- |
| `--bg` | `#eef2ff` | `#12102b` |
| `--panel` (solid-ish glass, ≥70% effective opacity) | `rgba(255,255,255,0.82)` | `rgba(24,20,58,0.82)` |
| `--text` | `#1e2340` | `#eef0ff` |
| `--accent` | `#6d28d9` (violet) | `#67e8f9` (cyan) |
| `--on-accent` (text on filled controls) | `#ffffff` | `#06222a` |
| `--border` (control edge) | `rgba(109,40,217,0.35)` | `rgba(255,255,255,0.22)` |
| `--danger` (destructive only: Reset / Delete / Discard) | `#e11d48` | `#fb7185` |
| `--danger-text` | `#be123c` | `#fb7185` |
| `--success` (status dot) | `#15803d` | `#34d399` |
| `--error` / `--error-text` (status + error banners) | `#dc2626` / `#b91c1c` | `#f87171` / `#f87171` |
| `--glass-bg` (decorative tier) | `rgba(255,255,255,0.55)` | `rgba(255,255,255,0.06)` |
| `--glass-border` | `rgba(255,255,255,0.40)` | `rgba(255,255,255,0.12)` |
| `--btn-bg` | `rgba(255,255,255,0.72)` | `rgba(18,16,44,0.62)` (frosted indigo) |
| `--input-bg` / `--input-border` | `rgba(255,255,255,0.85)` / `rgba(109,40,217,0.65)` | `rgba(255,255,255,0.08)` / `rgba(255,255,255,0.36)` |
| `--glow` / `--glow-strong` (halo) | `rgba(109,40,217,0.38)` / `rgba(109,40,217,0.55)` | `rgba(103,232,249,0.32)` / `rgba(103,232,249,0.5)` |
| mesh gradients | `#eef2ff`→`#f5e8ff`→`#e7f6ff` + cyan/violet/white blooms | `#12102b`→`#1e1145`→`#0d1b3e` + cyan/violet/sky blooms |

Two glass tiers, documented in `tailwind.css`: decorative `.glass`
(airy 55%/6% white + `backdrop-blur(16px)`) for frames with no body text, and
`.surface-panel` (≥70% effective opacity) for every panel that carries text.

## What changed per surface

- **App shell / background** (`tailwind.css` base): fixed `body::before` aurora
  gradient mesh (layered radial glows over a 155° three-stop gradient), tokens
  for both schemes, body font Plus Jakarta Sans. `THEME_BACKGROUNDS` updated to
  the mesh base colors so the pre-CSS flash matches.
- **Buttons** (`ui/Button.tsx` → `.btn*` component classes): one pill language,
  one box height, frosted fills, accent hover edge. `contained` = glowing accent
  fill (Run Shader only in the editor pane). `tone="warning"` = danger styling,
  used only for Reset to default shader / Delete / Discard.
- **Recording** (`ShaderPlayground.tsx`): active state is a pulsing accent halo
  (`.is-recording`), not a warning tone; pulse removed under reduced motion.
- **Toolbar**: floating frosted pill bar (`.glass rounded-full`) with theme
  toggle / Record / Settings.
- **Preview pane** (`PreviewPane.tsx`): `.glass` frame, canvas gets 16px radius +
  glass border + soft shadow (inline sizing styles untouched), zoom row pills,
  status strip as a glass pill, error banners on `--error` semantic tokens
  (both themes readable now — they were hardcoded light-only colors).
- **Editor pane** (`EditorPane.tsx`): `.glass` frame, editor inset in a rounded
  slab with custom Monaco themes ("aurora-dark"/"aurora-light") matching the
  scheme and `fontFamily: JetBrains Mono`; Run Shader is the single filled,
  glowing primary (taller pill); texture picker restyled to the same quiet pill
  language (was a second filled accent control).
- **Inputs** (`ui/TextField.tsx`, SettingsDialog): frosted fills, visible violet
  (light) / white (dark) edges, accent glow focus ring.
- **Panels** (download row, screenshot row, shader history, draft banner,
  status bar, toasts): `.surface-panel` solid-ish glass, 16px radius.
- **Settings dialog**: blurred scrim + glass card; selected theme = glowing
  accent pill; Close is quiet.
- **Fonts** (`public/index.html`): Plus Jakarta Sans 400/600/700 + JetBrains
  Mono 400/600 from Google Fonts with system fallback stacks.

## Measured contrast ratios (computed, not estimated)

Method: every surface is the *composited* stack (glass + panel layers blended
over the brightest and darkest points of the actual aurora mesh, per alpha in
the CSS), so these are worst-case ratios across the whole background.

### Light

| Pair | Ratio |
| --- | --- |
| Body text on text panel (`--text` on `--panel`) | 14.88:1 |
| Button text on glass button | 14.67:1 |
| Button text on hover | 12.56:1 |
| Input text in field | 15.21:1 |
| Floating label @75% opacity | 6.74:1 |
| Destructive text on danger button | 6.01:1 |
| Destructive text on danger hover | 5.15:1 |
| Error banner text on error fill | 5.40:1 |
| Filled button text (`--on-accent` on `--accent`) | 7.10:1 |
| Filled button text on hover (brightness 1.08) | 6.12:1 |
| Accent fill vs panel surface (≥3:1 required) | 6.90:1 |
| Accent fill vs button surface (≥3:1 required) | 6.80:1 |
| Accent text on button (recording state) | 6.80:1 |
| Success dot vs status strip | 4.87:1 |
| Error dot vs status strip | 4.69:1 |

### Dark

| Pair | Ratio |
| --- | --- |
| Body text on text panel (`--text` on `--panel`) | 13.98:1 |
| Button text on glass button | 12.80:1 |
| Button text on hover | 14.57:1 |
| Input text in field | 11.41:1 |
| Floating label @75% opacity | 7.16:1 |
| Destructive text on danger button | 5.39:1 |
| Destructive text on danger hover | 6.21:1 |
| Error banner text on error fill | 4.70:1 |
| Filled button text (`--on-accent` on `--accent`) | 11.41:1 |
| Filled button text on hover (brightness 1.08) | 11.71:1 |
| Accent fill vs panel surface (≥3:1 required) | 10.92:1 |
| Accent fill vs button surface (≥3:1 required) | 10.00:1 |
| Accent text on button (recording state) | 10.00:1 |
| Success dot vs status strip | 8.24:1 |
| Error dot vs status strip | 5.72:1 |

All text pairs ≥ 4.5:1 (WCAG AA) and accent-fill distinguishability ≥ 3:1 in
both schemes. Text on filled controls uses `--on-accent`, never literal `#fff`.
One accent per scheme; `--danger` is used only for destructive actions; the
status dot keeps its own success/error semantics.

## Not changing

Behavior, reducer/state logic, DOM structure tests rely on, all button/link
text (`Run Shader (Ctrl+Enter)`, `Screenshot!`, `Settings`, `Undo`, `Redo`,
`Fit`, `Zoom in`, `Zoom out`, `Compiled`, `Save shader`, `Load`, `Delete`,
`Reset to default shader`, `Download Shader (Ctrl+S)`, `Record (WebM)`,
`Pick tDiffuse Image`, `Dark theme`/`Light theme` …), aria-labels/roles, the
`max-[900px]` responsive stacking, and the preview canvas inline sizing are all
untouched. This is a visual-only exploration; no tests needed expectation
updates.

**Verification:** `npm run build:css && npx tsc --noEmit && npx eslint . && npm test` (148/148 unit tests pass) `&& npm run build` — all green.
