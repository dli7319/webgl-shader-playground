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
| `--glow` / `--glow-strong` (halo) | `rgba(109,40,217,0.45)` / `rgba(109,40,217,0.6)` | `rgba(103,232,249,0.32)` / `rgba(103,232,249,0.5)` |
| mesh gradients | `#eef2ff`→`#f0e4ff`→`#ddf1ff` + cyan/violet/white blooms | `#12102b`→`#1e1145`→`#0d1b3e` + cyan/violet/sky blooms |

Two glass tiers, documented in `tailwind.css`: decorative `.glass`
(airy 55%/6% white + `backdrop-blur(16px)`) for frames with no body text, and
`.surface-panel` (≥70% effective opacity) for every panel that carries text.

## What changed per surface

- **App shell / background** (`tailwind.css` base): transparent app shell over a fixed `body::before` aurora
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
| Body text on text panel (`--text` on `--panel`) | 14.74:1 |
| Button text on glass button | 14.44:1 |
| Button text on hover | 12.37:1 |
| Input text in field | 15.12:1 |
| Floating label @75% opacity | 6.70:1 |
| Destructive text on danger button | 5.92:1 |
| Destructive text on danger hover | 5.07:1 |
| Error banner text on error fill | 5.34:1 |
| Filled button text (`--on-accent` on `--accent`) | 7.10:1 |
| Filled button text on hover (brightness 1.08) | 6.12:1 |
| Accent fill vs panel surface (≥3:1 required) | 6.83:1 |
| Accent fill vs button surface (≥3:1 required) | 6.69:1 |
| Accent text on button (recording state) | 6.69:1 |
| Success dot vs status strip | 4.82:1 |
| Error dot vs status strip | 4.64:1 |

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

## Layout pass — floating glass islands + a macOS-style glass dock

**Spatial concept.** The two-column wall-of-controls is gone. Three floating
glass islands sit over the aurora mesh: the preview is the large dominant
canvas card (56%), the editor a subordinate glass panel beside it (44%), and
every action lives in a detached, bottom-centered **glass dock** — Run Shader
is the glowing dock item, and export/history/settings are glass sheets that
rise above the dock, each opened from a dock item that carries a tiny live
summary of what's inside. On <900px the islands stack (preview first) and the
dock stays a floating bottom bar with sheets as near-full-width bottom sheets.

**Surface archetype: mixed — Operate / Configure / Monitor.**
- *Operate* (always available, no mode change): preview island (canvas + zoom
  cluster) and the dock (Run, theme, openers).
- *Configure*: the glass sheets (Export / History / Settings) above the dock.
- *Monitor*: status chip + compile/texture/screenshot banners pinned to the
  canvas island — they recolor in place on state change, nothing moves.

**Decision counts** (interactive controls on the always-visible surface;
read-only readouts like the zoom % and status chip excluded):
**before 20 → after 10.**
Visible now: `−` `+` `Fit` (zoom cluster), `Undo`, `Redo`, `Run Shader
(Ctrl+Enter)` (the single filled/primary, visible without opening anything),
`Dark theme`/`Light theme`, and the three dock openers `Export` / `History` /
`Settings`.

**Where each object's controls live** (one object, one group — nothing split):
- **Zoom cluster** (`−`/value/`+`/`Fit`) → one pill group on the preview island.
- **Screenshot export** (Width + Height + Filename + `Screenshot!`) → Export
  sheet, group "Screenshot (PNG)".
- **Shader file** (Filename + `Download Shader (Ctrl+S)`) → Export sheet, group
  "Shader file (GLSL)".
- **Video** (`Record (WebM)` / `Stop recording`) → Export sheet, group
  "Video (WebM)".
- **History** (name + `Save shader` + list of `Load`/`Delete`) → History sheet
  (its empty state is neutral and carries a direct save affordance).
- **Settings** (Editor font size, `Word wrap`, `Auto-run while typing`, Theme
  `Light`/`Dark`, `Pick tDiffuse Image`, `Reset to default shader` danger row)
  → Settings sheet.

**Disclosed state reported beside each opener** (dock labels):
- Export: `1920×1080 · screenshot.png` + `fragment.frag` (size + both
  filenames), plus a pulsing `REC` badge while a recording is live — the badge
  is an in-place flag swap, no block ever moves.
- History: `3 saved` / `No saves`.
- Settings: `14px · wrap off · auto on` + `tDiffuse: <file or "default texture">`.
The open dock item is marked `aria-expanded="true"` and glows quietly.

**Test expectations changed in this commit** (labels/roles/behavior untouched):
- `PreviewPane.test.tsx` "renders the screenshot controls regardless of errors"
  → "renders the zoom cluster and status regardless of errors": the export
  controls left the preview pane, and what must survive errors is the canvas
  island's monitor surface. The old screenshot-controls expectations moved to
  the new `ExportSheet.test.tsx` ("renders the full screenshot export group",
  "exposes accessible names for the export controls") — same strings, now
  encoding their home in the Export sheet.
- `PreviewPane.test.tsx` accessible-names test now covers the preview + zoom
  cluster only.
- New `ActionDock.test.tsx` pins the dock contract: the primary is visible
  without opening anything, every opener carries its state summary, the REC
  flag appears while recording, and the open item reports `aria-expanded`.
- E2E (not executed here — Playwright browsers are single-session) placement
  expectations updated to open the relevant sheet first (smoke/flows/screenshot
  click the `Export`/`Settings` dock items before touching disclosed controls;
  `settings.spec.ts` matches the Settings opener by `/^settings/i` since its
  accessible name now includes the state summary). All pinned label strings
  survive exactly.

**Verification:** `npm run build:css && npx tsc --noEmit && npx eslint . &&
npm test` (160/160 unit tests pass — 148 original + 12 new for the dock and
sheets) `&& npm run build` — all green. Screenshots above are from the styling
pass and will be re-taken for this layout.
