"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hardware = void 0;
// Defines a base class for all hardware components within the system
class Hardware {
    // Constructor to initialize hardware components with an ID and name
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.debug = true;
    }
    // Method to log messages with a timestamp, but only if debugging is enabled
    log(message) {
        if (this.debug) {
            console.log(`[HW - ${this.name} id: ${this.id} - ${Date.now()}]: ${message}`);
        }
    }
    // Method to output numbers as properly formatted uppercase hexadecimal strings
    hexLog(number, desiredLength) {
        this.log(`[hexValue]: 0x${number.toString(16).toUpperCase().padStart(desiredLength, '0')}`);
    }
}
exports.Hardware = Hardware;
//# sourceMappingURL=Hardware.js.map