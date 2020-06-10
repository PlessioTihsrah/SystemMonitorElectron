const { Tray, screen, Menu, app } = require("electron");
const os = require("os");
const path = require("path");

class AppTray extends Tray {
  constructor(appWindow) {
    super(path.join(__dirname, "logos", "logo_off.png"));
    this.appWindow = appWindow;
    this.on("click", this.handleClick.bind(this));
    const contextMenu = Menu.buildFromTemplate([
      { label: "Open", click: this.handleClick },
      { label: "Quit", click: () => app.quit() },
    ]);
    this.setContextMenu(contextMenu);
  }
  setIconOn(){
    this.setImage(path.join(__dirname, "logos", "logo_on.png"));
  }
  setIconOff(){
    this.setImage(path.join(__dirname, "logos", "logo_off.png"));
  }
  setIconWait(){
    this.setImage(path.join(__dirname, "logos", "logo_standby.png"));
  }

  handleClick = (event, bounds, position) => {
    let { x, y } = position;
    if (os.platform() === "linux") {
      x = screen.getCursorScreenPoint().x;
      y = screen.getCursorScreenPoint().y;
      if (y < 50) {
        y = y - 30;
      } else {
        y = y + 30;
      }
    }
    this.setWindowBounds(x, y);
  };
  setWindowBounds = (x, y) => {
    const { height, width } = this.appWindow.getBounds();
    const xCoord = Math.floor(x - width / 2);
    if (y <= 50) {
      this.appWindow.setContentBounds({
        x: xCoord,
        y: y,
        height,
        width,
      });
    } else {
      this.appWindow.setContentBounds({
        x: xCoord,
        y: y - height,
        height,
        width,
      });
    }
    this.appWindow.show();
  };
}

module.exports = AppTray;
