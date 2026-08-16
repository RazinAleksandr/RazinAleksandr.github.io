/**
 * telemetry.js — session recording.
 *
 * The point of the project is a question ("does muscle-level LLM control
 * produce a believable face?"), so every run is recorded in a form that can be
 * argued with afterwards: what was said, what was appraised, which muscles
 * fired with what parameters, what the critic scored it, and how long each
 * agent took.
 */

export class Telemetry {
  constructor() {
    this.runs = [];
    this.startedAt = new Date().toISOString();
  }

  record(run) {
    if (!run) return;
    this.runs.push({
      t: new Date().toISOString(),
      input: run.input,
      offline: !!run.offline,
      reply: run.reply ?? null,
      appraisal: run.appraisal ?? null,
      leak: run.leak ?? null,
      commands: run.motor?.commands ?? [],
      commit: run.motor?.commit ?? null,
      critique: run.critique ?? null,
      revised: run.revision ? run.revision.commands : null,
      stages: run.stages ?? [],
      totalMs: run.totalMs ?? null,
      usage: run.usage ?? null,
      error: run.error ?? null,
    });
    if (this.runs.length > 400) this.runs.shift();
  }

  get stats() {
    const scored = this.runs.filter((r) => r.critique?.believability != null);
    const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
    const online = this.runs.filter((r) => !r.offline);
    return {
      runs: this.runs.length,
      believability: avg(scored.map((r) => r.critique.believability)),
      intentMatch: avg(scored.map((r) => r.critique.matches_intent)),
      revisionRate: online.length ? online.filter((r) => r.critique?.verdict === "revise").length / online.length : null,
      musclesPerExpression: avg(this.runs.map((r) => r.commands.length)),
      latency: avg(online.map((r) => r.totalMs).filter(Boolean)),
      tokens: this.runs.reduce(
        (acc, r) => {
          if (!r.usage) return acc;
          acc.input += r.usage.input;
          acc.output += r.usage.output;
          acc.cacheRead += r.usage.cacheRead;
          acc.cacheWrite += r.usage.cacheWrite;
          acc.calls += r.usage.calls;
          return acc;
        },
        { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, calls: 0 }
      ),
    };
  }

  export() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            project: "robot-face",
            startedAt: this.startedAt,
            exportedAt: new Date().toISOString(),
            stats: this.stats,
            runs: this.runs,
          },
          null,
          2
        ),
      ],
      { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `robot-face-session-${Date.now()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  clear() {
    this.runs = [];
  }
}
