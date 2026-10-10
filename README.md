# webgl-shader-playground

Test fragment shaders in the browser — a small, offline-friendly playground
similar to Shadertoy. Edit GLSL on the right, see the result live on the left,
and export screenshots or the shader source when you're happy with it.

## Features

- **Live GLSL editing** with a Monaco-based editor and custom GLSL syntax
  highlighting.
- **Instant preview** rendered with WebGL (three.js) at your chosen aspect
  ratio.
- **Custom input texture** — the `tDiffuse` uniform starts as a bundled photo;
  pick any local image to replace it.
- **Screenshots** exported as PNG or JPG at any resolution (width/height are
  independent of the preview size).
- **Shader download** — save the current fragment shader as a `.frag` file.
- **Runs fully in the browser** — no server-side code, works from a static
  build.

## Usage

1. Open the app (see Development below, or the built `dist` branch).
2. Edit the fragment shader in the editor. The default shader samples the
   `tDiffuse` texture:

   ```glsl
   uniform sampler2D tDiffuse;
   uniform float opacity;
   varying vec2 vUv;
   void main() {
     vec4 texel = texture2D(tDiffuse, vUv);
     gl_FragColor = opacity * texel;
   }
   ```

3. Click **Run Shader** to compile and render it.
4. Set the export width/height and click **Screenshot!** to download a render
   at that resolution.
5. Click **Pick tDiffuse Image** to use your own texture.

## Shadertoy shaders

Paste any single-image shader from [shadertoy.com](https://www.shadertoy.com)
unchanged and press Run — when the code defines `mainImage(...)`, the playground
switches to Shadertoy mode automatically:

- All standard uniforms are provided: `iResolution`, `iTime`, `iTimeDelta`,
  `iFrame`, `iFrameRate`, `iSampleRate`, `iMouse`, `iDate`, `iChannelTime`,
  `iChannelResolution`, and `iChannel0..3`.
- Classic (`texture2D`, `gl_FragColor`) and modern (`texture`, `textureLod`,
  `texelFetch`) GLSL idioms both compile unchanged.
- Both Shadertoy eras are recognized: modern `mainImage(out vec4, in vec2)`
  sources, and legacy pre-2014 sources with their own `main()` writing
  `gl_FragColor` (e.g. iq's original "Raymarching primitives").
- Time-driven shaders animate automatically; `iMouse` follows your pointer on
  the preview (xy = position while down, zw = click position, negated on
  release — the Shadertoy convention).
- The legacy `iGlobalTime` name keeps working.
- `iChannel0..3` sample the playground's texture (the default kitten or the
  `tDiffuse` image you pick).

Not covered (yet): multi-pass shaders (Buffer A–D) — their channel wiring lives
in Shadertoy's UI rather than in the copied code, so it cannot be inferred from
a single pasted tab — and cubemap/video/keyboard channels.

## Development

Requirements: Node.js 22+.

Browser support: modern evergreen browsers (Chrome/Edge 100+, Firefox 100+,
Safari 15.4+) — the app ships as native ESM with ES2022 syntax (see
`.browserslistrc`). Older browsers get a friendly in-page message.

```sh
npm ci          # install dependencies
npm run dev     # start the dev server with hot reload
npm run build   # production build into dist/
npm run lint    # eslint
npm run format  # prettier --write .
```

Other scripts:

| Script                 | What it does                   |
| ---------------------- | ------------------------------ |
| `npm run format:check` | Verify Prettier formatting     |
| `npm test`             | Run the test suite (placeholder until test infra lands) |

## Project structure

```
public/                # static build inputs (index.html, default texture)
src/
  ShaderPlayground.tsx   # main app component (preview + editor + controls)
  glsl.ts                # GLSL Monarch language definition for Monaco
  shaders/               # default vertex & fragment shaders
  styles/                # CSS module for the layout
```

## License

[MIT](LICENSE)
