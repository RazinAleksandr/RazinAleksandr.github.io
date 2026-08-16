/**
 * render2d.js — procedural face renderer.
 *
 * Draws a face from muscle activations alone, with no external assets. Every
 * contour is a function of the current contraction of the muscles that move
 * it, so the geometry is driven by the same anatomy the model addresses.
 *
 * Face space is measured in units where the head is 600 wide and 840 tall,
 * origin on the pupil line between the eyes. The layout follows the classical
 * canon: eyes on the vertical midline of the skull, the face divided into
 * equal thirds from hairline to brow to nose base to chin, one eye-width
 * between the eyes, and five eye-widths across.
 */

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (c1, c2, t) => [Math.round(lerp(c1[0], c2[0], t)), Math.round(lerp(c1[1], c2[1], t)), Math.round(lerp(c1[2], c2[2], t))];
const rgba = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x9e3779b9) | 0;
    let t = Math.imul(a ^ (a >>> 16), 0x21f0aaad);
    t = Math.imul(t ^ (t >>> 15), 0x735a2d97);
    return ((t ^ (t >>> 15)) >>> 0) / 4294967296;
  };
}

/* ── Anthropometry ───────────────────────────────────────────────────── */
const F = {
  W: 300, // half-width at the cheekbones
  TOP: -420, // top of the cranium
  CHIN: 420, // chin, jaw closed
  HAIRLINE: -292,
  BROW_Y: -70,
  EYE_Y: 0,
  EYE_X: 120, // one eye-width from centre
  EYE_HW: 60, // half the palpebral fissure
  IRIS_R: 24,
  NOSE_BASE: 182,
  NOSE_HW: 56,
  MOUTH_Y: 262,
  MOUTH_HW: 92,
  EAR_TOP: -74,
  EAR_BOT: 176,
};

/* ── Palette: warm light complexion under a soft key light ───────────── */
const SKIN = {
  base: [227, 186, 168],
  lit: [244, 214, 197],
  mid: [211, 165, 148],
  shadow: [175, 126, 112],
  deep: [138, 93, 84],
  blush: [206, 108, 100],
  lipBase: [190, 116, 113],
  lipDeep: [138, 70, 72],
  sclera: [238, 233, 231],
  scleraShade: [193, 184, 184],
  iris: [98, 118, 106],
  irisDeep: [38, 50, 45],
  irisLight: [151, 168, 137],
  hair: [58, 39, 31],
  hairLit: [122, 84, 58],
  brow: [79, 53, 39],
  teeth: [240, 236, 232],
  mouthDark: [66, 30, 33],
};

export class Renderer2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.bloomEnabled = true;
    this.rand = prng(90210);
    this.buildStaticTextures();
    this.buildHair();
    this.resize();
  }

  resize() {
    const r = this.canvas.getBoundingClientRect();
    const w = Math.max(320, r.width),
      h = Math.max(320, r.height);
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.w = w;
    this.h = h;
    // Frame from the top of the hair to the collarbone, with air around it.
    this.scale = Math.min(w / 1080, h / 1480);
    this.ox = w / 2;
    this.oy = h / 2 + 40 * this.scale;

    if (!this.bloom) this.bloom = document.createElement("canvas");
    this.bloom.width = Math.max(1, Math.round(w * 0.3));
    this.bloom.height = Math.max(1, Math.round(h * 0.3));

    // Gradients that never change are built once per resize, not per frame.
    const c = this.ctx;
    this.backdrop = c.createRadialGradient(w * 0.5, h * 0.34, 40, w * 0.5, h * 0.5, h * 0.95);
    this.backdrop.addColorStop(0, "#242429");
    this.backdrop.addColorStop(1, "#0c0c0f");
    this.vignette = c.createRadialGradient(w / 2, h / 2, h * 0.34, w / 2, h / 2, h * 0.86);
    this.vignette.addColorStop(0, "rgba(0,0,0,0)");
    this.vignette.addColorStop(1, "rgba(0,0,0,0.55)");
  }

  /* ── Static textures ─────────────────────────────────────────────────── */
  buildStaticTextures() {
    const g = document.createElement("canvas");
    g.width = g.height = 256;
    const gc = g.getContext("2d");
    const img = gc.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = 128 + (this.rand() - 0.5) * 54;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = n;
      img.data[i + 3] = 255;
    }
    gc.putImageData(img, 0, 0);
    // Pores and freckles are baked into the same tile so skin detail costs
    // one composited fill per frame instead of two.
    for (let i = 0; i < 1100; i++) {
      const x = this.rand() * 256,
        y = this.rand() * 256;
      gc.fillStyle = `rgba(148,102,90,${0.08 + this.rand() * 0.14})`;
      gc.beginPath();
      gc.arc(x, y, 0.4 + this.rand() * 1.4, 0, 7);
      gc.fill();
    }
    this.grain = g;

    // Iris: radial fibre structure, drawn once and reused for both eyes.
    const ir = document.createElement("canvas");
    ir.width = ir.height = 256;
    const ic = ir.getContext("2d");
    const cx = 128,
      cy = 128,
      R = 124;
    const bg = ic.createRadialGradient(cx, cy, 8, cx, cy, R);
    bg.addColorStop(0, rgba(SKIN.irisDeep));
    bg.addColorStop(0.4, rgba(SKIN.iris));
    bg.addColorStop(0.8, rgba(SKIN.irisLight));
    bg.addColorStop(1, rgba(mix(SKIN.irisDeep, SKIN.iris, 0.3)));
    ic.fillStyle = bg;
    ic.beginPath();
    ic.arc(cx, cy, R, 0, 7);
    ic.fill();
    for (let i = 0; i < 300; i++) {
      const a = this.rand() * Math.PI * 2;
      const r0 = 26 + this.rand() * 22;
      const r1 = r0 + 40 + this.rand() * 70;
      const wob = (this.rand() - 0.5) * 0.09;
      ic.strokeStyle =
        this.rand() < 0.5
          ? `rgba(${SKIN.irisLight.join(",")},${0.06 + this.rand() * 0.22})`
          : `rgba(${SKIN.irisDeep.join(",")},${0.05 + this.rand() * 0.24})`;
      ic.lineWidth = 0.8 + this.rand() * 2.2;
      ic.beginPath();
      ic.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      ic.quadraticCurveTo(
        cx + (Math.cos(a + wob) * (r0 + r1)) / 2,
        cy + (Math.sin(a + wob) * (r0 + r1)) / 2,
        cx + Math.cos(a + wob * 2) * r1,
        cy + Math.sin(a + wob * 2) * r1
      );
      ic.stroke();
    }
    // Limbal ring — the dark border that makes an eye read as real.
    const lg = ic.createRadialGradient(cx, cy, R * 0.7, cx, cy, R);
    lg.addColorStop(0, "rgba(18,24,20,0)");
    lg.addColorStop(0.8, "rgba(18,24,20,0.5)");
    lg.addColorStop(1, "rgba(12,16,14,0.95)");
    ic.fillStyle = lg;
    ic.beginPath();
    ic.arc(cx, cy, R, 0, 7);
    ic.fill();
    this.irisTex = ir;
  }

  buildHair() {
    // Hair and eyebrow hairs are fixed geometry, generated once. Regenerating
    // them per frame is both expensive and visibly wrong — hair that reshuffles
    // every 16 ms shimmers, and shimmer reads as "computer graphics" instantly.
    //
    // Hair is a silhouette first and strands second. Drawing strands without a
    // filled shape underneath gives straw; the shape carries the mass and the
    // strands only supply direction and sheen inside it.
    const strand = (x0, y0, len, bow, drop) => ({
      x0,
      y0,
      len,
      bow,
      drop,
      w: 1.2 + this.rand() * 3.4,
      tone: this.rand(),
    });

    this.backStrands = [];
    for (let i = 0; i < 190; i++) {
      const side = i % 2 ? 1 : -1;
      const t = this.rand();
      this.backStrands.push(
        strand(
          side * F.W * (0.15 + t * 1.05),
          F.TOP - 40 + this.rand() * 180,
          620 + this.rand() * 460,
          side * (40 + this.rand() * 150),
          0.9 + this.rand() * 0.3
        )
      );
    }

    // The fringe sweeps from a part slightly off-centre down to both temples.
    this.frontStrands = [];
    for (let i = 0; i < 150; i++) {
      const side = this.rand() < 0.62 ? 1 : -1;
      const t = this.rand();
      this.frontStrands.push(
        strand(
          -30 + side * F.W * t * 0.5,
          F.TOP + 6 + this.rand() * 90,
          340 + this.rand() * 430,
          side * (120 + this.rand() * 260),
          0.85 + this.rand() * 0.35
        )
      );
    }

    // Eyebrow hairs, parameterised along the brow curve rather than in
    // absolute coordinates, so they follow the brow as it moves.
    this.browHairs = [];
    for (let i = 0; i < 130; i++) {
      const t = Math.pow(this.rand(), 0.8);
      const thick = Math.sin(Math.min(1, t * 1.4) * Math.PI) * 7.5 + 3;
      this.browHairs.push({
        t,
        jx: (this.rand() - 0.5) * 5,
        jy: (this.rand() - 0.5) * thick,
        len: 10 + this.rand() * 11,
        w: 1.3 + this.rand() * 1.2,
        tone: this.rand() * 0.5,
        alpha: 0.5 + this.rand() * 0.4,
      });
    }
    this.hairBackLayer = null;
    this.hairFrontLayer = null;
    this.skinLayer = null;
  }

  /** The mass of hair behind the head, from crown to below the shoulders. */
  hairBackPath(ctx) {
    const W = F.W;
    ctx.beginPath();
    ctx.moveTo(-W * 1.22, -110);
    ctx.bezierCurveTo(-W * 1.36, 250, -W * 1.22, 520, -W * 1.08, 740);
    ctx.lineTo(W * 1.08, 740);
    ctx.bezierCurveTo(W * 1.22, 520, W * 1.36, 250, W * 1.22, -110);
    ctx.bezierCurveTo(W * 1.18, F.TOP - 76, -W * 1.18, F.TOP - 76, -W * 1.22, -110);
    ctx.closePath();
  }

  /**
   * The hair in front: bounded above by the crown and below by the hairline,
   * which dips at the temples and carries a slight widow's peak. Everything
   * inside this shape is hair; everything below it is forehead.
   */
  hairFrontPath(ctx) {
    const W = F.W,
      H = F.HAIRLINE;
    ctx.beginPath();
    // Outer edge, over the top of the skull.
    ctx.moveTo(-W * 1.1, 150);
    ctx.bezierCurveTo(-W * 1.26, -170, -W * 0.78, F.TOP - 70, 0, F.TOP - 70);
    ctx.bezierCurveTo(W * 0.78, F.TOP - 70, W * 1.26, -170, W * 1.1, 150);
    // Back along the hairline, right temple to left temple.
    ctx.bezierCurveTo(W * 1.03, 10, W * 0.99, -110, W * 0.82, H + 86);
    ctx.bezierCurveTo(W * 0.6, H + 30, W * 0.4, H - 26, W * 0.16, H - 34);
    ctx.bezierCurveTo(W * 0.02, H - 38, -W * 0.12, H - 4, -W * 0.34, H - 12);
    ctx.bezierCurveTo(-W * 0.56, H - 20, -W * 0.7, H + 34, -W * 0.82, H + 86);
    ctx.bezierCurveTo(-W * 0.99, -110, -W * 1.03, 10, -W * 1.1, 150);
    ctx.closePath();
  }

  /** Approximate height of the hairline at a given x, for feathering. */
  hairlineY(x) {
    const t = Math.min(1, Math.abs(x) / (F.W * 0.82));
    // Slight widow's peak at centre, dropping toward the temples.
    return F.HAIRLINE - 26 + 112 * t * t + Math.sin(x * 0.031) * 9;
  }

  /**
   * A hairline that is a clean curve reads as a swimming cap. Real ones are
   * ragged: fine short hairs cross the boundary in both directions.
   */
  featherHairline(x) {
    x.lineCap = "round";
    for (let i = 0; i < 260; i++) {
      const px = (this.rand() * 2 - 1) * F.W * 0.94;
      const py = this.hairlineY(px) + (this.rand() - 0.5) * 16;
      const len = 6 + this.rand() * 34;
      const drift = (this.rand() - 0.5) * 26 + Math.sign(px) * 10;
      x.beginPath();
      x.moveTo(px, py - len * 0.4);
      x.quadraticCurveTo(px + drift * 0.4, py + len * 0.3, px + drift, py + len * 0.6);
      x.strokeStyle = `rgba(${mix(SKIN.hair, SKIN.hairLit, this.rand() * 0.6).join(",")},${0.1 + this.rand() * 0.34})`;
      x.lineWidth = 0.7 + this.rand() * 1.5;
      x.stroke();
    }
  }

  /** Fill a hair shape and texture it with strands clipped inside. */
  bakeHair(pathFn, strands, sheenTop, feather = false) {
    const S = 2,
      W = 980,
      H = 1420,
      OX = 490,
      OY = 560;
    const c = document.createElement("canvas");
    c.width = W * S;
    c.height = H * S;
    const x = c.getContext("2d");
    x.scale(S, S);
    x.translate(OX, OY);

    pathFn.call(this, x);
    const mg = x.createLinearGradient(-F.W, F.TOP, F.W, 500);
    mg.addColorStop(0, rgba(mix(SKIN.hair, SKIN.hairLit, 0.34)));
    mg.addColorStop(0.45, rgba(SKIN.hair));
    mg.addColorStop(1, rgba(mix(SKIN.hair, [16, 10, 8], 0.6)));
    x.fillStyle = mg;
    x.fill();

    x.save();
    pathFn.call(this, x);
    x.clip();
    x.lineCap = "round";
    for (const s of strands) {
      x.beginPath();
      x.moveTo(s.x0, s.y0);
      x.bezierCurveTo(
        s.x0 + s.bow * 0.45,
        s.y0 + s.len * 0.34 * s.drop,
        s.x0 + s.bow * 1.0,
        s.y0 + s.len * 0.7 * s.drop,
        s.x0 + s.bow * 1.2,
        s.y0 + s.len * s.drop
      );
      const col = mix(SKIN.hair, SKIN.hairLit, s.tone * s.tone);
      x.strokeStyle = `rgba(${col.join(",")},${0.3 + s.tone * 0.45})`;
      x.lineWidth = s.w;
      x.stroke();
    }
    // Sheen band where the light wraps the curve of the skull.
    const sg = x.createLinearGradient(0, sheenTop, 0, sheenTop + 210);
    sg.addColorStop(0, "rgba(255,220,188,0)");
    sg.addColorStop(0.5, "rgba(255,220,188,0.17)");
    sg.addColorStop(1, "rgba(255,220,188,0)");
    x.fillStyle = sg;
    x.fillRect(-F.W * 1.4, sheenTop, F.W * 2.8, 210);
    x.restore();

    if (feather) {
      // Fade the fringe out along the hairline rather than letting the fill
      // stop on a crisp curve, then draw individual hairs back across the
      // boundary. The fade has to follow the hairline column by column — a
      // single horizontal band leaves hard notches where the line dips at
      // the temples.
      const mask = document.createElement("canvas");
      mask.width = c.width;
      mask.height = c.height;
      const mc = mask.getContext("2d");
      mc.scale(S, S);
      mc.translate(OX, OY);
      mc.beginPath();
      mc.moveTo(-F.W * 1.4, this.hairlineY(-F.W * 1.4));
      for (let px = -F.W * 1.4; px <= F.W * 1.4; px += 6) mc.lineTo(px, this.hairlineY(px));
      mc.lineTo(F.W * 1.4, 900);
      mc.lineTo(-F.W * 1.4, 900);
      mc.closePath();
      mc.fillStyle = "#fff";
      mc.fill();

      x.save();
      x.setTransform(1, 0, 0, 1, 0, 0);
      x.globalCompositeOperation = "destination-out";
      x.filter = "blur(26px)";
      x.drawImage(mask, 0, 0);
      x.filter = "none";
      x.restore();
      this.featherHairline(x);
    }

    return { canvas: c, W, H, OX, OY };
  }

  /** Head silhouette. Cranium, temple, cheekbone, jaw angle, chin. */
  headPath(ctx, chinY = F.CHIN, yawSkew = 0) {
    const W = F.W,
      T = F.TOP;
    ctx.beginPath();
    ctx.moveTo(yawSkew * 0.5, T);
    ctx.bezierCurveTo(W * 0.62 + yawSkew * 0.4, T + 2, W * 1.0, T + 150, W, -40);
    ctx.bezierCurveTo(W * 0.97, 84, W * 0.84, 190, W * 0.56, chinY - 132);
    ctx.bezierCurveTo(W * 0.44, chinY - 58, W * 0.24, chinY - 2, 0, chinY);
    ctx.bezierCurveTo(-W * 0.24, chinY - 2, -W * 0.44, chinY - 58, -W * 0.56, chinY - 132);
    ctx.bezierCurveTo(-W * 0.84, 190, -W * 0.97, 84, -W, -40);
    ctx.bezierCurveTo(-W * 1.0, T + 150, -W * 0.62 + yawSkew * 0.4, T + 2, yawSkew * 0.5, T);
    ctx.closePath();
  }

  /* ── Baked layers ────────────────────────────────────────────────────── */

  /**
   * The complexion — base gradient, subsurface rim, and the structural
   * shadows and highlights that describe the skull — never changes. Bake it
   * once; per frame the face is one blit plus whatever is genuinely dynamic.
   */
  buildSkinLayer() {
    const W = 760,
      H = 1060,
      OX = 380,
      OY = 520;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d");
    ctx.translate(OX, OY);

    const g = ctx.createRadialGradient(-70, -180, 30, 0, 60, 520);
    g.addColorStop(0, rgba(SKIN.lit));
    g.addColorStop(0.4, rgba(SKIN.base));
    g.addColorStop(0.76, rgba(SKIN.mid));
    g.addColorStop(1, rgba(SKIN.shadow));
    ctx.fillStyle = g;
    ctx.fillRect(-OX, -OY, W, H);

    // Warm subsurface scatter at the silhouette.
    const rim = ctx.createRadialGradient(0, 0, 268, 0, 0, 372);
    rim.addColorStop(0, "rgba(196,104,88,0)");
    rim.addColorStop(1, "rgba(196,104,88,0.42)");
    ctx.fillStyle = rim;
    ctx.fillRect(-OX, -OY, W, H);

    const shade = (x, y, rx, ry, a, rot = 0) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      const s = ctx.createRadialGradient(0, 0, 1, 0, 0, Math.max(rx, ry));
      s.addColorStop(0, `rgba(130,80,70,${a})`);
      s.addColorStop(1, "rgba(130,80,70,0)");
      ctx.fillStyle = s;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, 7);
      ctx.fill();
      ctx.restore();
    };
    const light = (x, y, rx, ry, a) => {
      const s = ctx.createRadialGradient(x, y, 1, x, y, Math.max(rx, ry));
      s.addColorStop(0, `rgba(255,240,228,${a})`);
      s.addColorStop(1, "rgba(255,240,228,0)");
      ctx.fillStyle = s;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, 7);
      ctx.fill();
    };

    shade(-258, -140, 82, 150, 0.28); // temples
    shade(258, -140, 82, 150, 0.28);
    shade(-212, 182, 118, 92, 0.2, -0.28); // under the cheekbone
    shade(212, 182, 118, 92, 0.2, 0.28);
    shade(0, -404, 260, 104, 0.24); // top of the skull
    shade(-186, F.CHIN - 96, 116, 120, 0.22); // jaw
    shade(186, F.CHIN - 96, 116, 120, 0.22);
    shade(0, F.CHIN - 14, 168, 74, 0.18); // under the chin

    light(-56, -230, 150, 96, 0.18); // forehead
    light(-160, 74, 82, 54, 0.2); // cheekbones
    light(160, 74, 82, 54, 0.13);
    light(0, F.CHIN - 92, 62, 44, 0.12); // chin
    light(0, 40, 34, 150, 0.1); // nose bridge

    this.skinLayer = { canvas: c, W, H, OX, OY };
  }

  /* ── Landmarks from muscle state ─────────────────────────────────────── */
  landmarks(nm, auto) {
    const g = (id) => nm.get(id);
    const gs = (id, s) => nm.getSide(id, s);

    const L = { left: {}, right: {} };
    for (const s of ["left", "right"]) {
      const dir = s === "left" ? -1 : 1; // screen-left is the subject's right
      const au1 = gs("frontalis_pars_medialis", s);
      const au2 = gs("frontalis_pars_lateralis", s);
      const au4 = gs("corrugator_supercilii", s) + gs("depressor_supercilii", s) * 0.6;
      const au5 = gs("levator_palpebrae_superioris", s);
      const au6 = gs("orbicularis_oculi_pars_orbitalis", s);
      const au7 = gs("orbicularis_oculi_pars_palpebralis", s);
      const au43 = gs("levator_palpebrae_inhibition", s);
      const au45 = gs("orbicularis_oculi_blink", s);
      const au12 = gs("zygomaticus_major", s);
      const au9 = gs("levator_labii_alaeque_nasi", s);

      const ex = dir * F.EYE_X;
      const ey = F.EYE_Y;

      L[s].browIn = {
        x: ex - dir * 76 + dir * au4 * 22,
        y: F.BROW_Y + 10 - au1 * 30 - au2 * 6 + au4 * 22 + au9 * 7,
      };
      L[s].browMid = {
        x: ex - dir * 2,
        y: F.BROW_Y - 12 - au1 * 15 - au2 * 24 + au4 * 15 - au6 * 4,
      };
      L[s].browOut = {
        x: ex + dir * 66,
        y: F.BROW_Y + 6 - au2 * 30 - au1 * 3 + au4 * 7 - au6 * 6,
      };

      const closure = clamp(au45 + au43 * 0.85, 0, 1);
      const up = 27 + au5 * 11 - au6 * 8 - au7 * 6 - closure * 32;
      const down = 22 - au6 * 10 - au7 * 7 - closure * 6 - au9 * 3;
      L[s].eye = { x: ex, y: ey, up: Math.max(-2, up), down: Math.max(-2, down), closure };
      L[s].au = { au1, au2, au4, au5, au6, au7, au9, au12, au45, au43 };
    }

    const au9 = g("levator_labii_alaeque_nasi");
    const au10 = g("levator_labii_superioris");
    const au11 = g("zygomaticus_minor");
    const au12l = nm.getSide("zygomaticus_major", "left");
    const au12r = nm.getSide("zygomaticus_major", "right");
    const au14l = nm.getSide("buccinator", "left");
    const au14r = nm.getSide("buccinator", "right");
    const au15l = nm.getSide("depressor_anguli_oris", "left");
    const au15r = nm.getSide("depressor_anguli_oris", "right");
    const au16 = g("depressor_labii_inferioris");
    const au17 = g("mentalis");
    const au18 = g("orbicularis_oris_pucker");
    const au20l = nm.getSide("risorius", "left");
    const au20r = nm.getSide("risorius", "right");
    const au22 = g("orbicularis_oris_funneler");
    const au23 = g("orbicularis_oris_tightener");
    const au24 = g("orbicularis_oris_pressor");
    const au25 = g("lips_part");
    const au26 = g("masseter_relaxation");
    const au27 = g("pterygoid_stretch");
    const au28 = g("lip_suck");
    const au31 = g("masseter_clench");
    const au33 = g("buccinator_puff");
    const au35 = g("buccinator_suck");

    const jaw = clamp(au26 * 54 + au27 * 112, 0, 150);
    const mouthY = F.MOUTH_Y + jaw * 0.32 - au17 * 5;
    const halfW = F.MOUTH_HW + (au20l + au20r) * 0.5 * 30 + (au12l + au12r) * 0.5 * 26 - au18 * 34 - au22 * 14 - au27 * 5;

    const corner = (v12, v15, v20, v14, dir) => ({
      x: dir * (halfW + v12 * 20 + v20 * 9 - v14 * 12),
      y: mouthY - v12 * 46 + v15 * 25 + v20 * 4 - v14 * 3,
      inset: v14,
    });

    const upperThick = clamp(13 + au10 * 3 + au22 * 6 - au23 * 5 - au24 * 4 - au28 * 10, 2, 22);
    const lowerThick = clamp(17 + au22 * 7 + au17 * 3 - au23 * 6 - au24 * 5 - au28 * 13, 3, 27);
    const gap = clamp(au25 * 15 + jaw * 0.72 + au16 * 11 - au24 * 9 - au23 * 5, 0, 120);

    const M = {
      cx: 0,
      cy: mouthY,
      halfW,
      cl: corner(au12l, au15l, au20l, au14l, -1),
      cr: corner(au12r, au15r, au20r, au14r, 1),
      upperY: mouthY - gap * 0.34 - au10 * 13 - au9 * 7 + au17 * 3,
      lowerY: mouthY + gap * 0.66 + au16 * 11 - au17 * 11,
      upperThick,
      lowerThick,
      gap,
      pucker: au18,
      funnel: au22,
      press: au24 + au23 * 0.6,
      suck: au28,
      jaw,
      clench: au31,
      puff: au33,
      hollow: au35,
      cupid: clamp(1 - au18 * 0.7 - au22 * 0.6, 0.2, 1),
    };

    return {
      L,
      M,
      chinY: F.CHIN + jaw,
      head: { pitch: g("head_pitch"), yaw: g("head_yaw"), roll: g("head_roll") },
      au9,
      au10,
      au11,
      au17,
      au25,
      cheekLift: {
        left: nm.getSide("orbicularis_oculi_pars_orbitalis", "left") + au12l * 0.6,
        right: nm.getSide("orbicularis_oculi_pars_orbitalis", "right") + au12r * 0.6,
      },
      blush: g("facial_vasodilation"),
      tears: g("lacrimal_secretion"),
      platysma: g("platysma"),
      tongue: g("genioglossus_protrusion"),
      pupil: auto ? auto.out.pupil : 0.5,
      gazeX: g("gaze_horizontal"),
      gazeY: g("gaze_vertical"),
      breath: auto ? auto.out.breath : 0,
      swallow: auto ? auto.out.swallow : 0,
    };
  }

  /* ── Frame ───────────────────────────────────────────────────────────── */
  render(nm, auto) {
    const ctx = this.ctx;
    const P = this.landmarks(nm, auto);

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = this.backdrop;
    ctx.fillRect(0, 0, this.w, this.h);

    ctx.save();
    ctx.translate(this.ox, this.oy);
    ctx.scale(this.scale, this.scale);
    ctx.rotate(P.head.roll * 0.2);
    ctx.translate(P.head.yaw * 40, -P.head.pitch * 34);

    this.drawHairBack(ctx, P);
    this.drawNeck(ctx, P);
    this.drawEars(ctx, P);
    this.drawHead(ctx, P);
    this.drawOrbits(ctx, P);
    this.drawEye(ctx, P, "left");
    this.drawEye(ctx, P, "right");
    this.drawBrow(ctx, P, "left");
    this.drawBrow(ctx, P, "right");
    this.drawNose(ctx, P);
    this.drawMouth(ctx, P);
    this.drawWrinkles(ctx, P);
    this.drawSkinDetail(ctx, P);
    this.drawHairFront(ctx, P);
    ctx.restore();

    this.postProcess(ctx);
  }

  drawNeck(ctx, P) {
    const y0 = F.CHIN - 130;
    ctx.save();
    // Neck and shoulders as one silhouette that runs off the bottom of frame;
    // a neck that ends in mid-air reads as a bust on a plinth.
    ctx.beginPath();
    ctx.moveTo(-112, y0);
    ctx.bezierCurveTo(-120, y0 + 150, -150, y0 + 210, -232, y0 + 258);
    ctx.bezierCurveTo(-340, y0 + 296, -430, y0 + 350, -470, y0 + 430);
    ctx.lineTo(-470, y0 + 520);
    ctx.lineTo(470, y0 + 520);
    ctx.lineTo(470, y0 + 430);
    ctx.bezierCurveTo(430, y0 + 350, 340, y0 + 296, 232, y0 + 258);
    ctx.bezierCurveTo(150, y0 + 210, 120, y0 + 150, 112, y0);
    ctx.closePath();
    const gr = ctx.createLinearGradient(-130, y0, 160, y0 + 240);
    gr.addColorStop(0, rgba(SKIN.shadow));
    gr.addColorStop(0.45, rgba(SKIN.mid));
    gr.addColorStop(1, rgba(SKIN.deep));
    ctx.fillStyle = gr;
    ctx.fill();

    // Clavicles catch a little light.
    for (const d of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(d * 34, y0 + 274);
      ctx.quadraticCurveTo(d * 160, y0 + 292, d * 268, y0 + 322);
      ctx.strokeStyle = "rgba(255,232,216,0.12)";
      ctx.lineWidth = 7;
      ctx.stroke();
    }

    // Jaw shadow cast onto the throat.
    ctx.beginPath();
    ctx.ellipse(0, y0 + 44, 148, 86, 0, 0, 7);
    const sg = ctx.createRadialGradient(0, y0 + 20, 8, 0, y0 + 44, 152);
    sg.addColorStop(0, "rgba(58,34,30,0.6)");
    sg.addColorStop(1, "rgba(58,34,30,0)");
    ctx.fillStyle = sg;
    ctx.fill();

    const pl = P.platysma;
    if (pl > 0.05) {
      ctx.strokeStyle = `rgba(112,72,62,${pl * 0.35})`;
      ctx.lineWidth = 5;
      for (const d of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(d * 52, y0 + 40);
        ctx.quadraticCurveTo(d * 86, y0 + 150, d * 136, y0 + 280);
        ctx.stroke();
      }
    }
    if (P.swallow > 0.02) {
      const sy = y0 + 70 + (1 - P.swallow) * 80;
      ctx.beginPath();
      ctx.ellipse(0, sy, 30, 18, 0, 0, 7);
      ctx.fillStyle = `rgba(255,225,210,${P.swallow * 0.16})`;
      ctx.fill();
    }
    ctx.restore();
  }

  drawEars(ctx, P) {
    for (const d of [-1, 1]) {
      ctx.save();
      ctx.translate(d * (F.W - 6), (F.EAR_TOP + F.EAR_BOT) / 2);
      ctx.rotate(d * 0.1);
      ctx.beginPath();
      ctx.ellipse(0, 0, 27, (F.EAR_BOT - F.EAR_TOP) / 2, 0, 0, 7);
      const g = ctx.createLinearGradient(-24, 0, 24, 0);
      g.addColorStop(0, rgba(SKIN.shadow));
      g.addColorStop(1, rgba(SKIN.deep));
      ctx.fillStyle = g;
      ctx.fill();
      // Concha shadow
      ctx.beginPath();
      ctx.ellipse(-3, 6, 12, 38, 0, 0, 7);
      ctx.fillStyle = "rgba(104,60,52,0.5)";
      ctx.fill();
      ctx.restore();
    }
  }

  drawHead(ctx, P) {
    if (!this.skinLayer) this.buildSkinLayer();
    ctx.save();
    this.headPath(ctx, P.chinY, P.head.yaw * 22);
    ctx.clip();

    const s = this.skinLayer;
    ctx.drawImage(s.canvas, -s.OX, -s.OY, s.W, s.H);

    // Cheek colour. Blush is slow and lingering; pallor drains the mid-tones.
    const b = P.blush;
    if (b > 0.01) {
      for (const d of [-1, 1]) {
        const bx = d * 165,
          by = 122;
        const bgd = ctx.createRadialGradient(bx, by, 4, bx, by, 150);
        bgd.addColorStop(0, `rgba(${SKIN.blush.join(",")},${0.4 * b})`);
        bgd.addColorStop(1, `rgba(${SKIN.blush.join(",")},0)`);
        ctx.fillStyle = bgd;
        ctx.beginPath();
        ctx.ellipse(bx, by, 150, 106, 0, 0, 7);
        ctx.fill();
      }
      // Ears and throat colour up too — that is what makes a blush read as real.
      const eg = ctx.createRadialGradient(0, F.CHIN - 40, 10, 0, F.CHIN, 240);
      eg.addColorStop(0, `rgba(${SKIN.blush.join(",")},${0.2 * b})`);
      eg.addColorStop(1, `rgba(${SKIN.blush.join(",")},0)`);
      ctx.fillStyle = eg;
      ctx.fillRect(-380, 200, 760, 500);
    } else if (b < -0.01) {
      ctx.fillStyle = `rgba(190,202,212,${-b * 0.26})`;
      ctx.fillRect(-380, -520, 760, 1060);
    }

    // The cheek mass rises with AU6 and AU12: a smile physically pushes the
    // midface up, which is why a smiling face looks shorter.
    for (const [side, d] of [
      ["left", -1],
      ["right", 1],
    ]) {
      const lift = clamp(P.cheekLift[side], 0, 1.4);
      if (lift < 0.05) continue;
      const cx = d * 150,
        cy = 130 - lift * 16;
      const cg = ctx.createRadialGradient(cx, cy, 4, cx, cy, 118);
      cg.addColorStop(0, `rgba(255,236,222,${0.2 * lift})`);
      cg.addColorStop(1, "rgba(255,236,222,0)");
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 106, 74, 0, 0, 7);
      ctx.fill();
    }
    ctx.restore();
  }

  drawOrbits(ctx, P) {
    ctx.save();
    this.headPath(ctx, P.chinY, P.head.yaw * 22);
    ctx.clip();
    for (const s of ["left", "right"]) {
      const e = P.L[s].eye;
      const g = ctx.createRadialGradient(e.x, e.y - 16, 6, e.x, e.y - 10, 92);
      g.addColorStop(0, "rgba(132,84,78,0.34)");
      g.addColorStop(1, "rgba(132,84,78,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(e.x, e.y - 12, 92, 62, 0, 0, 7);
      ctx.fill();
      // Tear trough deepens with fatigue and sadness.
      const t = ctx.createRadialGradient(e.x - 8, e.y + 44, 4, e.x - 8, e.y + 44, 62);
      t.addColorStop(0, `rgba(132,94,104,${0.13 + P.L[s].au.au43 * 0.16})`);
      t.addColorStop(1, "rgba(132,94,104,0)");
      ctx.fillStyle = t;
      ctx.beginPath();
      ctx.ellipse(e.x - 8, e.y + 42, 60, 28, 0.1, 0, 7);
      ctx.fill();
    }
    ctx.restore();
  }

  eyePath(ctx, e, s) {
    const dir = s === "left" ? -1 : 1;
    const hw = F.EYE_HW;
    const inner = e.x - dir * hw,
      outer = e.x + dir * hw;
    ctx.beginPath();
    ctx.moveTo(inner, e.y + 3);
    // Upper lid: peak sits slightly toward the outer canthus.
    ctx.bezierCurveTo(e.x - dir * 34, e.y - e.up * 1.05, e.x + dir * 22, e.y - e.up * 1.02, outer, e.y - 3);
    ctx.bezierCurveTo(e.x + dir * 25, e.y + e.down, e.x - dir * 30, e.y + e.down * 0.94, inner, e.y + 3);
    ctx.closePath();
  }

  drawEye(ctx, P, s) {
    const e = P.L[s].eye;
    const dir = s === "left" ? -1 : 1;
    const open = clamp((e.up + e.down) / 49, 0, 1.4);
    const lidTop = e.y - e.up;

    ctx.save();
    if (open > 0.04) {
      ctx.save();
      this.eyePath(ctx, e, s);
      ctx.clip();

      // Sclera, shaded by the lid above it — never draw it flat white.
      const wg = ctx.createLinearGradient(e.x, e.y - e.up, e.x, e.y + e.down);
      wg.addColorStop(0, rgba(SKIN.scleraShade));
      wg.addColorStop(0.42, rgba(SKIN.sclera));
      wg.addColorStop(1, rgba(mix(SKIN.sclera, SKIN.scleraShade, 0.5)));
      ctx.fillStyle = wg;
      ctx.fillRect(e.x - 80, e.y - 70, 160, 140);

      // Vascular warmth at the inner canthus.
      const cg = ctx.createRadialGradient(e.x - dir * 56, e.y + 3, 2, e.x - dir * 56, e.y + 3, 32);
      cg.addColorStop(0, "rgba(206,124,118,0.55)");
      cg.addColorStop(1, "rgba(206,124,118,0)");
      ctx.fillStyle = cg;
      ctx.fillRect(e.x - 80, e.y - 70, 160, 140);

      // Iris and pupil
      const R = F.IRIS_R;
      const ix = e.x - P.gazeX * 20;
      const iy = e.y + 1 - P.gazeY * 13;
      ctx.save();
      ctx.beginPath();
      ctx.arc(ix, iy, R, 0, 7);
      ctx.clip();
      ctx.drawImage(this.irisTex, ix - R, iy - R, R * 2, R * 2);
      // Shadow cast by the upper lid onto the iris — critical for depth.
      const ls = ctx.createLinearGradient(0, iy - R, 0, iy + R * 0.35);
      ls.addColorStop(0, "rgba(10,14,12,0.58)");
      ls.addColorStop(1, "rgba(10,14,12,0)");
      ctx.fillStyle = ls;
      ctx.fillRect(ix - R, iy - R, R * 2, R * 2);
      ctx.restore();

      const pr = lerp(5.5, 12.5, clamp(P.pupil, 0, 1));
      ctx.beginPath();
      ctx.arc(ix, iy, pr, 0, 7);
      ctx.fillStyle = "#080a09";
      ctx.fill();

      // Specular highlight from the key light, plus a dim fill catchlight.
      ctx.beginPath();
      ctx.arc(ix - 8.5, iy - 8.5, 5, 0, 7);
      ctx.fillStyle = "rgba(255,255,255,0.94)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ix + 8, iy + 6, 2.4, 0, 7);
      ctx.fillStyle = "rgba(255,255,255,0.32)";
      ctx.fill();

      // Corneal bulge glint
      const bulge = ctx.createRadialGradient(ix - 5, iy - 6, 1, ix, iy, R * 1.2);
      bulge.addColorStop(0, "rgba(255,255,255,0.14)");
      bulge.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = bulge;
      ctx.beginPath();
      ctx.arc(ix, iy, R * 1.2, 0, 7);
      ctx.fill();

      // Tear film pooling on the lower lid.
      if (P.tears > 0.02) {
        const tg = ctx.createLinearGradient(0, e.y + e.down - 10, 0, e.y + e.down);
        tg.addColorStop(0, "rgba(255,255,255,0)");
        tg.addColorStop(1, `rgba(238,246,255,${0.28 + P.tears * 0.5})`);
        ctx.fillStyle = tg;
        ctx.fillRect(e.x - 70, e.y + e.down - 12, 140, 16);
      }
      ctx.restore();
    }

    // Upper lid skin above the lash line, so the lid reads as a surface.
    ctx.beginPath();
    ctx.moveTo(e.x - dir * 62, e.y + 3);
    ctx.bezierCurveTo(e.x - dir * 34, lidTop, e.x + dir * 22, lidTop, e.x + dir * 62, e.y - 3);
    ctx.lineTo(e.x + dir * 70, e.y - 34);
    ctx.lineTo(e.x - dir * 70, e.y - 30);
    ctx.closePath();
    const lg = ctx.createLinearGradient(0, lidTop - 30, 0, lidTop + 4);
    lg.addColorStop(0, rgba(SKIN.base, 0.95));
    lg.addColorStop(1, rgba(mix(SKIN.mid, SKIN.shadow, 0.35)));
    ctx.fillStyle = lg;
    ctx.fill();

    // Lid crease
    ctx.beginPath();
    ctx.moveTo(e.x - dir * 54, e.y - 4);
    ctx.bezierCurveTo(e.x - dir * 30, lidTop - 15, e.x + dir * 22, lidTop - 14, e.x + dir * 60, e.y - 12);
    ctx.strokeStyle = `rgba(140,96,90,${0.32 + open * 0.2})`;
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // Lash line and lashes
    ctx.beginPath();
    ctx.moveTo(e.x - dir * 62, e.y + 3);
    ctx.bezierCurveTo(e.x - dir * 34, lidTop, e.x + dir * 22, lidTop, e.x + dir * 62, e.y - 3);
    ctx.strokeStyle = "rgba(42,27,24,0.88)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.stroke();
    for (let i = 0; i < 11; i++) {
      const t = i / 10;
      const px = lerp(e.x - dir * 56, e.x + dir * 58, t);
      const py = lerp(e.y + 2, e.y - 2, t) + Math.sin(t * Math.PI) * -(e.up * 0.94);
      const l = 8 + Math.sin(t * Math.PI) * 6 + t * 5;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.quadraticCurveTo(px + dir * 3, py - l * 0.7, px + dir * (5 + t * 6), py - l);
      ctx.strokeStyle = "rgba(34,22,18,0.75)";
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
    // Lower lash line, much softer.
    ctx.beginPath();
    ctx.moveTo(e.x - dir * 58, e.y + 4);
    ctx.bezierCurveTo(e.x - dir * 30, e.y + e.down * 0.96, e.x + dir * 25, e.y + e.down, e.x + dir * 58, e.y - 2);
    ctx.strokeStyle = "rgba(90,58,54,0.4)";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Lower lid ridge catches light — the fullness that reads as youth, and
    // the part of a smile that cannot be faked.
    ctx.beginPath();
    ctx.moveTo(e.x - dir * 50, e.y + e.down + 5);
    ctx.bezierCurveTo(e.x - dir * 22, e.y + e.down + 14, e.x + dir * 22, e.y + e.down + 12, e.x + dir * 52, e.y - 1);
    ctx.strokeStyle = `rgba(255,234,222,${0.14 + P.L[s].au.au6 * 0.34})`;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
  }

  drawBrow(ctx, P, s) {
    const b = P.L[s];
    const dir = s === "left" ? -1 : 1;
    ctx.save();
    ctx.lineCap = "round";
    // Two passes: an offset shadow so the brow sits in the skin, then the hair.
    for (let pass = 0; pass < 2; pass++) {
      const off = pass === 0 ? 3.5 : 0;
      if (pass === 0) ctx.strokeStyle = "rgba(112,74,60,0.28)";
      for (const h of this.browHairs) {
        const t = h.t,
          it = 1 - t;
        const x = it * it * b.browIn.x + 2 * it * t * b.browMid.x + t * t * b.browOut.x;
        const y = it * it * b.browIn.y + 2 * it * t * b.browMid.y + t * t * b.browOut.y;
        ctx.beginPath();
        ctx.moveTo(x + h.jx, y + h.jy + off);
        ctx.lineTo(x + h.jx + dir * h.len * 0.85, y + h.jy + off - h.len * 0.3 * it - 2);
        if (pass === 1) ctx.strokeStyle = `rgba(${mix(SKIN.brow, SKIN.hairLit, h.tone).join(",")},${h.alpha})`;
        ctx.lineWidth = h.w;
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawNose(ctx, P) {
    const au9 = P.au9;
    const w = F.NOSE_HW + au9 * 10;
    const tipY = F.NOSE_BASE - 24;
    ctx.save();

    // Bridge: highlight on the lit side, shadow on the other.
    const bg = ctx.createLinearGradient(-40, 0, 40, 0);
    bg.addColorStop(0, "rgba(255,242,232,0.26)");
    bg.addColorStop(0.5, "rgba(255,242,232,0.05)");
    bg.addColorStop(1, "rgba(138,88,78,0.30)");
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.moveTo(-22, -58);
    ctx.bezierCurveTo(-28, 20, -38, 92, -w * 0.62, tipY + 8);
    ctx.lineTo(w * 0.62, tipY + 8);
    ctx.bezierCurveTo(38, 92, 28, 20, 22, -58);
    ctx.closePath();
    ctx.fill();

    // Tip
    const tg = ctx.createRadialGradient(-6, tipY - 12, 2, 0, tipY - 4, 40);
    tg.addColorStop(0, "rgba(255,244,234,0.46)");
    tg.addColorStop(1, "rgba(255,244,234,0)");
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.ellipse(0, tipY - 6, 36, 26, 0, 0, 7);
    ctx.fill();

    for (const d of [-1, 1]) {
      // Ala
      ctx.beginPath();
      ctx.ellipse(d * (w * 0.66), tipY + 6, 19 + au9 * 4, 15, d * 0.24, 0, 7);
      const ag = ctx.createRadialGradient(d * w * 0.66 - 5, tipY - 3, 2, d * w * 0.66, tipY + 6, 23);
      ag.addColorStop(0, rgba(SKIN.base, 0.85));
      ag.addColorStop(1, rgba(SKIN.mid, 0.8));
      ctx.fillStyle = ag;
      ctx.fill();

      // Nostril
      ctx.beginPath();
      ctx.ellipse(d * (w * 0.4), tipY + 14, 9.5, 6, d * -0.42, 0, 7);
      ctx.fillStyle = "rgba(92,54,48,0.6)";
      ctx.fill();

      // Alar crease
      ctx.beginPath();
      ctx.moveTo(d * (w * 0.5), tipY + 18);
      ctx.quadraticCurveTo(d * (w * 0.88), tipY + 16, d * (w * 0.9), tipY - 4);
      ctx.strokeStyle = "rgba(142,92,82,0.2)";
      ctx.lineWidth = 2.2;
      ctx.stroke();
    }

    // Columella shadow
    ctx.beginPath();
    ctx.ellipse(0, tipY + 20, 12, 7, 0, 0, 7);
    ctx.fillStyle = "rgba(132,84,74,0.3)";
    ctx.fill();
    ctx.restore();
  }

  drawMouth(ctx, P) {
    const M = P.M;
    ctx.save();

    // Philtrum
    ctx.beginPath();
    ctx.moveTo(-11, F.NOSE_BASE + 4);
    ctx.lineTo(-14, M.upperY - M.upperThick);
    ctx.lineTo(14, M.upperY - M.upperThick);
    ctx.lineTo(11, F.NOSE_BASE + 4);
    ctx.closePath();
    ctx.fillStyle = "rgba(142,94,84,0.14)";
    ctx.fill();

    const cl = M.cl,
      cr = M.cr;
    const upperTop = M.upperY - M.upperThick;
    const lowerBot = M.lowerY + M.lowerThick;
    const cupid = M.cupid;

    // Mouth interior
    if (M.gap > 1.5) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cl.x, cl.y);
      ctx.bezierCurveTo(-46, M.upperY - 2, 46, M.upperY - 2, cr.x, cr.y);
      ctx.bezierCurveTo(44, M.lowerY + 4, -44, M.lowerY + 4, cl.x, cl.y);
      ctx.closePath();
      ctx.clip();
      const ig = ctx.createLinearGradient(0, M.upperY, 0, M.lowerY);
      ig.addColorStop(0, "rgba(38,14,18,1)");
      ig.addColorStop(1, rgba(SKIN.mouthDark));
      ctx.fillStyle = ig;
      ctx.fillRect(-150, M.upperY - 10, 300, M.gap + 40);

      if (M.gap > 6) {
        const th = clamp(M.gap * 0.5, 6, 30);
        ctx.beginPath();
        ctx.moveTo(-64, M.upperY - 1);
        ctx.bezierCurveTo(-34, M.upperY + th * 0.5, 34, M.upperY + th * 0.5, 64, M.upperY - 1);
        ctx.lineTo(64, M.upperY - 13);
        ctx.lineTo(-64, M.upperY - 13);
        ctx.closePath();
        const tg = ctx.createLinearGradient(0, M.upperY - 9, 0, M.upperY + th);
        tg.addColorStop(0, rgba(SKIN.teeth));
        tg.addColorStop(1, rgba(mix(SKIN.teeth, [184, 172, 166], 0.8)));
        ctx.fillStyle = tg;
        ctx.fill();
        ctx.strokeStyle = "rgba(176,164,160,0.5)";
        ctx.lineWidth = 1;
        for (const tx of [-40, -21, 0, 21, 40]) {
          ctx.beginPath();
          ctx.moveTo(tx, M.upperY - 11);
          ctx.lineTo(tx, M.upperY + th * 0.42);
          ctx.stroke();
        }
      }
      if (M.gap > 42) {
        ctx.beginPath();
        ctx.moveTo(-50, M.lowerY + 1);
        ctx.bezierCurveTo(-28, M.lowerY - 11, 28, M.lowerY - 11, 50, M.lowerY + 1);
        ctx.lineTo(50, M.lowerY + 14);
        ctx.lineTo(-50, M.lowerY + 14);
        ctx.closePath();
        ctx.fillStyle = rgba(mix(SKIN.teeth, [170, 158, 152], 0.5));
        ctx.fill();
      }
      if (P.tongue > 0.03 || M.gap > 58) {
        const tv = Math.max(P.tongue, (M.gap - 58) / 80);
        ctx.beginPath();
        ctx.ellipse(0, M.lowerY - 5 + (1 - tv) * 16, 40, 19, 0, 0, 7);
        ctx.fillStyle = `rgba(168,86,90,${clamp(tv, 0, 1)})`;
        ctx.fill();
      }
      ctx.restore();
    }

    // Upper lip
    ctx.beginPath();
    ctx.moveTo(cl.x, cl.y);
    ctx.bezierCurveTo(-62, upperTop + 7 * (1 - cupid), -30, upperTop - 4 * cupid, -11, upperTop + 3 * cupid);
    ctx.quadraticCurveTo(0, upperTop + 8 * cupid, 11, upperTop + 3 * cupid);
    ctx.bezierCurveTo(30, upperTop - 4 * cupid, 62, upperTop + 7 * (1 - cupid), cr.x, cr.y);
    if (M.gap > 1.5) ctx.bezierCurveTo(44, M.upperY - 1, -44, M.upperY - 1, cl.x, cl.y);
    else ctx.bezierCurveTo(46, M.lowerY + 2, -46, M.lowerY + 2, cl.x, cl.y);
    ctx.closePath();
    const ug = ctx.createLinearGradient(0, upperTop, 0, M.upperY + 5);
    ug.addColorStop(0, rgba(mix(SKIN.lipBase, SKIN.lipDeep, 0.4)));
    ug.addColorStop(0.55, rgba(SKIN.lipBase));
    ug.addColorStop(1, rgba(SKIN.lipDeep));
    ctx.fillStyle = ug;
    ctx.fill();

    // Lower lip
    ctx.beginPath();
    ctx.moveTo(cl.x, cl.y);
    ctx.bezierCurveTo(-46, M.lowerY - 2, 46, M.lowerY - 2, cr.x, cr.y);
    ctx.bezierCurveTo(58, lowerBot - 5, 30, lowerBot + 5, 0, lowerBot + 6);
    ctx.bezierCurveTo(-30, lowerBot + 5, -58, lowerBot - 5, cl.x, cl.y);
    ctx.closePath();
    const dg = ctx.createLinearGradient(0, M.lowerY - 4, 0, lowerBot + 6);
    dg.addColorStop(0, rgba(SKIN.lipDeep));
    dg.addColorStop(0.42, rgba(SKIN.lipBase));
    dg.addColorStop(1, rgba(mix(SKIN.lipBase, SKIN.lipDeep, 0.5)));
    ctx.fillStyle = dg;
    ctx.fill();

    // Volume highlight on the lower lip — the strongest realism cue a mouth
    // has. It shrinks as the lips press or roll inward.
    const hl = clamp(1 - M.press * 0.8 - M.suck, 0, 1);
    if (hl > 0.05) {
      const hg = ctx.createRadialGradient(-6, M.lowerY + M.lowerThick * 0.35, 2, 0, M.lowerY + M.lowerThick * 0.4, 54);
      hg.addColorStop(0, `rgba(255,234,228,${0.48 * hl})`);
      hg.addColorStop(1, "rgba(255,234,228,0)");
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.ellipse(-3, M.lowerY + M.lowerThick * 0.4, 46, 11, 0, 0, 7);
      ctx.fill();
    }
    ctx.fillStyle = `rgba(255,230,224,${0.15 * hl})`;
    ctx.beginPath();
    ctx.ellipse(-19, upperTop + 6, 22, 4, -0.1, 0, 7);
    ctx.fill();

    // Vermilion border
    ctx.beginPath();
    ctx.moveTo(cl.x, cl.y);
    ctx.bezierCurveTo(-62, upperTop + 7 * (1 - cupid), -30, upperTop - 4 * cupid, -11, upperTop + 3 * cupid);
    ctx.quadraticCurveTo(0, upperTop + 8 * cupid, 11, upperTop + 3 * cupid);
    ctx.bezierCurveTo(30, upperTop - 4 * cupid, 62, upperTop + 7 * (1 - cupid), cr.x, cr.y);
    ctx.strokeStyle = "rgba(255,224,216,0.26)";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Closed-mouth seam
    if (M.gap <= 1.5) {
      ctx.beginPath();
      ctx.moveTo(cl.x, cl.y);
      ctx.bezierCurveTo(-44, M.upperY + 1, 44, M.upperY + 1, cr.x, cr.y);
      ctx.strokeStyle = `rgba(104,52,52,${0.55 + M.press * 0.4})`;
      ctx.lineWidth = 2.2 + M.press * 1.8;
      ctx.stroke();
    }

    // Corner pits
    for (const c of [cl, cr]) {
      const depth = 0.26 + c.inset * 0.5;
      const cg2 = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 13);
      cg2.addColorStop(0, `rgba(110,60,54,${depth})`);
      cg2.addColorStop(1, "rgba(110,60,54,0)");
      ctx.fillStyle = cg2;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, 9 + c.inset * 5, 7, 0, 0, 7);
      ctx.fill();
    }

    // Shadow under the lower lip and the mental crease
    const mg = ctx.createRadialGradient(0, lowerBot + 18, 2, 0, lowerBot + 24, 60);
    mg.addColorStop(0, `rgba(138,88,78,${0.32 + P.au17 * 0.2})`);
    mg.addColorStop(1, "rgba(138,88,78,0)");
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.ellipse(0, lowerBot + 24, 56, 16, 0, 0, 7);
    ctx.fill();

    // Chin boss wrinkling from mentalis
    if (P.au17 > 0.12) {
      ctx.save();
      ctx.globalAlpha = clamp((P.au17 - 0.12) * 1.1, 0, 0.55);
      ctx.strokeStyle = "rgba(132,86,76,0.5)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 11; i++) {
        const x = -40 + i * 8;
        ctx.beginPath();
        ctx.moveTo(x, lowerBot + 30);
        ctx.quadraticCurveTo(x + 2, lowerBot + 46, x - 1, lowerBot + 62);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Cheek inflation / hollowing
    if (M.puff > 0.05 || M.hollow > 0.05) {
      for (const d of [-1, 1]) {
        const x = d * 172,
          y = M.cy - 34;
        const g2 = ctx.createRadialGradient(x, y, 4, x, y, 88);
        if (M.puff > M.hollow) {
          g2.addColorStop(0, `rgba(255,230,218,${M.puff * 0.32})`);
          g2.addColorStop(1, "rgba(255,230,218,0)");
        } else {
          g2.addColorStop(0, `rgba(124,78,70,${M.hollow * 0.36})`);
          g2.addColorStop(1, "rgba(124,78,70,0)");
        }
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.ellipse(x, y, 82, 64, 0, 0, 7);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  drawWrinkles(ctx, P) {
    const line = (pts, a, w = 2.2, col = "118,72,64") => {
      if (a <= 0.02) return;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (pts[i][0] + pts[i + 1][0]) / 2;
        const yc = (pts[i][1] + pts[i + 1][1]) / 2;
        ctx.quadraticCurveTo(pts[i][0], pts[i][1], xc, yc);
      }
      ctx.strokeStyle = `rgba(${col},${clamp(a, 0, 0.6)})`;
      ctx.lineWidth = w;
      ctx.lineCap = "round";
      ctx.stroke();
    };

    const au1 = (P.L.left.au.au1 + P.L.right.au.au1) / 2;
    const au2 = (P.L.left.au.au2 + P.L.right.au.au2) / 2;
    const au4 = (P.L.left.au.au4 + P.L.right.au.au4) / 2;

    // Forehead furrows: only when frontalis actually lifts.
    const fh = clamp(au1 * 0.8 + au2 * 0.9, 0, 1);
    for (let i = 0; i < 3; i++) {
      const y = -160 - i * 34;
      line(
        [
          [-158, y + 12],
          [-76, y - 5],
          [0, y - 9],
          [76, y - 5],
          [158, y + 12],
        ],
        fh * (0.5 - i * 0.11),
        2.8 - i * 0.4
      );
    }

    // Glabellar "elevens" from corrugator.
    line(
      [
        [-20, -128],
        [-23, -100],
        [-19, -76],
      ],
      au4 * 0.7,
      3
    );
    line(
      [
        [19, -130],
        [22, -102],
        [17, -78],
      ],
      au4 * 0.64,
      2.9
    );
    line(
      [
        [-34, -66],
        [0, -74],
        [34, -66],
      ],
      P.au9 * 0.5 + au4 * 0.25,
      2.6
    );

    // Crow's feet and the lower-lid crinkle nobody can fake.
    for (const s of ["left", "right"]) {
      const v = P.L[s].au.au6;
      const e = P.L[s].eye,
        dir = s === "left" ? -1 : 1;
      for (let i = 0; i < 3; i++) {
        const ang = -0.34 + i * 0.34;
        const x0 = e.x + dir * 62,
          y0 = e.y + i * 6 - 8;
        line(
          [
            [x0, y0],
            [x0 + dir * 20, y0 + Math.sin(ang) * 18],
            [x0 + dir * 38, y0 + Math.sin(ang) * 36],
          ],
          v * (0.52 - i * 0.08),
          2.2
        );
      }
      line(
        [
          [e.x - dir * 40, e.y + e.down + 14],
          [e.x, e.y + e.down + 19],
          [e.x + dir * 44, e.y + e.down + 10],
        ],
        v * 0.4,
        1.9
      );
    }

    // Nasolabial folds. They are creases in soft tissue, not drawn lines, so
    // they only appear once the midface is actually lifted, and they stop at
    // the corner of the mouth rather than running to the jaw.
    for (const [c, s] of [
      [P.M.cl, "left"],
      [P.M.cr, "right"],
    ]) {
      const dir = s === "left" ? -1 : 1;
      const v = clamp(Math.max(0, P.M.cy - c.y) / 26 + P.au10 * 0.5 + P.au9 * 0.4 + P.au11 * 0.5 - 0.12, 0, 1.1);
      if (v <= 0.02) continue;
      line(
        [
          [dir * 56, F.NOSE_BASE - 10],
          [dir * (92 + v * 9), F.NOSE_BASE + 30],
          [dir * (104 + v * 7), c.y - 4],
        ],
        v * 0.34,
        6
      );
    }

    // Nose wrinkle from AU9.
    for (let i = 0; i < 3; i++) {
      const y = 24 + i * 15;
      line(
        [
          [-38 + i * 3, y],
          [0, y - 7],
          [38 - i * 3, y],
        ],
        P.au9 * (0.58 - i * 0.14),
        2.6
      );
    }
  }

  drawSkinDetail(ctx, P) {
    ctx.save();
    this.headPath(ctx, P.chinY, P.head.yaw * 22);
    ctx.clip();
    if (!this.grainPat) this.grainPat = ctx.createPattern(this.grain, "repeat");
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = this.grainPat;
    ctx.fillRect(-380, -520, 760, 1080);
    ctx.restore();
  }

  drawHairBack(ctx, P) {
    if (!this.hairBackLayer) {
      this.hairBackLayer = this.bakeHair(this.hairBackPath, this.backStrands, F.TOP - 30);
    }
    const h = this.hairBackLayer;
    ctx.drawImage(h.canvas, -h.OX, -h.OY, h.W, h.H);
  }

  drawHairFront(ctx, P) {
    if (!this.hairFrontLayer) {
      this.hairFrontLayer = this.bakeHair(this.hairFrontPath, this.frontStrands, F.TOP - 20, true);
    }
    const h = this.hairFrontLayer;
    ctx.save();
    // The front mass lags the head very slightly, which reads as weight.
    ctx.translate(P.head.yaw * 7, -P.head.pitch * 4);
    ctx.drawImage(h.canvas, -h.OX, -h.OY, h.W, h.H);
    ctx.restore();
  }

  postProcess(ctx) {
    // Bloom softens the vector edges into something more photographic, but it
    // needs a readback of the main canvas, which is the most expensive thing
    // in the frame. Refresh it every third frame and reuse it in between —
    // at 17% opacity two frames of staleness is invisible.
    if (this.bloomEnabled) {
      this.bloomAge = (this.bloomAge ?? 99) + 1;
      if (this.bloomAge >= 3) {
        this.bloomAge = 0;
        const b = this.bloom,
          bc = b.getContext("2d");
        bc.globalCompositeOperation = "copy";
        bc.filter = "blur(2.4px)";
        bc.drawImage(this.canvas, 0, 0, b.width, b.height);
        bc.filter = "none";
      }
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.16;
      ctx.drawImage(this.bloom, 0, 0, this.w, this.h);
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = this.vignette;
    ctx.fillRect(0, 0, this.w, this.h);
    ctx.restore();
  }
}
