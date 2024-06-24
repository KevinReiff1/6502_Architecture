"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterruptController = void 0;
const Hardware_1 = require("./Hardware");
const PriorityQueue = require("priorityqueuejs");
const Keyboard_1 = require("./Keyboard");
class InterruptController extends Hardware_1.Hardware {
    constructor() {
        super(0, "InterruptController");
        //create and keep track of the keyboard in a hash map
        this.devices = new Map();
        let keyboard = new Keyboard_1.Keyboard(this);
        keyboard.debug = false;
        this.devices.set(keyboard.iqr, keyboard);
        //priority queue to track interrupts
        this.interrupts = new PriorityQueue((a, b) => { return a.priority - b.priority; });
    }
    //Enqueues the devices iqr and priority. This should be called when the device wants to interrupt the cpu
    acceptInterrupt(device) {
        this.interrupts.enq({ iqr: device.iqr, priority: device.priority });
    }
    //Dequeues and returns the value in the output buffer from the device with the iqr. Returns null if it can't return a number
    getInterruptBuffer() {
        try {
            return this.devices.get(this.interrupts.deq().iqr).outputBuffer;
        }
        catch (error) {
            return null;
        }
    }
}
exports.InterruptController = InterruptController;
//# sourceMappingURL=InterruptController.js.map