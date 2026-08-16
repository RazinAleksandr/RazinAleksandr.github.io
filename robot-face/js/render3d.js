/**
 * render3d.js — photoreal path.
 *
 * The 2D renderer is guaranteed to work with no assets, but it is a drawing.
 * For an actual photorealistic face we need a scanned or scan-derived head
 * with ARKit blendshapes. This backend loads any GLB that carries the 52
 * standard ARKit morph targets and drives them from the same muscle state.
 *
 * The muscle→blendshape matrix lives in facs.js next to each muscle, so the
 * anatomy stays the single source of truth across both renderers.
 */

// Resolved through the import map in index.html so this module and the
// vendored loaders share one copy of three.
import * as THREE from "three";
import { GLTFLoader } from "../vendor/three/loaders/GLTFLoader.js";
import { RoomEnvironment } from "../vendor/three/environments/RoomEnvironment.js";
import { MUSCLES } from "./facs.js";

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

const BONE_HINTS = {
  head: ["head"],
  neck: ["neck"],
  eyeL: ["lefteye", "eye_l", "eyeleft"],
  eyeR: ["righteye", "eye_r", "eyeright"],
};

export class Renderer3D {
  constructor(canvas) {
    this.canvas = canvas;
    this.ready = false;
    this.error = null;
    this.morphMeshes = [];
    this.bones = {};
    this.available = new Set();

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x14141a);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    this.camera = new THREE.PerspectiveCamera(24, 1, 0.05, 40);
    this.camera.position.set(0, 1.62, 0.68);

    // Three-point lighting: warm key upper-left, cool fill, hair rim behind.
    const key = new THREE.DirectionalLight(0xfff1e2, 2.4);
    key.position.set(-1.1, 2.4, 1.5);
    const fill = new THREE.DirectionalLight(0xbcd0ff, 0.7);
    fill.position.set(1.4, 1.3, 0.9);
    const rim = new THREE.DirectionalLight(0xffd9b8, 1.6);
    rim.position.set(0.4, 2.2, -1.6);
    this.scene.add(key, fill, rim, new THREE.AmbientLight(0xffffff, 0.28));

    this.orbit = { yaw: 0, pitch: 0, dist: 0.68 };
    this.attachPointer();
    this.resize();
  }

  attachPointer() {
    let dragging = false,
      lx = 0,
      ly = 0;
    const c = this.canvas;
    c.addEventListener("pointerdown", (e) => {
      dragging = true;
      lx = e.clientX;
      ly = e.clientY;
      c.setPointerCapture(e.pointerId);
    });
    c.addEventListener("pointerup", (e) => {
      dragging = false;
      c.releasePointerCapture(e.pointerId);
    });
    c.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      this.orbit.yaw = clamp(this.orbit.yaw - (e.clientX - lx) * 0.005, -0.7, 0.7);
      this.orbit.pitch = clamp(this.orbit.pitch + (e.clientY - ly) * 0.004, -0.4, 0.4);
      lx = e.clientX;
      ly = e.clientY;
    });
    c.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        this.orbit.dist = clamp(this.orbit.dist + e.deltaY * 0.0006, 0.28, 1.6);
      },
      { passive: false }
    );
  }

  resize() {
    const r = this.canvas.getBoundingClientRect();
    const w = Math.max(320, r.width),
      h = Math.max(320, r.height);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /** Load from a URL (CORS-enabled host) or from a local File/Blob. */
  async load(src) {
    this.error = null;
    this.ready = false;
    const loader = new GLTFLoader();
    let gltf;
    try {
      if (src instanceof Blob) {
        const buf = await src.arrayBuffer();
        gltf = await loader.parseAsync(buf, "");
      } else {
        gltf = await loader.loadAsync(src);
      }
    } catch (e) {
      this.error = `Could not load the model: ${e.message}`;
      throw e;
    }

    if (this.root) this.scene.remove(this.root);
    this.root = gltf.scene;
    this.scene.add(this.root);
    this.morphMeshes = [];
    this.bones = {};
    this.available = new Set();

    this.root.traverse((o) => {
      if (o.isMesh || o.isSkinnedMesh) {
        if (o.morphTargetDictionary) {
          this.morphMeshes.push(o);
          for (const k of Object.keys(o.morphTargetDictionary)) this.available.add(k);
        }
        o.frustumCulled = false;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) {
          if (!m) continue;
          // Skin reads plastic at default roughness; soften it and add a
          // touch of sheen so the highlight rolls off like skin.
          if (/skin|body|head|face/i.test(m.name || "")) {
            m.roughness = clamp((m.roughness ?? 0.7) * 0.82, 0.32, 0.78);
            if ("sheen" in m) {
              m.sheen = 0.35;
              m.sheenRoughness = 0.7;
              m.sheenColor = new THREE.Color(0xffd8c8);
            }
          }
          m.envMapIntensity = 1.05;
          m.needsUpdate = true;
        }
      }
      if (o.isBone) {
        const n = o.name.toLowerCase();
        for (const [key, hints] of Object.entries(BONE_HINTS)) {
          if (this.bones[key]) continue;
          if (hints.some((h) => n.includes(h))) {
            this.bones[key] = o;
            if (!o.userData.restQ) o.userData.restQ = o.quaternion.clone();
          }
        }
      }
    });

    if (!this.morphMeshes.length) {
      this.error =
        "This model has no morph targets. Export the avatar with ARKit blendshapes (Ready Player Me: append ?morphTargets=ARKit to the .glb URL).";
      throw new Error(this.error);
    }

    this.frameHead();
    this.ready = true;
    return {
      morphs: this.available.size,
      bones: Object.keys(this.bones),
      arkit: [...this.available].filter((k) => /^(brow|cheek|eye|jaw|mouth|nose|tongue)/.test(k)).length,
    };
  }

  frameHead() {
    const head = this.bones.head;
    const target = new THREE.Vector3();
    if (head) head.getWorldPosition(target);
    else {
      const box = new THREE.Box3().setFromObject(this.root);
      target.set((box.min.x + box.max.x) / 2, box.max.y - (box.max.y - box.min.y) * 0.09, 0);
    }
    this.headTarget = target.clone().add(new THREE.Vector3(0, 0.055, 0));
  }

  /** Resolve every ARKit weight from the current muscle state. */
  computeWeights(nm) {
    const w = {};
    const put = (k, v) => {
      if (v > (w[k] ?? 0)) w[k] = v;
    };

    for (const m of MUSCLES) {
      if (!m.arkit || m.signed) continue;
      const l = nm.getSide(m.id, "left");
      const r = nm.getSide(m.id, "right");
      for (const [key, coef] of Object.entries(m.arkit)) {
        if (/Left$/.test(key)) put(key, clamp(l * coef, 0, 1));
        else if (/Right$/.test(key)) put(key, clamp(r * coef, 0, 1));
        else put(key, clamp(((l + r) / 2) * coef, 0, 1));
      }
    }

    // Gaze is bipolar and has to be split across four ARKit targets per axis.
    const gx = clamp(nm.get("gaze_horizontal"), -1, 1);
    const gy = clamp(nm.get("gaze_vertical"), -1, 1);
    if (gx >= 0) {
      put("eyeLookOutLeft", gx);
      put("eyeLookInRight", gx);
    } else {
      put("eyeLookInLeft", -gx);
      put("eyeLookOutRight", -gx);
    }
    if (gy >= 0) {
      put("eyeLookUpLeft", gy);
      put("eyeLookUpRight", gy);
    } else {
      put("eyeLookDownLeft", -gy);
      put("eyeLookDownRight", -gy);
    }

    // A blink must beat a lid raise outright, not average with it.
    const blink = clamp(nm.get("orbicularis_oculi_blink") + nm.get("levator_palpebrae_inhibition") * 0.85, 0, 1);
    if (blink > 0.02) {
      w.eyeBlinkLeft = Math.max(w.eyeBlinkLeft ?? 0, blink);
      w.eyeBlinkRight = Math.max(w.eyeBlinkRight ?? 0, blink);
      const k = 1 - blink;
      for (const key of ["eyeWideLeft", "eyeWideRight", "eyeSquintLeft", "eyeSquintRight"]) {
        if (w[key]) w[key] *= k;
      }
    }
    return w;
  }

  applyPose(nm, dt) {
    const rot = (bone, pitch, yaw, roll, gain) => {
      if (!bone) return;
      const rest = bone.userData.restQ;
      const e = new THREE.Euler(pitch * gain, yaw * gain, roll * gain, "XYZ");
      const q = new THREE.Quaternion().setFromEuler(e);
      bone.quaternion.copy(rest).multiply(q);
    };
    const p = -clamp(nm.get("head_pitch"), -1, 1);
    const y = clamp(nm.get("head_yaw"), -1, 1);
    const r = -clamp(nm.get("head_roll"), -1, 1);
    // Split the rotation between neck and head so the motion has a chain.
    rot(this.bones.neck, p * 0.4, y * 0.4, r * 0.4, 0.42);
    rot(this.bones.head, p * 0.6, y * 0.6, r * 0.6, 0.42);
  }

  render(nm, auto) {
    if (!this.ready) return;
    const w = this.computeWeights(nm);
    for (const mesh of this.morphMeshes) {
      const dict = mesh.morphTargetDictionary;
      const inf = mesh.morphTargetInfluences;
      for (const key in dict) inf[dict[key]] = w[key] ?? 0;
    }
    this.applyPose(nm);

    // Pupil size, if the model exposes a pupil morph or scalable pupil mesh.
    const pupil = auto ? auto.out.pupil : 0.5;
    if (this.available.has("pupilDilate")) {
      for (const mesh of this.morphMeshes) {
        const i = mesh.morphTargetDictionary.pupilDilate;
        if (i !== undefined) mesh.morphTargetInfluences[i] = pupil;
      }
    }

    const t = this.headTarget || new THREE.Vector3(0, 1.6, 0);
    const { yaw, pitch, dist } = this.orbit;
    this.camera.position.set(
      t.x + Math.sin(yaw) * Math.cos(pitch) * dist,
      t.y + Math.sin(pitch) * dist,
      t.z + Math.cos(yaw) * Math.cos(pitch) * dist
    );
    this.camera.lookAt(t);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.dispose();
  }
}
