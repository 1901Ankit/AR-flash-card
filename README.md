# AR Flash Card (React + MindAR + Three.js)

A web-based AR flash card app: point your phone camera at a physical flash
card and a 3D object appears on top of it, tracked in real time (similar to
Pokémon AR cards). Built with React (Vite), MindAR (image tracking), and
Three.js.

## Tech Stack

- React.js (Vite)
- MindAR (`mind-ar`) - image tracking
- Three.js (pinned to `0.151.3` - see note below)
- Tailwind CSS

## Folder Structure

```
src/
├── components/
│   ├── CameraView.jsx     # fullscreen container MindAR mounts video/canvas into
│   ├── ARScene.jsx        # composes CameraView + MarkerTracker + status overlay UI
│   ├── MarkerTracker.jsx  # MindAR lifecycle: init, anchor, found/lost events, cleanup
│   └── ModelViewer.jsx    # builds the 3D object shown on the card (cube, future GLB)
├── assets/
│   ├── marker/target.mind # compiled image target (placeholder - see below)
│   └── models/            # place .glb models here (future scope)
├── hooks/
│   └── useCamera.js       # camera permission probing + status
├── pages/
│   └── Home.jsx           # start screen -> launches ARScene
├── App.jsx
└── main.jsx
```

## Setup

```bash
npm install
npm run dev
```

Open the printed local URL. **AR features require HTTPS or `localhost`** and
a camera - test on your phone by exposing the dev server (e.g. via `--host`
and a tunnel, or `vite preview` behind HTTPS) if testing on a mobile device
over the network.

## IMPORTANT: Generate your own image target

`src/assets/marker/target.mind` is an **empty placeholder**. MindAR cannot
recognize any card until you replace it with a real compiled target:

1. Take a clear photo of the physical flash card you want to detect.
2. Go to the MindAR compiler: https://hiukim.github.io/mind-ar-js-doc/tools/compile
3. Upload the image, compile, and download `targets.mind`.
4. Replace `src/assets/marker/target.mind` with the downloaded file (keep the
   filename `target.mind`).

See `src/assets/marker/README.md` for more detail, including how to support
multiple cards at once.

## Current Scope (MVP)

- Request camera permission (with denied/unsupported states)
- Open rear camera automatically
- Detect one image marker via MindAR
- Show one animated placeholder 3D cube attached to the marker
- Continuous tracking (object follows the card as it moves)
- Hide object automatically when the marker is lost

## Extending

- **Multiple cards / models**: compile a multi-target `.mind` file, then call
  `addAnchor(index)` per target in `MarkerTracker.jsx` and look up the right
  `modelConfig` per index (see `src/assets/marker/README.md`).
- **GLB models**: `ModelViewer.jsx` already supports `{ type: "glb", url }`
  via `GLTFLoader`; see `src/assets/models/README.md`.
- **Videos / GIFs / audio / character info / API / admin panel / S3**: add
  new `type` cases to `buildModel()` in `ModelViewer.jsx` and/or a data layer
  in `pages/Home.jsx` that fetches card -> content mappings from an API
  instead of the hardcoded `DEFAULT_TARGET_SRC` / `DEFAULT_MODEL_CONFIG`.

## Notes

- MindAR manages its own Three.js `WebGLRenderer`/`Scene`/`Camera` (via
  `MindARThree`) synced to the camera feed, which is the standard, reliable
  way to do image-tracked AR.
- **Why `three` is pinned to `0.151.3`**: `mind-ar@1.2.5`'s prebuilt bundle
  (`mindar-image-three.prod.js`) still imports the deprecated `sRGBEncoding`
  export, which three.js removed starting at r152. Newer `three` versions
  will fail to bundle with a `MISSING_EXPORT` error. Do not upgrade `three`
  past `0.151.x` until `mind-ar` ships a fix (tracked upstream at
  https://github.com/hiukim/mind-ar-js/pull/503).
- `@react-three/fiber`/`drei` were intentionally **not** installed: `@react-three/fiber@9`
  requires `three>=0.156`, which conflicts with the `mind-ar` constraint above.
  Since MindAR already provides its own renderer/scene/camera, r3f isn't
  needed for this app; add it later only if you decouple 3D UI from the AR
  camera view and can use a separate, newer `three` instance.

