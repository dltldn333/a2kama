import a2kama from "a2kama";
import { a2kGlass, a2kWater } from "a2kama/presets";

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
      "Click the player bar (Glass) or the widget (Water) to tune it. Every slider writes one uniform through <code>a2kama.getOptions()</code>, and the snippet is the recipe for the current values.",
    "panel.swap": "Swap",
    "panel.emptyTitle": "Nothing selected",
    "panel.emptyBody": "Click a card on the left to edit its uniforms.",
    "panel.reset": "Reset",
    "panel.layerOrder": "{top} (traveler {topLayer}) refracts {bottom} (traveler {bottomLayer})",
    "panel.onTop": "on top",
    "panel.underneath": "underneath",
    "glass.title": "Glass",
    "glass.name": "Player bar",
    "water.title": "Water",
    "water.name": "Ambient widget",
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
      "플레이어 바(Glass)나 위젯(Water)을 클릭해 설정을 바꿔 보세요. 슬라이더마다 <code>a2kama.getOptions()</code>로 유니폼 하나를 바꾸고, 아래 코드는 현재 값으로 만든 레시피예요.",
    "panel.swap": "레이어 바꾸기",
    "panel.emptyTitle": "선택된 카드가 없어요",
    "panel.emptyBody": "카드를 클릭하면 유니폼을 조절할 수 있어요.",
    "panel.reset": "초기화",
    "panel.layerOrder": "{top}(traveler {topLayer})가 {bottom}(traveler {bottomLayer})를 굴절시켜요",
    "panel.onTop": "위",
    "panel.underneath": "아래",
    "glass.title": "글래스",
    "glass.name": "플레이어 바",
    "water.title": "워터",
    "water.name": "앰비언트 위젯",
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

// Each param maps one recipe option to the uniform it drives.
const GROUPS = [
  {
    id: "glass",
    recipe: "testGlass",
    selector: "#glass",
    factory: "a2kGlass.normal",
    create: (options) => a2kGlass.normal(options),
    params: [
      { key: "refraction", uniform: "uGlassRefraction", min: 0, max: 300, step: 1, value: 100 },
      { key: "depth", uniform: "uGlassDepth", min: 0, max: 200, step: 1, value: 40 },
      { key: "bevelWidth", uniform: "uGlassBevelWidth", min: 0, max: 200, step: 1, value: 20 },
      { key: "bevelCurve", uniform: "uGlassBevelCurve", min: 0.1, max: 10, step: 0.1, value: 3 },
      { key: "splay", uniform: "uGlassSplay", min: 0, max: 200, step: 1, value: 0 },
      { key: "zoom", uniform: "uGlassZoom", min: 0.1, max: 5, step: 0.05, value: 1 },
      { key: "dispersion", uniform: "uGlassDispersion", min: 0, max: 200, step: 1, value: 0 },
      { key: "frost", uniform: "uGlassFrost", min: 0, max: 100, step: 1, value: 0 },
      { key: "lightDirection", uniform: "uGlassLightDirection", min: 0, max: 360, step: 1, value: 45 },
      { key: "lightIntensity", uniform: "uGlassLightIntensity", min: 0, max: 2, step: 0.01, value: 0.6 },
      { key: "lightSymmetry", uniform: "uGlassLightSymmetry", min: 0, max: 1, step: 0.01, value: 1 },
    ],
  },
  {
    id: "water",
    recipe: "testWater",
    selector: "#water",
    factory: "a2kWater.normal",
    create: (options) => a2kWater.normal(options),
    params: [
      { key: "speed", uniform: "uWaterSpeed", min: 0, max: 4, step: 0.05, value: 1 },
      { key: "amplitude", uniform: "uWaterAmplitude", min: 0, max: 40, step: 0.5, value: 8 },
      { key: "wavelength", uniform: "uWaterWavelength", min: 10, max: 400, step: 1, value: 90 },
      { key: "direction", uniform: "uWaterDirection", min: 0, max: 360, step: 1, value: 30 },
      { key: "turbulence", uniform: "uWaterTurbulence", min: 0, max: 1, step: 0.01, value: 0.6 },
      { key: "edgeSoftness", uniform: "uWaterEdgeSoftness", min: 0, max: 100, step: 1, value: 16 },
      { key: "highlight", uniform: "uWaterHighlight", min: 0, max: 2, step: 0.01, value: 0.5 },
      { key: "lightDirection", uniform: "uWaterLightDirection", min: 0, max: 360, step: 1, value: 45 },
      { key: "tintStrength", uniform: "uWaterTintStrength", min: 0, max: 1, step: 0.01, value: 0.18 },
      { key: "tint", uniform: "uWaterTint", type: "color", value: [0.36, 0.66, 0.85] },
    ],
  },
];

const GUIDE_KEY = "a2kama-test-guide-seen";

const round = (value, digits = 3) => Number(value.toFixed(digits));
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const toHex = (rgb) => `#${rgb.map((c) => Math.round(c * 255).toString(16).padStart(2, "0")).join("")}`;
const fromHex = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const initialValue = (param) => (Array.isArray(param.value) ? [...param.value] : param.value);
const travelerLayer = (card) => Number(card.dataset.mirageTravel.split(/\s+/)[1]);

function formatValue(value) {
  return Array.isArray(value) ? toHex(value) : String(round(value));
}

function snippet(group) {
  const lines = group.params.map(({ key }) => {
    const value = group.state[key];
    const text = Array.isArray(value) ? `[${value.map((c) => round(c, 2)).join(", ")}]` : round(value);
    return `  ${key}: ${text},`;
  });
  return `${group.factory}({\n${lines.join("\n")}\n});`;
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
      const value = initialValue(param);
      inputs.get(param.key).input.value = Array.isArray(value) ? toHex(value) : value;
      apply(param, value);
    }
  });

  code.textContent = snippet(group);
}

function makeDraggable(card, onGrab) {
  const stage = card.offsetParent;
  let drag = null;

  card.addEventListener("pointerdown", (event) => {
    onGrab();
    drag = { id: event.pointerId, dx: event.clientX - card.offsetLeft, dy: event.clientY - card.offsetTop };
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

  const end = () => {
    drag = null;
    card.classList.remove("dragging");
  };
  card.addEventListener("pointerup", end);
  card.addEventListener("pointercancel", end);
}

// ── Selection: clicking a card opens its uniforms in the panel ──
const frame = document.querySelector("#frame");
const ring = document.querySelector("#selection-ring");
const ringTag = ring.querySelector(".selection-tag");
const emptyState = document.querySelector("#panel-empty");
let selected = null;

function updateLayerLabels() {
  const [top, bottom] = [...GROUPS].sort((a, b) => travelerLayer(b.card) - travelerLayer(a.card));
  document.querySelector("#layer-order").textContent = t("panel.layerOrder", {
    top: t(`${top.id}.title`),
    topLayer: travelerLayer(top.card),
    bottom: t(`${bottom.id}.title`),
    bottomLayer: travelerLayer(bottom.card),
  });

  for (const group of GROUPS) {
    group.section.querySelector(".group-title").textContent = `${t(`${group.id}.title`)} · ${t(`${group.id}.name`)}`;
    group.section.querySelector(".group-layer").textContent =
      `traveler ${travelerLayer(group.card)} · ${t(group === top ? "panel.onTop" : "panel.underneath")}`;
    group.section.querySelector(".reset").textContent = t("panel.reset");
  }
  if (selected) ringTag.textContent = `${t(`${selected.id}.title`)} · traveler ${travelerLayer(selected.card)}`;
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

// 1. Register one recipe per group from its default values.
for (const group of GROUPS) {
  group.state = Object.fromEntries(group.params.map((param) => [param.key, initialValue(param)]));
  a2kama.register(group.recipe, group.create(group.state));
}

// 2. Start the engine on the stage only, so the panel and overlays are not mirrored.
a2kama.init(document.querySelector("#stage"), {
  quality: "medium",
  layer: "selected",
  travelerClipArea: "80px",
});

// 3. Wire each card to its options proxy and controls.
for (const group of GROUPS) {
  group.card = document.querySelector(group.selector);
  group.section = document.querySelector(`[data-group="${group.id}"]`);
  group.options = a2kama.getOptions(group.card);
  renderGroup(group);
  makeDraggable(group.card, () => select(group));
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

// ── First-visit guide: rings on the cards, closed by any click ──
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
  try {
    localStorage.setItem(GUIDE_KEY, "1");
  } catch {
    // Storage can be unavailable (private mode); the guide just shows again next time.
  }
}

document.querySelector("#guide-open").addEventListener("click", openGuide);
guide.addEventListener("click", closeGuide);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !guide.hidden) closeGuide();
});
window.addEventListener("resize", () => {
  if (!guide.hidden) positionGuideSpots();
});

let guideSeen = false;
try {
  guideSeen = localStorage.getItem(GUIDE_KEY) === "1";
} catch {
  guideSeen = false;
}
if (!guideSeen) openGuide();

window.a2kama = a2kama;
