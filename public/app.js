const TUX_SVG = `<svg viewBox="0 0 220 260" width="54" height="64"><ellipse cx="110" cy="145" rx="68" ry="88" fill="#111827"/><ellipse cx="110" cy="156" rx="48" ry="68" fill="#f8fafc"/><circle cx="110" cy="64" r="42" fill="#111827"/><ellipse cx="97" cy="56" rx="11" ry="15" fill="#fff"/><ellipse cx="123" cy="56" rx="11" ry="15" fill="#fff"/><circle cx="100" cy="58" r="5" fill="#0f172a"/><circle cx="120" cy="58" r="5" fill="#0f172a"/><path d="M86 76 Q110 64 134 76 Q130 96 110 98 Q90 96 86 76 Z" fill="#facc15"/><path d="M46 115 Q24 155 48 182 Q62 172 60 142 Z" fill="#111827"/><path d="M174 115 Q196 155 172 182 Q158 172 160 142 Z" fill="#111827"/><path d="M42 215 Q32 238 66 244 Q95 246 98 228 Z" fill="#facc15"/><path d="M178 215 Q188 238 154 244 Q125 246 122 228 Z" fill="#facc15"/></svg>`;

const GLOW_CHAT_URL = ["https://", "glowchat-7b6b3", ".web.app/"].join("");

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
  { id: "ai", name: "Nova AI", svg: APP_ICONS.ai, kind: "ai" },
  { id: "arcade", name: "Games", svg: APP_ICONS.arcade, kind: "arcade" },
  { id: "links", name: "Glow Links", svg: APP_ICONS.links, kind: "links" },
  { id: "calc", name: "Calculator", svg: APP_ICONS.calc, kind: "calc" },
  { id: "studio", name: "Code Studio", svg: APP_ICONS.studio, kind: "studio" },
  { id: "settings", name: "Settings", svg: APP_ICONS.settings, kind: "settings" }
];

let proxyPromise = null;
function ensureProxy() {
  if (proxyPromise) return proxyPromise;
  proxyPromise = (async () => {
    await navigator.serviceWorker.register("/sw.js", { scope: "/service/" });
    await navigator.serviceWorker.ready;
    const conn = new BareMux.BareMuxConnection("/baremux/worker.js");
    await conn.setTransport("/bare-client/index.mjs", [location.origin + "/bare/"]);
  })().catch(e => { proxyPromise = null; throw e; });
  return proxyPromise;
}

const encodeProxyUrl = u => self.__uv$config.prefix + self.__uv$config.encodeUrl(u);
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
  if (hidden && hidden.style.display === "none") {
    hidden.style.display = "flex";
    hidden.style.zIndex = ++zTop;
    return;
  }
  if (app.kind === "glow" || app.id === "glow") openBrowserWindow(app.name, app.id, GLOW_CHAT_URL, false, true);
  else if (app.kind === "browser" || app.kind === "proxy") openBrowserWindow(app.name, app.id, app.url || "https://duckduckgo.com", true, app.kind === "browser");
  else if (app.kind === "ai") openNovaAIWindow();
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
    const tabBar = el("div", { className: "retina-tabs", style: multi ? "" : "display:none" });
    const stack = el("div", { className: "retina-frame-stack" });
    const input = el("input", { type: "text", value: initialUrl, placeholder: "Search or enter URL" });
    const form = el("form", { className: "browser-bar", style: showBar ? "" : "display:none" }, [
      el("button", { type: "button", textContent: "◀", onclick: () => { try { activeTab()?.iframe.contentWindow.history.back(); } catch {} } }),
      el("button", { type: "button", textContent: "▶", onclick: () => { try { activeTab()?.iframe.contentWindow.history.forward(); } catch {} } }),
      el("button", { type: "button", textContent: "↻", onclick: () => { const t = activeTab(); if (t) goTab(t, input.value); } }),
      input,
      el("button", { type: "submit", textContent: "Go" })
    ]);
    body.append(tabBar, form, stack);

    let tabs = [], curId = null;
    const activeTab = () => tabs.find(t => t.id === curId);

    function drawTabs() {
      if (!multi) return;
      tabBar.innerHTML = "";
      tabs.forEach(t => {
        const x = el("button", { type: "button", className: "retina-tab-close", textContent: "×", onclick: e => {
          e.stopPropagation();
          if (tabs.length === 1) return;
          t.iframe.remove();
          tabs = tabs.filter(k => k.id !== t.id);
          if (curId === t.id) pickTab(tabs[tabs.length - 1].id);
          else drawTabs();
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
        try { await ensureProxy(); tab.iframe.src = encodeProxyUrl(url); }
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
      tabs.push(tab);
      pickTab(id);
      await goTab(tab, url);
    }

    form.onsubmit = e => { e.preventDefault(); const t = activeTab(); if (t) goTab(t, input.value); };
    await newTab(initialUrl);
  });
}
function openNovaAIWindow() {
  createWindow("Nova AI", "ai", (body) => {
    const feed = el("div", { className: "ai-feed" }, [
      el("div", { className: "ai-msg bot", textContent: "Hey! I'm Nova AI. Ask me anything about coding, homework, math, or ideas." })
    ]);
    const input = el("input", { placeholder: "Ask Nova AI anything..." });
    const form = el("form", { className: "ai-bar" }, [input, el("button", { type: "submit", textContent: "Send" })]);
    body.append(el("div", { className: "ai-shell" }, [feed, form]));

    form.onsubmit = async e => {
      e.preventDefault();
      const q = input.value.trim();
      if (!q) return;
      input.value = "";
      feed.appendChild(el("div", { className: "ai-msg user", textContent: q }));
      const msg = el("div", { className: "ai-msg bot", textContent: "Thinking..." });
      feed.appendChild(msg);
      feed.scrollTop = feed.scrollHeight;

      try {
        await ensureProxy();
        const endpoints = [
          "https://pollinations.ai" + encodeURIComponent(q),
          "https://duckduckgo.com" + encodeURIComponent(q) + "&format=json&no_html=1"
        ];
        let ans = "";
        for (const ep of endpoints) {
          const r = await fetch(encodeProxyUrl(ep));
          const raw = await r.text();
          if (r.ok && raw && !raw.includes("error code: 1016") && !raw.includes("<!DOCTYPE html>")) {
            if (ep.includes("duckduckgo.com")) {
              const d = JSON.parse(raw);
              ans = d.AbstractText || d.Answer || (d.RelatedTopics?.[0]?.Text) || "";
            } else {
              ans = raw.trim();
            }
            if (ans) break;
          }
        }
        msg.textContent = ans || "No instant answer found—try rephrasing or opening DuckDuckGo AI in Retina!";
      } catch {
        msg.textContent = "Could not reach AI gateway. Try again or open DuckDuckGo AI in Retina!";
      }
      feed.scrollTop = feed.scrollHeight;
    };
  });
}

function openCalculatorWindow() {
  createWindow("Calculator", "calc", (body, win) => {
    win.style.width = "320px";
    win.style.height = "460px";
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
