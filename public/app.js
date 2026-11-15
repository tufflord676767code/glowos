const APP_ICONS = {
  browser: `<svg viewBox="0 0 64 64" width="34" height="34"><defs><linearGradient id="ret" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient></defs><rect x="6" y="6" width="52" height="52" rx="14" fill="url(#ret)"/><circle cx="32" cy="32" r="16" fill="none" stroke="#fff" stroke-width="3.5"/><circle cx="32" cy="32" r="7" fill="#fff"/><circle cx="35" cy="29" r="2.2" fill="#2563eb"/></svg>`,
  glow: `<svg viewBox="0 0 64 64" width="34" height="34"><defs><linearGradient id="msg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4ade80"/><stop offset="100%" stop-color="#16a34a"/></linearGradient></defs><rect x="6" y="6" width="52" height="52" rx="14" fill="url(#msg)"/><path d="M32 16 C20.5 16 12 22.8 12 31.2 C12 35.8 14.8 39.8 19.2 42.5 L16.5 49 L24.5 45.2 C26.9 45.9 29.4 46.3 32 46.3 C43.5 46.3 52 39.5 52 31.2 C52 22.8 43.5 16 32 16 Z" fill="#fff"/></svg>`,
  arcade: `<svg viewBox="0 0 64 64" width="34" height="34"><defs><linearGradient id="arc" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#10b981"/><stop offset="100%" stop-color="#059669"/></linearGradient></defs><rect x="6" y="14" width="52" height="36" rx="14" fill="url(#arc)"/><path d="M22 25 v14 M15 32 h14" stroke="#fff" stroke-width="4" stroke-linecap="round"/><circle cx="43" cy="28" r="3" fill="#fff"/><circle cx="49" cy="34" r="3" fill="#fff"/></svg>`,
  studio: `<svg viewBox="0 0 64 64" width="34" height="34"><path d="M46 8 L56 13 V51 L46 56 L22 36 L12 44 L8 40 L18 32 L8 24 L12 20 L22 28 Z" fill="#007acc"/><path d="M46 8 L56 13 V51 L46 56 V8 Z" fill="#1f9cf0"/><path d="M46 20 L31 32 L46 44 V20 Z" fill="#060b19"/></svg>`,
  settings: `<svg viewBox="0 0 64 64" width="34" height="34"><defs><linearGradient id="set" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#475569"/></linearGradient></defs><circle cx="32" cy="32" r="26" fill="url(#set)"/><circle cx="32" cy="32" r="10" fill="none" stroke="#fff" stroke-width="5"/><path d="M32 10 v6 M32 48 v6 M10 32 h6 M48 32 h6 M17 17 l4 4 M43 43 l4 4 M47 17 l-4 4 M21 43 l-4 4" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`
};

const coreApps = [
  { id: "browser", name: "Retina", svg: APP_ICONS.browser, kind: "browser", url: "https://duckduckgo.com" },
  { id: "glow", name: "Glow Chat", svg: APP_ICONS.glow, kind: "direct", url: "https://web.app", allowMic: true },
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
    await connection.setTransport("/bare/index.mjs", [location.origin + "/bare/"]);
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
    openBrowserWindow(app.name, app.id, app.url || "https://duckduckgo.com", true);
  } else if (app.kind === "direct") {
    createWindow(app.name, app.id, (body) => {
      const iframe = el("iframe", { className: "app-frame", src: app.url });
      iframe.style.background = "#090d16";
      if (app.allowMic) iframe.allow = "microphone; autoplay; clipboard-read; clipboard-write";
      body.appendChild(iframe);
    });
  } else if (app.kind === "arcade") {
    openGnMathArcade();
  } else if (app.kind === "studio") {
    openCodeStudioWindow();
  } else if (app.kind === "settings") {
    openSettingsWindow();
  }
}
function openBrowserWindow(title, appId, initialUrl, useProxy = true) {
  createWindow(title, appId, async (body) => {
    const backBtn = el("button", { type: "button", textContent: "◀", onclick: () => { try { iframe.contentWindow.history.back(); } catch {} } });
    const reloadBtn = el("button", { type: "button", textContent: "↻", onclick: () => navigate(input.value) });
    const input = el("input", { type: "text", value: initialUrl, placeholder: "Search or enter website name" });
    const goBtn = el("button", { type: "submit", textContent: "Go" });
    const form = el("form", { className: "browser-bar" }, [backBtn, reloadBtn, input, goBtn]);
    const iframe = el("iframe", { className: "app-frame", allowFullscreen: true });
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

const GN_ZONES_URL = "https://jsdelivr.net";
const GN_COVERS_BASE = "https://jsdelivr.net";
const GN_HTML_BASE = "https://jsdelivr.net";

function resolveGnUrl(rawUrl) {
  if (!rawUrl) return "https://github.io";
  return rawUrl.replace("{COVER_URL}", GN_COVERS_BASE).replace("{HTML_URL}", GN_HTML_BASE);
}

function openGnMathArcade() {
  createWindow("Games", "arcade", async (body) => {
    const searchInput = el("input", { type: "text", placeholder: "Search 850+ games..." });
    const fullBtn = el("button", {
      textContent: "Open Full Portal",
      onclick: () => openBrowserWindow("Games Portal", "browser", "https://github.io", true)
    });
    const grid = el("div", { className: "arcade-grid", textContent: "Loading games..." });
    body.appendChild(el("div", { className: "arcade-wrap" }, [
      el("div", { className: "arcade-top" }, [searchInput, fullBtn]),
      grid
    ]));

    let zones = [];
    function render(filter = "") {
      grid.innerHTML = "";
      const matches = zones
        .filter(z => z && z.name && Number(z.id) >= 0 && z.name.toLowerCase().includes(filter.toLowerCase()))
        .slice(0, 150);

      if (!matches.length) {
        grid.textContent = "No matching games found.";
        return;
      }

      matches.forEach(game => {
        const coverUrl = resolveGnUrl(game.cover);
        const targetUrl = `https://github.io?id=${game.id}`;
        const img = el("img", {
          src: coverUrl,
          loading: "lazy",
          onerror: () => { img.src = "https://placehold.co"; }
        });
        const card = el("div", {
          className: "game-card",
          onclick: () => openBrowserWindow(game.name, "arcade", targetUrl, true)
        }, [img, el("div", { textContent: game.name })]);
        grid.appendChild(card);
      });
    }

    searchInput.addEventListener("input", () => render(searchInput.value));

    try {
      const res = await fetch(GN_ZONES_URL);
      zones = await res.json();
      render();
    } catch (err) {
      grid.innerHTML = "";
      grid.append(
        document.createTextNode("Catalog feed blocked on this network. "),
        el("button", {
          textContent: "Open Games via Proxy",
          onclick: () => openBrowserWindow("Games", "arcade", "https://github.io", true)
        })
      );
    }
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

document.getElementById("menu-browser").onclick = () => openBrowserWindow("Retina", "browser", "https://duckduckgo.com", true);
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
