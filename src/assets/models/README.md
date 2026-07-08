# 3D Models

Place `.glb` models here (e.g. `cube.glb`) for future use.

The MVP renders a procedural placeholder cube (`createCube` in
`src/components/ModelViewer.jsx`) so no `.glb` file is required to run the
app out of the box.

To use a real GLB model instead of the placeholder cube:

1. Drop your `.glb` file in this folder, e.g. `src/assets/models/cube.glb`.
2. Import it with Vite's URL suffix:
   ```js
   import cubeModelUrl from "../assets/models/cube.glb?url";
   ```
3. Pass it to `ARScene` as the model config:
   ```jsx
   <ARScene
     imageTargetSrc={targetUrl}
     modelConfig={{ type: "glb", url: cubeModelUrl, scale: 0.3 }}
   />
   ```

`buildModel()` in `ModelViewer.jsx` already knows how to load `type: "glb"`
via `GLTFLoader`.
