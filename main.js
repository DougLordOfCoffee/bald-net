import { app, BrowserWindow, BrowserView, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let win;
const views = new Map();
let activeTabId = null;
const TAB_BAR_HEIGHT = 48;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: { preload: path.join(__dirname, "preload.js") }
  });

  win.loadURL("http://localhost:5173");

  // Handle resizing of BrowserViews when window resizes
  win.on('resize', () => {
    if (activeTabId && views.has(activeTabId)) {
      updateViewBounds(views.get(activeTabId));
    }
  });
}

function updateViewBounds(view) {
  const bounds = win.getContentBounds();
  view.setBounds({
    x: 0,
    y: TAB_BAR_HEIGHT,
    width: bounds.width,
    height: bounds.height - TAB_BAR_HEIGHT
  });
}

function createTab(tabId, url) {
  if (views.has(tabId)) return;

  const view = new BrowserView({
    webPreferences: { sandbox: true }
  });

  // Attach event listeners to the new view
  view.webContents.on("did-navigate", (_, url) => win.webContents.send("url-updated", tabId, url));
  view.webContents.on("did-navigate-in-page", (_, url) => win.webContents.send("url-updated", tabId, url));
  view.webContents.on("page-title-updated", (_, title) => win.webContents.send("title-updated", tabId, title));

  views.set(tabId, view);
  view.webContents.loadURL(url);
  setActiveTab(tabId);
}

function setActiveTab(tabId) {
  if (!views.has(tabId)) return;

  if (activeTabId && views.has(activeTabId)) {
    win.removeBrowserView(views.get(activeTabId));
  }

  const view = views.get(tabId);
  win.setBrowserView(view);
  updateViewBounds(view);
  activeTabId = tabId;
}

/* --- IPC Handlers --- */

ipcMain.on("new-tab", (_, id, url) => createTab(id, url));
ipcMain.on("activate-tab", (_, id) => setActiveTab(id));
ipcMain.on("close-tab", (_, id) => {
  if (views.has(id)) {
    const view = views.get(id);
    win.removeBrowserView(view);
    view.webContents.destroy();
    views.delete(id);
    if (activeTabId === id) activeTabId = null;
  }
});

ipcMain.on("hide-displays", () => {
  if (activeTabId && views.has(activeTabId)) {
    win.removeBrowserView(views.get(activeTabId));
    activeTabId = null;
  }
});

ipcMain.on("navigate", (_, url) => views.get(activeTabId)?.webContents.loadURL(url));
ipcMain.on("refresh-tab", () => views.get(activeTabId)?.webContents.reload());
ipcMain.on("nav-back", () => {
  const wc = views.get(activeTabId)?.webContents;
  if (wc?.canGoBack()) wc.goBack();
});
ipcMain.on("nav-forward", () => {
  const wc = views.get(activeTabId)?.webContents;
  if (wc?.canGoForward()) wc.goForward();
});

app.whenReady().then(createWindow);