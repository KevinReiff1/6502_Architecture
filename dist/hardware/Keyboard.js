"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Keyboard = void 0;
const Interrupt_1 = require("./imp/Interrupt");
const Ascii_1 = require("../Ascii");
class Keyboard extends Interrupt_1.Interrupt {
    constructor(ic) {
        super(0, 0, 0, "Keyboard");
        this.interruptController = ic;
        this.monitorKeys();
    }
    monitorKeys() {
        var stdin = process.stdin;
        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding(null);
        stdin.on('data', function (key) {
            let keyPressed = key.toString();
            this.log("Key pressed - " + keyPressed);
            if (key.toString() === '\u0003') {
                process.exit();
            }
            this.outputBuffer = (0, Ascii_1.decode)(keyPressed);
            this.interruptController.acceptInterrupt(this);
        }.bind(this));
    }
}
exports.Keyboard = Keyboard;
//# sourceMappingURL=Keyboard.js.map