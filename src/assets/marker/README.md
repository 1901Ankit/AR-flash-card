# Image Target (`target.mind`)

`target.mind` in this folder is a **placeholder** (empty file). MindAR cannot
track anything until you replace it with a real compiled target file.

## How to generate a real target

1. Take a clear, high-contrast photo of your physical flash card (the image
   that should be recognized).
2. Open the official MindAR compiler: https://hiukim.github.io/mind-ar-js-doc/tools/compile
3. Upload your image and click **Start**.
4. Download the generated `targets.mind` file.
5. Replace `src/assets/marker/target.mind` with the downloaded file (keep the
   same filename, `target.mind`).

## Multiple cards (future scope)

The MindAR compiler supports uploading multiple images at once, producing a
single `.mind` file with several targets (index 0, 1, 2, ...). To support
multiple flash cards later:

1. Compile a `.mind` file containing all card images.
2. In `MarkerTracker.jsx`, call `mindarThree.addAnchor(index)` once per
   target index instead of just `0`.
3. Maintain a lookup table (e.g. in `src/pages/Home.jsx` or fetched from an
   API) mapping target index -> `modelConfig` so each card shows its own
   3D model/video/GIF.
