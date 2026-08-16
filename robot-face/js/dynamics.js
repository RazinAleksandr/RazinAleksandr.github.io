/**
 * dynamics.js — the neuromuscular layer.
 *
 * The model issues discrete commands ("contract zygomaticus major to 0.55 over
 * 210 ms, hold 1200 ms, release over 320 ms"). Real muscle does not step to a
 * value: it is a mass on a spring driven by a noisy motor unit population, it
 * fatigues, it inhibits its antagonists, and it drags its synergists along.
 *
 * Everything that makes the result look alive rather than animated happens
 * here, between the command and the pixel.
 */

import { MUSCLES, MUSCLE_BY_ID } from "./facs.js";

/** Deterministic PRNG so a given "person" always has the same idiosyncrasies. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

class Fibre {
  constructor(muscle, side, rng) {
    this.muscle = muscle;
    this.side = side;
    this.value = 0; // what the renderer sees
    this.velocity = 0;
    this.command = 0; // voluntary target from the model
    this.reflex = 0; // autonomic target from the brainstem layer
    this.noise = 0; // Ornstein-Uhlenbeck motor-unit tremor
    this.fatigue = 0;
    // Persistent contraction bias — nobody's face is symmetric.
    this.asym = (rng() - 0.5) * 0.13;
  }
}

class Envelope {
  constructor(id, side, peak, onset, hold, release, t0, note) {
    this.id = id;
    this.side = side;
    this.peak = peak;
    this.onset = Math.max(16, onset);
    this.hold = Math.max(0, hold);
    this.release = Math.max(16, release);
    this.t0 = t0;
    this.note = note || "";
    this.sustain = hold === 0; // hold indefinitely until superseded
  }
  /** Envelope amplitude at time t, or null once it has fully expired. */
  at(t) {
    const e = t - this.t0;
    if (e < 0) return 0;
    if (e < this.onset) {
      // Muscle recruitment is sigmoidal, not linear — motor units join in.
      const u = e / this.onset;
      return this.peak * (u * u * (3 - 2 * u));
    }
    const afterOnset = e - this.onset;
    if (this.sustain || afterOnset < this.hold) return this.peak;
    const r = (afterOnset - this.hold) / this.release;
    if (r >= 1) return null;
    // Relaxation is exponential — passive elastic recoil, not a driven ramp.
    return this.peak * Math.exp(-3.2 * r) * (1 - r);
  }
}

export class Neuromuscular {
  constructor({ seed = 20260816 } = {}) {
    this.rng = mulberry32(seed);
    this.fibres = {};
    for (const m of MUSCLES) {
      this.fibres[m.id] = {
        left: new Fibre(m, "left", this.rng),
        right: new Fibre(m, "right", this.rng),
      };
    }
    this.envelopes = [];
    /** Affective context that modulates the whole system. */
    this.arousal = 0.25; // 0 calm … 1 activated
    this.valence = 0.05; // -1 negative … 1 positive
    this.tension = 0.1; // muscular guardedness
    this.mood = 0.05; // slow-moving baseline valence
    this.time = 0;
  }

  /** Queue one muscle command. Returns the envelope for telemetry. */
  innervate(id, { intensity = 0, side = "both", delay_ms = 0, onset_ms, hold_ms, release_ms, note } = {}) {
    const m = MUSCLE_BY_ID[id];
    if (!m) return null;
    const lo = m.signed ? -m.ceiling : 0;
    const peak = clamp(intensity, lo, m.ceiling);
    const onset = onset_ms ?? m.tau;
    const hold = hold_ms ?? 1200;
    const release = release_ms ?? Math.round(onset * 1.5);
    const sides = m.bilateral ? (side === "both" ? ["left", "right"] : [side]) : ["left", "right"];
    const delay = clamp(delay_ms || 0, 0, 4000);

    // A new command on the same muscle+side supersedes the old one.
    this.envelopes = this.envelopes.filter((e) => !(e.id === id && sides.includes(e.side)));
    const made = [];
    for (const s of sides) {
      // Motor commands never arrive at exactly the same instant on both sides.
      const jitter = m.bilateral && side === "both" ? (s === "left" ? 0 : 8 + this.rng() * 26) : 0;
      const env = new Envelope(id, s, peak, onset, hold, release, this.time + delay + jitter, note);
      this.envelopes.push(env);
      made.push(env);
    }
    return made;
  }

  /** Release every voluntary command; the face falls back to its resting mood. */
  relaxAll(release_ms = 700) {
    const t = this.time;
    for (const e of this.envelopes) {
      if (e.sustain) {
        e.sustain = false;
        e.hold = Math.max(0, t - e.t0 - e.onset);
        e.release = release_ms;
      }
    }
  }

  /** The brainstem layer writes here; it is combined with, not replaced by, voluntary drive. */
  setReflex(id, side, v) {
    const f = this.fibres[id];
    if (!f) return;
    if (side === "both") {
      f.left.reflex = v;
      f.right.reflex = v;
    } else f[side].reflex = v;
  }

  get(id) {
    const f = this.fibres[id];
    return f ? (f.left.value + f.right.value) * 0.5 : 0;
  }
  getSide(id, side) {
    const f = this.fibres[id];
    return f ? f[side].value : 0;
  }

  /** Resting tone implied by long-term mood — nobody's face is truly blank. */
  baselineFor(id) {
    const mood = this.mood;
    switch (id) {
      case "zygomaticus_major":
        return mood > 0 ? mood * 0.16 : 0;
      case "orbicularis_oculi_pars_orbitalis":
        return mood > 0 ? mood * 0.1 : 0;
      case "depressor_anguli_oris":
        return mood < 0 ? -mood * 0.18 : 0;
      case "corrugator_supercilii":
        return mood < 0 ? -mood * 0.14 + this.tension * 0.12 : this.tension * 0.08;
      case "frontalis_pars_medialis":
        return mood < 0 ? -mood * 0.08 : 0;
      case "levator_palpebrae_inhibition":
        return clamp(0.12 - this.arousal * 0.2, 0, 0.2);
      case "lips_part":
        return clamp(0.12 + this.arousal * 0.12 - this.tension * 0.2, 0, 0.4);
      case "orbicularis_oris_pressor":
        return this.tension * 0.22;
      case "platysma":
        return this.tension * 0.18;
      default:
        return 0;
    }
  }

  step(dt) {
    this.time += dt * 1000;
    const t = this.time;

    // ── 1. Collect voluntary drive from live envelopes ────────────────────
    const drive = {};
    for (const m of MUSCLES) drive[m.id] = { left: 0, right: 0 };
    const expired = [];
    for (const e of this.envelopes) {
      const a = e.at(t);
      if (a === null) {
        expired.push(e);
        continue;
      }
      const cur = drive[e.id][e.side];
      // Same-sign commands take the larger magnitude; opposite signs sum.
      drive[e.id][e.side] = Math.sign(a) === Math.sign(cur) && cur !== 0 ? (Math.abs(a) > Math.abs(cur) ? a : cur) : cur + a;
    }
    if (expired.length) this.envelopes = this.envelopes.filter((e) => !expired.includes(e));

    // ── 2. Involuntary synergist recruitment ──────────────────────────────
    // Fire zygomaticus major and orbicularis oculi comes along for the ride,
    // unless the model explicitly commanded orbicularis oculi lower (a social
    // smile). This single rule is most of the difference between a face that
    // looks sincere and one that looks like a mask.
    for (const m of MUSCLES) {
      for (const syn of m.synergists) {
        for (const side of ["left", "right"]) {
          const src = drive[m.id][side];
          if (src <= 0) continue;
          const commanded = this.envelopes.some((e) => e.id === syn.id && e.side === side);
          const pull = src * syn.gain * (commanded ? 0.35 : 1);
          if (pull > drive[syn.id][side]) drive[syn.id][side] = pull;
        }
      }
    }

    // ── 3. Reciprocal inhibition between antagonists ──────────────────────
    const inhibited = {};
    for (const m of MUSCLES) {
      inhibited[m.id] = { left: 0, right: 0 };
      for (const side of ["left", "right"]) {
        let opposing = 0;
        for (const aid of m.antagonists) opposing = Math.max(opposing, Math.abs(drive[aid]?.[side] ?? 0));
        inhibited[m.id][side] = drive[m.id][side] * (1 - 0.6 * opposing);
      }
    }

    // ── 4. Integrate each fibre ───────────────────────────────────────────
    for (const m of MUSCLES) {
      const omega = 1000 / Math.max(40, m.tau); // natural frequency
      const zeta = m.tau < 120 ? 0.72 : 0.95; // fast muscles overshoot slightly
      const base = this.baselineFor(m.id);

      for (const side of ["left", "right"]) {
        const f = this.fibres[m.id][side];

        let target = inhibited[m.id][side];
        // Voluntary and reflex drive coexist. Bipolar channels (gaze, head
        // pose, pupil, vasodilation) sum, so a saccade rides on top of a
        // commanded gaze direction. Unipolar contractions take whichever
        // drive is stronger, so a blink can override a commanded lid raise.
        target = m.signed
          ? clamp(target + f.reflex, -m.ceiling, m.ceiling)
          : Math.abs(f.reflex) > Math.abs(target)
            ? f.reflex
            : target + f.reflex * 0.5;
        if (target >= 0) target = Math.max(target, base);
        target *= 1 + f.asym * (m.bilateral ? 1 : 0.25);
        target *= 1 - f.fatigue * 0.3;

        // Motor-unit tremor: an Ornstein-Uhlenbeck process, louder when the
        // muscle is loaded and when the person is aroused.
        const amp = (0.004 + Math.abs(target) * 0.022) * (0.6 + this.arousal * 1.4);
        f.noise += -f.noise * 7 * dt + (this.rng() - 0.5) * amp * Math.sqrt(dt) * 26;

        const x = f.value - (target + f.noise);
        f.velocity += (-2 * zeta * omega * f.velocity - omega * omega * x) * dt;
        f.value += f.velocity * dt;

        const lo = m.signed ? -m.ceiling : -0.02;
        f.value = clamp(f.value, lo, m.ceiling);

        // Sustained contraction fatigues; released muscle recovers slowly.
        const load = Math.abs(f.value);
        f.fatigue += (load > 0.55 ? (load - 0.55) * 0.32 : -f.fatigue * 0.55) * dt;
        f.fatigue = clamp(f.fatigue, 0, 0.6);
      }
    }

    // Mood follows valence with a long time constant, so the resting face
    // still carries the residue of the last few exchanges.
    this.mood += (this.valence - this.mood) * clamp(dt * 0.09, 0, 1);
  }

  /** Snapshot for telemetry, the critic agent, and the muscle meters. */
  snapshot(threshold = 0.03) {
    const out = {};
    for (const m of MUSCLES) {
      const l = this.fibres[m.id].left.value;
      const r = this.fibres[m.id].right.value;
      if (Math.abs(l) > threshold || Math.abs(r) > threshold) {
        out[m.id] = m.bilateral ? { au: m.au, left: +l.toFixed(3), right: +r.toFixed(3) } : { au: m.au, value: +((l + r) / 2).toFixed(3) };
      }
    }
    return out;
  }
}
