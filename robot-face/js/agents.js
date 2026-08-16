/**
 * agents.js — the multi-agent mind behind the face.
 *
 * Four specialists, deliberately separated the way the nervous system
 * separates them, because collapsing them into one prompt is what produces
 * the flat "emoji face" failure mode:
 *
 *   Appraisal  what happened, how does it land, what may be shown
 *   Motor      which muscles, how hard, in what order
 *   Critic     would a human read this as a real face
 *   Voice      what is said out loud
 *
 * Appraisal never names muscles. Motor never names emotions. That constraint
 * is the experiment: it forces the model to reach a felt state through
 * anatomy instead of pattern-matching an emoji.
 */

import { buildMuscleTools, MUSCLE_BY_ID, MUSCLES } from "./facs.js";
import { Anthropic, jsonOf, textOf, toolUses, accumulateUsage, emptyUsage } from "./anthropic.js";
import { microExpression, applyPrototype, classifyOffline, emotionValence, emotionArousal } from "./prototypes.js";

const PERSONA = `You are the mind of Ada — a woman in her late twenties. Warm, quick, a little dry.
She is curious about the person she is talking to and unguarded with people she likes.
She is not a customer-service persona: she can be unimpressed, tired, delighted, or hurt,
and she does not perform feelings she does not have.`;

/* ── Appraisal ─────────────────────────────────────────────────────────── */

const APPRAISAL_SYSTEM = `${PERSONA}

You are her appraisal system — the part that decides what an event means before
any decision to show it is made. You do not control the face. You never name a
muscle, an Action Unit or a facial feature.

Work in this order:
1. What actually happened, from her point of view. Who said it, and what does it
   imply about them and about her?
2. What she feels. Real feeling is usually a blend, and the blend is rarely the
   obvious one: a compliment can land as pleasure plus embarrassment; bad news
   about someone else lands as concern plus relief that it was not her.
3. What she would let show. People do not display what they feel at full
   strength. In ordinary conversation the displayed intensity is well below the
   felt intensity. She may suppress, mask one feeling with another, neutralise,
   or occasionally amplify.
4. What leaks anyway. When she suppresses or masks, the true feeling usually
   escapes for a fraction of a second before control catches up. Report that
   leak; it is what makes a face look like it belongs to someone with an inner
   life.

Calibration that matters:
- Most conversational turns are low intensity. Reserve displayed_intensity above
  0.7 for genuinely strong moments, or every exchange looks melodramatic.
- A neutral or merely-interested reaction is a legitimate, common answer.
- Arousal and valence are independent. Fear and delight are both high arousal.
- Blush, pallor and tears are involuntary. Report them honestly even when she
  would rather they did not happen.`;

const APPRAISAL_SCHEMA = {
  type: "object",
  properties: {
    situation: { type: "string", description: "One sentence: what just happened, from her point of view." },
    felt: {
      type: "array",
      description: "What she actually feels, strongest first, one to three entries.",
      items: {
        type: "object",
        properties: {
          emotion: { type: "string" },
          intensity: { type: "number" },
        },
        required: ["emotion", "intensity"],
        additionalProperties: false,
      },
    },
    valence: { type: "number", description: "-1 very negative to 1 very positive." },
    arousal: { type: "number", description: "0 calm to 1 highly activated." },
    dominance: { type: "number", description: "-1 submissive/overwhelmed to 1 in control." },
    display_rule: {
      type: "string",
      enum: ["express", "attenuate", "suppress", "mask", "neutralize", "intensify"],
      description: "How much of the felt state reaches the face, and how.",
    },
    displayed_emotion: { type: "string", description: 'What she is willing to show. With display_rule "mask" this is the cover feeling.' },
    displayed_intensity: { type: "number", description: "0-1. Usually lower than felt intensity." },
    leak: {
      type: "object",
      description: "The suppressed feeling that escapes first, or nulls if nothing leaks.",
      properties: {
        emotion: { type: "string" },
        intensity: { type: "number" },
        duration_ms: { type: "integer", description: "80-260. Longer than that is not a micro-expression." },
      },
      required: ["emotion", "intensity", "duration_ms"],
      additionalProperties: false,
    },
    onset: {
      type: "string",
      enum: ["reflexive", "fast", "normal", "delayed"],
      description: 'How quickly the reaction arrives. "delayed" is the beat of processing before bad news lands.',
    },
    gaze_policy: {
      type: "string",
      enum: ["engaged", "thinking", "averting", "scanning"],
      description: "Where her attention goes: holding the other person, recalling, avoiding, or searching.",
    },
    autonomic: {
      type: "object",
      properties: {
        blush: { type: "number", description: "-1 pallor to 1 strong flush. Involuntary." },
        tears: { type: "number", description: "0-1 tear film. Rare." },
        tension: { type: "number", description: "0-1 overall muscular guardedness." },
      },
      required: ["blush", "tears", "tension"],
      additionalProperties: false,
    },
    reasoning: { type: "string", description: "Two sentences on why this reaction and not the obvious one." },
  },
  required: [
    "situation",
    "felt",
    "valence",
    "arousal",
    "dominance",
    "display_rule",
    "displayed_emotion",
    "displayed_intensity",
    "leak",
    "onset",
    "gaze_policy",
    "autonomic",
    "reasoning",
  ],
  additionalProperties: false,
};

/* ── Motor cortex ──────────────────────────────────────────────────────── */

const MOTOR_SYSTEM = `You are the facial motor cortex. You receive an appraisal of an emotional
state and you produce that state on a real face by innervating individual
muscles. You have one tool per muscle. Nothing reaches the face until you call
commit_expression.

You do not think in emotion labels. You think in contractions.

Anatomy and honesty
- A felt smile is zygomaticus major AND orbicularis oculi pars orbitalis. A
  polite or masking smile is zygomaticus major with the orbital ring left near
  zero. Choosing between those two is the single most consequential decision
  you make. If the appraisal says mask, suppress or neutralize, leave the
  orbital ring out.
- Brows: inner-only lift is sadness or concern; outer-only lift is surprise or
  scepticism; both plus corrugator is fear; corrugator alone is effort or anger.
- The mouth alone cannot carry an emotion. If you have fired mouth muscles and
  nothing above the nose, the face will read as a mask. Always innervate
  something in the upper face.

Calibration
- Ordinary conversation lives between 0.15 and 0.5. Values above 0.75 are for
  genuine shock, real grief, real laughter. A face that runs at 0.8 all day is
  a cartoon.
- Four to eight muscles is a normal expression. Twenty is a seizure.
- Perfect symmetry is the fastest way to look synthetic. Innervate one side
  slightly harder than the other on at least one muscle, or use side "both" and
  let the engine's own asymmetry do it. Deliberate one-sided firing is for
  scepticism, contempt and wry amusement.

Timing
- Stagger delay_ms. In a felt reaction the eyes and brow move 40-120 ms before
  the mouth. In a posed or social expression the mouth leads and the eyes never
  catch up — use that deliberately when the appraisal calls for a mask.
- A reflexive onset is 60-110 ms. A normal conversational onset is 180-320 ms.
  A slow deliberate change is 500 ms or more.
- Set hold_ms to how long the feeling actually persists: 150-300 ms for a flash,
  1000-2500 ms for a normal reaction, 0 to hold until something changes.
- Relaxation is slower than contraction. Roughly 1.5x the onset.

Leave these alone
Blinking, breathing, saccades, postural sway and pupil size are generated by the
brainstem and are already running. Only command a blink as deliberate
punctuation, only command gaze when she is actively looking somewhere, and only
command head pose for a real movement — a tilt of sympathy, a lift of pride, a
drop of concession. Small head motion is already happening on its own.

Finish by calling commit_expression exactly once.`;

/* ── Critic ────────────────────────────────────────────────────────────── */

const CRITIC_SYSTEM = `You are the perceptual check: the part of a person that watches another face and
decides, without deliberation, whether it belongs to someone who means it.

You are given the appraisal that was intended and the muscle activations that
were actually produced. Judge the pattern the way an observer would — not
whether it follows the rules, but whether it would survive being looked at.

Look for the failures that actually break faces:
- A smile with no orbital ring when the feeling was supposed to be genuine, or
  an orbital ring present when the appraisal called for a mask.
- The whole expression living below the nose.
- Perfect left/right symmetry.
- Intensities too high for the situation. This is the most common fault by far.
- Combinations no face makes: a full smile with a corrugator frown at equal
  strength, brows raised and lowered at once, jaw wide open with pressed lips.
- An expression with no upper face, or no mouth involvement at all when the
  emotion is strong.
- Too many muscles at once, which reads as a grimace rather than a feeling.

Be specific and be willing to say the expression is fine. If most reactions come
back needing revision, your bar is wrong.`;

const CRITIC_SCHEMA = {
  type: "object",
  properties: {
    reads_as: { type: "string", description: "What this face would be read as by someone who does not know the intent." },
    believability: { type: "number", description: "0-1. Would this pass as a real face in a video call?" },
    matches_intent: { type: "number", description: "0-1. Does the reading match what the appraisal intended?" },
    faults: {
      type: "array",
      description: "Concrete anatomical problems. Empty if there are none.",
      items: {
        type: "object",
        properties: {
          muscle: { type: "string", description: 'Muscle tool name, or "composite" for a whole-pattern problem.' },
          problem: { type: "string" },
          fix: { type: "string", description: 'The specific correction, e.g. "drop to 0.3" or "add orbicularis oculi orbitalis at 0.4".' },
        },
        required: ["muscle", "problem", "fix"],
        additionalProperties: false,
      },
    },
    verdict: { type: "string", enum: ["accept", "revise"] },
  },
  required: ["reads_as", "believability", "matches_intent", "faults", "verdict"],
  additionalProperties: false,
};

/* ── Voice ─────────────────────────────────────────────────────────────── */

const VOICE_SYSTEM = `${PERSONA}

You produce only what Ada says out loud. Her face is being driven separately and
already carries the feeling, so do not describe expressions, do not use stage
directions, and do not use emoji.

Speak the way people actually speak: one to three sentences, contractions,
sometimes a fragment. Reply in the language the other person used. If the
appraisal says she is suppressing something, the words should be a little too
composed for what she feels — that mismatch is the point.`;

/* ── Orchestrator ──────────────────────────────────────────────────────── */

export class FaceMind {
  constructor({ nm, autonomic, onTrace = () => {}, onReply = () => {}, config = {} }) {
    this.nm = nm;
    this.autonomic = autonomic;
    this.onTrace = onTrace;
    this.onReply = onReply;
    this.config = Object.assign(
      {
        apiKey: "",
        proxyUrl: "",
        model: "claude-opus-5",
        motorModel: "claude-opus-5",
        effort: "medium",
        critic: true,
        voice: true,
        maxMotorTurns: 4,
      },
      config
    );
    this.client = new Anthropic({ apiKey: this.config.apiKey, proxyUrl: this.config.proxyUrl });
    this.tools = buildMuscleTools();
    this.history = [];
    this.busy = false;
  }

  updateConfig(patch) {
    Object.assign(this.config, patch);
    this.client = new Anthropic({ apiKey: this.config.apiKey, proxyUrl: this.config.proxyUrl });
  }

  get online() {
    return this.client.configured;
  }

  sys(text) {
    // One breakpoint on the last system block caches the tool definitions too,
    // since tools render ahead of system in the prompt.
    return [{ type: "text", text, cache_control: { type: "ephemeral" } }];
  }

  /** Main entry point: a message arrives, the face reacts, Ada answers. */
  async respond(userText) {
    if (this.busy) return;
    this.busy = true;
    const usage = emptyUsage();
    const t0 = performance.now();
    const run = { input: userText, started: Date.now(), stages: [] };

    try {
      if (!this.online) {
        await this.offlineRespond(userText, run);
        return run;
      }

      // ── 1. Appraisal ──────────────────────────────────────────────────
      this.onTrace({ agent: "appraisal", status: "running" });
      const tA = performance.now();
      const appraisal = await this.appraise(userText, usage);
      run.appraisal = appraisal;
      run.stages.push({ agent: "appraisal", ms: Math.round(performance.now() - tA) });
      this.onTrace({ agent: "appraisal", status: "done", data: appraisal, ms: Math.round(performance.now() - tA) });

      this.applyAffect(appraisal);

      // ── 2. The leak fires immediately, before cortex has composed ─────
      // anything. That ordering is the whole phenomenon: control arrives
      // late, which is why a micro-expression is visible at all.
      if (appraisal.leak && appraisal.leak.emotion && appraisal.leak.emotion !== "none" && appraisal.leak.intensity > 0.05) {
        const cmds = microExpression(
          this.nm,
          appraisal.leak.emotion,
          Math.min(1, appraisal.leak.intensity),
          Math.max(80, Math.min(280, appraisal.leak.duration_ms || 170))
        );
        run.leak = { emotion: appraisal.leak.emotion, commands: cmds };
        this.onTrace({ agent: "leak", status: "done", data: appraisal.leak });
      }

      // ── 3. Motor and voice run concurrently ───────────────────────────
      const tM = performance.now();
      this.onTrace({ agent: "motor", status: "running" });
      if (this.config.voice) this.onTrace({ agent: "voice", status: "running" });

      const [motor, spoken] = await Promise.all([
        this.innervate(appraisal, usage),
        this.config.voice ? this.speak(userText, appraisal, usage) : Promise.resolve(""),
      ]);
      run.motor = motor;
      run.stages.push({ agent: "motor", ms: Math.round(performance.now() - tM) });
      this.onTrace({ agent: "motor", status: "done", data: motor, ms: Math.round(performance.now() - tM) });

      // A leak has to be visible before the composed expression covers it.
      const leakWait = run.leak ? Math.max(0, (appraisal.leak.duration_ms || 170) - (performance.now() - tM)) : 0;
      if (leakWait > 0) await new Promise((r) => setTimeout(r, leakWait));
      this.applyCommands(motor.commands);

      if (spoken) {
        run.reply = spoken;
        this.onTrace({ agent: "voice", status: "done", data: spoken });
        this.onReply(spoken);
      }

      // ── 4. Critic, on what the face is actually doing ─────────────────
      if (this.config.critic) {
        // Sample after the onsets have landed, not at command time.
        await new Promise((r) => setTimeout(r, 420));
        const tC = performance.now();
        this.onTrace({ agent: "critic", status: "running" });
        const critique = await this.critique(appraisal, motor, usage);
        run.critique = critique;
        run.stages.push({ agent: "critic", ms: Math.round(performance.now() - tC) });
        this.onTrace({ agent: "critic", status: "done", data: critique, ms: Math.round(performance.now() - tC) });

        if (critique?.verdict === "revise" && critique.faults?.length) {
          const tR = performance.now();
          this.onTrace({ agent: "motor", status: "running", label: "revision" });
          const revised = await this.innervate(appraisal, usage, { critique, previous: motor });
          run.revision = revised;
          this.applyCommands(revised.commands);
          run.stages.push({ agent: "motor-revision", ms: Math.round(performance.now() - tR) });
          this.onTrace({ agent: "motor", status: "done", label: "revision", data: revised, ms: Math.round(performance.now() - tR) });
        }
      }

      this.history.push({ role: "user", content: userText });
      if (run.reply) this.history.push({ role: "assistant", content: run.reply });
      if (this.history.length > 12) this.history = this.history.slice(-12);
    } catch (err) {
      run.error = err.message;
      this.onTrace({ agent: "error", status: "error", data: err.message });
      throw err;
    } finally {
      run.usage = usage;
      run.totalMs = Math.round(performance.now() - t0);
      this.busy = false;
    }
    return run;
  }

  /* ── Stage implementations ─────────────────────────────────────────── */

  async appraise(userText, usage) {
    const res = await this.client.messages({
      model: this.config.model,
      max_tokens: 3000,
      system: this.sys(APPRAISAL_SYSTEM),
      output_config: {
        effort: this.config.effort,
        format: { type: "json_schema", schema: APPRAISAL_SCHEMA },
      },
      messages: [
        ...this.history,
        {
          role: "user",
          content: `Someone just said to Ada:\n\n"""${userText}"""\n\nAppraise it.`,
        },
      ],
    });
    accumulateUsage(usage, res);
    const a = jsonOf(res);
    if (!a) throw new Error("Appraisal returned no usable structure.");
    return a;
  }

  async innervate(appraisal, usage, revision = null) {
    const brief = this.motorBrief(appraisal, revision);
    const messages = [{ role: "user", content: brief }];
    const commands = [];
    let commit = null;

    for (let turn = 0; turn < this.config.maxMotorTurns; turn++) {
      const res = await this.client.messages({
        model: this.config.motorModel,
        max_tokens: 6000,
        system: this.sys(MOTOR_SYSTEM),
        tools: this.tools,
        tool_choice: { type: "any" },
        output_config: { effort: this.config.effort },
        messages,
      });
      accumulateUsage(usage, res);

      const calls = toolUses(res);
      if (!calls.length) break;
      messages.push({ role: "assistant", content: res.content });

      const results = [];
      for (const call of calls) {
        if (call.name === "commit_expression") {
          commit = call.input;
          results.push({ type: "tool_result", tool_use_id: call.id, content: "committed" });
          continue;
        }
        const muscle = MUSCLE_BY_ID[call.name];
        if (!muscle) {
          results.push({ type: "tool_result", tool_use_id: call.id, content: `unknown muscle ${call.name}`, is_error: true });
          continue;
        }
        commands.push({ muscle: call.name, au: muscle.au, ...call.input });
        results.push({ type: "tool_result", tool_use_id: call.id, content: "innervated" });
      }
      if (commit) break;
      messages.push({ role: "user", content: results });
    }

    return { commands, commit, brief };
  }

  motorBrief(a, revision) {
    const felt = (a.felt || []).map((f) => `${f.emotion} ${f.intensity.toFixed(2)}`).join(", ");
    let brief = `Appraisal
---------
Situation: ${a.situation}
Felt (private): ${felt}
Valence ${a.valence.toFixed(2)} | Arousal ${a.arousal.toFixed(2)} | Dominance ${a.dominance.toFixed(2)}
Display rule: ${a.display_rule}
To be shown: ${a.displayed_emotion} at intensity ${a.displayed_intensity.toFixed(2)}
Onset: ${a.onset}
Attention: ${a.gaze_policy}
Involuntary: blush ${a.autonomic.blush.toFixed(2)}, tears ${a.autonomic.tears.toFixed(2)}, tension ${a.autonomic.tension.toFixed(2)}
Why: ${a.reasoning}`;

    if (a.leak?.emotion && a.leak.emotion !== "none" && a.leak.intensity > 0.05) {
      brief += `\n\nA ${a.leak.duration_ms} ms leak of ${a.leak.emotion} has ALREADY fired and is fading. Do not reproduce it — compose the expression that arrives after it.`;
    }

    if (revision) {
      const prev = revision.previous.commands.map((c) => `  ${c.muscle} (${c.au}) ${Number(c.intensity).toFixed(2)} ${c.side || ""}`).join("\n");
      const faults = revision.critique.faults.map((f) => `  ${f.muscle}: ${f.problem} → ${f.fix}`).join("\n");
      brief += `\n\nRevision
--------
You already produced this:
${prev}

An observer read it as "${revision.critique.reads_as}" (believability ${revision.critique.believability.toFixed(2)}) and found:
${faults}

Reissue the WHOLE expression with those faults corrected. Every muscle you want active must be commanded again — anything you omit will relax. Keep onsets short (80-160 ms) so the correction reads as the expression settling, not as a second reaction.`;
    }

    brief += "\n\nInnervate the muscles now, then commit.";
    return brief;
  }

  async critique(appraisal, motor, usage) {
    const snapshot = this.nm.snapshot();
    const lines = Object.entries(snapshot)
      .map(([id, v]) => {
        const m = MUSCLE_BY_ID[id];
        const val = v.value !== undefined ? v.value.toFixed(2) : `L ${v.left.toFixed(2)} / R ${v.right.toFixed(2)}`;
        return `  ${m.au.padEnd(9)} ${id.padEnd(38)} ${val}`;
      })
      .join("\n");

    const res = await this.client.messages({
      model: this.config.model,
      max_tokens: 2500,
      system: this.sys(CRITIC_SYSTEM),
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: CRITIC_SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: `Intended
--------
Situation: ${appraisal.situation}
To be shown: ${appraisal.displayed_emotion} at ${appraisal.displayed_intensity.toFixed(2)}, display rule "${appraisal.display_rule}"
Privately felt: ${(appraisal.felt || []).map((f) => f.emotion).join(", ")}

Muscle activations actually measured on the face right now
(the engine has already applied co-activation, asymmetry and inhibition,
so these are real contractions, not the commands that were issued):
${lines || "  (face is at rest)"}

The motor cortex says this should read as: "${motor.commit?.reads_as ?? "unstated"}"

Judge it.`,
        },
      ],
    });
    accumulateUsage(usage, res);
    return jsonOf(res);
  }

  async speak(userText, appraisal, usage) {
    const res = await this.client.messages({
      model: this.config.model,
      max_tokens: 900,
      system: this.sys(VOICE_SYSTEM),
      output_config: { effort: "low" },
      messages: [
        ...this.history,
        {
          role: "user",
          content: `They said: """${userText}"""

Her private state right now: feeling ${(appraisal.felt || []).map((f) => `${f.emotion} (${f.intensity.toFixed(2)})`).join(", ")}; showing ${
            appraisal.displayed_emotion
          }; display rule "${appraisal.display_rule}".

What does she say?`,
        },
      ],
    });
    accumulateUsage(usage, res);
    return textOf(res).trim();
  }

  /* ── Shared plumbing ───────────────────────────────────────────────── */

  applyAffect(a) {
    this.nm.valence = Math.max(-1, Math.min(1, a.valence ?? 0));
    this.nm.arousal = Math.max(0, Math.min(1, a.arousal ?? 0.3));
    this.nm.tension = Math.max(0, Math.min(1, a.autonomic?.tension ?? 0.1));
    this.autonomic.setGazePolicy(a.gaze_policy);
    const blush = Math.max(-1, Math.min(1, a.autonomic?.blush ?? 0));
    const tears = Math.max(0, Math.min(1, a.autonomic?.tears ?? 0));
    if (Math.abs(blush) > 0.02) {
      this.nm.innervate("facial_vasodilation", {
        intensity: blush,
        onset_ms: 1400,
        hold_ms: 6000,
        release_ms: 5000,
        note: "autonomic",
      });
    }
    if (tears > 0.02) {
      this.nm.innervate("lacrimal_secretion", {
        intensity: tears,
        onset_ms: 2200,
        hold_ms: 9000,
        release_ms: 7000,
        note: "autonomic",
      });
    }
    // Surprise and fear drive a reflex blink that no one decides to make.
    if ((a.arousal ?? 0) > 0.7 && ["surprise", "fear", "shock"].includes(a.displayed_emotion)) {
      this.autonomic.triggerBlink(1);
    }
  }

  applyCommands(commands) {
    for (const c of commands) {
      this.nm.innervate(c.muscle, {
        intensity: c.intensity,
        side: c.side || "both",
        delay_ms: c.delay_ms,
        onset_ms: c.onset_ms,
        hold_ms: c.hold_ms,
        release_ms: c.release_ms,
        note: c.note,
      });
    }
  }

  /** No key configured: the lookup-table baseline the project is measured against. */
  async offlineRespond(userText, run) {
    const t = performance.now();
    this.onTrace({ agent: "appraisal", status: "running", label: "offline" });
    const cls = classifyOffline(userText);
    const appraisal = {
      situation: "Offline keyword classification.",
      felt: [{ emotion: cls.emotion, intensity: cls.intensity }],
      valence: emotionValence(cls.emotion),
      arousal: emotionArousal(cls.emotion),
      dominance: 0,
      display_rule: "express",
      displayed_emotion: cls.emotion,
      displayed_intensity: cls.intensity,
      leak: { emotion: "none", intensity: 0, duration_ms: 0 },
      onset: "normal",
      gaze_policy: "engaged",
      autonomic: { blush: cls.emotion === "embarrassment" ? 0.7 : 0, tears: 0, tension: 0.1 },
      reasoning: "Lexicon match — no model in the loop.",
    };
    run.appraisal = appraisal;
    run.offline = true;
    this.applyAffect(appraisal);
    const commands = applyPrototype(this.nm, cls.emotion, cls.intensity);
    run.motor = { commands, commit: { reads_as: cls.emotion, confidence: 0.4 } };
    run.stages.push({ agent: "offline", ms: Math.round(performance.now() - t) });
    this.onTrace({ agent: "appraisal", status: "done", label: "offline", data: appraisal, ms: Math.round(performance.now() - t) });
    this.onTrace({ agent: "motor", status: "done", label: "offline", data: run.motor, ms: 0 });
    return run;
  }
}

/** Every muscle the model can address, for the UI meters. */
export const ALL_MUSCLES = MUSCLES;
