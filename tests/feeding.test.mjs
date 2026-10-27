import test from "node:test";
import assert from "node:assert/strict";
import { Meal, mouthScore } from "../feeding/meal.js";

test("only an armed, sustained open-close sequence reaches caregiver confirmation", () => {
  const meal = new Meal();
  meal.observe(0.8, 0);
  assert.equal(meal.phase, "ready");
  meal.arm();
  meal.observe(0.8, 10);
  meal.observe(0.8, 310);
  assert.equal(meal.phase, "open");
  meal.observe(0.05, 320);
  meal.observe(0.05, 620);
  assert.equal(meal.phase, "waiting");
  assert.equal(meal.count, 0);
  meal.confirm();
  meal.confirm();
  assert.equal(meal.count, 1);
  assert.equal(meal.phase, "celebrate");
  meal.arm();
  assert.equal(meal.phase, "armed");
});

test("brief openings, missing faces, and invalid scores never count a bite", () => {
  const meal = new Meal();
  meal.arm();
  meal.observe(0.8, 0);
  meal.observe(0.1, 100);
  meal.observe(0.8, 200);
  assert.equal(meal.phase, "armed");
  meal.observe(null, 600);
  meal.observe(0.8, 900);
  assert.equal(meal.phase, "armed");
  meal.observe(NaN, 1300);
  meal.observe(Infinity, 1700);
  assert.equal(meal.phase, "armed");
  assert.equal(meal.count, 0);
});

test("tracking loss after opening requires a fresh opening before closing", () => {
  const meal = new Meal();
  meal.arm();
  meal.observe(0.8, 0);
  meal.observe(0.8, 300);
  meal.observe(null, 400);
  meal.observe(0.05, 500);
  meal.observe(0.05, 900);
  assert.equal(meal.phase, "armed");
});

test("pause, finish, and resume discard incomplete bites", () => {
  const meal = new Meal();
  meal.arm();
  meal.pause();
  meal.observe(0.8, 0);
  meal.confirm();
  assert.equal(meal.phase, "paused");
  meal.resume();
  assert.equal(meal.phase, "ready");
  meal.finish();
  meal.arm();
  meal.confirm();
  assert.equal(meal.phase, "ended");
});

test("manual mode still requires an explicit caregiver confirmation", () => {
  const meal = new Meal();
  meal.manual();
  assert.equal(meal.phase, "waiting");
  meal.confirm();
  assert.equal(meal.count, 1);
  meal.manual();
  meal.pause();
  meal.resume();
  assert.equal(meal.count, 1);
});

test("sensitivity changes threshold and resets an in-progress observation", () => {
  const meal = new Meal();
  meal.arm();
  meal.observe(0.4, 0);
  meal.observe(0.4, 300);
  assert.equal(meal.phase, "armed");
  meal.setThreshold(0.3);
  meal.observe(0.4, 400);
  meal.observe(0.4, 700);
  assert.equal(meal.phase, "open");
  meal.observe(0.2, 800);
  meal.observe(0.2, 1200);
  assert.equal(meal.phase, "open");
  meal.observe(0.05, 1300);
  meal.observe(0.05, 1600);
  assert.equal(meal.phase, "waiting");
});

test("mouth score reads jawOpen and returns null for no reliable face", () => {
  assert.equal(mouthScore({ faceLandmarks: [] }), null);
  assert.equal(
    mouthScore({
      faceLandmarks: [[]],
      faceBlendshapes: [
        { categories: [{ categoryName: "jawOpen", score: 0.6 }] },
      ],
    }),
    0.6,
  );
  assert.equal(mouthScore({ faceLandmarks: [[]] }), null);
  assert.equal(mouthScore(null), null);
});
