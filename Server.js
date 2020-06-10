const express = require("express");
const helmet = require("helmet");
const socketio = require("socket.io");
const ngrok = require("ngrok");
const SystemDetails = require("./SystemDetails");
const CryptoJS = require("crypto-js");

class Server {
  running = false;
  server;
  io;
  port;
  url;
  tray;
  firebase;
  constructor(tray, firebase) {
    this.systemDetails = new SystemDetails();
    this.tray = tray;
    this.firebase = firebase;
  }
  getName() {
    return this.systemDetails.deviceName;
  }
  getMac() {
    return this.systemDetails.mac;
  }
  startServer() {
    return new Promise(async (resolve) => {
      if (this.running) {
        resolve(true);
      } else {
        const app = express();
        app.use(helmet());
        this.server = app.listen();
        this.port = this.server.address().port;
        this.io = socketio(this.server);
        this.io.origins(["https://sys-monitor.now.sh:443"]);
        this.url = await ngrok.connect({
          addr: this.port,
          binPath: path => path.replace("app.asar", "app.asar.unpacked"),
        });
        this.running = true;
        this.io.on("connect", this.socketListener);
        const uid = this.firebase.auth().currentUser.uid;
        this.firebase
          .database()
          .ref(`users/${uid}/machines`)
          .update(
            { [this.getMac()]: { url: this.url, name: this.getName() } },
            (err) => {
              if (err) {
                resolve(false);
              } else {
                resolve(true);
              }
            }
          );
      }
    });
  }
  stopServer() {
    return new Promise(async (resolve) => {
      if (this.running) {
        this.io.close();
        this.server.close();
        this.io = null;
        this.server = null;
        this.running = false;
        await ngrok.kill();
        this.url = null;
        const uid = this.firebase.auth().currentUser.uid;
        this.firebase
          .database()
          .ref(`users/${uid}/machines/${this.getMac()}`)
          .remove();
        resolve(true);
      } else {
        resolve(true);
      }
    });
  }

  verifyConnection = (requester) => {
    if (!requester) {
      return false;
    }
    return new Promise((resolve) => {
      const uid = this.firebase.auth().currentUser.uid;
      const dbRef = this.firebase
        .database()
        .ref(`users/${uid}/machines/${this.getMac()}/auth`);
      dbRef.once("value").then((snapshot) => {
        const authData = snapshot.val();
        dbRef.remove();
        if (
          authData &&
          authData.requester === requester &&
          new Date() - new Date(authData.time) < 30000
        ) {
          //30 seconds to connect
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  };

  socketListener = async (socket) => {
    if (Object.keys(this.io.sockets.sockets).length > 1) {
      socket.disconnect();
    } else {
      const { requester } = socket.handshake.query;
      const validRequest = await this.verifyConnection(requester);
      if (validRequest) {
        const systemData = this.encryptData(
          this.systemDetails.getStaticDetails(),
          requester
        );
        socket.emit("systemData", systemData); //send info about the machine on connection
        this.tray.setIconOn();
        const interval = setInterval(async () => {
          const data = this.encryptData(
            await this.systemDetails.getSystemLoad(),
            requester
          );
          socket.emit("data", data);
        }, 5000);
        socket.on("disconnect", () => {
          clearInterval(interval);
          this.tray.setIconWait();
          socket.disconnect();
        });
      } else {
        socket.disconnect();
      }
    }
  };
  encryptData = (data, token) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), token).toString();
  };
}

module.exports = Server;
