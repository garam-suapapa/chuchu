# Bundled face tracking

- `vision_bundle.js`, `wasm/*`: `@mediapipe/tasks-vision` **1.1.1**, official npm package, Apache-2.0. See `LICENSE`.
- `face_landmarker.task`: Google MediaPipe Face Landmarker float16 model, version **1**.
- Model source: https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task
- Upstream documentation: https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker/web_js

These files are served from the same origin as the game. No external CDN is needed at runtime. The first camera session downloads the model and a WASM runtime; subsequent visits can use the browser cache. Model confidence and performance must be checked on the child's actual device; mouth movement does not establish food intake or swallowing.
