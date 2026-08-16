/**
 * prototypes.js — canonical FACS patterns.
 *
 * Two jobs:
 *   1. Micro-expressions. A leaked emotion lasts 120-250 ms. Round-tripping
 *      that through the model would cost more latency than the expression
 *      itself lasts, so leaks are drawn from these prototypes.
 *   2. Offline mode. With no API key the app still has to do something, so a
 *      keyword classifier picks a prototype. This is the null hypothesis the
 *      whole project is testing against: if the multi-agent face is not
 *      visibly better than this lookup table, the idea has not earned itself.
 */

export const PROTOTYPES = {
  joy: [
    ["zygomaticus_major", 0.62],
    ["orbicularis_oculi_pars_orbitalis", 0.5],
    ["lips_part", 0.3],
    ["head_pitch", 0.08],
  ],
  amusement: [
    ["zygomaticus_major", 0.74],
    ["orbicularis_oculi_pars_orbitalis", 0.62],
    ["masseter_relaxation", 0.28],
    ["lips_part", 0.5],
    ["head_pitch", -0.1],
    ["buccinator", 0.2],
  ],
  affection: [
    ["zygomaticus_major", 0.4],
    ["orbicularis_oculi_pars_orbitalis", 0.44],
    ["head_roll", 0.24],
    ["levator_palpebrae_inhibition", 0.16],
    ["frontalis_pars_medialis", 0.14],
  ],
  pride: [
    ["zygomaticus_major", 0.34],
    ["head_pitch", 0.22],
    ["levator_palpebrae_inhibition", 0.12],
    ["orbicularis_oris_pressor", 0.2],
  ],
  relief: [
    ["zygomaticus_major", 0.3],
    ["levator_palpebrae_inhibition", 0.3],
    ["orbicularis_oris_funneler", 0.24],
    ["head_pitch", -0.14],
  ],
  interest: [
    ["frontalis_pars_lateralis", 0.4],
    ["levator_palpebrae_superioris", 0.2],
    ["lips_part", 0.22],
    ["head_pitch", 0.06],
    ["head_roll", 0.1],
  ],
  surprise: [
    ["frontalis_pars_medialis", 0.8],
    ["frontalis_pars_lateralis", 0.85],
    ["levator_palpebrae_superioris", 0.7],
    ["masseter_relaxation", 0.44],
    ["lips_part", 0.6],
  ],
  fear: [
    ["frontalis_pars_medialis", 0.75],
    ["frontalis_pars_lateralis", 0.55],
    ["corrugator_supercilii", 0.45],
    ["levator_palpebrae_superioris", 0.8],
    ["risorius", 0.6],
    ["platysma", 0.35],
    ["head_pitch", -0.12],
  ],
  anger: [
    ["corrugator_supercilii", 0.85],
    ["levator_palpebrae_superioris", 0.42],
    ["orbicularis_oculi_pars_palpebralis", 0.6],
    ["orbicularis_oris_tightener", 0.7],
    ["masseter_clench", 0.5],
    ["nasalis_dilator", 0.4],
    ["head_pitch", -0.08],
  ],
  irritation: [
    ["corrugator_supercilii", 0.42],
    ["orbicularis_oculi_pars_palpebralis", 0.3],
    ["orbicularis_oris_pressor", 0.4],
    ["head_yaw", 0.1],
  ],
  contempt: [
    ["buccinator", 0.55, "left"],
    ["zygomaticus_major", 0.2, "left"],
    ["levator_labii_superioris", 0.22, "left"],
    ["head_pitch", 0.12],
    ["levator_palpebrae_inhibition", 0.14],
  ],
  disgust: [
    ["levator_labii_alaeque_nasi", 0.8],
    ["procerus", 0.5],
    ["levator_labii_superioris", 0.55],
    ["depressor_labii_inferioris", 0.3],
    ["orbicularis_oculi_pars_palpebralis", 0.35],
    ["head_pitch", -0.1],
  ],
  sadness: [
    ["frontalis_pars_medialis", 0.72],
    ["corrugator_supercilii", 0.34],
    ["depressor_anguli_oris", 0.6],
    ["levator_palpebrae_inhibition", 0.4],
    ["mentalis", 0.3],
    ["head_pitch", -0.2],
  ],
  disappointment: [
    ["frontalis_pars_medialis", 0.4],
    ["depressor_anguli_oris", 0.4],
    ["levator_palpebrae_inhibition", 0.3],
    ["orbicularis_oris_funneler", 0.2],
    ["head_pitch", -0.16],
  ],
  shame: [
    ["levator_palpebrae_inhibition", 0.5],
    ["head_pitch", -0.34],
    ["depressor_anguli_oris", 0.3],
    ["facial_vasodilation", 0.6],
    ["mentalis", 0.34],
  ],
  embarrassment: [
    ["zygomaticus_major", 0.4],
    ["orbicularis_oculi_pars_orbitalis", 0.3],
    ["facial_vasodilation", 0.8],
    ["head_pitch", -0.24],
    ["head_yaw", 0.18],
    ["lip_suck", 0.3],
  ],
  confusion: [
    ["corrugator_supercilii", 0.44],
    ["frontalis_pars_lateralis", 0.35, "left"],
    ["head_roll", 0.26],
    ["orbicularis_oris_pucker", 0.24],
    ["orbicularis_oculi_pars_palpebralis", 0.2],
  ],
  concentration: [
    ["corrugator_supercilii", 0.36],
    ["orbicularis_oculi_pars_palpebralis", 0.28],
    ["orbicularis_oris_pressor", 0.3],
    ["head_pitch", -0.06],
  ],
  skepticism: [
    ["frontalis_pars_lateralis", 0.55, "left"],
    ["corrugator_supercilii", 0.28, "right"],
    ["buccinator", 0.3, "left"],
    ["head_yaw", 0.14],
    ["head_pitch", 0.08],
    ["orbicularis_oculi_pars_palpebralis", 0.25],
  ],
  boredom: [
    ["levator_palpebrae_inhibition", 0.55],
    ["depressor_anguli_oris", 0.2],
    ["head_roll", 0.16],
    ["head_pitch", -0.1],
  ],
  sympathy: [
    ["frontalis_pars_medialis", 0.5],
    ["head_roll", 0.3],
    ["zygomaticus_major", 0.16],
    ["orbicularis_oculi_pars_orbitalis", 0.2],
    ["depressor_anguli_oris", 0.16],
    ["head_pitch", -0.08],
  ],
  awe: [
    ["frontalis_pars_medialis", 0.5],
    ["frontalis_pars_lateralis", 0.6],
    ["levator_palpebrae_superioris", 0.45],
    ["masseter_relaxation", 0.3],
    ["lips_part", 0.45],
    ["head_pitch", 0.16],
  ],
  guilt: [
    ["frontalis_pars_medialis", 0.4],
    ["levator_palpebrae_inhibition", 0.35],
    ["mentalis", 0.4],
    ["head_pitch", -0.26],
    ["orbicularis_oris_pressor", 0.35],
  ],
  gratitude: [
    ["zygomaticus_major", 0.48],
    ["orbicularis_oculi_pars_orbitalis", 0.42],
    ["frontalis_pars_medialis", 0.24],
    ["head_pitch", -0.12],
    ["head_roll", 0.14],
  ],
  neutral: [["lips_part", 0.12]],
};

/** Play a prototype as a brief micro-expression: fast on, short hold, fast off. */
export function microExpression(nm, emotion, intensity = 0.55, duration = 180) {
  const proto = PROTOTYPES[emotion] || PROTOTYPES.neutral;
  const commands = [];
  for (const [id, base, side] of proto) {
    const cmd = {
      intensity: base * intensity,
      side: side || "both",
      onset_ms: 70,
      hold_ms: duration,
      release_ms: 130,
      note: `leak:${emotion}`,
    };
    nm.innervate(id, cmd);
    commands.push({ muscle: id, ...cmd });
  }
  return commands;
}

/** Play a prototype as a normal, sustained expression. */
export function applyPrototype(nm, emotion, intensity = 0.6, hold = 2400) {
  const proto = PROTOTYPES[emotion] || PROTOTYPES.neutral;
  const commands = [];
  for (const [id, base, side] of proto) {
    const cmd = {
      intensity: base * intensity,
      side: side || "both",
      onset_ms: 200 + Math.round(Math.random() * 120),
      hold_ms: hold,
      release_ms: 460,
      note: `prototype:${emotion}`,
    };
    nm.innervate(id, cmd);
    commands.push({ muscle: id, ...cmd });
  }
  return commands;
}

/* ── Offline classifier ───────────────────────────────────────────────── */

const LEXICON = [
  [/\b(ха-?ха|hah?a|lol|смешн|funny|hilarious|joke|шутк)/i, "amusement", 0.75],
  [/\b(спасибо|thank|grateful|благодар|thanks)/i, "gratitude", 0.6],
  [/\b(люблю|love you|обожаю|adore|дорог|sweet|милый|мила)/i, "affection", 0.6],
  [/\b(ура|отлично|great|awesome|прекрасно|wonderful|поздравля|congrat|рад|glad|happy|счастл)/i, "joy", 0.7],
  [/\b(горжусь|proud|достиж|achievement|получилось|it worked|success)/i, "pride", 0.55],
  [/\b(фух|уф|phew|relief|наконец|finally|обошлось)/i, "relief", 0.55],
  [/\b(что|why|как|how|интересно|interesting|расскажи|tell me|\?)/i, "interest", 0.45],
  [/\b(ого|вау|wow|неужели|really\?|serious|не может быть|no way|surprise|удиви)/i, "surprise", 0.7],
  [/\b(страшно|боюсь|afraid|scared|scary|опасн|danger|паник|panic|ужас)/i, "fear", 0.7],
  [/\b(зл|бес|ненавиж|angry|furious|hate|отвратительно ведёшь|как ты смеешь|how dare)/i, "anger", 0.75],
  [/\b(раздража|annoy|достал|irritat|опять|again\b.*not|надоел)/i, "irritation", 0.5],
  [/\b(фу|мерз|отврат|disgust|gross|тошн|nasty|revolting)/i, "disgust", 0.7],
  [/\b(жалк|pathetic|whatever|как скажешь|ну-ну|sure, sure|наивн)/i, "contempt", 0.55],
  [/\b(грустн|печал|sad|умер|died|потер|lost|горе|grief|плак|cry|жаль)/i, "sadness", 0.7],
  [/\b(жаль|разочаров|disappoint|не получилось|failed|провал|увы)/i, "disappointment", 0.55],
  [/\b(стыдно|ashamed|виноват|guilty|прости|sorry|извин|apolog)/i, "guilt", 0.55],
  [/\b(смущ|неловко|embarrass|awkward|краснею|blush)/i, "embarrassment", 0.6],
  [/\b(не понимаю|confus|don'?t understand|странно|weird|что за|huh)/i, "confusion", 0.55],
  [/\b(сочувств|сочувствую|соболезн|sympath|бедн|poor you|держись|hang in there)/i, "sympathy", 0.6],
  [/\b(сомнева|doubt|скептич|skeptic|правда\?|уверен\?|are you sure|вряд ли)/i, "skepticism", 0.55],
  [/\b(скучн|bored|boring|зануд|давай уже|whatever)/i, "boredom", 0.5],
  [/\b(невероятн|amazing|потряс|breathtaking|космос|awe|величествен)/i, "awe", 0.65],
  [/\b(подумать|думаю|let me think|сложн|difficult|hmm|хм|посчитаю|calculat)/i, "concentration", 0.45],
];

export function classifyOffline(text) {
  const hits = [];
  for (const [re, emotion, weight] of LEXICON) {
    if (re.test(text)) hits.push({ emotion, weight });
  }
  if (!hits.length) return { emotion: "interest", intensity: 0.35, blend: [] };
  hits.sort((a, b) => b.weight - a.weight);
  return {
    emotion: hits[0].emotion,
    intensity: Math.min(1, hits[0].weight + (hits.length - 1) * 0.05),
    blend: hits.slice(1, 3).map((h) => h.emotion),
  };
}

const VALENCE = {
  joy: 0.8,
  amusement: 0.85,
  affection: 0.8,
  pride: 0.6,
  relief: 0.5,
  gratitude: 0.7,
  interest: 0.3,
  surprise: 0.1,
  awe: 0.5,
  concentration: 0,
  neutral: 0,
  confusion: -0.15,
  skepticism: -0.2,
  boredom: -0.3,
  irritation: -0.5,
  disappointment: -0.55,
  sadness: -0.75,
  sympathy: -0.25,
  guilt: -0.6,
  shame: -0.7,
  embarrassment: -0.3,
  fear: -0.75,
  anger: -0.7,
  disgust: -0.7,
  contempt: -0.4,
};
const AROUSAL = {
  joy: 0.6,
  amusement: 0.75,
  affection: 0.4,
  pride: 0.5,
  relief: 0.3,
  gratitude: 0.45,
  interest: 0.5,
  surprise: 0.9,
  awe: 0.6,
  concentration: 0.45,
  neutral: 0.25,
  confusion: 0.45,
  skepticism: 0.4,
  boredom: 0.12,
  irritation: 0.55,
  disappointment: 0.35,
  sadness: 0.3,
  sympathy: 0.35,
  guilt: 0.45,
  shame: 0.5,
  embarrassment: 0.6,
  fear: 0.95,
  anger: 0.9,
  disgust: 0.65,
  contempt: 0.4,
};

export const emotionValence = (e) => VALENCE[e] ?? 0;
export const emotionArousal = (e) => AROUSAL[e] ?? 0.3;
