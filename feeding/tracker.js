/* Classic worker: MediaPipe's WASM loader uses importScripts. */
importScripts("./vendor/vision_bundle.js");

let detector;
let mouthScore;
self.onmessage = async ({ data }) => {
  if (data.type === "init") {
    try {
      ({ mouthScore } = await import("./meal.js"));
      const files = await Vision.FilesetResolver.forVisionTasks(
        new URL("./vendor/wasm", self.location.href).href,
      );
      detector = await Vision.FaceLandmarker.createFromOptions(files, {
        baseOptions: {
          modelAssetPath: new URL(
            "./vendor/face_landmarker.task",
            self.location.href,
          ).href,
          delegate: "CPU",
        },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFaceBlendshapes: true,
      });
      self.postMessage({ type: "ready" });
    } catch {
      self.postMessage({ type: "error" });
    }
  } else if (data.type === "frame") {
    try {
      const score = mouthScore(detector.detectForVideo(data.frame, data.now));
      self.postMessage({
        type: "result",
        score,
        now: data.now,
        generation: data.generation,
      });
    } catch {
      self.postMessage({ type: "error" });
    } finally {
      data.frame.close();
    }
  }
};
