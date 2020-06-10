const si = require("systeminformation");
const os = require("os");
const GetMac = require("getmac");

class SystemDetails {
  constructor() {
    this.generateStaticData();
  }
  async generateStaticData() {
    const cpu = await si.cpu();
    const graphicsData = await si.graphics();
    const system = await si.system();
    const osInfo = await si.osInfo();
    this.manufacturer = system.manufacturer;
    this.model = system.model;
    this.cpuManufacturer = cpu.manufacturer;
    this.cpuBrand = cpu.brand;
    this.threads = cpu.cores;
    this.physicalCores = cpu.physicalCores;
    this.cpuMaxSpeed = cpu.speedmax;
    this.cpuMinSpeed = cpu.speedmin;
    this.graphics = graphicsData.controllers;
    this.platform = osInfo.platform;
    this.distro = osInfo.distro;
    this.release = osInfo.release;
    this.kernel = osInfo.kernel;
    this.arch = osInfo.arch;
    let os = "Linux";
    if (osInfo.platform === "darwin") {
      os = "Macintosh";
    }
    if (osInfo.platform.toLowerCase().includes("win")) {
      os = "Windows";
    }
    this.deviceName = `${system.model} - ${os} ${osInfo.arch} ${osInfo.distro} ${osInfo.release}`.trim();
    this.mac = GetMac.default();
  }

  async getSystemLoad() {
    const { currentload } = await si.currentLoad();
    const { percent } = await si.battery();
    const users = (await si.users()).map(({ user, date, time }) => ({
      name: user,
      login: `${date} ${time}`,
    }));
    const processes = (await si.processes()).list
      .filter(({ user }) => user != "root")
      .map(({ pid, name, state, mem_rss }) => ({
        pid,
        name,
        state,
        mem: mem_rss / 1024,
      }))
      .sort((a, b) => b.mem - a.mem);
    const temperature = await si.cpuTemperature();
    const data = {
      cpuLoad: currentload,
      freeMem: os.freemem(),
      totalMem: os.totalmem(),
      batteryPercentage: percent,
      users,
      processes,
      temperature: temperature.main,
    };
    return data;
  }

  getStaticDetails() {
    return {
      manufacturer: this.manufacturer,
      model: this.model,
      arch: this.arch,
      distro: this.distro,
      release: this.release,
      deviceName: this.deviceName,
      kernel: this.kernel,
      platform: this.platform,
      graphics: this.graphics,
      cpuMinSpeed: this.cpuMinSpeed,
      cpuMaxSpeed: this.cpuMaxSpeed,
      physicalCores: this.physicalCores,
      threads: this.threads,
      cpuBrand: this.cpuBrand,
      cpuManufacturer: this.cpuManufacturer,
    };
  }
}

module.exports = SystemDetails;
