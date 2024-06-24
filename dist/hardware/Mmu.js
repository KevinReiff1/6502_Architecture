"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mmu = void 0;
const Hardware_1 = require("./Hardware");
class Mmu extends Hardware_1.Hardware {
    constructor(memory) {
        super(0, 'Mmu');
        this.log("created");
        this._memory = memory;
    }
    //Functions to be used by the CPU to access memory
    setMar(addr) { this._memory.setMAR(addr); }
    setMarHigh(highByte) { this._memory.setMarHigh(highByte); }
    setMarLow(lowByte) { this._memory.setMarLow(lowByte); }
    getMdr() { return this._memory.getMDR(); }
    setMdr(value) { this._memory.setMDR(value); }
    read() { this._memory.read(); }
    write() { this._memory.write(); }
    /**Immediately writes a value to memory.*/
    writeImmediate(addr, value) {
        this._memory.setMAR(addr);
        this._memory.setMDR(value);
        this._memory.write();
    }
    /**Immediately writes every value in the array to memory starting at the starting address.*/
    flashMemory(startAddr, values) {
        values.forEach((value, i) => {
            this._memory.setMAR(startAddr + i);
            this._memory.setMDR(value);
            this._memory.write();
        });
    }
}
exports.Mmu = Mmu;
//# sourceMappingURL=Mmu.js.map