"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.System = void 0;
const Cpu_1 = require("./hardware/Cpu");
const Memory_1 = require("./hardware/Memory");
const Clock_1 = require("./hardware/Clock");
const Hardware_1 = require("./hardware/Hardware");
const Mmu_1 = require("./hardware/Mmu");
const CLOCK_INTERVAL_MS = 100;
// This System class represents the entire computer system, extending the basic Hardware functionality
class System extends Hardware_1.Hardware {
    // Constructor for the System class, initializing hardware components
    constructor() {
        super(0, 'System');
        this._Memory = new Memory_1.Memory();
        this._MMU = new Mmu_1.Mmu(this._Memory);
        this._Clock = new Clock_1.Clock();
        this._CPU = new Cpu_1.Cpu(this._MMU, () => { this._Clock.stop(); });
    }
    // Public method to start the system
    startSystem() {
        this.log("System started.");
        //hello world program
        let programArray = [0xA2, 0x03, 0xFF, 0x06, 0x00, 0x00, 0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64, 0x21, 0x00];
        for (let i = 0x0000; i < programArray.length; i++) {
            this._MMU.writeImmediate(i, programArray[i]);
        }
        this._Memory.displayMemory(0x0000, 0x000F);
        this._Clock.addClockListener(this._CPU);
        this._Clock.addClockListener(this._Memory);
        this._Memory.debug = false;
        this._CPU.debug = false;
        this._Clock.start(CLOCK_INTERVAL_MS);
        this.log("Clock Pulse Initialized"); // Log clock start (new code to match expected output)
    }
}
exports.System = System;
// The program starts here:
let system = new System();
system.startSystem();
//# sourceMappingURL=System.js.map