export class Meal {
  phase = "ready";
  count = 0;
  threshold = 0.45;
  since = null;
  setThreshold(value) {
    this.threshold = Math.max(0.2, Math.min(0.75, Number(value) || 0.45));
    this.since = null;
  }
  arm() {
    if (
      ["ready", "celebrate", "waiting", "armed", "open"].includes(this.phase)
    ) {
      this.phase = "armed";
      this.since = null;
    }
  }
  observe(score, now) {
    if (!["armed", "open"].includes(this.phase)) return;
    if (!Number.isFinite(score)) {
      this.since = null;
      this.phase = "armed";
      return;
    }
    const matches =
      this.phase === "armed"
        ? score >= this.threshold
        : score <= this.threshold * 0.4;
    if (!matches) {
      this.since = null;
      return;
    }
    if (this.since === null) this.since = now;
    if (now - this.since >= 250) {
      this.phase = this.phase === "armed" ? "open" : "waiting";
      this.since = null;
    }
  }
  manual() {
    if (!["paused", "ended"].includes(this.phase)) {
      this.phase = "waiting";
      this.since = null;
    }
  }
  confirm() {
    if (this.phase === "waiting") {
      this.count++;
      this.phase = "celebrate";
    }
  }
  pause() {
    if (this.phase !== "ended") {
      this.phase = "paused";
      this.since = null;
    }
  }
  resume() {
    if (this.phase === "paused") this.phase = "ready";
  }
  finish() {
    this.phase = "ended";
    this.since = null;
  }
}

export function mouthScore(result) {
  if (!result?.faceLandmarks?.length) return null;
  const score = result.faceBlendshapes?.[0]?.categories?.find(
    (item) => item.categoryName === "jawOpen",
  )?.score;
  return Number.isFinite(score) ? score : null;
}
