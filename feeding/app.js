import { Meal } from "./meal.js";

const $ = (id) => document.getElementById(id);
const meal = new Meal();
const video = $("camera");
let active = false,
  sound = true,
  stream,
  worker,
  session = 0,
  busy = false,
  timer,
  watchdog;
let mode = "none",
  lastPhase,
  frameGeneration = 0;
const foods = { rice: "🍚", carrot: "🥕", soup: "🥣" };
const messages = {
  ready: [
    "수아야, 같이 먹자!",
    "숟가락을 준비한 뒤 ‘한 입 준비’를 눌러 주세요.",
  ],
  armed: ["준비되면, 아~", "편안하게 입을 벌려요. 서두르지 않아도 괜찮아요."],
  open: ["츄츄도 아~", "한 입 먹고 입을 닫으면 츄츄도 냠냠!"],
  waiting: [
    "냠냠, 천천히 먹어요",
    "다 먹을 때까지 기다린 뒤 보호자가 확인해 주세요.",
  ],
  celebrate: ["수아, 잘했어요! ♡", "다음 한 입은 수아가 준비됐을 때 시작해요."],
  paused: ["잠깐 쉬어가요", "편안하게 쉬어요. 준비되면 다시 만나요."],
  ended: [
    "함께 먹어서 즐거웠어!",
    "오늘의 식사 놀이가 끝났어요. 다음에 또 만나요.",
  ],
};

function speak(text) {
  if (!sound || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ko-KR";
  utterance.rate = 0.9;
  utterance.volume = 0.8;
  window.speechSynthesis.speak(utterance);
}

function render() {
  const phase = meal.phase;
  document.body.classList.toggle("session-active", active && phase !== "ended");
  $("friend-stage").dataset.phase = phase;
  $("message").textContent = messages[phase][0];
  $("instruction").textContent = active
    ? messages[phase][1]
    : "시작 버튼을 누르면 츄츄가 기다릴게요.";
  $("arm").hidden = ["waiting", "paused", "ended"].includes(phase);
  $("arm").disabled = !active;
  $("arm").textContent =
    phase === "celebrate"
      ? "다음 한 입 준비 🥄"
      : ["armed", "open"].includes(phase)
        ? "다시 준비하기 🥄"
        : "한 입 준비 🥄";
  $("confirm").hidden = phase !== "waiting";
  $("manual-bite").hidden = !active || !["armed", "open"].includes(phase);
  $("manual-bite").textContent =
    mode === "manual" ? "한 입 먹기 동작 완료" : "입 동작 대신 버튼으로 진행";
  $("pause").disabled = !active || phase === "ended";
  $("pause").textContent = phase === "paused" ? "다시 함께 먹기" : "잠깐 쉬기";
  $("finish").disabled = !active || phase === "ended";
  $("start").hidden = active && phase !== "ended";
  $("start").textContent =
    phase === "ended" ? "새로 시작하기 ↗" : "카메라 켜고 시작하기 ↗";
  $("manual-start").hidden = active && phase !== "ended";
  if (lastPhase !== phase) {
    if (phase === "celebrate") speak("수아, 잘했어요!");
    if (phase === "ended") speak("함께 먹어서 즐거웠어. 다음에 또 만나!");
    lastPhase = phase;
  }
}

function cameraStatus(text, live = false) {
  $("camera-status").textContent = text;
  $("camera-dot").classList.toggle("live", live);
}

function releaseCamera() {
  session++;
  frameGeneration++;
  busy = false;
  clearTimeout(timer);
  clearTimeout(watchdog);
  worker?.terminate();
  worker = null;
  stream?.getTracks().forEach((track) => {
    track.onended = null;
    track.stop();
  });
  stream = null;
  video.srcObject = null;
  $("placeholder").hidden = false;
  $("face-hint").hidden = true;
  cameraStatus("카메라 꺼짐");
}

function trackerFailure() {
  releaseCamera();
  mode = "manual";
  if (["armed", "open"].includes(meal.phase)) meal.arm();
  $("camera-error").textContent =
    "얼굴 추적을 시작하지 못했어요. 카메라 없이 버튼으로 계속 놀 수 있어요.";
  $("camera-error").hidden = false;
  cameraStatus("버튼으로 놀이");
  render();
}

function begin() {
  releaseCamera();
  meal.phase = "ready";
  meal.since = null;
  meal.count = 0;
  active = true;
  lastPhase = null;
  $("camera-error").hidden = true;
  render();
  speak("수아야, 같이 먹자!");
}

async function sendFrame(token) {
  if (token !== session || !worker) return;
  if (
    !busy &&
    !document.hidden &&
    meal.phase !== "paused" &&
    video.readyState >= 2
  ) {
    busy = true;
    const generation = frameGeneration;
    try {
      const frame = await createImageBitmap(video);
      if (token !== session || generation !== frameGeneration || !worker) {
        frame.close();
        busy = false;
        if (token === session) timer = setTimeout(() => sendFrame(token), 100);
        return;
      }
      worker.postMessage(
        { type: "frame", frame, now: performance.now(), generation },
        [frame],
      );
      watchdog = setTimeout(trackerFailure, 12000);
    } catch {
      if (token === session) trackerFailure();
      return;
    }
  }
  if (token === session) timer = setTimeout(() => sendFrame(token), 100);
}

async function startCamera() {
  $("start").disabled = true;
  $("manual-start").disabled = true;
  begin();
  mode = "camera";
  cameraStatus("카메라 준비 중");
  const token = session;
  try {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia)
      throw new Error("insecure");
    const acquired = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
    });
    if (token !== session) {
      acquired.getTracks().forEach((track) => track.stop());
      return;
    }
    stream = acquired;
    stream.getVideoTracks()[0].onended = () => {
      if (token === session) trackerFailure();
    };
    video.srcObject = stream;
    await video.play();
    if (token !== session) return;
    $("placeholder").hidden = true;
    $("face-hint").hidden = false;
    cameraStatus("얼굴 추적 준비 중", true);
    worker = new Worker(new URL("./tracker.js", import.meta.url));
    watchdog = setTimeout(trackerFailure, 120000);
    worker.onerror = () => {
      if (token === session) trackerFailure();
    };
    worker.onmessage = ({ data }) => {
      if (token !== session) return;
      clearTimeout(watchdog);
      if (data.type === "ready") {
        cameraStatus("얼굴 추적 켜짐", true);
        sendFrame(token);
      }
      if (data.type === "error") trackerFailure();
      if (data.type === "result") {
        busy = false;
        if (
          data.generation !== frameGeneration ||
          document.hidden ||
          meal.phase === "paused"
        )
          return;
        $("face-hint").textContent =
          data.score === null
            ? "얼굴이 잘 보이게 앉아 주세요"
            : "얼굴을 찾았어요 ♡";
        meal.observe(data.score, performance.now());
        render();
      }
    };
    worker.postMessage({ type: "init" });
  } catch (error) {
    if (token !== session) return;
    releaseCamera();
    active = false;
    mode = "none";
    $("camera-error").textContent =
      error.message === "insecure"
        ? "카메라는 HTTPS 주소에서 열어 주세요. 카메라 없이도 놀 수 있어요."
        : error.name === "NotAllowedError"
          ? "카메라 사용이 허용되지 않았어요. 브라우저 설정에서 허용하거나 카메라 없이 시작해 주세요."
          : "카메라를 열지 못했어요. 다른 앱에서 사용 중인지 확인하거나 카메라 없이 시작해 주세요.";
    $("camera-error").hidden = false;
    render();
  } finally {
    $("start").disabled = false;
    $("manual-start").disabled = false;
  }
}

$("start").addEventListener("click", startCamera);
$("manual-start").addEventListener("click", () => {
  begin();
  mode = "manual";
  cameraStatus("버튼으로 놀이");
});
$("arm").addEventListener("click", () => {
  frameGeneration++;
  meal.arm();
  render();
});
$("manual-bite").addEventListener("click", () => {
  meal.manual();
  render();
});
$("confirm").addEventListener("click", () => {
  meal.confirm();
  render();
});
$("pause").addEventListener("click", () => {
  frameGeneration++;
  if (meal.phase === "paused") meal.resume();
  else meal.pause();
  window.speechSynthesis?.cancel();
  render();
});
$("finish").addEventListener("click", () => {
  releaseCamera();
  meal.finish();
  render();
});
$("sound").addEventListener("click", () => {
  sound = !sound;
  $("sound").setAttribute("aria-pressed", String(sound));
  $("sound").setAttribute("aria-label", sound ? "소리 끄기" : "소리 켜기");
  $("sound").textContent = sound ? "소리 켜짐 ♪" : "소리 꺼짐";
  if (sound) speak("수아야, 안녕!");
  else window.speechSynthesis?.cancel();
});
$("food").addEventListener("change", () => {
  const emoji = foods[$("food").value];
  $("food-art").textContent = emoji;
  $("spoon-food").textContent = emoji;
});
$("sensitivity").addEventListener("change", () => {
  frameGeneration++;
  meal.setThreshold($("sensitivity").value);
  if (["armed", "open"].includes(meal.phase)) meal.arm();
  render();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && active && meal.phase !== "ended") {
    frameGeneration++;
    meal.pause();
    window.speechSynthesis?.cancel();
    render();
  }
});
window.addEventListener("pagehide", () => {
  releaseCamera();
  if (active && meal.phase !== "ended") meal.pause();
  window.speechSynthesis?.cancel();
  render();
});
render();
