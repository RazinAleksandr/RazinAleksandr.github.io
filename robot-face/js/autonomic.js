/**
 * autonomic.js — the brainstem.
 *
 * The LLM is cortex: it decides what the face should mean. It must never be
 * asked to schedule blinks, because a face that only blinks when a language
 * model remembers to is instantly, viscerally wrong.
 *
 * Everything here runs whether or not the model is thinking: spontaneous
 * blinking, saccadic gaze, respiration, postural sway, pupillary response,
 * swallowing. The model modulates these through arousal, valence and a gaze
 * policy — it does not drive them frame by frame.
 */

const TAU = Math.PI * 2;
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const lerp = (a, b, t) => a + (b - a) * t;

/** Log-normal sample, for inter-blink and fixation intervals. */
function logNormal(median, sigma) {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const n = Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
  return median * Math.exp(n * sigma);
}

export class Autonomic {
  constructor(nm) {
    this.nm = nm;
    this.t = 0;

    // Blinking
    this.blinkAt = 1.2;
    this.blinkPhase = -1; // -1 idle, else seconds into the blink
    this.blinkDur = 0.15;
    this.blinkQueue = 0;

    // Gaze
    this.mode = "engaged"; // engaged | thinking | averting | scanning
    this.gaze = { x: 0, y: 0 };
    this.gazeTarget = { x: 0, y: 0 };
    this.gazeBias = { x: 0, y: 0 }; // where cortex wants the eyes pointed
    this.fixationUntil = 0.6;
    this.vergence = 0;

    // Respiration
    this.breathPhase = Math.random() * TAU;
    this.breathRate = 0.26; // Hz ≈ 15.6 breaths/min
    this.breathDepth = 1;
    this.sighAt = 26;

    // Micro-posture
    this.swaySeed = Math.random() * 100;

    // Deglutition
    this.swallowAt = 9;
    this.swallow = 0;

    // Speech
    this.speaking = false;
    this.speechEnergy = 0;

    // Read-only outputs for the renderers
    this.out = { blink: 0, breath: 0, gazeX: 0, gazeY: 0, pupil: 0.5, swallow: 0, sway: { x: 0, y: 0, z: 0 } };
  }

  /** Cortex hands down a gaze policy rather than eye coordinates. */
  setGazePolicy(mode) {
    if (mode) this.mode = mode;
  }

  /** A deliberate look in a direction, in normalised units (-1..1). */
  setGazeBias(x, y) {
    this.gazeBias.x = clamp(x, -1, 1);
    this.gazeBias.y = clamp(y, -1, 1);
  }

  /** Force a blink now (flinch, punctuation, reaction to a loud statement). */
  triggerBlink(n = 1) {
    this.blinkQueue += n;
  }

  setSpeaking(on) {
    this.speaking = on;
    if (!on) this.speechEnergy = 0;
  }

  pickGazeTarget() {
    const nm = this.nm;
    const arousal = nm.arousal;
    let x, y, dwell;
    switch (this.mode) {
      case "thinking":
        // Gaze aversion during retrieval: up and to one side, held longer.
        x = (Math.random() < 0.65 ? -1 : 1) * (0.35 + Math.random() * 0.4);
        y = 0.25 + Math.random() * 0.4;
        dwell = logNormal(1.1, 0.35);
        break;
      case "averting":
        x = (Math.random() - 0.5) * 0.9;
        y = -(0.2 + Math.random() * 0.45);
        dwell = logNormal(0.9, 0.4);
        break;
      case "scanning":
        x = (Math.random() - 0.5) * 1.5;
        y = (Math.random() - 0.5) * 0.9;
        dwell = logNormal(0.32, 0.4);
        break;
      default: {
        // Engaged listening is not a fixed stare: the eyes hop around the
        // other person's face — eye, eye, mouth — every few hundred ms.
        const r = Math.random();
        if (r < 0.34) {
          x = -0.16;
          y = 0.1;
        } else if (r < 0.68) {
          x = 0.16;
          y = 0.1;
        } else if (r < 0.86) {
          x = 0;
          y = -0.16;
        } else {
          x = (Math.random() - 0.5) * 0.5;
          y = (Math.random() - 0.5) * 0.3;
        }
        x += (Math.random() - 0.5) * 0.07;
        y += (Math.random() - 0.5) * 0.05;
        dwell = logNormal(0.42 - arousal * 0.12, 0.42);
      }
    }
    this.gazeTarget.x = clamp(x + this.gazeBias.x, -1, 1);
    this.gazeTarget.y = clamp(y + this.gazeBias.y, -1, 1);
    this.fixationUntil = this.t + clamp(dwell, 0.14, 3.2);
    // A gaze shift larger than a few degrees usually carries a blink with it.
    if (Math.random() < 0.22) this.triggerBlink();
  }

  step(dt) {
    this.t += dt;
    const nm = this.nm;
    const arousal = nm.arousal;
    const tension = nm.tension;

    // ── Respiration ───────────────────────────────────────────────────────
    this.breathRate = lerp(0.21, 0.46, arousal) * (this.speaking ? 1.18 : 1);
    this.breathPhase += TAU * this.breathRate * dt;
    if (this.breathPhase > TAU) this.breathPhase -= TAU;
    // Inhale is shorter than exhale; skew the sine accordingly.
    const bp = this.breathPhase;
    const breath = Math.sin(bp) * (bp < Math.PI ? 1 : 0.72);
    this.breathDepth = lerp(this.breathDepth, 0.55 + arousal * 0.7 + tension * 0.25, dt * 0.8);
    let breathOut = breath * this.breathDepth;

    if (this.t > this.sighAt) {
      this.sighAt = this.t + logNormal(nm.valence < -0.2 ? 22 : 48, 0.4);
      this.breathPhase = 0;
      this.breathDepth = 1.9;
    }
    this.out.breath = breathOut;
    nm.setReflex("nasalis_dilator", "both", clamp(breathOut * 0.22 + arousal * 0.1, 0, 0.5));

    // ── Blinking ──────────────────────────────────────────────────────────
    if (this.blinkPhase < 0) {
      if (this.blinkQueue > 0 || this.t >= this.blinkAt) {
        if (this.blinkQueue > 0) this.blinkQueue--;
        this.blinkPhase = 0;
        // Blinks are faster when alert, sluggish when tired or sad.
        this.blinkDur = clamp(logNormal(0.145, 0.14) * (1.25 - arousal * 0.35), 0.09, 0.34);
        // Blink rate: ~15/min at rest, up under stress, down under visual load.
        const median = this.mode === "thinking" ? 6.5 : lerp(5.4, 2.1, arousal);
        this.blinkAt = this.t + clamp(logNormal(median, 0.62), 0.9, 22);
        // Double blinks are common and read as very natural.
        if (Math.random() < 0.17) this.blinkQueue++;
      }
      nm.setReflex("orbicularis_oculi_blink", "both", 0);
      this.out.blink = 0;
    } else {
      this.blinkPhase += dt;
      const u = this.blinkPhase / this.blinkDur;
      if (u >= 1) {
        this.blinkPhase = -1;
        this.out.blink = 0;
        nm.setReflex("orbicularis_oculi_blink", "both", 0);
      } else {
        // Closing is roughly twice as fast as reopening.
        const a = u < 0.36 ? u / 0.36 : 1 - (u - 0.36) / 0.64;
        const v = clamp(a, 0, 1);
        const eased = v * v * (3 - 2 * v);
        this.out.blink = eased;
        nm.setReflex("orbicularis_oculi_blink", "both", eased);
      }
    }

    // ── Saccades and microsaccades ────────────────────────────────────────
    if (this.t >= this.fixationUntil) this.pickGazeTarget();
    // Saccades are ballistic: ~400°/s, so a normal shift completes in ~40 ms.
    const k = clamp(dt / 0.045, 0, 1);
    this.gaze.x += (this.gazeTarget.x - this.gaze.x) * k;
    this.gaze.y += (this.gazeTarget.y - this.gaze.y) * k;
    // Ocular drift and tremor — the eye is never still.
    const drift = 0.012;
    const mx = Math.sin(this.t * 3.1 + this.swaySeed) * drift + (Math.random() - 0.5) * 0.004;
    const my = Math.cos(this.t * 2.3 + this.swaySeed) * drift * 0.7 + (Math.random() - 0.5) * 0.004;
    this.out.gazeX = clamp(this.gaze.x + mx, -1, 1);
    this.out.gazeY = clamp(this.gaze.y + my, -1, 1);
    nm.setReflex("gaze_horizontal", "both", this.out.gazeX);
    nm.setReflex("gaze_vertical", "both", this.out.gazeY);

    // ── Pupillary response ────────────────────────────────────────────────
    // Sympathetic tone widens, positive calm narrows; slow to follow.
    const pupilTarget = clamp(0.42 + arousal * 0.42 + Math.abs(nm.valence) * 0.08 - 0.06, 0.15, 0.95);
    this.out.pupil = lerp(this.out.pupil, pupilTarget, clamp(dt * 1.6, 0, 1));
    nm.setReflex("pupillary_dilation", "both", (this.out.pupil - 0.5) * 0.7);

    // ── Deglutition ───────────────────────────────────────────────────────
    if (this.swallow > 0) {
      this.swallow -= dt / 0.55;
      if (this.swallow < 0) this.swallow = 0;
    } else if (this.t > this.swallowAt) {
      this.swallowAt = this.t + logNormal(tension > 0.4 ? 7 : 15, 0.5);
      this.swallow = 1;
    }
    this.out.swallow = this.swallow > 0 ? Math.sin(this.swallow * Math.PI) : 0;

    // ── Postural sway ─────────────────────────────────────────────────────
    // Superposed slow sinusoids never quite repeat, which is what keeps a
    // head from looking like it is on a servo.
    const s = this.swaySeed,
      T = this.t;
    const amp = 0.055 + arousal * 0.05;
    const sway = {
      x: (Math.sin(T * 0.23 + s) * 0.6 + Math.sin(T * 0.41 + s * 2.1) * 0.3) * amp,
      y: (Math.sin(T * 0.19 + s * 1.7) * 0.5 + Math.sin(T * 0.37 + s) * 0.25) * amp + breathOut * 0.018,
      z: Math.sin(T * 0.15 + s * 3.3) * 0.5 * amp * 0.8,
    };
    this.out.sway = sway;
    nm.setReflex("head_yaw", "both", sway.x);
    nm.setReflex("head_pitch", "both", sway.y);
    nm.setReflex("head_roll", "both", sway.z);

    // ── Speech-driven articulation ────────────────────────────────────────
    if (this.speaking) {
      // Envelope roughly at syllable rate with jitter; drives jaw and lips.
      const syl = 4.4 + Math.sin(T * 0.9) * 0.8;
      const e = Math.max(0, Math.sin(T * TAU * syl) * 0.5 + 0.5) * (0.55 + Math.random() * 0.45);
      this.speechEnergy = lerp(this.speechEnergy, e, clamp(dt * 22, 0, 1));
      nm.setReflex("masseter_relaxation", "both", this.speechEnergy * 0.42);
      nm.setReflex("lips_part", "both", 0.25 + this.speechEnergy * 0.35);
    } else if (this.speechEnergy > 0.001) {
      this.speechEnergy = lerp(this.speechEnergy, 0, clamp(dt * 8, 0, 1));
      nm.setReflex("masseter_relaxation", "both", this.speechEnergy * 0.42);
      nm.setReflex("lips_part", "both", this.speechEnergy * 0.3);
    }
  }
}
