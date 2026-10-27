const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const modules =
  process.env.CHUCHU_NODE_MODULES ||
  path.join(
    process.env.USERPROFILE,
    ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules",
  );
const { chromium } = require(path.join(modules, "playwright"));
const root = path.resolve(__dirname, "..");
const base = process.env.CHUCHU_FEEDING_URL || "http://127.0.0.1:4187/feeding/";
const errors = [],
  results = [];
let server, browser;
const mark = (name) => {
  results.push(name);
  console.log("PASS " + name);
};
async function stage(page, phase) {
  await page.waitForFunction(
    (p) => document.querySelector("#friend-stage").dataset.phase === p,
    phase,
  );
}

(async () => {
  if (!process.env.CHUCHU_FEEDING_URL) {
    server = spawn(process.execPath, ["server.cjs"], {
      cwd: root,
      env: { ...process.env, CHUCHU_PORT: "4187" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    await new Promise((resolve, reject) => {
      server.stdout.once("data", resolve);
      server.once("error", reject);
      server.once("exit", (code) => reject(new Error("server exited " + code)));
    });
  }
  browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1000 },
    reducedMotion: "reduce",
  });
  const externalRequests = [],
    uploads = [];
  context.on("request", (request) => {
    if (
      /^https?:/.test(request.url()) &&
      new URL(request.url()).origin !== new URL(base).origin
    )
      externalRequests.push(request.url());
    if (!["GET", "HEAD"].includes(request.method()))
      uploads.push(request.method() + " " + request.url());
  });
  await context.addInitScript(() => {
    window.__spoken = [];
    speechSynthesis.speak = (utterance) => window.__spoken.push(utterance.text);
    speechSynthesis.cancel = () => {};
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  const requests = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto(base);
  assert.equal(await page.locator("#arm").isDisabled(), true);
  assert.equal(
    requests.some((url) => /vendor\//.test(url)),
    false,
  );
  mark("first screen loads without downloading model or accessing camera");
  await page.locator("#manual-start").click();
  await page.locator("#arm").click();
  await page.setViewportSize({ width: 390, height: 844 });
  fs.mkdirSync(path.join(root, "artifacts/feeding"), { recursive: true });
  await page.screenshot({
    path: path.join(root, "artifacts/feeding/mobile-playing.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 1280, height: 1000 });
  await stage(page, "armed");
  await page.locator("#manual-bite").click();
  await stage(page, "waiting");
  assert.equal(
    (await page.evaluate(() => window.__spoken)).includes("수아, 잘했어요!"),
    false,
  );
  await page.locator("#confirm").click();
  await stage(page, "celebrate");
  assert.equal(
    (await page.evaluate(() => window.__spoken)).filter(
      (x) => x === "수아, 잘했어요!",
    ).length,
    1,
  );
  mark("manual bite requires caregiver confirmation and praises exactly once");
  await page.locator("#arm").click();
  await page.locator("#pause").click();
  await stage(page, "paused");
  await page.locator("#pause").click();
  await stage(page, "ready");
  await page.locator("#food").selectOption("carrot");
  assert.equal(await page.locator("#spoon-food").textContent(), "🥕");
  await page.locator("#sound").click();
  await page.locator("#arm").click();
  await page.locator("#manual-bite").click();
  await page.locator("#confirm").click();
  assert.equal(
    (await page.evaluate(() => window.__spoken)).filter(
      (x) => x === "수아, 잘했어요!",
    ).length,
    1,
  );
  await page.locator("#finish").click();
  await stage(page, "ended");
  mark("pause resumes at preparation, food selection, mute and end work");
  fs.mkdirSync(path.join(root, "artifacts/feeding"), { recursive: true });
  await page.reload();
  for (const viewport of [
    { width: 1280, height: 1000 },
    { width: 820, height: 1180 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.screenshot({
      path: path.join(root, `artifacts/feeding/${viewport.width}.png`),
      fullPage: true,
    });
  }
  mark("desktop, tablet and mobile layouts have no horizontal overflow");

  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      throw new DOMException("denied", "NotAllowedError");
    };
  });
  await page.reload();
  await page.locator("#start").click();
  await page.locator("#camera-error").waitFor();
  assert.match(await page.locator("#camera-error").textContent(), /허용/);
  assert.equal(await page.locator("#start").isVisible(), true);
  await page.locator("#manual-start").click();
  await page.locator("#arm").click();
  await stage(page, "armed");
  mark("camera permission denial recovers to manual play");

  const tracked = await context.newPage();
  tracked.on("pageerror", (error) => errors.push(error.message));
  await tracked.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      window.__constraints = constraints;
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 240;
      canvas.getContext("2d").fillRect(0, 0, 320, 240);
      window.__cameraStream = canvas.captureStream(10);
      return window.__cameraStream;
    };
    window.Worker = class {
      constructor() {
        window.__tracker = this;
      }
      postMessage(data) {
        if (data.type === "init")
          setTimeout(() => this.onmessage({ data: { type: "ready" } }), 0);
        if (data.frame) {
          data.frame.close();
          this.generation = data.generation;
          this.onmessage({
            data: {
              type: "result",
              score: window.__currentScore ?? null,
              generation: this.generation,
            },
          });
        }
      }
      terminate() {}
    };
    window.__score = (score) => {
      window.__currentScore = score;
      window.__tracker.onmessage({
        data: {
          type: "result",
          score,
          generation: window.__tracker.generation,
        },
      });
    };
  });
  await tracked.goto(base);
  await tracked.locator("#start").click();
  await tracked.waitForFunction(
    () =>
      document.querySelector("#camera-status").textContent === "얼굴 추적 켜짐",
  );
  assert.equal(await tracked.evaluate(() => window.__constraints.audio), false);
  await tracked.locator("#arm").click();
  await tracked.waitForTimeout(150);
  await tracked.evaluate(() => window.__score(0.8));
  await tracked.waitForTimeout(300);
  await tracked.evaluate(() => window.__score(0.8));
  await stage(tracked, "open");
  await tracked.evaluate(() => window.__score(0.05));
  await tracked.waitForTimeout(300);
  await tracked.evaluate(() => window.__score(0.05));
  await stage(tracked, "waiting");
  await tracked.locator("#confirm").click();
  await stage(tracked, "celebrate");
  await tracked.screenshot({
    path: path.join(root, "artifacts/feeding/celebrate.png"),
    fullPage: true,
  });
  await tracked.locator("#finish").click();
  assert.equal(
    await tracked.evaluate(() =>
      window.__cameraStream
        .getTracks()
        .every((track) => track.readyState === "ended"),
    ),
    true,
  );
  mark(
    "camera stream + simulated mouth sequence reaches praise and releases camera on end",
  );
  await tracked.locator("#start").click();
  await tracked.waitForFunction(
    () =>
      document.querySelector("#camera-status").textContent === "얼굴 추적 켜짐",
  );
  await tracked.evaluate(() =>
    window.__tracker.onmessage({ data: { type: "error" } }),
  );
  await tracked.locator("#camera-error").waitFor();
  assert.equal(
    await tracked.evaluate(() =>
      window.__cameraStream
        .getTracks()
        .every((track) => track.readyState === "ended"),
    ),
    true,
  );
  await tracked.locator("#arm").click();
  await tracked.locator("#manual-bite").click();
  await stage(tracked, "waiting");
  mark("tracker failure releases camera and preserves playable manual flow");

  const cancelled = await context.newPage();
  await cancelled.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = () =>
      new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 240;
        window.__lateStream = canvas.captureStream(10);
        window.__allowCamera = () => resolve(window.__lateStream);
      });
  });
  await cancelled.goto(base);
  await cancelled.locator("#start").click();
  await cancelled.locator("#finish").click();
  await cancelled.evaluate(() => window.__allowCamera());
  await cancelled.waitForFunction(() =>
    window.__lateStream
      .getTracks()
      .every((track) => track.readyState === "ended"),
  );
  await stage(cancelled, "ended");
  mark(
    "ending during a pending permission request stops the late camera stream",
  );

  const inference = await context.newPage();
  inference.on("pageerror", (error) => errors.push(error.message));
  await inference.goto(base);
  const fixturePath = process.env.CHUCHU_FACE_FIXTURE;
  const fixture = fixturePath
    ? "data:image/jpeg;base64," +
      fs.readFileSync(fixturePath).toString("base64")
    : null;
  const modelResult = await inference.evaluate(async (fixture) => {
    const tracker = new Worker(new URL("./tracker.js", location.href));
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        tracker.terminate();
        reject(new Error("real model timed out"));
      }, 60000);
      tracker.onerror = (error) => {
        clearTimeout(timeout);
        tracker.terminate();
        reject(new Error(error.message));
      };
      tracker.onmessage = async ({ data }) => {
        if (data.type === "error") {
          clearTimeout(timeout);
          tracker.terminate();
          reject(new Error("real model init/inference error"));
        }
        if (data.type === "ready") {
          const canvas = document.createElement("canvas");
          canvas.width = 320;
          canvas.height = 240;
          let frame;
          if (fixture) {
            const image = new Image();
            image.src = fixture;
            await image.decode();
            frame = await createImageBitmap(image);
          } else frame = await createImageBitmap(canvas);
          tracker.postMessage(
            { type: "frame", frame, now: performance.now(), generation: 0 },
            [frame],
          );
        }
        if (data.type === "result") {
          clearTimeout(timeout);
          tracker.terminate();
          resolve(data);
        }
      };
      tracker.postMessage({ type: "init" });
    });
  }, fixture);
  if (fixture) assert.equal(Number.isFinite(modelResult.score), true);
  else assert.equal(modelResult.score, null);
  mark(
    fixture
      ? "actual model detects a face and jaw score in the official public sample"
      : "actual bundled MediaPipe WASM and face model initialize and run in a real Worker",
  );
  assert.deepEqual(externalRequests, []);
  assert.deepEqual(uploads, []);
  mark("all runtime requests stay on the site and no upload requests occur");
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    path.join(root, "artifacts/feeding/results.json"),
    JSON.stringify({ base, results, errors }, null, 2),
  );
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await browser?.close();
    server?.kill();
  });
