import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { app, BrowserWindow, BrowserView, ipcMain } from 'electron';
import path from 'path';

/* ---------- WINDOW & TAB MANAGEMENT ---------- */

let win;
const views = new Map();
let activeTabId = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadURL("http://localhost:5173");

    win.webContents.once("did-finish-load", () => {
        createTab("dome", "https://the-bald-chat.web.app");
        createTab("astrominer", "https://randydomke.github.io/Astrominer");
    });

    view.webContents.on("did-navigate", (_, url) => {
        win.webContents.send("url-updated", tabId, url);
    });

    view.webContents.on("did-navigate-in-page", (_, url) => {
        win.webContents.send("url-updated", tabId, url);
    });

    view.webContents.on("page-title-updated", (_, title) => {
      win.webContents.send("title-updated", tabId, title);
    });
}

function createTab(tabId, url) {
  if (views.has(tabId)) return;

  const view = new BrowserView({
    webPreferences: {
      sandbox:
       true
    }
  });

  views.set(tabId, view);

  view.webContents.loadURL(url);
  setActiveTab(tabId);
}

function setActiveTab(tabId) {
  if (!views.has(tabId)) return;

  // remove old view
  if (activeTabId && views.has(activeTabId)) {
    win.removeBrowserView(views.get(activeTabId));
  }

  const view = views.get(tabId);
  win.setBrowserView(view);

  // match your UI layout
  const bounds = win.getContentBounds();
  view.setBounds({
    x: 0,
    y: 48, // tab bar height — adjust if needed
    width: bounds.width,
    height: bounds.height - 48
  });

  view.setAutoResize({ width: true, height: true });

  activeTabId = tabId;
}

function closeTab(tabId) {
  if (!views.has(tabId)) return;

  const view = views.get(tabId);
  win.removeBrowserView(view);
  view.destroy();
  views.delete(tabId);

  if (activeTabId === tabId) {
    activeTabId = null;
  }
}

/* ---------- IPC ---------- */

ipcMain.on("hide-displays", () => {
  if (activeTabId && views.has(activeTabId)) {
    win.removeBrowserView(views.get(activeTabId));
    activeTabId = null;
  }
});

//^display vs. no display tab management

ipcMain.on("new-tab", (_, tabId, url) => {
  createTab(tabId, url);
});

ipcMain.on("activate-tab", (_, tabId) => {
  setActiveTab(tabId);
});

ipcMain.on("close-tab", (_, tabId) => {
  closeTab(tabId);
});

ipcMain.on("nav-back", () => {
  const v = views.get(activeTabId);
  if (v?.webContents.navigationHistory.canGoBack()) {
    v.webContents.navigationHistory.goBack();
  }
});

ipcMain.on("nav-forward", () => {
  const v = views.get(activeTabId);
  if (v?.webContents.navigationHistory.canGoForward()) {
    v.webContents.navigationHistory.goForward();
  }
});

ipcMain.on("refresh-tab", () => {
  const v = views.get(activeTabId);
  v?.webContents.reload();
});

ipcMain.on("navigate", (_, url) => {
  const v = views.get(activeTabId);
  v?.webContents.loadURL(url);
});


/* ---------- lifecycle ---------- */

app.whenReady().then(createWindow);
