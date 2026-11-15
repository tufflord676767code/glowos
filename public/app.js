const { ScramjetController } = $scramjetLoadController();
const scramjet = new ScramjetController({
  files: {
    wasm: "/scram/scramjet.wasm.wasm",
    all: "/scram/scramjet.all.js",
    sync: "/scram/scramjet.sync.js"
  }
});
scramjet.init();

const connection = new BareMux.BareMuxConnection("/baremux/worker.js");
let proxyReady = false;

async function ensureProxy() {
  if (proxyReady) return;
  await navigator.serviceWorker.register("/sw.js");
  await connection.setTransport("/bare/index.mjs", [location.origin + "/bare/"]);
  proxyReady = true;
}

const coreApps = [
  { id: "browser", name: "Nova Browser", icon: "🌐", kind: "browser", url: "https://duckduckgo.com" },
  { id: "glow", name: "Glow Chat", icon: "✦", kind: "direct", url: "https://web.app", allowMic: true },
  { id: "arcade", name: "gn-math Arcade", icon: "🎮", kind: "arcade" },
  { id: "studio", name: "Code Studio", icon: "💻", kind: "studio" },
  { id: "settings", name: "Settings", icon: "⚙️", kind: "settings" }
];

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

function renderDesktopAndStart() {
  const desktop = document.getElementById("desktop");
  const startList = document.getElementById("start-list");
  desktop.querySelectorAll(".desktop-icon").forEach(n => n.remove());
  startList.innerHTML = "";

  getAllApps().forEach(app => {
    const iconEl = el("div", { className: "desktop-icon", onclick: () => launchApp(app) }, [
      el("div", { className: "icon-box", textContent: app.icon }),
      el("div", { className: "icon-label", textContent: app.name })
    ]);
    desktop.prepend(iconEl);

    const startItem = el("div", {
      className: "start-item",
      onclick: () => { closeStartMenu(); launchApp(app); }
    }, [
      el("span", { textContent: app.icon }),
      el("span", { textContent: app.name })
    ]);
    startList.appendChild(startItem);
  });
}

let zIndexCounter = 100;
let windowCount = 0;

function focusWindow(win) {
  zIndexCounter++;
  win.style.zIndex = zIndexCounter;
  document.querySelectorAll(".task-pill").forEach(p => p.classList.remove("active"));
  const pill = document.getElementById("pill-" + win.id);
  if (pill) pill.classList.add("active");
}

function createWindow(title, icon, builderFn) {
  windowCount++;
  const winId = "win-" + windowCount;
  const body = el("div", { className: "win-body" });

  const minBtn = el("button", { className: "win-btn", textContent: "_", title: "Minimize", onclick: () => {
    win.style.display = "none";
    pill.classList.remove("active");
  }});
  const maxBtn = el("button", { className: "win-btn", textContent: "□", title: "Maximize", onclick: () => win.classList.toggle("maximized") });
  const closeBtn = el("button", { className: "win-btn close", textContent: "✕", title: "Close", onclick: () => {
    win.remove();
    pill.remove();
  }});

  const header = el("div", { className: "win-header" }, [
    el("div", { className: "win-title" }, [el("span", { textContent: icon }), el("span", { textContent: title })]),
    el("div", { className: "win-controls" }, [minBtn, maxBtn, closeBtn])
  ]);

  const win = el("div", { className: "os-window", id: winId }, [header, body]);
  win.style.top = (28 + (windowCount % 6) * 22) + "px";
  win.style.left = (90 + (windowCount % 6) * 26) + "px";
  win.addEventListener("mousedown", () => focusWindow(win));
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
    win.style.top = Math.max(0, e.clientY - offsetY) + "px";
  });
  window.addEventListener("mouseup", () => { dragging = false; });

  const pill = el("button", {
    className: "task-pill",
    id: "pill-" + winId,
    textContent: `${icon} ${title}`,
    onclick: () => {
      if (win.style.display === "none") win.style.display = "flex";
      focusWindow(win);
    }
  });
  document.getElementById("taskbar-apps").appendChild(pill);

  builderFn(body, win);
  focusWindow(win);
  return win;
}

function launchApp(app) {
  if (app.kind === "browser" || app.kind === "proxy") {
    openBrowserWindow(app.name, app.icon, app.url || "https://duckduckgo.com", true);
  } else if (app.kind === "direct") {
    createWindow(app.name, app.icon, (body) => {
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

function openBrowserWindow(title, icon, initialUrl, useProxy = true) {
  createWindow(title, icon, async (body) => {
    const input = el("input", { type: "text", value: initialUrl, placeholder: "Search or enter URL..." });
    const goBtn = el("button", { type: "submit", textContent: "Go" });
    const form = el("form", { className: "browser-bar" }, [input, goBtn]);
    const iframe = el("iframe", { className: "app-frame", allowFullscreen: true });
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
        await ensureProxy();
        iframe.src = scramjet.encodeUrl(target);
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
  createWindow("gn-math Arcade (Scramjet)", "🎮", async (body) => {
    const searchInput = el("input", { type: "text", placeholder: "Search 850+ gn-math games..." });
    const fullBtn = el("button", {
      textContent: "Open Full gn-math Site",
      onclick: () => openBrowserWindow("gn-math Full Site", "🎮", "https://github.io", true)
    });
    const grid = el("div", { className: "arcade-grid", textContent: "Fetching gn-math catalog via Scramjet..." });
    const wrap = el("div", { className: "arcade-wrap" }, [
      el("div", { className: "arcade-top" }, [searchInput, fullBtn]),
      grid
    ]);
    body.appendChild(wrap);

    let zones = [];
    function render(filter = "") {
      grid.innerHTML = "";
      const matches = zones
        .filter(z => z && z.name && z.id >= 0 && z.name.toLowerCase().includes(filter.toLowerCase()))
        .slice(0, 120);

      if (!matches.length) {
        grid.textContent = "No matching games found.";
        return;
      }

      matches.forEach(game => {
        const coverUrl = resolveGnUrl(game.cover);
        const targetUrl = game.url.startsWith("http") && !game.url.includes("{HTML_URL}")
          ? game.url
          : `https://github.io?id=${game.id}`;

        const img = el("img", {
          src: coverUrl,
          loading: "lazy",
          onerror: () => { img.src = "https://placehold.co"; }
        });
        const card = el("div", {
          className: "game-card",
          onclick: () => openBrowserWindow(game.name, "🕹️", targetUrl, true)
        }, [img, el("div", { textContent: game.name })]);
        grid.appendChild(card);
      });
    }

    searchInput.addEventListener("input", () => render(searchInput.value));

    try {
      await ensureProxy();
      const res = await fetch(scramjet.encodeUrl(GN_ZONES_URL));
      zones = await res.json();
      render();
    } catch (err) {
      grid.innerHTML = "";
      grid.append(
        document.createTextNode("Could not load catalog feed. "),
        el("button", {
          textContent: "Launch gn-math in Scramjet",
          onclick: () => openBrowserWindow("gn-math", "🎮", "https://github.io", true)
        })
      );
    }
  });
}

let pyodideInstance = null;
function openCodeStudioWindow() {
  createWindow("Code Studio", "💻", (body) => {
    const sel = el("select", {}, [
      el("option", { value: "web", textContent: "HTML / CSS / JS" }),
      el("option", { value: "python", textContent: "Python 3 (Pyodide)" })
    ]);
    const runBtn = el("button", { textContent: "▶ Run" });
    const status = el("span", { textContent: "Ready" });
    status.style.cssText = "font-size:12px; color:#94a3b8; margin-left:auto;";

    const edHtml = el("textarea", { className: "studio-ed", value: "<h1>Hello NovaOS!</h1>" });
    const edCss = el("textarea", { className: "studio-ed", value: "body { font-family: sans-serif; color: #38bdf8; background: #0f172a; padding: 16px; }" });
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
          pyodideInstance = await loadPyodide();
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
  createWindow("Settings", "⚙️", (body) => {
    const scName = el("input", { placeholder: "App Name (e.g. YouTube)" });
    const scUrl = el("input", { placeholder: "https://youtube.com" });
    const scIcon = el("input", { placeholder: "Emoji (📺)" });
    scIcon.style.maxWidth = "90px";
    const scBtn = el("button", { textContent: "Pin App", onclick: () => {
      const name = scName.value.trim();
      let url = scUrl.value.trim();
      const icon = scIcon.value.trim() || "🌐";
      if (!name || !url) return;
      if (!url.startsWith("http")) url = "https://" + url;
      const saved = JSON.parse(localStorage.getItem("novaos_shortcuts") || "[]");
      saved.push({ id: "custom-" + Date.now(), name, icon, kind: "proxy", url });
      localStorage.setItem("novaos_shortcuts", JSON.stringify(saved));
      renderDesktopAndStart();
      scName.value = "";
      scUrl.value = "";
    }});

    const wpInput = el("input", { placeholder: "Paste image URL or leave blank..." });
    const wpBtn = el("button", { textContent: "Apply", onclick: () => {
      localStorage.setItem("novaos_wallpaper", wpInput.value.trim());
      applySavedPreferences();
    }});

    const wrap = el("div", { className: "settings-wrap" }, [
      el("div", { className: "setting-card" }, [
        el("h3", { textContent: "Pin Web App Shortcut to Desktop" }),
        el("div", { className: "setting-row" }, [scName, scUrl, scIcon, scBtn])
      ]),
      el("div", { className: "setting-card" }, [
        el("h3", { textContent: "Desktop Wallpaper URL" }),
        el("div", { className: "setting-row" }, [wpInput, wpBtn])
      ]),
      el("div", { className: "setting-card" }, [
        el("h3", { textContent: "Tab Cloak (Disguise Browser Tab)" }),
        el("div", { className: "setting-row" }, [
          el("button", { textContent: "Google Docs", onclick: () => applyCloak("Google Docs", "https://gstatic.com") }),
          el("button", { textContent: "Canvas LMS", onclick: () => applyCloak("Dashboard", "https://cloudfront.net") }),
          el("button", { textContent: "Reset", onclick: () => applyCloak("NovaOS", "") })
        ])
      ])
    ]);
    body.appendChild(wrap);
  });
}

function applyCloak(title, iconUrl) {
  document.title = title;
  if (iconUrl) document.getElementById("favicon").href = iconUrl;
}

function applySavedPreferences() {
  const wp = localStorage.getItem("novaos_wallpaper");
  const desktop = document.getElementById("desktop");
  desktop.style.backgroundImage = wp ? `url('${wp}')` : "radial-gradient(circle at 20% 20%, #1e1b4b 0%, #0f172a 45%, #020617 100%)";
}

function toggleStartMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById("start-menu");
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
}

function closeStartMenu() {
  document.getElementById("start-menu").style.display = "none";
}

document.getElementById("desktop").addEventListener("click", closeStartMenu);
document.getElementById("start-btn").addEventListener("click", toggleStartMenu);

setInterval(() => {
  document.getElementById("clock").textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}, 1000);

applySavedPreferences();
renderDesktopAndStart();
