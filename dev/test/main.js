import a2kama from "a2kama";
import {
  a2kAurora,
  a2kBloom,
  a2kGlass,
  a2kGlitch,
  a2kHeatHaze,
  a2kHolographic,
  a2kJelly,
  a2kOil,
  a2kPrism,
  a2kRipple,
  a2kSmoke,
  a2kWater,
} from "a2kama/presets";

// ── Language ──
const MESSAGES = {
  en: {
    "nav.home": "Home",
    "nav.browse": "Browse",
    "nav.radio": "Radio",
    "nav.library": "Library",
    "nav.playlists": "Playlists",
    "playlist.morning": "Morning Focus",
    "playlist.deep": "Deep Work",
    "playlist.night": "Night Drive",
    "playlist.coastal": "Coastal Chill",
    "header.greeting": "Good evening",
    "header.sub": "Picked for your Thursday night",
    "header.search": "Search artists, songs, podcasts",
    "hero.kicker": "New release",
    "hero.meta": "Aurora Lane · 12 songs · 41 min",
    "hero.play": "Play album",
    "row.recent": "Recently played",
    "row.seeAll": "See all",
    "row.upNext": "Up next",
    "widget.kicker": "AMBIENT",
    "widget.title": "Ocean Waves",
    "widget.meta": "Focus mode · 42 min left",
    "guide.drag": "Drag",
    "guide.hint": "Click a card to tune it",
    "guide.open": "Show guide",
    "panel.title": "Uniform Playground",
    "panel.description":
      "Click the player bar (Glass) or the widget to tune it. Every slider writes one uniform through <code>a2kama.getOptions()</code>, and the snippet is the recipe for the current values.",
    "panel.swap": "Swap",
    "panel.emptyTitle": "Nothing selected",
    "panel.emptyBody": "Click a card on the left to edit its uniforms.",
    "panel.reset": "Reset",
    "panel.effect": "Effect",
    "panel.rippleHint": "Click the widget to drop a ripple.",
    "panel.jellyHint": "Click the widget to make it wobble.",
    "panel.layerOrder": "{top} (traveler {topLayer}) refracts {bottom} (traveler {bottomLayer})",
    "panel.onTop": "on top",
    "panel.underneath": "underneath",
    "glass.name": "Player bar",
    "water.name": "Ambient widget",
    "effect.glass": "Glass",
    "effect.water": "Water",
    "effect.jelly": "Jelly",
    "effect.prism": "Prism",
    "effect.aurora": "Aurora",
    "effect.bloom": "Bloom",
    "effect.holographic": "Holographic",
    "effect.ripple": "Ripple",
    "effect.heatHaze": "Heat haze",
    "effect.smoke": "Smoke",
    "effect.glitch": "Glitch",
    "effect.oil": "Oil",
  },
  ko: {
    "nav.home": "홈",
    "nav.browse": "둘러보기",
    "nav.radio": "라디오",
    "nav.library": "보관함",
    "nav.playlists": "플레이리스트",
    "playlist.morning": "아침 집중",
    "playlist.deep": "딥 워크",
    "playlist.night": "밤 드라이브",
    "playlist.coastal": "바닷가 휴식",
    "header.greeting": "좋은 저녁이에요",
    "header.sub": "목요일 밤을 위한 추천",
    "header.search": "아티스트, 노래, 팟캐스트 검색",
    "hero.kicker": "새 앨범",
    "hero.meta": "Aurora Lane · 12곡 · 41분",
    "hero.play": "앨범 재생",
    "row.recent": "최근 재생",
    "row.seeAll": "모두 보기",
    "row.upNext": "다음 곡",
    "widget.kicker": "앰비언트",
    "widget.title": "파도 소리",
    "widget.meta": "집중 모드 · 42분 남음",
    "guide.drag": "드래그",
    "guide.hint": "카드를 클릭하면 값을 조절할 수 있어요",
    "guide.open": "가이드 보기",
    "panel.title": "유니폼 플레이그라운드",
    "panel.description":
      "플레이어 바(Glass)나 위젯을 클릭해 설정을 바꿔 보세요. 슬라이더마다 <code>a2kama.getOptions()</code>로 유니폼 하나를 바꾸고, 아래 코드는 현재 값으로 만든 레시피예요.",
    "panel.swap": "레이어 바꾸기",
    "panel.emptyTitle": "선택된 카드가 없어요",
    "panel.emptyBody": "카드를 클릭하면 유니폼을 조절할 수 있어요.",
    "panel.reset": "초기화",
    "panel.effect": "효과",
    "panel.rippleHint": "위젯을 클릭하면 파문이 생겨요.",
    "panel.jellyHint": "위젯을 클릭하면 출렁여요.",
    "panel.layerOrder": "{top}(traveler {topLayer}) → {bottom}(traveler {bottomLayer}) 굴절",
    "panel.onTop": "위",
    "panel.underneath": "아래",
    "glass.name": "플레이어 바",
    "water.name": "앰비언트 위젯",
    "effect.glass": "글래스",
    "effect.water": "워터",
    "effect.jelly": "젤리",
    "effect.prism": "프리즘",
    "effect.aurora": "오로라",
    "effect.bloom": "블룸",
    "effect.holographic": "홀로그래픽",
    "effect.ripple": "리플",
    "effect.heatHaze": "아지랑이",
    "effect.smoke": "스모크",
    "effect.glitch": "글리치",
    "effect.oil": "오일",
  },
};

// Location without a permission prompt: the Asia/Seoul time zone or a Korean browser language.
function detectLanguage() {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  const prefersKorean = languages.some((language) => language?.toLowerCase().startsWith("ko"));
  return timeZone === "Asia/Seoul" || prefersKorean ? "ko" : "en";
}

const lang = detectLanguage();
const t = (key, vars = {}) => MESSAGES[lang][key].replace(/\{(\w+)\}/g, (_, name) => vars[name]);

// ── Effects ──
// Only slider ranges live here; defaults and uniform names come from each preset.
const range = (key, min, max, step) => ({ key, min, max, step });
const color = (key) => ({ key });

const EFFECTS = {
  glass: {
    factory: "a2kGlass.normal",
    create: (options) => a2kGlass.normal(options),
    controls: [
      range("refraction", 0, 300, 1),
      range("depth", 0, 200, 1),
      range("bevelWidth", 0, 200, 1),
      range("bevelCurve", 0.1, 10, 0.1),
      range("splay", 0, 200, 1),
      range("zoom", 0.1, 5, 0.05),
      range("dispersion", 0, 200, 1),
      range("frost", 0, 100, 1),
      range("lightDirection", 0, 360, 1),
      range("lightIntensity", 0, 2, 0.01),
      range("lightSymmetry", 0, 1, 0.01),
    ],
  },
  water: {
    factory: "a2kWater.normal",
    create: (options) => a2kWater.normal(options),
    controls: [
      range("speed", 0, 4, 0.05),
      range("amplitude", 0, 40, 0.5),
      range("wavelength", 10, 400, 1),
      range("direction", 0, 360, 1),
      range("turbulence", 0, 1, 0.01),
      range("edgeSoftness", 0, 100, 1),
      range("highlight", 0, 2, 0.01),
      range("lightDirection", 0, 360, 1),
      range("tintStrength", 0, 1, 0.01),
      color("tint"),
    ],
  },
  jelly: {
    factory: "a2kJelly.normal",
    create: (options) => a2kJelly.normal(options),
    controls: [
      range("speed", 0, 4, 0.05),
      range("wobble", 0, 40, 0.5),
      range("duration", 0.2, 4, 0.05),
      range("softness", 1, 120, 1),
      range("refraction", 0, 80, 1),
      range("gloss", 0, 2, 0.01),
      range("tintStrength", 0, 1, 0.01),
      color("tint"),
    ],
  },
  prism: {
    factory: "a2kPrism.normal",
    create: (options) => a2kPrism.normal(options),
    controls: [
      range("facetSize", 10, 200, 1),
      range("angle", 0, 360, 1),
      range("refraction", 0, 40, 0.5),
      range("dispersion", 0, 30, 0.5),
      range("rainbow", 0, 1, 0.01),
    ],
  },
  aurora: {
    factory: "a2kAurora.normal",
    create: (options) => a2kAurora.normal(options),
    controls: [
      range("speed", 0, 4, 0.05),
      range("intensity", 0, 2, 0.01),
      range("scale", 40, 600, 1),
      range("warp", 0, 30, 0.5),
      color("colorA"),
      color("colorB"),
    ],
  },
  bloom: {
    factory: "a2kBloom.normal",
    create: (options) => a2kBloom.normal(options),
    controls: [
      range("threshold", 0, 0.95, 0.01),
      range("radius", 0, 60, 1),
      range("intensity", 0, 4, 0.05),
      color("tint"),
    ],
  },
  holographic: {
    factory: "a2kHolographic.normal",
    create: (options) => a2kHolographic.normal(options),
    controls: [
      range("speed", 0, 4, 0.05),
      range("intensity", 0, 1, 0.01),
      range("bands", 0.1, 6, 0.05),
      range("angle", 0, 360, 1),
      range("sparkle", 0, 1, 0.01),
      range("refraction", 0, 20, 0.5),
    ],
  },
  ripple: {
    factory: "a2kRipple.normal",
    create: (options) => a2kRipple.normal(options),
    controls: [
      range("speed", 0, 1200, 5),
      range("amplitude", 0, 40, 0.5),
      range("wavelength", 8, 160, 1),
      range("duration", 0.2, 5, 0.05),
      range("autoInterval", 0, 8, 0.1),
      range("highlight", 0, 2, 0.01),
    ],
  },
  heatHaze: {
    factory: "a2kHeatHaze.normal",
    create: (options) => a2kHeatHaze.normal(options),
    controls: [
      range("speed", 0, 4, 0.05),
      range("amplitude", 0, 30, 0.5),
      range("scale", 10, 200, 1),
      range("tintStrength", 0, 1, 0.01),
      color("tint"),
    ],
  },
  smoke: {
    factory: "a2kSmoke.normal",
    create: (options) => a2kSmoke.normal(options),
    controls: [
      range("speed", 0, 4, 0.05),
      range("density", 0, 1, 0.01),
      range("scale", 40, 500, 1),
      range("distortion", 0, 30, 0.5),
      color("color"),
    ],
  },
  glitch: {
    factory: "a2kGlitch.normal",
    create: (options) => a2kGlitch.normal(options),
    controls: [
      range("speed", 0, 4, 0.05),
      range("intensity", 0, 1, 0.01),
      range("split", 0, 30, 0.5),
      range("shift", 0, 80, 1),
      range("blockSize", 4, 80, 1),
      range("scanlines", 0, 1, 0.01),
    ],
  },
  oil: {
    factory: "a2kOil.normal",
    create: (options) => a2kOil.normal(options),
    controls: [
      range("speed", 0, 4, 0.05),
      range("intensity", 0, 1, 0.01),
      range("scale", 40, 500, 1),
      range("refraction", 0, 30, 0.5),
      range("darkness", 0, 1, 0.01),
      range("bands", 0.2, 4, 0.05),
    ],
  },
};

// Effects that react to a click on the card, with the hint shown in the panel.
const TAP_EFFECTS = {
  jelly: { trigger: a2kJelly.trigger, hint: "panel.jellyHint" },
  ripple: { trigger: a2kRipple.trigger, hint: "panel.rippleHint" },
};

const WIDGET_EFFECTS = [
  "water",
  "jelly",
  "prism",
  "aurora",
  "bloom",
  "holographic",
  "ripple",
  "heatHaze",
  "smoke",
  "glitch",
  "oil",
];

const GROUPS = [
  { id: "glass", selector: "#glass", effectId: "glass", choices: null },
  { id: "water", selector: "#water", effectId: "water", choices: WIDGET_EFFECTS },
];

const round = (value, digits = 3) => Number(value.toFixed(digits));
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const toHex = (rgb) => `#${rgb.map((c) => Math.round(c * 255).toString(16).padStart(2, "0")).join("")}`;
const fromHex = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const copy = (value) => (Array.isArray(value) ? [...value] : value);
const travelerLayer = (card) => Number(card.dataset.mirageTravel.split(/\s+/)[1]);
const effectLabel = (group) => t(`effect.${group.effectId}`);
const recipeName = (group) => `demo-${group.id}-${group.effectId}`;

function formatValue(value) {
  return Array.isArray(value) ? toHex(value) : String(round(value));
}

function snippet(group) {
  const lines = group.params.map(({ key }) => {
    const value = group.state[key];
    const text = Array.isArray(value) ? `[${value.map((c) => round(c, 2)).join(", ")}]` : round(value);
    return `  ${key}: ${text},`;
  });
  return `${EFFECTS[group.effectId].factory}({\n${lines.join("\n")}\n});`;
}

// Registers the effect's default recipe for this card and derives its sliders from it.
function loadEffect(group, effectId) {
  const effect = EFFECTS[effectId];
  const recipe = effect.create();

  group.effectId = effectId;
  group.params = effect.controls.map((control) => {
    const uniform = recipe.optionMap[control.key];
    const value = recipe.shader.uniforms[uniform];
    return { ...control, uniform, value: copy(value), type: Array.isArray(value) ? "color" : "range" };
  });
  group.state = Object.fromEntries(group.params.map((param) => [param.key, copy(param.value)]));
  a2kama.register(recipeName(group), recipe);
}

function renderGroup(group) {
  const root = group.section;
  root.innerHTML = `
    <div class="group-head">
      <div>
        <h2 class="group-title"></h2>
        <span class="group-layer"></span>
      </div>
      <button type="button" class="reset"></button>
    </div>
    ${
      group.choices
        ? `<label class="effect-field">
            <span>${t("panel.effect")}</span>
            <select class="effect-select">
              ${group.choices.map((id) => `<option value="${id}">${t(`effect.${id}`)}</option>`).join("")}
            </select>
          </label>`
        : ""
    }
    ${TAP_EFFECTS[group.effectId] ? `<p class="effect-hint">${t(TAP_EFFECTS[group.effectId].hint)}</p>` : ""}
    <div class="rows"></div>
    <pre class="snippet"><code></code></pre>
  `;

  const rows = root.querySelector(".rows");
  const code = root.querySelector(".snippet code");
  const inputs = new Map();

  const apply = (param, value) => {
    group.state[param.key] = value;
    // The proxy forwards the assignment to the matching uniform.
    if (group.options) group.options[param.key] = value;
    inputs.get(param.key).output.textContent = formatValue(value);
    code.textContent = snippet(group);
  };

  for (const param of group.params) {
    const row = document.createElement("label");
    row.className = "row";
    row.innerHTML = `
      <span class="row-name">${param.key}<small>${param.uniform}</small></span>
      <output>${formatValue(param.value)}</output>
    `;

    const input = document.createElement("input");
    if (param.type === "color") {
      input.type = "color";
      input.value = toHex(param.value);
      input.addEventListener("input", () => apply(param, fromHex(input.value)));
    } else {
      input.type = "range";
      input.min = param.min;
      input.max = param.max;
      input.step = param.step;
      input.value = param.value;
      input.addEventListener("input", () => apply(param, Number(input.value)));
    }

    row.append(input);
    rows.append(row);
    inputs.set(param.key, { input, output: row.querySelector("output") });
  }

  root.querySelector(".reset").addEventListener("click", () => {
    for (const param of group.params) {
      const value = copy(param.value);
      inputs.get(param.key).input.value = Array.isArray(value) ? toHex(value) : value;
      apply(param, value);
    }
  });

  const select = root.querySelector(".effect-select");
  if (select) {
    select.value = group.effectId;
    select.addEventListener("change", () => switchEffect(group, select.value));
  }

  code.textContent = snippet(group);
  updateLayerLabels();
}

function switchEffect(group, effectId) {
  loadEffect(group, effectId);
  a2kama.setRecipe(group.card, recipeName(group));
  group.options = a2kama.getOptions(group.card);
  renderGroup(group);
}

function makeDraggable(card, onGrab, onTap) {
  const stage = card.offsetParent;
  let drag = null;

  card.addEventListener("pointerdown", (event) => {
    onGrab();
    drag = {
      id: event.pointerId,
      dx: event.clientX - card.offsetLeft,
      dy: event.clientY - card.offsetTop,
      startX: event.clientX,
      startY: event.clientY,
    };
    card.setPointerCapture(event.pointerId);
    card.classList.add("dragging");
  });

  card.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const left = clamp(event.clientX - drag.dx, 0, stage.clientWidth - card.offsetWidth);
    const top = clamp(event.clientY - drag.dy, 0, stage.clientHeight - card.offsetHeight);
    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
  });

  card.addEventListener("pointerup", (event) => {
    if (drag && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 4) onTap(event);
    drag = null;
    card.classList.remove("dragging");
  });

  card.addEventListener("pointercancel", () => {
    drag = null;
    card.classList.remove("dragging");
  });
}

// ── Selection: clicking a card opens its uniforms in the panel ──
const frame = document.querySelector("#frame");
const ring = document.querySelector("#selection-ring");
const ringTag = ring.querySelector(".selection-tag");
const emptyState = document.querySelector("#panel-empty");
let selected = null;

function updateLayerLabels() {
  if (!GROUPS.every((group) => group.card && group.section)) return;

  const [top, bottom] = [...GROUPS].sort((a, b) => travelerLayer(b.card) - travelerLayer(a.card));
  document.querySelector("#layer-order").textContent = t("panel.layerOrder", {
    top: effectLabel(top),
    topLayer: travelerLayer(top.card),
    bottom: effectLabel(bottom),
    bottomLayer: travelerLayer(bottom.card),
  });

  for (const group of GROUPS) {
    const title = group.section.querySelector(".group-title");
    if (!title) continue;
    title.textContent = `${effectLabel(group)} · ${t(`${group.id}.name`)}`;
    group.section.querySelector(".group-layer").textContent =
      `traveler ${travelerLayer(group.card)} · ${t(group === top ? "panel.onTop" : "panel.underneath")}`;
    group.section.querySelector(".reset").textContent = t("panel.reset");
  }
  if (selected) ringTag.textContent = `${effectLabel(selected)} · traveler ${travelerLayer(selected.card)}`;
}

function select(group) {
  selected = group;
  emptyState.hidden = true;
  for (const other of GROUPS) other.section.hidden = other !== group;
  ring.hidden = false;
  updateLayerLabels();
}

function deselect() {
  selected = null;
  emptyState.hidden = false;
  for (const group of GROUPS) group.section.hidden = true;
  ring.hidden = true;
}

// Pressing anywhere on the app except a card clears the selection.
document.querySelector("#stage").addEventListener("pointerdown", (event) => {
  if (selected && !event.target.closest(".card")) deselect();
});

// The ring sits outside the mirrored stage, so it follows the card every frame.
function trackRing() {
  if (selected) {
    const pad = 6;
    const frameRect = frame.getBoundingClientRect();
    const cardRect = selected.card.getBoundingClientRect();
    ring.style.left = `${cardRect.left - frameRect.left - pad}px`;
    ring.style.top = `${cardRect.top - frameRect.top - pad}px`;
    ring.style.width = `${cardRect.width + pad * 2}px`;
    ring.style.height = `${cardRect.height + pad * 2}px`;
    ring.style.borderRadius = `${parseFloat(getComputedStyle(selected.card).borderTopLeftRadius) + pad}px`;
  }
  requestAnimationFrame(trackRing);
}

// Translate the mirrored stage before the engine extracts it.
document.documentElement.lang = lang;
for (const el of document.querySelectorAll("[data-i18n]")) el.textContent = t(el.dataset.i18n);
for (const el of document.querySelectorAll("[data-i18n-html]")) el.innerHTML = t(el.dataset.i18nHtml);
for (const el of document.querySelectorAll("[data-i18n-label]")) el.setAttribute("aria-label", t(el.dataset.i18nLabel));

// 1. Register each card's starting effect and point the card at it.
for (const group of GROUPS) {
  group.card = document.querySelector(group.selector);
  group.section = document.querySelector(`[data-group="${group.id}"]`);
  loadEffect(group, group.effectId);
  group.card.dataset.a2kama = recipeName(group);
}

// 2. Start the engine on the stage only, so the panel and overlays are not mirrored.
a2kama.init(document.querySelector("#stage"), {
  quality: "medium",
  layer: "selected",
  travelerClipArea: "80px",
});

// 3. Wire each card to its options proxy and controls.
for (const group of GROUPS) {
  group.options = a2kama.getOptions(group.card);
  renderGroup(group);
  makeDraggable(
    group.card,
    () => select(group),
    (event) => {
      TAP_EFFECTS[group.effectId]?.trigger(group.options, group.card, event.clientX, event.clientY);
    },
  );
}
updateLayerLabels();
trackRing();

// Traveler N samples capture buffer N (the page plus every lower traveler),
// so whichever card is on the higher layer refracts the other one.
document.querySelector("#swap-layers").addEventListener("click", () => {
  const [glass, water] = GROUPS;
  const [bottom, top] = travelerLayer(glass.card) > travelerLayer(water.card) ? [glass, water] : [water, glass];

  bottom.card.dataset.mirageTravel = "traveler 2";
  bottom.card.style.zIndex = "2";
  top.card.dataset.mirageTravel = "traveler 3";
  top.card.style.zIndex = "3";
  updateLayerLabels();
});

// ── Guide: shown on every load, closed by any click ──
const guide = document.querySelector("#guide");

function positionGuideSpots() {
  const pad = 10;
  const frameRect = frame.getBoundingClientRect();
  for (const spot of guide.querySelectorAll(".guide-spot")) {
    const card = document.querySelector(spot.dataset.target);
    const cardRect = card.getBoundingClientRect();
    spot.style.left = `${cardRect.left - frameRect.left - pad}px`;
    spot.style.top = `${cardRect.top - frameRect.top - pad}px`;
    spot.style.width = `${cardRect.width + pad * 2}px`;
    spot.style.height = `${cardRect.height + pad * 2}px`;
    spot.style.borderRadius = `${parseFloat(getComputedStyle(card).borderTopLeftRadius) + pad}px`;
    spot.classList.toggle("label-above", cardRect.top - frameRect.top > frameRect.height / 2);
  }
}

function openGuide() {
  guide.hidden = false;
  positionGuideSpots();
}

function closeGuide() {
  guide.hidden = true;
}

document.querySelector("#guide-open").addEventListener("click", openGuide);
guide.addEventListener("click", closeGuide);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !guide.hidden) closeGuide();
});
window.addEventListener("resize", () => {
  if (!guide.hidden) positionGuideSpots();
});
openGuide();

window.a2kama = a2kama;
