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
}

function createTab(tabId, url) {
  if (views.has(tabId)) return;

  const view = new BrowserView({
    webPreferences: {
      sandbox: true
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

ipcMain.on("new-tab", (_, tabId, url) => {
  createTab(tabId, url);
});

ipcMain.on("activate-tab", (_, tabId) => {
  setActiveTab(tabId);
});

ipcMain.on("close-tab", (_, tabId) => {
  closeTab(tabId);
});

ipcMain.on("refresh-tab", () => {
  if (activeTabId && views.has(activeTabId)) {
    views.get(activeTabId).webContents.reload();
  }
});

/* ---------- lifecycle ---------- */

app.whenReady().then(createWindow);
