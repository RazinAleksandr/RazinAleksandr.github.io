/**
 * anthropic.js — Messages API transport.
 *
 * This is a build-free static page, so it talks to POST /v1/messages over
 * fetch rather than bundling the SDK. The key lives in the browser, which is
 * only acceptable because the key is the user's own and never leaves their
 * machine except to Anthropic; a `proxyUrl` is provided for anyone who wants
 * to keep it server-side instead.
 */

const API_VERSION = "2023-06-01";

export class AnthropicError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export class Anthropic {
  constructor({ apiKey = "", baseUrl = "https://api.anthropic.com", proxyUrl = "" } = {}) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.proxyUrl = proxyUrl.replace(/\/$/, "");
  }

  get configured() {
    return Boolean(this.apiKey || this.proxyUrl);
  }

  async messages(body, { signal } = {}) {
    const url = this.proxyUrl ? `${this.proxyUrl}/v1/messages` : `${this.baseUrl}/v1/messages`;

    const headers = {
      "content-type": "application/json",
      "anthropic-version": API_VERSION,
    };
    if (!this.proxyUrl) {
      headers["x-api-key"] = this.apiKey;
      // Required for any call made straight from a page context.
      headers["anthropic-dangerous-direct-browser-access"] = "true";
    }

    let res;
    try {
      res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal });
    } catch (e) {
      if (e.name === "AbortError") throw e;
      throw new AnthropicError(
        "Network request failed. If you are calling api.anthropic.com directly, check that the key is valid and that no extension is blocking the request.",
        0,
        null
      );
    }

    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      /* leave null */
    }

    if (!res.ok) {
      const msg = json?.error?.message || text || `HTTP ${res.status}`;
      throw new AnthropicError(msg, res.status, json);
    }
    return json;
  }
}

/** Pull the first text block out of a response. */
export function textOf(response) {
  for (const b of response?.content ?? []) {
    if (b.type === "text") return b.text;
  }
  return "";
}

/** Parse a structured-output response into an object. */
export function jsonOf(response) {
  const t = textOf(response);
  if (!t) return null;
  try {
    return JSON.parse(t);
  } catch {
    /* fall through */
  }
  // Structured outputs guarantee valid JSON, but a model asked for prose in a
  // fenced block should still be recoverable.
  const m = t.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      return JSON.parse(m[0]);
    } catch {
      /* give up */
    }
  }
  return null;
}

/** All tool_use blocks in a response. */
export function toolUses(response) {
  return (response?.content ?? []).filter((b) => b.type === "tool_use");
}

/** Token accounting across a pipeline run. */
export function accumulateUsage(into, response) {
  const u = response?.usage;
  if (!u) return into;
  into.input += u.input_tokens ?? 0;
  into.output += u.output_tokens ?? 0;
  into.cacheWrite += u.cache_creation_input_tokens ?? 0;
  into.cacheRead += u.cache_read_input_tokens ?? 0;
  into.calls += 1;
  return into;
}

export const emptyUsage = () => ({ input: 0, output: 0, cacheWrite: 0, cacheRead: 0, calls: 0 });
