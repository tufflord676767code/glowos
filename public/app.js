const APP_ICONS = {
  browser: `<svg viewBox="0 0 64 64" width="34" height="34"><defs><linearGradient id="ret" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient></defs><rect x="6" y="6" width="52" height="52" rx="14" fill="url(#ret)"/><circle cx="32" cy="32" r="16" fill="none" stroke="#fff" stroke-width="3.5"/><circle cx="32" cy="32" r="7" fill="#fff"/><circle cx="35" cy="29" r="2.2" fill="#2563eb"/></svg>`,
  glow: `<svg viewBox="0 0 64 64" width="34" height="34"><defs><linearGradient id="msg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4ade80"/><stop offset="100%" stop-color="#16a34a"/></linearGradient></defs><rect x="6" y="6" width="52" height="52" rx="14" fill="url(#msg)"/><path d="M32 16 C20.5 16 12 22.8 12 31.2 C12 35.8 14.8 39.8 19.2 42.5 L16.5 49 L24.5 45.2 C26.9 45.9 29.4 46.3 32 46.3 C43.5 46.3 52 39.5 52 31.2 C52 22.8 43.5 16 32 16 Z" fill="#fff"/></svg>`,
  arcade: `<svg viewBox="0 0 64 64" width="34" height="34"><defs><linearGradient id="arc" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#10b981"/><stop offset="100%" stop-color="#059669"/></linearGradient></defs><rect x="6" y="14" width="52" height="36" rx="14" fill="url(#arc)"/><path d="M22 25 v14 M15 32 h14" stroke="#fff" stroke-width="4" stroke-linecap="round"/><circle cx="43" cy="28" r="3" fill="#fff"/><circle cx="49" cy="34" r="3" fill="#fff"/></svg>`,
  studio: `<svg viewBox="0 0 64 64" width="34" height="34"><path d="M46 8 L56 13 V51 L46 56 L22 36 L12 44 L8 40 L18 32 L8 24 L12 20 L22 28 Z" fill="#007acc"/><path d="M46 8 L56 13 V51 L46 56 V8 Z" fill="#1f9cf0"/><path d="M46 20 L31 32 L46 44 V20 Z" fill="#060b19"/></svg>`,
  settings: `<svg viewBox="0 0 64 64" width="34" height="34"><defs><linearGradient id="set" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#475569"/></linearGradient></defs><circle cx="32" cy="32" r="26" fill="url(#set)"/><circle cx="32" cy="32" r="10" fill="none" stroke="#fff" stroke-width="5"/><path d="M32 10 v6 M32 48 v6 M10 32 h6 M48 32 h6 M17 17 l4 4 M43 43 l4 4 M47 17 l-4 4 M21 43 l-4 4" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`
};

const coreApps = [
  { id: "browser", name: "Retina", svg: APP_ICONS.browser, kind: "browser", url: "https://duckduckgo.com" },
  { id: "glow", name: "Glow Chat", svg: APP_ICONS.glow, kind: "browser", url: "https://web.app" },
  { id: "arcade", name: "Games", svg: APP_ICONS.arcade, kind: "arcade" },
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
    console.error("UV init error:", err);
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
    if (app.svg) {
      item.innerHTML = app.svg;
    } else {
      item.textContent = app.icon || "🌐";
    }
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
      if (!target.startsWith("http://") && !target.startsWith("https://")) {
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
  { id: "slope", name: "Slope", source: "Selenite", cat: "Arcade", icon: "🟢", url: "https://selenite.cc" },
  { id: "1v1lol", name: "1v1.LOL", source: "Selenite", cat: "Action", icon: "🎯", url: "https://selenite.cc" },
  { id: "retrobowl", name: "Retro Bowl", source: "Selenite", cat: "Sports", icon: "🏈", url: "https://selenite.cc" },
  { id: "bitlife", name: "BitLife", source: "Selenite", cat: "Simulation", icon: "🧬", url: "https://selenite.cc" },
  { id: "drifthunters", name: "Drift Hunters", source: "Selenite", cat: "Racing", icon: "🏎️", url: "https://selenite.cc" },
  { id: "minecraft", name: "Eaglercraft 1.8", source: "Selenite", cat: "Sandbox", icon: "⛏️", url: "https://selenite.cc" },
  { id: "subwaysurfers", name: "Subway Surfers", source: "Truffled", cat: "Runner", icon: "🛹", url: "https://truffled.lol" },
  { id: "geometrydash", name: "Geometry Dash", source: "Selenite", cat: "Rhythm", icon: "🟦", url: "https://selenite.cc" },
  { id: "cookieclicker", name: "Cookie Clicker", source: "Selenite", cat: "Idle", icon: "🍪", url: "https://selenite.cc" },
  { id: "basketrandom", name: "Basket Random", source: "Selenite", cat: "Sports", icon: "🏀", url: "https://selenite.cc" },
  { id: "fnaf", name: "FNAF 1", source: "Selenite", cat: "Horror", icon: "🐻", url: "https://selenite.cc" },
  { id: "stickmanhook", name: "Stickman Hook", source: "Truffled", cat: "Arcade", icon: "🪝", url: "https://truffled.lol" }
];

function getInstalledGames() {
  return JSON.parse(localStorage.getItem("novaos_installed_games") || "[]");
}

function saveInstalledGames(list) {
  localStorage.setItem("novaos_installed_games", JSON.stringify(list));
}

function getCustomCatalog() {
  return JSON.parse(localStorage.getItem("novaos_custom_games") || "[]");
}
function openGnMathArcade() {
  createWindow("App Store & Games", "arcade", (body) => {
    let activeTab = "discover";
    let query = "";

    const tabDiscover = el("button", { className: "store-tab active", textContent: "Discover" });
    const tabLibrary = el("button", { className: "store-tab", textContent: "My Library" });
    const tabPortals = el("button", { className: "store-tab", textContent: "Full Portals (1.3k+)" });
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
          el("button", { className: "btn-play", textContent: "▶ Play", onclick: () => openBrowserWindow(game.name, "arcade", game.url, true, false) }),
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
            el("div", { className: "store-icon", textContent: "🌙" }),
            el("div", { className: "store-meta" }, [
              el("div", { className: "store-name", textContent: "Selenite Catalog" }),
              el("div", { className: "store-sub", textContent: "selenite.cc · 800+ Web Games" })
            ]),
            el("button", { className: "btn-play", textContent: "Open", onclick: () => openBrowserWindow("Selenite", "arcade", "https://selenite.cc", true, true) })
          ]),
          el("div", { className: "store-card" }, [
            el("div", { className: "store-icon", textContent: "🍄" }),
            el("div", { className: "store-meta" }, [
              el("div", { className: "store-name", textContent: "Truffled Catalog" }),
              el("div", { className: "store-sub", textContent: "truffled.lol · 500+ Web Games" })
            ]),
            el("button", { className: "btn-play", textContent: "Open", onclick: () => openBrowserWindow("Truffled", "arcade", "https://truffled.lol", true, true) })
          ])
        ]);
        content.appendChild(portalGrid);
        return;
      }

      if (activeTab === "discover") {
        const nameIn = el("input", { placeholder: "Custom Game Title" });
        const urlIn = el("input", { placeholder: "Paste Selenite/Truffled Game URL" });
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
