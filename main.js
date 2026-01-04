const { app, BrowserWindow } = require("electron");
const path = require("path");
const { BrowserView } = require("electron");
const { ipcMain } = require("electron");

let win;
let views = [];

function createTab(url) {
  const view = new BrowserView({
    webPreferences: {
      sandbox: true
    }
  });


  win.setBrowserView(view);
  view.setBounds({ x: 0, y: 60, width: 1200, height: 740 });
  view.webContents.loadURL(url);
  
    views.push(view);
  return views.length - 1;
}

app.whenReady().then(() => {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadURL("http://localhost:5173"); // dev
});

ipcMain.on("new-tab", (_, url) => {
  createTab(url);
});
