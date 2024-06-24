"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Memory = void 0;
const Hardware_1 = require("./Hardware");
// The Memory class extends Hardware and implements the ClockListener interface.
class Memory extends Hardware_1.Hardware {
    constructor() {
        super(2, 'Memory');
        this.memory = new Array(0x10000);
        this.reset();
        this.log("Memory has been initialized. Addressable space: 0x0000 - 0xFFFF");
    }
    // Method to handle clock pulses as required by the ClockListener interface.
    pulse() {
        this.log("received clock pulse");
    }
    // Function to display the contents of the memory from address 0x00 to 0x14
    displayMemory(startAddress, endAddress) {
        this.log("Memory Dump -----------------------------");
        for (; startAddress <= endAddress; startAddress++) {
            if (startAddress >= this.memory.length) {
                this.hexLog(startAddress, 4);
                this.log(`Address : 0x${startAddress} Contains Value: ERR [hexValue conversion]: number undefined`);
                break;
            }
            const value = this.memory[startAddress];
            //this.hexLog(startAddress, 4);
            this.log(`Address: 0x${startAddress.toString(16).toUpperCase().padStart(4, '0')} | Value: 0x${value.toString(16).toUpperCase().padStart(2, '0')}`);
        }
        this.log("End of Memory Dump ----------------------");
    }
    reset() {
        this.mdr = 0x00;
        this.mar = 0x0000;
        this.memory.fill(0x00);
    }
    getMDR() { return this.mdr; }
    setMDR(value) { this.mdr = value; }
    setMAR(address) { this.mar = address; }
    setMarHigh(highByte) { this.mar = (this.mar & 0xFF) | ((highByte & 0xFF) << 8); }
    setMarLow(lowByte) { this.mar = (this.mar & 0xFF00) | (lowByte & 0xFF); }
    read() { this.mdr = this.memory[this.mar]; }
    write() { this.memory[this.mar] = this.mdr; }
}
exports.Memory = Memory;
//# sourceMappingURL=Memory.js.map