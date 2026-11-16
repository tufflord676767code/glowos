const TUX_SVG = `<svg viewBox="0 0 220 260" width="54" height="64"><ellipse cx="110" cy="145" rx="68" ry="88" fill="#111827"/><ellipse cx="110" cy="156" rx="48" ry="68" fill="#f8fafc"/><circle cx="110" cy="64" r="42" fill="#111827"/><ellipse cx="97" cy="56" rx="11" ry="15" fill="#fff"/><ellipse cx="123" cy="56" rx="11" ry="15" fill="#fff"/><circle cx="100" cy="58" r="5" fill="#0f172a"/><circle cx="120" cy="58" r="5" fill="#0f172a"/><path d="M86 76 Q110 64 134 76 Q130 96 110 98 Q90 96 86 76 Z" fill="#facc15"/><path d="M46 115 Q24 155 48 182 Q62 172 60 142 Z" fill="#111827"/><path d="M174 115 Q196 155 172 182 Q158 172 160 142 Z" fill="#111827"/><path d="M42 215 Q32 238 66 244 Q95 246 98 228 Z" fill="#facc15"/><path d="M178 215 Q188 238 154 244 Q125 246 122 228 Z" fill="#facc15"/></svg>`;

const GLOW_CHAT_URL = ["https://", "glowchat-7b6b3", ".web.app/"].join("");
const DUCK_AI_URL = ["https://", "duck", ".ai/"].join("");

const APP_ICONS = {
  browser: `<svg viewBox="0 0 64 64" width="38" height="38"><rect x="4" y="4" width="56" height="56" rx="14" fill="#f8fafc"/><circle cx="32" cy="32" r="23" fill="#2563eb"/><polygon points="44,20 35,35 32,32" fill="#ef4444"/><polygon points="20,44 29,29 32,32" fill="#fff"/></svg>`,
  glow: `<svg viewBox="0 0 64 64" width="38" height="38"><rect x="4" y="4" width="56" height="56" rx="14" fill="#16a34a"/><path d="M32 15 C20 15 11 22.2 11 31 C11 35.8 13.9 40 18.5 42.8 L15.5 49.5 L24 45.6 C26.5 46.3 29.2 46.7 32 46.7 C44 46.7 53 39.5 53 31 C53 22.2 44 15 32 15 Z" fill="#fff"/></svg>`,
  ai: `<svg viewBox="0 0 64 64" width="38" height="38"><rect x="4" y="4" width="56" height="56" rx="14" fill="#9333ea"/><path d="M32 14 L36 27 L49 31 L36 35 L32 48 L28 35 L15 31 L28 27 Z" fill="#fff"/></svg>`,
  arcade: `<svg viewBox="0 0 64 64" width="38" height="38"><rect x="4" y="4" width="56" height="56" rx="14" fill="#059669"/><path d="M22 25 v14 M15 32 h14" stroke="#fff" stroke-width="4" stroke-linecap="round"/><circle cx="43" cy="28" r="3" fill="#fff"/><circle cx="49" cy="34" r="3" fill="#fff"/></svg>`,
  links: `<svg viewBox="0 0 64 64" width="38" height="38"><rect x="4" y="4" width="56" height="56" rx="14" fill="#0284c7"/><path d="M27 37 L37 27 M23 31 L19 35 A7 7 0 0 0 29 45 L33 41 M41 33 L45 29 A7 7 0 0 0 35 19 L31 23" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`,
  calc: `<svg viewBox="0 0 64 64" width="38" height="38"><rect x="4" y="4" width="56" height="56" rx="14" fill="#1e293b"/><rect x="13" y="12" width="38" height="12" rx="4" fill="#10b981"/><circle cx="20" cy="34" r="3.5" fill="#fff"/><circle cx="32" cy="34" r="3.5" fill="#fff"/><circle cx="44" cy="34" r="3.5" fill="#f59e0b"/><circle cx="20" cy="45" r="3.5" fill="#fff"/><circle cx="32" cy="45" r="3.5" fill="#fff"/><circle cx="44" cy="45" r="3.5" fill="#f59e0b"/></svg>`,
  studio: `<svg viewBox="0 0 64 64" width="38" height="38"><rect x="4" y="4" width="56" height="56" rx="14" fill="#1c1c1e"/><polyline points="17,21 26,28 17,35" fill="none" stroke="#f8fafc" stroke-width="3.5" stroke-linecap="round"/><line x1="29" y1="36" x2="41" y2="36" stroke="#94a3b8" stroke-width="3.5" stroke-linecap="round"/></svg>`,
  settings: `<svg viewBox="0 0 64 64" width="38" height="38"><rect x="4" y="4" width="56" height="56" rx="14" fill="#475569"/><circle cx="32" cy="32" r="10" fill="none" stroke="#fff" stroke-width="5"/></svg>`
};

const coreApps = [
  { id: "browser", name: "Retina", svg: APP_ICONS.browser, kind: "browser", url: "https://duckduckgo.com" },
  { id: "glow", name: "Glow Chat", svg: APP_ICONS.glow, kind: "glow", url: GLOW_CHAT_URL },
  { id: "ai", name: "Nova AI", svg: APP_ICONS.ai, kind: "ai", url: DUCK_AI_URL },
  { id: "arcade", name: "Games", svg: APP_ICONS.arcade, kind: "arcade" },
  { id: "links", name: "Glow Links", svg: APP_ICONS.links, kind: "links" },
  { id: "calc", name: "Calculator", svg: APP_ICONS.calc, kind: "calc" },
  { id: "studio", name: "Code Studio", svg: APP_ICONS.studio, kind: "studio" },
  { id: "settings", name: "Settings", svg: APP_ICONS.settings, kind: "settings" }
];

let proxyPromise = null, sjController = null;
function ensureProxy() {
  if (proxyPromise) return proxyPromise;
  proxyPromise = (async () => {
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    await navigator.serviceWorker.ready;
    const conn = new BareMux.BareMuxConnection("/baremux/worker.js");
    await conn.setTransport("/bare-client/index.mjs", [location.origin + "/bare/"]);
    if (window.$scramjetLoadController && !sjController) {
      const { ScramjetController } = $scramjetLoadController();
      sjController = new ScramjetController({
        files: { wasm: "/scramjet/scramjet.wasm.wasm", all: "/scramjet/scramjet.all.js", sync: "/scramjet/scramjet.sync.js" }
      });
      await sjController.init();
    }
  })().catch(e => { proxyPromise = null; throw e; });
  return proxyPromise;
}

const encodeProxyUrl = u => self.__uv$config.prefix + self.__uv$config.encodeUrl(u);
const encodeScramjetUrl = u => sjController ? sjController.encodeUrl(u) : encodeProxyUrl(u);
const el = (tag, props = {}, kids = []) => {
  const n = Object.assign(document.createElement(tag), props);
  kids.forEach(c => n.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
  return n;
};
let zTop = 100, winSeq = 0;
function createWindow(title, appId, buildFn) {
  const id = "win-" + (++winSeq);
  const body = el("div", { className: "win-body" });
  const dockEl = document.getElementById("dock-" + appId);
  if (dockEl) dockEl.classList.add("open");

  const toggleFs = () => {
    win.classList.toggle("maximized");
    fsBtn.textContent = win.classList.contains("maximized") ? "Exit Fullscreen" : "⛶ Fullscreen";
  };
  const fsBtn = el("button", { className: "win-fs-btn", textContent: "⛶ Fullscreen", onclick: toggleFs });
  const header = el("div", { className: "win-header" }, [
    el("div", { className: "traffic-lights" }, [
      el("button", { className: "tl-btn tl-close", onclick: () => { win.remove(); if (dockEl && !document.querySelector(`[data-appid="${appId}"]`)) dockEl.classList.remove("open"); } }),
      el("button", { className: "tl-btn tl-min", onclick: () => { win.style.display = "none"; } }),
      el("button", { className: "tl-btn tl-max", onclick: toggleFs })
    ]),
    el("div", { className: "win-title", textContent: title }),
    fsBtn
  ]);

  const win = el("div", { className: "os-window", id }, [header, body]);
  win.dataset.appid = appId;
  win.style.cssText = `top:${42 + (winSeq % 5) * 24}px; left:${100 + (winSeq % 5) * 28}px; z-index:${++zTop};`;
  win.onmousedown = () => { win.style.zIndex = ++zTop; document.getElementById("active-app-name").textContent = title; };
  document.getElementById("desktop").appendChild(win);

  let drag = false, dx = 0, dy = 0;
  header.onmousedown = e => { if (e.target.tagName !== "BUTTON" && !win.classList.contains("maximized")) { drag = true; dx = e.clientX - win.offsetLeft; dy = e.clientY - win.offsetTop; } };
  window.addEventListener("mousemove", e => { if (drag) { win.style.left = Math.max(0, e.clientX - dx) + "px"; win.style.top = Math.max(28, e.clientY - dy) + "px"; } });
  window.addEventListener("mouseup", () => { drag = false; });

  buildFn(body, win);
  return win;
}

function renderDock() {
  const dock = document.getElementById("dock");
  if (!dock) return;
  dock.innerHTML = "";
  const custom = JSON.parse(localStorage.getItem("novaos_shortcuts") || "[]");
  [...coreApps, ...custom].forEach((app, idx) => {
    if (idx === coreApps.length) dock.appendChild(el("div", { className: "dock-divider" }));
    const item = el("div", { className: "dock-item", id: "dock-" + app.id, onclick: () => launchApp(app) });
    if (app.svg) item.innerHTML = app.svg;
    else item.textContent = app.icon || "🌐";
    item.appendChild(el("div", { className: "dock-dot" }));
    item.dataset.name = app.name;
    dock.appendChild(item);
  });
}

function launchApp(app) {
  const hidden = document.querySelector(`.os-window[data-appid="${app.id}"]`);
  if (hidden && hidden.style.display === "none") { hidden.style.display = "flex"; hidden.style.zIndex = ++zTop; return; }
  if (app.kind === "glow" || app.id === "glow") openBrowserWindow(app.name, app.id, GLOW_CHAT_URL, false, true);
  else if (app.kind === "ai") openBrowserWindow("Nova AI (Duck.ai)", "ai", DUCK_AI_URL, true, false);
  else if (app.kind === "browser" || app.kind === "proxy") openBrowserWindow(app.name, app.id, app.url || "https://duckduckgo.com", true, app.kind === "browser");
  else if (app.kind === "calc") openCalculatorWindow();
  else if (app.kind === "arcade") openGnMathArcade();
  else if (app.kind === "links") openGlowLinksWindow();
  else if (app.kind === "studio") openCodeStudioWindow();
  else if (app.kind === "settings") openSettingsWindow();
}
let localPrefix = null;
async function resolveLocalUrl(path) {
  if (localPrefix !== null) return localPrefix + path;
  for (const p of ["", "/gnmath-html-games-main"]) {
    try {
      const r = await fetch(p + path);
      const t = await r.text();
      if (r.ok && !t.includes("<title>NovaOS</title>")) { localPrefix = p; return p + path; }
    } catch {}
  }
  return null;
}

function openBrowserWindow(title, appId, initialUrl, useProxy = true, showBar = true) {
  createWindow(title, appId, async (body) => {
    const multi = appId === "browser";
    let engine = "uv";
    const tabBar = el("div", { className: "retina-tabs", style: multi ? "" : "display:none" });
    const stack = el("div", { className: "retina-frame-stack" });
    const input = el("input", { type: "text", value: initialUrl, placeholder: "Search or enter URL" });
    const engBtn = el("button", { type: "button", textContent: "UV", title: "Switch UV / Scramjet", style: useProxy ? "background:#0284c7;color:#fff" : "display:none", onclick: () => {
      engine = engine === "uv" ? "sj" : "uv";
      engBtn.textContent = engine === "uv" ? "UV" : "SJ";
      engBtn.style.background = engine === "uv" ? "#0284c7" : "#9333ea";
      const t = activeTab(); if (t) goTab(t, input.value);
    }});
    const form = el("form", { className: "browser-bar", style: showBar ? "" : "display:none" }, [
      el("button", { type: "button", textContent: "◀", onclick: () => { try { activeTab()?.iframe.contentWindow.history.back(); } catch {} } }),
      el("button", { type: "button", textContent: "▶", onclick: () => { try { activeTab()?.iframe.contentWindow.history.forward(); } catch {} } }),
      el("button", { type: "button", textContent: "↻", onclick: () => { const t = activeTab(); if (t) goTab(t, input.value); } }),
      engBtn, input, el("button", { type: "submit", textContent: "Go" })
    ]);
    body.append(tabBar, form, stack);

    let tabs = [], curId = null;
    const activeTab = () => tabs.find(t => t.id === curId);

    function drawTabs() {
      if (!multi) return;
      tabBar.innerHTML = "";
      tabs.forEach(t => {
        const x = el("button", { type: "button", className: "retina-tab-close", textContent: "×", onclick: e => {
          e.stopPropagation(); if (tabs.length === 1) return;
          t.iframe.remove(); tabs = tabs.filter(k => k.id !== t.id);
          if (curId === t.id) pickTab(tabs[tabs.length - 1].id); else drawTabs();
        }});
        tabBar.appendChild(el("div", { className: "retina-tab" + (t.id === curId ? " active" : ""), onclick: () => pickTab(t.id) }, [
          el("span", { className: "retina-tab-title", textContent: t.label }), x
        ]));
      });
      tabBar.appendChild(el("button", { type: "button", className: "retina-new-tab", textContent: "+", onclick: () => newTab("https://duckduckgo.com") }));
    }

    function pickTab(id) {
      curId = id;
      tabs.forEach(t => { t.iframe.classList.toggle("active", t.id === id); if (t.id === id) input.value = t.url; });
      drawTabs();
    }

    async function goTab(tab, raw) {
      let url = raw.trim();
      const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
      if (yt) url = `https://youtube-nocookie.com{yt}?autoplay=1`;
      else if (/^https?:\/\/(www\.|m\.)?youtube\.com\/?$/i.test(url)) url = "https://yewtu.be";
      else if (useProxy && !/^https?:\/\//i.test(url)) url = url.includes(".") && !url.includes(" ") ? "https://" + url : "https://duckduckgo.com" + encodeURIComponent(url);

      tab.url = url;
      tab.label = url.replace(/^https?:\/\/(www\.)?/, "").split("/") || title;
      if (tab.id === curId) input.value = url;
      drawTabs();

      if (useProxy) {
        try { await ensureProxy(); tab.iframe.src = engine === "sj" ? encodeScramjetUrl(url) : encodeProxyUrl(url); }
        catch (e) { tab.iframe.srcdoc = `<body style="background:#090d16;color:#f87171;padding:20px;font-family:sans-serif"><h3>Proxy Error</h3><pre>${e}</pre></body>`; }
      } else if (/^https?:\/\//i.test(url)) {
        tab.iframe.src = url;
      } else {
        const local = await resolveLocalUrl(url);
        if (local) tab.iframe.src = local;
        else tab.iframe.srcdoc = `<body style="background:#090d16;color:#fff;padding:20px;font-family:sans-serif"><h3>File Not Found</h3><p>Upload your <b>games</b>, <b>emulators</b>, and <b>tools</b> folders inside <b>public/</b>.</p></body>`;
      }
    }

    async function newTab(url) {
      const id = "t-" + Date.now() + Math.random().toString(36).slice(2, 5);
      const iframe = el("iframe", { allowFullscreen: true });
      iframe.allow = "microphone; autoplay; fullscreen; gamepad; clipboard-read; clipboard-write";
      iframe.style.background = "#090d16";
      stack.appendChild(iframe);
      const tab = { id, url, label: title, iframe };
      tabs.push(tab); pickTab(id); await goTab(tab, url);
    }

    form.onsubmit = e => { e.preventDefault(); const t = activeTab(); if (t) goTab(t, input.value); };
    await newTab(initialUrl);
  });
}

function openCalculatorWindow() {
  createWindow("Calculator", "calc", (body, win) => {
    win.style.width = "320px"; win.style.height = "460px";
    let expr = "";
    const disp = el("div", { className: "calc-disp", textContent: "0" });
    const grid = el("div", { className: "calc-grid" });
    [["C","fn"],["⌫","fn"],["%","fn"],["/","op"],["7",""],["8",""],["9",""],["*","op"],["4",""],["5",""],["6",""],["-","op"],["1",""],["2",""],["3",""],["+","op"],["0",""],[".",""],["(","fn"],["=","op"]].forEach(([k, c]) => {
      grid.appendChild(el("button", { type: "button", className: "calc-btn " + c, textContent: k, onclick: () => {
        if (k === "C") { expr = ""; disp.textContent = "0"; }
        else if (k === "⌫") { expr = expr.slice(0, -1); disp.textContent = expr || "0"; }
        else if (k === "=") {
          try { expr = String(Function('"use strict";return (' + expr.replace(/[^0-9+\-*/.%()]/g, "") + ')')()); disp.textContent = expr; }
          catch { disp.textContent = "Error"; expr = ""; }
        } else { expr += k; disp.textContent = expr; }
      }}));
    });
    body.append(el("div", { className: "calc-wrap" }, [disp, grid]));
  });
}
const STORE_CATALOG = [
  { id: "ages-of-conflict", name: "Ages of Conflict", source: "Local", cat: "Strategy", icon: "🗺️", url: "/games/Ages%20of%20Conflict.html", local: true },
  { id: "angry-birds", name: "Angry Birds", source: "Local", cat: "Arcade", icon: "🐦", url: "/games/Angry%20Birds.html", local: true },
  { id: "baldis-basics-plus", name: "Baldi's Basics Plus", source: "Local", cat: "Horror", icon: "📏", url: "/games/Baldi's%20Basics%20Plus.html", local: true },
  { id: "basket-battle", name: "Basket Battle", source: "Local", cat: "Sports", icon: "🏀", url: "/games/Basket%20Battle.html", local: true },
  { id: "basket-bros", name: "Basket Bros", source: "Local", cat: "Sports", icon: "⛹️", url: "/games/Basket%20Bros.html", local: true },
  { id: "basket-random", name: "Basket Random", source: "Local", cat: "Sports", icon: "🏀", url: "/games/Basket%20Random.html", local: true },
  { id: "bitlife", name: "BitLife", source: "Local", cat: "Simulation", icon: "🧬", url: "/games/BitLife.html", local: true },
  { id: "bloxorz", name: "Bloxorz", source: "Local", cat: "Puzzle", icon: "🧊", url: "/games/Bloxorz.html", local: true },
  { id: "bridge-race", name: "Bridge Race", source: "Local", cat: "Arcade", icon: "🌉", url: "/games/Bridge%20Race.html", local: true },
  { id: "buckshot-roulette", name: "Buckshot Roulette", source: "Local", cat: "Horror", icon: "🎲", url: "/games/Buckshot%20Roulette.html", local: true },
  { id: "candy-crush", name: "Candy Crush", source: "Local", cat: "Puzzle", icon: "🍬", url: "/games/Candy%20Crush.html", local: true },
  { id: "cannon-balls-3d", name: "Cannon Balls 3D", source: "Local", cat: "Arcade", icon: "💣", url: "/games/Cannon%20Balls%203D.html", local: true },
  { id: "circloo-2", name: "CircloO 2", source: "Local", cat: "Platformer", icon: "⭕", url: "/games/CircloO%202.html", local: true },
  { id: "circloo", name: "CircloO", source: "Local", cat: "Platformer", icon: "⭕", url: "/games/CircloO.html", local: true },
  { id: "clash-of-vikings", name: "Clash Of Vikings", source: "Local", cat: "Strategy", icon: "⚔️", url: "/games/Clash%20Of%20Vikings.html", local: true },
  { id: "cluster-rush", name: "Cluster Rush", source: "Local", cat: "Action", icon: "🚚", url: "/games/Cluster%20Rush.html", local: true },
  { id: "coreball", name: "Coreball", source: "Local", cat: "Arcade", icon: "🎯", url: "/games/Coreball.html", local: true },
  { id: "cut-the-rope", name: "Cut the Rope", source: "Local", cat: "Puzzle", icon: "🐸", url: "/games/Cut%20the%20Rope.html", local: true },
  { id: "cut-the-rope-holiday", name: "Cut the Rope: Holiday Gift", source: "Local", cat: "Puzzle", icon: "🎁", url: "/games/Cut%20the%20Rope_%20Holiday%20Gift.html", local: true },
  { id: "cut-the-rope-time", name: "Cut the Rope: Time Travel", source: "Local", cat: "Puzzle", icon: "⏳", url: "/games/Cut%20the%20Rope_%20Time%20Travel.html", local: true },
  { id: "death-run-3d", name: "Death Run 3D", source: "Local", cat: "Runner", icon: "⚡", url: "/games/Death%20Run%203D.html", local: true },
  { id: "draw-joust", name: "Draw Joust", source: "Local", cat: "Action", icon: "✏️", url: "/games/Draw%20Joust.html", local: true },
  { id: "drift-boss", name: "Drift Boss", source: "Local", cat: "Racing", icon: "🏎️", url: "/games/Drift%20Boss.html", local: true },
  { id: "eaglercraftx", name: "EaglercraftX", source: "Local", cat: "Sandbox", icon: "⛏️", url: "/games/EaglercraftX.html", local: true },
  { id: "evolving-bombs-3d", name: "Evolving Bombs 3D", source: "Local", cat: "Arcade", icon: "💥", url: "/games/Evolving%20Bombs%203D%20(1).html", local: true },
  { id: "fnac-1", name: "Five Nights at Candy's", source: "Local", cat: "Horror", icon: "🐱", url: "/games/Five%20Nights%20at%20Candy's.html", local: true },
  { id: "fnac-2", name: "Five Nights at Candy's 2", source: "Local", cat: "Horror", icon: "🐱", url: "/games/Five%20Nights%20at%20Candy's%202.html", local: true },
  { id: "fnaf-1", name: "Five Nights at Freddy's", source: "Local", cat: "Horror", icon: "🐻", url: "/games/Five%20Nights%20at%20Freddy's.html", local: true },
  { id: "fnaf-2", name: "Five Nights at Freddy's 2", source: "Local", cat: "Horror", icon: "🐻", url: "/games/Five%20Nights%20at%20Freddy's%202.html", local: true },
  { id: "fnaf-3", name: "Five Nights at Freddy's 3", source: "Local", cat: "Horror", icon: "🐰", url: "/games/Five%20Nights%20at%20Freddy's%203.html", local: true },
  { id: "fnaf-4", name: "Five Nights at Freddy's 4", source: "Local", cat: "Horror", icon: "🐻", url: "/games/Five%20Nights%20at%20Freddy's%204.html", local: true },
  { id: "fnaf-4-halloween", name: "FNAF 4: Halloween", source: "Local", cat: "Horror", icon: "🎃", url: "/games/Five%20Nights%20at%20Freddy's%204_%20Halloween.html", local: true },
  { id: "fnaf-pizzeria", name: "FNAF: Pizza Simulator", source: "Local", cat: "Horror", icon: "🍕", url: "/games/Five%20Nights%20at%20Freddy's_%20Pizza%20Simulator.html", local: true },
  { id: "fnaf-sister", name: "FNAF: Sister Location", source: "Local", cat: "Horror", icon: "🤡", url: "/games/Five%20Nights%20at%20Freddy's_%20Sister%20Location.html", local: true },
  { id: "fnaf-ucn", name: "FNAF: Ultimate Custom Night", source: "Local", cat: "Horror", icon: "🐻", url: "/games/Five%20Nights%20at%20Freddy's_%20Ultimate%20Custom%20Night.html", local: true },
  { id: "fnaf-world", name: "FNAF: World", source: "Local", cat: "RPG", icon: "🌍", url: "/games/Five%20Nights%20at%20Freddy's_%20World.html", local: true },
  { id: "fnaw", name: "Five Nights at Winston's", source: "Local", cat: "Horror", icon: "🦍", url: "/games/Five%20Nights%20at%20Winston's.html", local: true },
  { id: "get-a-virus-sim", name: "Get A Virus Sim", source: "Local", cat: "Simulation", icon: "🦠", url: "/games/Get%20A%20Virus%20Sim.html", local: true },
  { id: "granny", name: "Granny", source: "Local", cat: "Horror", icon: "👵", url: "/games/Granny.html", local: true },
  { id: "man-runner-2048", name: "Man Runner 2048", source: "Local", cat: "Runner", icon: "🏃", url: "/games/Man%20Runner%202048.html", local: true },
  { id: "mob-control", name: "Mob Control HTML5", source: "Local", cat: "Arcade", icon: "👥", url: "/games/Mob%20Control%20HTML5.html", local: true },
  { id: "repo", name: "R.E.P.O.", source: "Local", cat: "Horror", icon: "🤖", url: "/games/R.E.P.O.html", local: true },
  { id: "schoolboy-runaway", name: "Schoolboy Runaway", source: "Local", cat: "Stealth", icon: "🎒", url: "/games/Schoolboy%20Runaway.html", local: true },
  { id: "pong-wars", name: "Pong Wars", source: "Local", cat: "Arcade", icon: "🏓", url: "/games/pong%20wars.html", local: true },
  { id: "emulator-js", name: "EmulatorJS (Retro Consoles)", source: "Emulator", cat: "Emulator", icon: "🕹️", url: "/emulators/Emulator.JS.html", local: true },
  { id: "play-js", name: "Play! PS2 Emulator", source: "Emulator", cat: "Emulator", icon: "🎮", url: "/emulators/Play!.js.html", local: true },
  { id: "ruffle", name: "Ruffle Flash Emulator", source: "Emulator", cat: "Emulator", icon: "⚡", url: "/emulators/Ruffle.html", local: true },
  { id: "tool-html-launcher", name: "HTML Launcher", source: "Tool", cat: "Utility", icon: "🚀", url: "/tools/.Html%20Launcher.html", local: true },
  { id: "tool-code-editor", name: "HTML Code Editor", source: "Tool", cat: "Utility", icon: "📝", url: "/tools/Code%20Editor.html", local: true },
  { id: "tool-lecture", name: "DON'T YOU LECTURE ME", source: "Tool", cat: "Meme", icon: "🗿", url: "/tools/DON'T%20YOU%20LECTURE%20ME.html", local: true },
  { id: "tool-soundboard", name: "Soundboard", source: "Tool", cat: "Audio", icon: "🔊", url: "/tools/Soundboard.html", local: true },
  { id: "tool-sandstone", name: "Sandstone", source: "Tool", cat: "Utility", icon: "🏜️", url: "/tools/sandstone.html", local: true }
];
const getInstalledGames = () => JSON.parse(localStorage.getItem("novaos_installed_games") || "[]");
const saveInstalledGames = l => localStorage.setItem("novaos_installed_games", JSON.stringify(l));
const getCustomCatalog = () => JSON.parse(localStorage.getItem("novaos_custom_games") || "[]");

function openGnMathArcade() {
  createWindow("App Store & Games", "arcade", body => {
    let tab = "discover", q = "";
    const bDisc = el("button", { className: "store-tab active", textContent: "Discover", onclick: () => setTab("discover") });
    const bLib = el("button", { className: "store-tab", textContent: "My Library", onclick: () => setTab("library") });
    const bPort = el("button", { className: "store-tab", textContent: "Full Portals", onclick: () => setTab("portals") });
    const sIn = el("input", { className: "store-search", placeholder: "Search local games, emulators & tools...", oninput: () => { q = sIn.value.toLowerCase(); draw(); } });
    const content = el("div", { className: "store-body" });
    body.appendChild(el("div", { className: "store-shell" }, [el("div", { className: "store-nav" }, [el("div", { className: "store-tabs" }, [bDisc, bLib, bPort]), sIn]), content]));

    function setTab(t) {
      tab = t;
      [bDisc, bLib, bPort].forEach(b => b.classList.remove("active"));
      (t === "discover" ? bDisc : t === "library" ? bLib : bPort).classList.add("active");
      draw();
    }

    function draw() {
      content.innerHTML = "";
      const inst = getInstalledGames(), instIds = new Set(inst.map(g => g.id));
      if (tab === "portals") {
        content.appendChild(el("div", { className: "store-grid" }, [
          ["gn-math.dev Hub", "Games, Music & Tools", "🎮", "https://gn-math.dev"],
          ["Poki Games", "1,000+ Instant HTML5 Games", "🕹️", "https://poki.com"],
          ["CrazyGames", "Multiplayer & 3D Web Games", "🔥", "https://crazygames.com"]
        ].map(([name, sub, icon, url]) => el("div", { className: "store-card" }, [
          el("div", { className: "store-icon", textContent: icon }),
          el("div", { className: "store-meta" }, [el("div", { className: "store-name", textContent: name }), el("div", { className: "store-sub", textContent: sub })]),
          el("button", { className: "btn-play", textContent: "Open", onclick: () => openBrowserWindow(name, "arcade", url, true, true) })
        ]))));
        return;
      }

      if (tab === "discover") {
        const nIn = el("input", { placeholder: "Custom Game Title" });
        const uIn = el("input", { placeholder: "Paste Direct Game URL" });
        content.appendChild(el("div", { className: "add-game-bar" }, [nIn, uIn, el("button", { textContent: "+ Add to Store", onclick: () => {
          if (!nIn.value.trim() || !uIn.value.trim()) return;
          const c = getCustomCatalog();
          c.unshift({ id: "cust-" + Date.now(), name: nIn.value.trim(), source: "Custom", cat: "Web", icon: "🕹️", url: uIn.value.trim(), local: false });
          localStorage.setItem("novaos_custom_games", JSON.stringify(c));
          nIn.value = ""; uIn.value = ""; draw();
        }})]));
      }

      const pool = (tab === "library" ? inst : [...getCustomCatalog(), ...STORE_CATALOG]).filter(g => g.name.toLowerCase().includes(q) || g.cat.toLowerCase().includes(q));
      if (!pool.length) {
        content.appendChild(el("div", { textContent: tab === "library" ? "Your Library is empty. Click GET on any game in Discover!" : "No games match your search.", style: "color:#94a3b8;font-size:13px;padding:20px;text-align:center;" }));
        return;
      }

      const grid = el("div", { className: "store-grid" });
      pool.forEach(g => {
        const acts = el("div", { className: "store-actions" });
        if (instIds.has(g.id)) {
          acts.append(
            el("button", { className: "btn-play", textContent: "▶ Play", onclick: () => openBrowserWindow(g.name, "arcade", g.url, !g.local, false) }),
            el("button", { className: "btn-offload", textContent: "Offload", onclick: () => { saveInstalledGames(getInstalledGames().filter(x => x.id !== g.id)); draw(); } })
          );
        } else {
          acts.append(el("button", { className: "btn-get", textContent: "GET", onclick: e => { e.target.textContent = "Downloading..."; e.target.disabled = true; setTimeout(() => { const cur = getInstalledGames(); if (!cur.some(x => x.id === g.id)) { cur.push(g); saveInstalledGames(cur); } draw(); }, 250); } }));
        }
        grid.appendChild(el("div", { className: "store-card" }, [
          el("div", { className: "store-icon", textContent: g.icon || "🎮" }),
          el("div", { className: "store-meta" }, [el("div", { className: "store-name", textContent: g.name }), el("div", { className: "store-sub", textContent: `${g.source} · ${g.cat}` })]),
          acts
        ]));
      });
      content.appendChild(grid);
    }
    draw();
  });
}

const GLOW_LINK_VAULT = [
  { name: "Glow Chat (Primary)", url: GLOW_CHAT_URL, tag: "Social", icon: "💬", proxy: false },
  { name: "gn-math.dev (All Games)", url: "https://gn-math.dev", tag: "Games", icon: "🎮", proxy: true },
  { name: "Poki Games", url: "https://poki.com", tag: "Games", icon: "🕹️", proxy: true },
  { name: "CrazyGames", url: "https://crazygames.com", tag: "Games", icon: "🔥", proxy: true },
  { name: "Truffled Portal", url: "https://truffled.lol", tag: "Games", icon: "🍄", proxy: true },
  { name: "DuckDuckGo Search", url: "https://duckduckgo.com", tag: "Search", icon: "🦆", proxy: true }
];

function openGlowLinksWindow() {
  createWindow("Glow Link Collection", "links", body => {
    let q = "", tag = "All";
    const sIn = el("input", { className: "store-search", placeholder: "Search Glow Link Collection...", oninput: () => { q = sIn.value.toLowerCase(); draw(); } });
    const content = el("div", { className: "store-body" });
    body.appendChild(el("div", { className: "store-shell" }, [el("div", { className: "store-nav" }, [sIn]), content]));
    const getU = () => JSON.parse(localStorage.getItem("novaos_glow_links") || "[]");
    const setU = l => localStorage.setItem("novaos_glow_links", JSON.stringify(l));

    function draw() {
      content.innerHTML = "";
      const all = [...getU(), ...GLOW_LINK_VAULT];
      const nIn = el("input", { placeholder: "Link Name" }), uIn = el("input", { placeholder: "https://..." }), tIn = el("input", { placeholder: "Tag", style: "max-width:130px" });
      content.appendChild(el("div", { className: "add-game-bar" }, [nIn, uIn, tIn, el("button", { textContent: "+ Save Link", onclick: () => {
        if (!nIn.value.trim() || !uIn.value.trim()) return;
        const url = /^https?:\/\//i.test(uIn.value.trim()) ? uIn.value.trim() : "https://" + uIn.value.trim();
        const cur = getU(); cur.unshift({ id: "l-" + Date.now(), name: nIn.value.trim(), url, tag: tIn.value.trim() || "General", icon: "🔗", proxy: true, custom: true });
        setU(cur); nIn.value = ""; uIn.value = ""; tIn.value = ""; draw();
      }})]));

      const pills = el("div", { style: "display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;" });
      ["All", ...new Set(all.map(l => l.tag || "General"))].forEach(t => pills.appendChild(el("button", {
        className: "store-tab" + (tag === t ? " active" : ""), textContent: t, style: "border:1px solid rgba(52,211,153,0.25)", onclick: () => { tag = t; draw(); }
      })));
      content.appendChild(pills);

      const grid = el("div", { className: "store-grid" });
      all.filter(l => (tag === "All" || l.tag === tag) && (l.name.toLowerCase().includes(q) || l.url.toLowerCase().includes(q))).forEach(link => {
        const acts = el("div", { className: "store-actions" }, [el("button", { className: "btn-play", textContent: "Open", onclick: () => openBrowserWindow(link.name, "browser", link.url, link.proxy !== false, true) })]);
        if (link.custom) acts.appendChild(el("button", { className: "btn-offload", textContent: "Delete", onclick: () => { setU(getU().filter(x => x.id !== link.id)); draw(); } }));
        grid.appendChild(el("div", { className: "store-card" }, [
          el("div", { className: "store-icon", textContent: link.icon || "🔗" }),
          el("div", { className: "store-meta" }, [el("div", { className: "store-name", textContent: link.name }), el("div", { className: "store-sub", textContent: `${link.tag} · ${link.url.replace(/^https?:\/\//, "")}` })]),
          acts
        ]));
      });
      content.appendChild(grid);
    }
    draw();
  });
}

let pyodideInst = null;
function openCodeStudioWindow() {
  createWindow("Code Studio", "studio", body => {
    const sel = el("select", {}, [el("option", { value: "web", textContent: "HTML / CSS / JS" }), el("option", { value: "python", textContent: "Python 3" })]);
    const st = el("span", { textContent: "Ready", style: "font-size:12px;color:#94a3b8;margin-left:auto" });
    const eH = el("textarea", { className: "studio-ed", value: "<h1>Hello NovaOS!</h1>" });
    const eC = el("textarea", { className: "studio-ed", value: "body{font-family:sans-serif;color:#34d399;background:#090d16;padding:16px}" });
    const eJ = el("textarea", { className: "studio-ed", value: "console.log('NovaOS');" });
    const cols = el("div", { className: "studio-col" }, [eH, eC, eJ]);
    const eP = el("textarea", { className: "studio-ed", value: "for i in range(5): print(i)", style: "display:none" });
    const wOut = el("iframe", { className: "app-frame", sandbox: "allow-scripts" });
    const pOut = el("pre", { className: "studio-pre" });

    sel.onchange = () => { const w = sel.value === "web"; cols.style.display = w ? "flex" : "none"; wOut.style.display = w ? "block" : "none"; eP.style.display = w ? "none" : "block"; pOut.style.display = w ? "none" : "block"; };
    const run = el("button", { textContent: "▶ Run", onclick: async () => {
      if (sel.value === "web") {const d = wOut.contentDocument; d.open(); d.write(${eH.value}<style>${eC.value}</style><script>${eJ.value}<\/script>); d.close(); st.textContent = "Rendered";
} else {
if (!pyodideInst) { st.textContent = "Loading Python..."; await new Promise((res, rej) => { const s = el("script", { src: "jsdelivr.net", onload: res, onerror: rej }); document.head.appendChild(s); }); pyodideInst = await window.loadPyodide(); }
pOut.textContent = ""; pyodideInst.setStdout({ batched: m => pOut.textContent += m + "\n" });
try { await pyodideInst.runPythonAsync(eP.value); st.textContent = "Done"; } catch (e) { pOut.textContent += e; st.textContent = "Error"; }
}
}});
body.append(el("div", { className: "studio-bar" }, [sel, run, st]), el("div", { className: "studio-main" }, [cols, eP, el("div", { className: "studio-out" }, [wOut, pOut])]));
});
}
const SCENE_WALLPAPERS = {
  "mc-snow": { label: "Minecraft Snow", img: "/wallpapers/minecraft-snow.png", fx: "snow" },
  "mc-sunset": { label: "Minecraft Sunset", img: "/wallpapers/minecraft-sunset.png", fx: "embers" },
  "corvette": { label: "Neon Corvette", img: "/wallpapers/neon-corvette.png", fx: "neon" },
  "bmw-rain": { label: "Rainy BMW M2", img: "/wallpapers/rainy-bmw.png", fx: "rain" },
  "black-hole": { label: "Black Hole", img: "/wallpapers/black-hole.png", fx: "dust" },
  "nyc": { label: "NYC Skyline", img: "/wallpapers/nyc-night.png", fx: "dust" },
  "nebula": { label: "Nebula Clock", img: "/wallpapers/cosmic-nebula.png", fx: "clock" },
  "forest": { label: "Winter Forest", img: "/wallpapers/winter-forest.png", fx: "snow" },
  "rdr": { label: "Red Dead Sunset", img: "/wallpapers/rdr-sunset.png", fx: "embers" }
};

let wpPreset = localStorage.getItem("novaos_wp_preset") || "matrix";

function setPreset(name) {
  wpPreset = name;
  localStorage.setItem("novaos_wp_preset", name);
  localStorage.removeItem("novaos_wallpaper");
  applySavedPreferences();
}

function openSettingsWindow() {
  createWindow("System Settings", "settings", body => {
    const nIn = el("input", { placeholder: "App Name (e.g. YouTube)" });
    const uIn = el("input", { placeholder: "https://youtube.com" });
    const iIn = el("input", { placeholder: "Emoji or SVG", style: "max-width:110px" });
    const wpIn = el("input", { placeholder: "Image or .mp4/.webm video wallpaper URL..." });

    body.appendChild(el("div", { className: "settings-wrap" }, [
      el("div", { className: "setting-card" }, [
        el("h3", { textContent: "Add App to Dock" }),
        el("div", { className: "setting-row" }, [nIn, uIn, iIn, el("button", { textContent: "Add to Dock", onclick: () => {
          if (!nIn.value.trim() || !uIn.value.trim()) return;
          const url = /^https?:\/\//i.test(uIn.value.trim()) ? uIn.value.trim() : "https://" + uIn.value.trim();
          const saved = JSON.parse(localStorage.getItem("novaos_shortcuts") || "[]");
          const entry = { id: "c-" + Date.now(), name: nIn.value.trim(), kind: "proxy", url };
          if (iIn.value.trim().startsWith("<svg")) entry.svg = iIn.value.trim();
          else entry.icon = iIn.value.trim() || "🌐";
          saved.push(entry); localStorage.setItem("novaos_shortcuts", JSON.stringify(saved));
          renderDock(); nIn.value = ""; uIn.value = "";
        }})])
      ]),
      el("div", { className: "setting-card" }, [
        el("h3", { textContent: "Animated Scene Wallpapers" }),
        el("div", { className: "setting-row", style: "margin-bottom:10px" }, [
          el("button", { textContent: "Matrix Rain", onclick: () => setPreset("matrix") }),
          ...Object.entries(SCENE_WALLPAPERS).map(([id, s]) => el("button", { textContent: s.label, onclick: () => setPreset(id) }))
        ]),
        el("div", { className: "setting-row" }, [wpIn, el("button", { textContent: "Apply Custom URL", onclick: () => { localStorage.setItem("novaos_wallpaper", wpIn.value.trim()); applySavedPreferences(); } })])
      ]),
      el("div", { className: "setting-card" }, [
        el("h3", { textContent: "Tab Cloak" }),
        el("div", { className: "setting-row" }, [
          el("button", { textContent: "Google Docs", onclick: () => applyCloak("Google Docs", "https://gstatic.com") }),
          el("button", { textContent: "Canvas LMS", onclick: () => applyCloak("Dashboard", "https://cloudfront.net") }),
          el("button", { textContent: "Reset", onclick: () => applyCloak("NovaOS", "") })
        ])
      ])
    ]));
  });
}

function applyCloak(title, icon) {
  document.title = title;
  if (icon) document.getElementById("favicon").href = icon;
}

function applySavedPreferences() {
  const customWp = (localStorage.getItem("novaos_wallpaper") || "").trim();
  const desk = document.getElementById("desktop"), vid = document.getElementById("video-bg"), mat = document.getElementById("matrix-bg"), clk = document.getElementById("wp-clock-overlay");
  if (clk) clk.style.display = "none";
  desk.classList.remove("animated-bg");

  if (customWp) {
    mat.style.display = "none";
    if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(customWp)) {
      desk.style.backgroundImage = "none"; vid.src = customWp; vid.style.display = "block"; vid.play().catch(() => {});
    } else {
      vid.pause(); vid.style.display = "none"; desk.style.backgroundImage = `url('${customWp}')`;
    }
    return;
  }

  vid.pause(); vid.style.display = "none";
  mat.style.display = "block";
  const scene = SCENE_WALLPAPERS[wpPreset];
  if (scene) {
    desk.style.backgroundImage = `url('${scene.img}')`;
    desk.classList.add("animated-bg");
    if (scene.fx === "clock" && clk) clk.style.display = "flex";
  } else {
    desk.style.backgroundImage = "none";
  }
}

const appleBtn = document.getElementById("apple-btn"), appleMenu = document.getElementById("apple-menu");
appleBtn.onclick = e => { e.stopPropagation(); appleMenu.style.display = appleMenu.style.display === "flex" ? "none" : "flex"; };
document.onclick = () => { appleMenu.style.display = "none"; };

document.getElementById("menu-browser").onclick = () => openBrowserWindow("Retina", "browser", "https://duckduckgo.com", true, true);
document.getElementById("menu-arcade").onclick = () => openGnMathArcade();
document.getElementById("menu-studio").onclick = () => openCodeStudioWindow();
document.getElementById("menu-settings").onclick = () => openSettingsWindow();
document.getElementById("drop-settings").onclick = () => openSettingsWindow();
document.getElementById("drop-studio").onclick = () => openCodeStudioWindow();
document.getElementById("drop-arcade").onclick = () => openGnMathArcade();
document.getElementById("drop-restart").onclick = () => location.reload();

const tick = () => {
  const d = new Date();
  document.getElementById("clock").textContent = d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) + "  " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
tick(); setInterval(tick, 1000);

(function initWallpaperEngine() {
  const c = document.getElementById("matrix-bg"), ctx = c.getContext("2d");
  const chars = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let drops = [], particles = [], t = 0;
  const fit = () => {
    c.width = innerWidth; c.height = innerHeight;
    drops = Array(Math.floor(c.width / 18)).fill(1).map(() => Math.random() * -50);
    particles = Array.from({ length: 95 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: 1 + Math.random() * 2.5, vx: (Math.random() - 0.5) * 0.8, vy: 0.4 + Math.random() * 1.4
    }));
  };
  fit(); addEventListener("resize", fit);

  setInterval(() => {
    t += 0.03;
    const scene = SCENE_WALLPAPERS[wpPreset];
    if (scene) {
      ctx.clearRect(0, 0, c.width, c.height);
      const fx = scene.fx;
      if (fx === "clock") {
        const now = new Date();
        const tEl = document.getElementById("wp-clock-time"), dEl = document.getElementById("wp-clock-day"), dtEl = document.getElementById("wp-clock-date");
        if (tEl) tEl.textContent = "-" + now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }) + "-";
        if (dEl) dEl.textContent = now.toLocaleDateString([], { weekday: "long" });
        if (dtEl) dtEl.textContent = now.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
      }
      if (fx === "neon") {
        const grad = ctx.createLinearGradient(0, 0, c.width, c.height);
        const shift = (Math.sin(t) + 1) / 2;
        grad.addColorStop(0, `rgba(56, 189, 248, ${0.14 * shift})`);
        grad.addColorStop(1, `rgba(236, 72, 153, ${0.16 * (1 - shift)})`);
        ctx.fillStyle = grad; ctx.fillRect(0, 0, c.width, c.height);
      }
      particles.forEach(p => {
        if (fx === "rain") {
          ctx.strokeStyle = "rgba(186, 230, 253, 0.35)"; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 4, p.y + 16); ctx.stroke();
          p.x -= 1.5; p.y += p.vy * 9;
        } else if (fx === "snow") {
          ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
          p.x += Math.sin(t + p.y * 0.01) * 0.7; p.y += p.vy * 1.1;
        } else if (fx === "embers") {
          ctx.fillStyle = "rgba(253, 224, 71, 0.65)";
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
          p.x += Math.sin(t + p.y * 0.02) * 0.6; p.y -= p.vy * 0.7;
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.8, 0, Math.PI * 2); ctx.fill();
          p.x += p.vx * 0.5; p.y += p.vy * 0.25;
        }
        if (p.y > c.height) { p.y = -10; p.x = Math.random() * c.width; }
        if (p.y < -15) { p.y = c.height + 10; p.x = Math.random() * c.width; }
        if (p.x < 0) p.x = c.width;
        if (p.x > c.width) p.x = 0;
      });
    } else {
      ctx.fillStyle = "rgba(2, 8, 4, 0.08)"; ctx.fillRect(0, 0, c.width, c.height); ctx.font = "16px monospace";
      for (let i = 0; i < drops.length; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)], x = i * 18, y = drops[i] * 18;
        ctx.fillStyle = Math.random() > 0.85 ? "#a7f3d0" : "#10b981";
        ctx.fillText(ch, x, y);
        if (y > c.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }
  }, 45);
})();

(function initBootSequence() {
  const scr = document.getElementById("boot-screen"), term = document.getElementById("boot-terminal"), log = document.getElementById("boot-log"), skip = document.getElementById("boot-skip"), tux = document.getElementById("boot-tux");
  if (tux) tux.innerHTML = TUX_SVG;
  if (!scr || !term || !log) return;
const lines = [
"[    0.000] Booting NovaOS Kernel 6.11.0-matrix-amd64...",
"[    0.118] Checking CPU features: SSE4.2 AVX2 WebAssembly SIMD...",
"[    0.245] Initializing BareMux + Ultraviolet + Scramjet...",
"[    0.382] Mounting VFS: /games (52 packages) /emulators /tools...",
"[    0.510] Starting Retina multi-tab compositor...",
"[    0.644] Connecting Duck.ai & Glow Chat daemons...",
"[    0.790] Loading animated scene wallpaper engine...",
"Compiling GLSL shaders [████████████████████] 100%",
"Injecting kernel hooks -> 0x7fff89a0 -> 0x7fff91b4 -> 0x7fffa02c",
"Accelerating terminal stream [2x]...",
"Accelerating terminal stream [5x]...",
"OVERCLOCKING MATRIX CASCADE..."
];
const glyphs = "0123456789ABCDEF@#$%&*+=<>?ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ";
let idx = 0, delay = 250, done = false;
const finish = () => { if (done) return; done = true; term.classList.add("fling"); setTimeout(() => scr.classList.add("done"), 550); };
if (skip) skip.onclick = finish;
const step = () => {
if (done) return;
if (idx < lines.length) {
log.textContent += lines[idx++] + "\n"; log.scrollTop = log.scrollHeight;
delay = Math.max(45, Math.floor(delay * 0.84)); setTimeout(step, delay);
} else {
let b = 0;
const flood = setInterval(() => {
if (done) return clearInterval(flood);
let row = ""; for (let k = 0; k < 62; k++) row += glyphs[Math.floor(Math.random() * glyphs.length)];
log.textContent += row + "\n"; log.scrollTop = log.scrollHeight;
if (++b >= 28) { clearInterval(flood); finish(); }
}, 32);
}
};
setTimeout(step, 180);
})();
applySavedPreferences();
renderDock();
