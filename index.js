const electron = require("electron");
const { app, ipcMain, BrowserWindow } = electron;
const AppTray = require("./AppTray");
const Server = require("./Server");
const firebaseApp = require("./firebaseConfig");
let mainWindow;
let tray;
let server;

app.on("ready", function () {
  mainWindow = new BrowserWindow({
    width: 250,
    height: 330,
    frame: false,
    resizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      backgroundThrottling: false,
    },
    alwaysOnTop: true,
    skipTaskbar: true,
  });
  mainWindow.loadFile("./html/index.html");
  mainWindow.on("blur", () => mainWindow.hide());
  tray = new AppTray(mainWindow);
  server = new Server(tray, firebaseApp);
  mainWindow.removeMenu();
  firebaseApp.auth().onAuthStateChanged(function (user) {
    mainWindow.webContents.send("userInfo", user);
  });
});

app.on("before-quit", async (event) => {
  if (server.runnning) {
    event.preventDefault();
    await server.stopServer();
    app.quit();
  }
});

ipcMain.on("send:userInfo", () => {
  const user = firebaseApp.auth().currentUser;
  mainWindow.webContents.send("userInfo", user);
});

ipcMain.on("login", (event, data) => {
  const { email, password } = data;
  firebaseApp
    .auth()
    .signInWithEmailAndPassword(email, password)
    .catch((err) => {
      mainWindow.webContents.send("error", err.code);
    });
});

ipcMain.on("logout", () => {
  firebaseApp.auth().signOut();
});

ipcMain.on("create:server", async () => {
  if (await server.startServer()) {
    tray.setIconWait();
    mainWindow.webContents.send("created:server");
  } else {
    await server.stopServer();
    mainWindow.webContents.send("error", "Server cannot be started");
  }
});

ipcMain.on("stop:server", async () => {
  await server.stopServer();
  tray.setIconOff();
  mainWindow.webContents.send("stopped:server");
});
