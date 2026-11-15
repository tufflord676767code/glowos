const APP_ICONS = {
  browser: `<svg viewBox="0 0 64 64" width="34" height="34"><defs><linearGradient id="ret" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient></defs><rect x="6" y="6" width="52" height="52" rx="14" fill="url(#ret)"/><circle cx="32" cy="32" r="16" fill="none" stroke="#fff" stroke-width="3.5"/><circle cx="32" cy="32" r="7" fill="#fff"/><circle cx="35" cy="29" r="2.2" fill="#2563eb"/></svg>`,
  glow: `<svg viewBox="0 0 64 64" width="34" height="34"><defs><linearGradient id="msg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4ade80"/><stop offset="100%" stop-color="#16a34a"/></linearGradient></defs><rect x="6" y="6" width="52" height="52" rx="14" fill="url(#msg)"/><path d="M32 16 C20.5 16 12 22.8 12 31.2 C12 35.8 14.8 39.8 19.2 42.5 L16.5 49 L24.5 45.2 C26.9 45.9 29.4 46.3 32 46.3 C43.5 46.3 52 39.5 52 31.2 C52 22.8 43.5 16 32 16 Z" fill="#fff"/></svg>`,
  arcade: `<svg viewBox="0 0 64 64" width="34" height="34"><defs><linearGradient id="arc" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#10b981"/><stop offset="100%" stop-color="#059669"/></linearGradient></defs><rect x="6" y="14" width="52" height="36" rx="14" fill="url(#arc)"/><path d="M22 25 v14 M15 32 h14" stroke="#fff" stroke-width="4" stroke-linecap="round"/><circle cx="43" cy="28" r="3" fill="#fff"/><circle cx="49" cy="34" r="3" fill="#fff"/></svg>`,
  links: `<svg viewBox="0 0 64 64" width="34" height="34"><defs><linearGradient id="lnk" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#34d399"/><stop offset="100%" stop-color="#0284c7"/></linearGradient></defs><rect x="6" y="6" width="52" height="52" rx="14" fill="url(#lnk)"/><path d="M27 37 L37 27 M23 31 L19 35 A7 7 0 0 0 29 45 L33 41 M41 33 L45 29 A7 7 0 0 0 35 19 L31 23" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`,
  studio: `<svg viewBox="0 0 64 64" width="34" height="34"><path d="M46 8 L56 13 V51 L46 56 L22 36 L12 44 L8 40 L18 32 L8 24 L12 20 L22 28 Z" fill="#007acc"/><path d="M46 8 L56 13 V51 L46 56 V8 Z" fill="#1f9cf0"/><path d="M46 20 L31 32 L46 44 V20 Z" fill="#060b19"/></svg>`,
  settings: `<svg viewBox="0 0 64 64" width="34" height="34"><defs><linearGradient id="set" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#475569"/></linearGradient></defs><circle cx="32" cy="32" r="26" fill="url(#set)"/><circle cx="32" cy="32" r="10" fill="none" stroke="#fff" stroke-width="5"/><path d="M32 10 v6 M32 48 v6 M10 32 h6 M48 32 h6 M17 17 l4 4 M43 43 l4 4 M47 17 l-4 4 M21 43 l-4 4" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`
};

const coreApps = [
  { id: "browser", name: "Retina", svg: APP_ICONS.browser, kind: "browser", url: "https://duckduckgo.com" },
  { id: "glow", name: "Glow Chat", svg: APP_ICONS.glow, kind: "browser", url: "https://web.app" },
  { id: "arcade", name: "Games", svg: APP_ICONS.arcade, kind: "arcade" },
  { id: "links", name: "Glow Links", svg: APP_ICONS.links, kind: "links" },
  { id: "studio", name: "Code Studio", svg: APP_ICONS.studio, kind: "studio" },
  { id: "settings", name: "Settings", svg: APP_ICONS.settings, kind: "settings" }
];

let proxyPromise = null;

function ensureProxy() {
  if (proxyPromise) return proxyPromise;
  proxyPromise = (async () => {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/service/" });
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller && reg.active) {
      await new Promise(r => setTimeout(r, 150));
    }
    const connection = new BareMux.BareMuxConnection("/baremux/worker.js");
    await connection.setTransport("/bare-client/index.mjs", [location.origin + "/bare/"]);
  })().catch(err => {
    proxyPromise = null;
    throw err;
  });
  return proxyPromise;
}

function encodeProxyUrl(target) {
  return self.__uv$config.prefix + self.__uv$config.encodeUrl(target);
}

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  Object.assign(node, props);
  children.forEach(c => node.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
  return node;
}

function getAllApps() {
  const custom = JSON.parse(localStorage.getItem("novaos_shortcuts") || "[]");
  return [...coreApps, ...custom];
}

function renderDock() {
  const dock = document.getElementById("dock");
  if (!dock) return;
  dock.innerHTML = "";

  getAllApps().forEach((app, idx) => {
    if (idx === coreApps.length) {
      dock.appendChild(el("div", { className: "dock-divider" }));
    }
    const dot = el("div", { className: "dock-dot" });
    const item = el("div", {
      className: "dock-item",
      id: "dock-" + app.id,
      onclick: () => launchApp(app)
    });
    if (app.svg) item.innerHTML = app.svg;
    else item.textContent = app.icon || "🌐";
    item.appendChild(dot);
    item.setAttribute("data-name", app.name);
    dock.appendChild(item);
  });
}

let zIndexCounter = 100;
let windowCount = 0;

function focusWindow(win, appName) {
  zIndexCounter++;
  win.style.zIndex = zIndexCounter;
  const activeLabel = document.getElementById("active-app-name");
  if (activeLabel && appName) activeLabel.textContent = appName;
}

function createWindow(title, appId, builderFn) {
  windowCount++;
  const winId = "win-" + windowCount;
  const body = el("div", { className: "win-body" });

  const dockIcon = document.getElementById("dock-" + appId);
  if (dockIcon) dockIcon.classList.add("open");

  const closeBtn = el("button", { className: "tl-btn tl-close", title: "Close", onclick: () => {
    win.remove();
    if (dockIcon && !document.querySelector(`[data-appid="${appId}"]`)) {
      dockIcon.classList.remove("open");
    }
  }});
  const minBtn = el("button", { className: "tl-btn tl-min", title: "Minimize", onclick: () => {
    win.style.display = "none";
  }});
  const maxBtn = el("button", { className: "tl-btn tl-max", title: "Fullscreen", onclick: () => {
    win.classList.toggle("maximized");
  }});

  const header = el("div", { className: "win-header" }, [
    el("div", { className: "traffic-lights" }, [closeBtn, minBtn, maxBtn]),
    el("div", { className: "win-title", textContent: title })
  ]);

  const win = el("div", { className: "os-window", id: winId }, [header, body]);
  win.setAttribute("data-appid", appId);
  win.style.top = (42 + (windowCount % 5) * 24) + "px";
  win.style.left = (100 + (windowCount % 5) * 28) + "px";
  win.addEventListener("mousedown", () => focusWindow(win, title));
  document.getElementById("desktop").appendChild(win);

  let dragging = false, offsetX = 0, offsetY = 0;
  header.addEventListener("mousedown", (e) => {
    if (e.target.tagName === "BUTTON" || win.classList.contains("maximized")) return;
    dragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
  });
  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    win.style.left = Math.max(0, e.clientX - offsetX) + "px";
    win.style.top = Math.max(28, e.clientY - offsetY) + "px";
  });
  window.addEventListener("mouseup", () => { dragging = false; });

  builderFn(body, win);
  focusWindow(win, title);
  return win;
}

function launchApp(app) {
  const existing = document.querySelector(`.os-window[data-appid="${app.id}"]`);
  if (existing && existing.style.display === "none") {
    existing.style.display = "flex";
    focusWindow(existing, app.name);
    return;
  }

  if (app.kind === "browser" || app.kind === "proxy") {
    openBrowserWindow(app.name, app.id, app.url || "https://duckduckgo.com", true, app.kind === "browser");
  } else if (app.kind === "arcade") {
    openGnMathArcade();
  } else if (app.kind === "links") {
    openGlowLinksWindow();
  } else if (app.kind === "studio") {
    openCodeStudioWindow();
  } else if (app.kind === "settings") {
    openSettingsWindow();
  }
}
function openBrowserWindow(title, appId, initialUrl, useProxy = true, showBar = true) {
  createWindow(title, appId, async (body) => {
    const backBtn = el("button", { type: "button", textContent: "◀", onclick: () => { try { iframe.contentWindow.history.back(); } catch {} } });
    const reloadBtn = el("button", { type: "button", textContent: "↻", onclick: () => navigate(input.value) });
    const input = el("input", { type: "text", value: initialUrl, placeholder: "Search or enter website name" });
    const goBtn = el("button", { type: "submit", textContent: "Go" });
    const form = el("form", { className: "browser-bar" }, [backBtn, reloadBtn, input, goBtn]);
    if (!showBar) form.style.display = "none";
    const iframe = el("iframe", { className: "app-frame", allowFullscreen: true });
    iframe.allow = "microphone; autoplay; fullscreen; gamepad; clipboard-read; clipboard-write";
    iframe.style.background = "#090d16";
    body.append(form, iframe);

    async function navigate(raw) {
      let target = raw.trim();
      if (useProxy && !target.startsWith("http://") && !target.startsWith("https://")) {
        target = target.includes(".") && !target.includes(" ")
          ? "https://" + target
          : "https://duckduckgo.com" + encodeURIComponent(target);
      }
      input.value = target;
      if (useProxy) {
        try {
          await ensureProxy();
          iframe.src = encodeProxyUrl(target);
        } catch (err) {
          iframe.srcdoc = `<body style="background:#090d16;color:#f87171;font-family:sans-serif;padding:24px;"><h3>Proxy Error</h3><pre>${err}</pre></body>`;
        }
      } else {
        iframe.src = target;
      }
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      navigate(input.value);
    });

    await navigate(initialUrl);
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

function getInstalledGames() {
  return JSON.parse(localStorage.getItem("novaos_installed_games") || "[]");
}

function saveInstalledGames(list) {
  localStorage.setItem("novaos_installed_games", JSON.stringify(list));
}

function getCustomCatalog() {return JSON.parse(localStorage.getItem("novaos_custom_games") || "[]");
}
function openGnMathArcade() {
  createWindow("App Store & Games", "arcade", (body) => {
    let activeTab = "discover";
    let query = "";

    const tabDiscover = el("button", { className: "store-tab active", textContent: "Discover" });
    const tabLibrary = el("button", { className: "store-tab", textContent: "My Library" });
    const tabPortals = el("button", { className: "store-tab", textContent: "Full Portals" });
    const searchInput = el("input", { className: "store-search", placeholder: "Search games..." });

    const nav = el("div", { className: "store-nav" }, [
      el("div", { className: "store-tabs" }, [tabDiscover, tabLibrary, tabPortals]),
      searchInput
    ]);
    const content = el("div", { className: "store-body" });
    body.appendChild(el("div", { className: "store-shell" }, [nav, content]));

    function setTab(tab) {
      activeTab = tab;
      [tabDiscover, tabLibrary, tabPortals].forEach(b => b.classList.remove("active"));
      if (tab === "discover") tabDiscover.classList.add("active");
      if (tab === "library") tabLibrary.classList.add("active");
      if (tab === "portals") tabPortals.classList.add("active");
      renderStore();
    }

    tabDiscover.onclick = () => setTab("discover");
    tabLibrary.onclick = () => setTab("library");
    tabPortals.onclick = () => setTab("portals");
    searchInput.oninput = () => { query = searchInput.value.toLowerCase(); renderStore(); };

    function installGame(game, btn) {
      btn.textContent = "Downloading...";
      btn.disabled = true;
      setTimeout(() => {
        const installed = getInstalledGames();
        if (!installed.some(g => g.id === game.id)) {
          installed.push(game);
          saveInstalledGames(installed);
        }
        renderStore();
      }, 450);
    }

    function offloadGame(id) {
      const updated = getInstalledGames().filter(g => g.id !== id);
      saveInstalledGames(updated);
      renderStore();
    }

    function renderCard(game, isInstalled) {
      const actions = el("div", { className: "store-actions" });
      if (isInstalled) {
        actions.append(
          el("button", { className: "btn-play", textContent: "▶ Play", onclick: () => openBrowserWindow(game.name, "arcade", game.url, !game.local, false) }),
          el("button", { className: "btn-offload", textContent: "Offload", onclick: () => offloadGame(game.id) })
        );
      } else {
        const getBtn = el("button", { className: "btn-get", textContent: "GET" });
        getBtn.onclick = () => installGame(game, getBtn);
        actions.appendChild(getBtn);
      }

      return el("div", { className: "store-card" }, [
        el("div", { className: "store-icon", textContent: game.icon || "🎮" }),
        el("div", { className: "store-meta" }, [
          el("div", { className: "store-name", textContent: game.name }),
          el("div", { className: "store-sub", textContent: `${game.source} · ${game.cat}` })
        ]),
        actions
      ]);
    }

    function renderStore() {
      content.innerHTML = "";
      const installed = getInstalledGames();
      const installedIds = new Set(installed.map(g => g.id));

      if (activeTab === "portals") {
        const portalGrid = el("div", { className: "store-grid" }, [
          el("div", { className: "store-card" }, [
            el("div", { className: "store-icon", textContent: "🕹️" }),
            el("div", { className: "store-meta" }, [
              el("div", { className: "store-name", textContent: "Poki Games" }),
              el("div", { className: "store-sub", textContent: "poki.com · 1,000+ Instant HTML5 Games" })
            ]),
            el("button", { className: "btn-play", textContent: "Open", onclick: () => openBrowserWindow("Poki", "arcade", "https://poki.com", true, true) })
          ]),
          el("div", { className: "store-card" }, [
            el("div", { className: "store-icon", textContent: "🔥" }),
            el("div", { className: "store-meta" }, [
              el("div", { className: "store-name", textContent: "CrazyGames" }),
              el("div", { className: "store-sub", textContent: "crazygames.com · Multiplayer & 3D Web Games" })
            ]),
            el("button", { className: "btn-play", textContent: "Open", onclick: () => openBrowserWindow("CrazyGames", "arcade", "https://crazygames.com", true, true) })
          ]),
          el("div", { className: "store-card" }, [
            el("div", { className: "store-icon", textContent: "🍄" }),
            el("div", { className: "store-meta" }, [
              el("div", { className: "store-name", textContent: "Truffled Catalog" }),
              el("div", { className: "store-sub", textContent: "truffled.lol · Classic Web Games" })
            ]),
            el("button", { className: "btn-play", textContent: "Open", onclick: () => openBrowserWindow("Truffled", "arcade", "https://truffled.lol", true, true) })
          ])
        ]);
        content.appendChild(portalGrid);
        return;
      }

      if (activeTab === "discover") {
        const nameIn = el("input", { placeholder: "Custom Game Title" });
        const urlIn = el("input", { placeholder: "Paste Game URL" });
        const addBtn = el("button", { textContent: "+ Add to Store", onclick: () => {
          if (!nameIn.value.trim() || !urlIn.value.trim()) return;
          const custom = getCustomCatalog();
          const newGame = { id: "cust-" + Date.now(), name: nameIn.value.trim(), source: "Custom", cat: "Web", icon: "🕹️", url: urlIn.value.trim() };
          custom.unshift(newGame);
          localStorage.setItem("novaos_custom_games", JSON.stringify(custom));
          nameIn.value = "";
          urlIn.value = "";
          renderStore();
        }});
        content.appendChild(el("div", { className: "add-game-bar" }, [nameIn, urlIn, addBtn]));
      }

      const pool = activeTab === "library" ? installed : [...getCustomCatalog(), ...STORE_CATALOG];
      const filtered = pool.filter(g => g.name.toLowerCase().includes(query) || g.cat.toLowerCase().includes(query));

      if (!filtered.length) {
        content.appendChild(el("div", {
          textContent: activeTab === "library" ? "Your Library is empty. Switch to Discover and click GET on any game to download it!" : "No games match your search.",
          style: "color:#94a3b8; font-size:13px; padding:20px; text-align:center;"
        }));
        return;
      }

      const grid = el("div", { className: "store-grid" });
      filtered.forEach(g => grid.appendChild(renderCard(g, installedIds.has(g.id))));
      content.appendChild(grid);
    }

    renderStore();
  });
}
const GLOW_LINK_VAULT = [
  { name: "Glow Chat (Primary)", url: "https://web.app", tag: "Social", icon: "💬", proxy: true },
  { name: "Poki Games", url: "https://poki.com", tag: "Games", icon: "🕹️", proxy: true },
  { name: "CrazyGames", url: "https://crazygames.com", tag: "Games", icon: "🔥", proxy: true },
  { name: "Truffled Portal", url: "https://truffled.lol", tag: "Games", icon: "🍄", proxy: true },
  { name: "DuckDuckGo Search", url: "https://duckduckgo.com", tag: "Search", icon: "🦆", proxy: true }
];

function openGlowLinksWindow() {
  createWindow("Glow Link Collection", "links", (body) => {
    let query = "";
    let activeTag = "All";

    const searchInput = el("input", { className: "store-search", placeholder: "Search Glow Link Collection..." });
    const nav = el("div", { className: "store-nav" }, [searchInput]);
    const content = el("div", { className: "store-body" });
    body.appendChild(el("div", { className: "store-shell" }, [nav, content]));

    function getUserLinks() {
      return JSON.parse(localStorage.getItem("novaos_glow_links") || "[]");
    }

    function saveUserLinks(list) {
      localStorage.setItem("novaos_glow_links", JSON.stringify(list));
    }

    function renderLinks() {
      content.innerHTML = "";
      const allLinks = [...getUserLinks(), ...GLOW_LINK_VAULT];

      const nameIn = el("input", { placeholder: "Link Name" });
      const urlIn = el("input", { placeholder: "https://..." });
      const tagIn = el("input", { placeholder: "Tag (e.g. Games, Proxy, Media)" });
      tagIn.style.maxWidth = "160px";
      const addBtn = el("button", { textContent: "+ Save Link", onclick: () => {
        const name = nameIn.value.trim();
        let url = urlIn.value.trim();
        const tag = tagIn.value.trim() || "General";
        if (!name || !url) return;
        if (!url.startsWith("http")) url = "https://" + url;
        const saved = getUserLinks();
        saved.unshift({ id: "lnk-" + Date.now(), name, url, tag, icon: "🔗", proxy: true, custom: true });
        saveUserLinks(saved);
        nameIn.value = "";
        urlIn.value = "";
        tagIn.value = "";
        renderLinks();
      }});
      content.appendChild(el("div", { className: "add-game-bar" }, [nameIn, urlIn, tagIn, addBtn]));

      const tags = ["All", ...new Set(allLinks.map(l => l.tag || "General"))];
      const pillRow = el("div", { style: "display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;" });
      tags.forEach(t => {
        const pill = el("button", {
          className: "store-tab" + (activeTag === t ? " active" : ""),
          textContent: t,
          onclick: () => { activeTag = t; renderLinks(); }
        });
        pill.style.border = "1px solid rgba(52,211,153,0.25)";
        pillRow.appendChild(pill);
      });
      content.appendChild(pillRow);

      const filtered = allLinks.filter(l => {
        const matchesTag = activeTag === "All" || (l.tag || "General") === activeTag;
        const matchesQuery = l.name.toLowerCase().includes(query) || l.url.toLowerCase().includes(query);
        return matchesTag && matchesQuery;
      });

      if (!filtered.length) {
        content.appendChild(el("div", {
          textContent: "No links found matching your filter.",
          style: "color:#94a3b8;font-size:13px;padding:20px;text-align:center;"
        }));
        return;
      }

      const grid = el("div", { className: "store-grid" });
      filtered.forEach(link => {
        const actions = el("div", { className: "store-actions" }, [
          el("button", {
            className: "btn-play",
            textContent: "Open",
            onclick: () => openBrowserWindow(link.name, "browser", link.url, link.proxy !== false, true)
          })
        ]);
        if (link.custom) {
          actions.appendChild(el("button", {
            className: "btn-offload",
            textContent: "Delete",
            onclick: () => {
              saveUserLinks(getUserLinks().filter(x => x.id !== link.id));
              renderLinks();
            }
          }));
        }

        grid.appendChild(el("div", { className: "store-card" }, [
          el("div", { className: "store-icon", textContent: link.icon || "🔗" }),
          el("div", { className: "store-meta" }, [
            el("div", { className: "store-name", textContent: link.name }),
            el("div", { className: "store-sub", textContent: `${link.tag || "Link"} · ${link.url.replace(/^https?:\/\//, "")}` })
          ]),
          actions
        ]));
      });
      content.appendChild(grid);
    }

    searchInput.oninput = () => { query = searchInput.value.toLowerCase(); renderLinks(); };
    renderLinks();
  });
}
let pyodideInstance = null;
function loadPyodideLazy() {
  if (window.loadPyodide) return window.loadPyodide();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://jsdelivr.net";
    s.onload = () => window.loadPyodide().then(resolve, reject);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function openCodeStudioWindow() {
  createWindow("Code Studio", "studio", (body) => {
    const sel = el("select", {}, [
      el("option", { value: "web", textContent: "HTML / CSS / JS" }),
      el("option", { value: "python", textContent: "Python 3 (Pyodide)" })
    ]);
    const runBtn = el("button", { textContent: "▶ Run" });
    const status = el("span", { textContent: "Ready" });
    status.style.cssText = "font-size:12px; color:#94a3b8; margin-left:auto;";

    const edHtml = el("textarea", { className: "studio-ed", value: "<h1>Hello NovaOS!</h1>" });
    const edCss = el("textarea", { className: "studio-ed", value: "body { font-family: -apple-system, sans-serif; color: #34d399; background: #090d16; padding: 16px; }" });
    const edJs = el("textarea", { className: "studio-ed", value: "console.log('Running inside NovaOS');" });
    const webCols = el("div", { className: "studio-col" }, [edHtml, edCss, edJs]);

    const edPy = el("textarea", { className: "studio-ed", value: "for i in range(5):\n    print(f'Python step {i}')" });
    edPy.style.display = "none";

    const webOut = el("iframe", { className: "app-frame" });
    webOut.sandbox = "allow-scripts";
    const pyOut = el("pre", { className: "studio-pre" });

    body.append(
      el("div", { className: "studio-bar" }, [sel, runBtn, status]),
      el("div", { className: "studio-main" }, [webCols, edPy, el("div", { className: "studio-out" }, [webOut, pyOut])])
    );

    sel.onchange = () => {
      const isWeb = sel.value === "web";
      webCols.style.display = isWeb ? "flex" : "none";
      webOut.style.display = isWeb ? "block" : "none";
      edPy.style.display = isWeb ? "none" : "block";
      pyOut.style.display = isWeb ? "none" : "block";
    };

    runBtn.onclick = async () => {
      if (sel.value === "web") {
        const doc = webOut.contentDocument;
        doc.open();
        doc.write(edHtml.value);
        const s = doc.createElement("style");
        s.textContent = edCss.value;
        doc.head.appendChild(s);
        const j = doc.createElement("script");
        j.textContent = edJs.value;
        doc.body.appendChild(j);
        doc.close();
        status.textContent = "Rendered Web Output";
      } else {
        if (!pyodideInstance) {
          status.textContent = "Loading Python WASM...";
          pyodideInstance = await loadPyodideLazy();
        }
        status.textContent = "Running Python...";
        pyOut.textContent = "";
        pyodideInstance.setStdout({ batched: m => { pyOut.textContent += m + "\n"; } });
        pyodideInstance.setStderr({ batched: m => { pyOut.textContent += "[Error] " + m + "\n"; } });
        try {
          await pyodideInstance.runPythonAsync(edPy.value);
          status.textContent = "Done";
        } catch (err) {
          pyOut.textContent += err.toString();
          status.textContent = "Error";
        }
      }
    };
  });
}

function openSettingsWindow() {
  createWindow("System Settings", "settings", (body) => {
    const scName = el("input", { placeholder: "App Name (e.g. YouTube)" });
    const scUrl = el("input", { placeholder: "https://youtube.com" });
    const scIcon = el("input", { placeholder: "Emoji or SVG" });
    scIcon.style.maxWidth = "110px";
    const scBtn = el("button", { textContent: "Add to Dock", onclick: () => {
      const name = scName.value.trim();
      let url = scUrl.value.trim();
      const iconVal = scIcon.value.trim() || "🌐";
      if (!name || !url) return;
      if (!url.startsWith("http")) url = "https://" + url;
      const saved = JSON.parse(localStorage.getItem("novaos_shortcuts") || "[]");
      const entry = { id: "custom-" + Date.now(), name, kind: "proxy", url };
      if (iconVal.startsWith("<svg")) entry.svg = iconVal;
      else entry.icon = iconVal;
      saved.push(entry);
      localStorage.setItem("novaos_shortcuts", JSON.stringify(saved));
      renderDock();
      scName.value = "";
      scUrl.value = "";
    }});

    const wpInput = el("input", { placeholder: "Custom wallpaper URL (leave blank for Matrix rain)..." });
    const wpBtn = el("button", { textContent: "Apply", onclick: () => {
      localStorage.setItem("novaos_wallpaper", wpInput.value.trim());
      applySavedPreferences();
    }});

    body.appendChild(el("div", { className: "settings-wrap" }, [
      el("div", { className: "setting-card" }, [
        el("h3", { textContent: "Add App to Dock" }),
        el("div", { className: "setting-row" }, [scName, scUrl, scIcon, scBtn])
      ]),
      el("div", { className: "setting-card" }, [
        el("h3", { textContent: "Desktop Wallpaper" }),
        el("div", { className: "setting-row" }, [wpInput, wpBtn])
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

function applyCloak(title, iconUrl) {
  document.title = title;
  if (iconUrl) document.getElementById("favicon").href = iconUrl;
}

function applySavedPreferences() {
  const wp = localStorage.getItem("novaos_wallpaper");
  const desktop = document.getElementById("desktop");
  desktop.style.backgroundImage = wp ? `url('${wp}')` : "none";
}

const appleBtn = document.getElementById("apple-btn");
const appleMenu = document.getElementById("apple-menu");
appleBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  appleMenu.style.display = appleMenu.style.display === "flex" ? "none" : "flex";
});
document.addEventListener("click", () => { appleMenu.style.display = "none"; });

document.getElementById("menu-browser").onclick = () => openBrowserWindow("Retina", "browser", "https://duckduckgo.com", true, true);
document.getElementById("menu-arcade").onclick = () => openGnMathArcade();
document.getElementById("menu-studio").onclick = () => openCodeStudioWindow();
document.getElementById("menu-settings").onclick = () => openSettingsWindow();

document.getElementById("drop-settings").onclick = () => openSettingsWindow();
document.getElementById("drop-studio").onclick = () => openCodeStudioWindow();
document.getElementById("drop-arcade").onclick = () => openGnMathArcade();
document.getElementById("drop-restart").onclick = () => location.reload();

function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) + "  " + now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
updateClock();
setInterval(updateClock, 1000);

(function initMatrix() {
  const canvas = document.getElementById("matrix-bg");
  const ctx = canvas.getContext("2d");
  const chars = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let cols = 0, drops = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.floor(canvas.width / 18);
    drops = Array(cols).fill(1).map(() => Math.random() * -50);
  }
  resize();
  window.addEventListener("resize", resize);

  setInterval(() => {
    ctx.fillStyle = "rgba(2, 8, 4, 0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "16px monospace";

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * 18;
      const y = drops[i] * 18;

      ctx.fillStyle = Math.random() > 0.85 ? "#a7f3d0" : "#10b981";
      ctx.shadowColor = "#34d399";
      ctx.shadowBlur = 8;
      ctx.fillText(char, x, y);
      ctx.shadowBlur = 0;

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }, 45);
})();

applySavedPreferences();
renderDock();

