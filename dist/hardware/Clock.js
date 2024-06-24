"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clock = void 0;
const Hardware_1 = require("./Hardware");
// The Clock class is responsible for timing and notifying all registered ClockListeners.
class Clock extends Hardware_1.Hardware {
    constructor() {
        super(3, 'Clock');
        this.clockListeners = [];
        this.log("created");
    }
    // Method to add a ClockListener to the array of listeners.
    addClockListener(listener) {
        this.clockListeners.push(listener);
    }
    // Method to start the clock. It sets up an interval timer that triggers pulseAll at regular intervals.
    start(clockInterval) {
        this.clockInterval = setInterval(() => { this.pulseAll(); }, clockInterval);
    }
    // Method to stop the clock. Clears the interval timer.
    stop() {
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
            this.clockInterval = null;
            process.stdout.write('\n'); //force stdout to flush
            process.exit(0);
        }
    }
    // Method called at each interval tick to pulse all registered listeners and log specific events.
    pulseAll() {
        this.clockListeners.forEach(listener => listener.pulse());
    }
}
exports.Clock = Clock;
//# sourceMappingURL=Clock.js.map