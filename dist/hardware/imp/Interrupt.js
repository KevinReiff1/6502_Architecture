"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interrupt = void 0;
const Hardware_1 = require("../Hardware");
class Interrupt extends Hardware_1.Hardware {
    constructor(iqr, priority, id, name) {
        super(id, name);
        this.iqr = iqr;
        this.priority = priority;
        this.name = name;
        this.outputBuffer = 0x00;
    }
}
exports.Interrupt = Interrupt;
//# sourceMappingURL=Interrupt.js.map