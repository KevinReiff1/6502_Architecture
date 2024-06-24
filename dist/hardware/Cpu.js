"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cpu = void 0;
const Hardware_1 = require("./Hardware");
const InterruptController_1 = require("./InterruptController");
const Ascii_1 = require("../Ascii");
// The Cpu class now implements the ClockListener interface in addition to extending Hardware.
class Cpu extends Hardware_1.Hardware {
    constructor(mmu, onBreak) {
        super(0, 'Cpu');
        this.log("created");
        this.cpuClockCount = 0;
        this.mmu = mmu;
        this.a = 0x00;
        this.x = 0x00;
        this.y = 0x00;
        this.pc = 0x0000;
        this.ir = Opcode.BRK;
        this.operandBuffer1 = 0x00;
        this.operandBuffer2 = 0x00;
        this.aluBuffer = 0x00;
        this.zFlag = false;
        this.onBreak = onBreak;
        this.pipelineStep = 0;
        this.interruptController = new InterruptController_1.InterruptController();
    }
    // The pulse() method as required by the ClockListener interface.
    // It increments the cpuClockCount and logs a message with the current count.
    pulse() {
        this.log(`CPU Clock Count: ${this.cpuClockCount} - PC: 0x${this.pc.toString(16).toUpperCase().padStart(4, '0')} - IR: ${Opcode[this.ir]} - Acc: 0x${this.a.toString(16).toUpperCase().padStart(2, '0')} - xReg: 0x${this.x.toString(16).toUpperCase().padStart(2, '0')} - yReg: 0x${this.y.toString(16).toUpperCase().padStart(2, '0')} - zFlag: ${this.zFlag} - Step: ${this.pipelineStep}`);
        this.cpuClockCount++;
        switch (this.pipelineStep) {
            case 0:
                this.ir = this.fetch();
                this.pipelineStep = this.firstStep();
                break;
            case 1:
                this.decode1();
                break;
            case 2:
                this.decode2();
                break;
            case 3:
                this.execute1();
                break;
            case 4:
                this.execute2();
                break;
            case 5:
                this.writeBack();
                break;
            case 6:
                this.interruptCheck();
                break;
        }
    }
    firstStep() {
        switch (this.ir) {
            case Opcode.TXA:
            case Opcode.TYA:
            case Opcode.TAX:
            case Opcode.TAY:
            case Opcode.BRK:
                return 3;
            case Opcode.LDAc:
            case Opcode.LDXc:
            case Opcode.LDYc:
            case Opcode.BNE:
            case Opcode.LDAm:
            case Opcode.STA:
            case Opcode.ADC:
            case Opcode.LDXm:
            case Opcode.LDYm:
            case Opcode.CPX:
            case Opcode.INC:
                return 1;
            case Opcode.SYS:
                return this.x === 3 ? 1 : 3;
            case Opcode.NOP:
                return 6;
        }
    }
    fetch() {
        this.mmu.setMar(this.pc);
        this.mmu.read();
        this.pc++;
        return this.mmu.getMdr();
    }
    decode1() {
        this.operandBuffer1 = this.fetch();
        this.pipelineStep = 6;
        switch (this.ir) {
            case Opcode.LDAc:
                this.a = this.operandBuffer1;
                break;
            case Opcode.LDXc:
                this.x = this.operandBuffer1;
                break;
            case Opcode.LDYc:
                this.y = this.operandBuffer1;
                break;
            case Opcode.BNE:
                if (this.zFlag) {
                    break;
                }
                if (this.operandBuffer1 >= 0x00 && this.operandBuffer1 < 0x80) {
                    this.pc += this.operandBuffer1;
                }
                else if (this.operandBuffer1 >= 0x80) {
                    this.pc -= (~this.operandBuffer1 & 0xFF) + 1; //two's compliment
                }
                break;
            case Opcode.SYS:
                switch (this.x) {
                    case 0x01:
                        process.stdout.write(`0x${this.y.toString(16).toUpperCase().padStart(2, '0')}`);
                        break;
                    case 0x02:
                        this.operandBuffer1 = this.y;
                        this.pipelineStep = 3;
                        break;
                    case 0x03:
                        this.pipelineStep = 2;
                        break;
                    default:
                        throw new Error(`X register did not contain 1/2/3 for SYS: ${this.x}`);
                }
                break;
            case Opcode.LDAm:
            case Opcode.STA:
            case Opcode.ADC:
            case Opcode.LDXm:
            case Opcode.LDYm:
            case Opcode.CPX:
            case Opcode.INC:
                this.pipelineStep = 2;
                break;
        }
    }
    decode2() {
        this.operandBuffer2 = this.fetch();
        if (this.ir === Opcode.STA) {
            this.mmu.setMdr(this.a);
            this.pipelineStep = 5;
        }
        else {
            this.pipelineStep = 3;
        }
    }
    execute1() {
        this.pipelineStep = 6;
        switch (this.ir) {
            case Opcode.LDAm:
                this.mmu.setMarLow(this.operandBuffer1);
                this.mmu.setMarHigh(this.operandBuffer2);
                this.mmu.read();
                this.a = this.mmu.getMdr();
                break;
            case Opcode.TXA:
                this.a = this.x;
                break;
            case Opcode.TYA:
                this.a = this.y;
                break;
            case Opcode.ADC:
                this.mmu.setMarLow(this.operandBuffer1);
                this.mmu.setMarHigh(this.operandBuffer2);
                this.mmu.read();
                let num = this.mmu.getMdr();
                if (num >= 0x00 && num < 0x80) {
                    this.a += num;
                }
                else if (this.operandBuffer1 >= 0x80) {
                    this.a -= (~num & 0xFF) + 1; //two's compliment
                }
                break;
            case Opcode.LDXm:
                this.mmu.setMarLow(this.operandBuffer1);
                this.mmu.setMarHigh(this.operandBuffer2);
                this.mmu.read();
                this.x = this.mmu.getMdr();
                break;
            case Opcode.TAX:
                this.x = this.a;
                break;
            case Opcode.LDYm:
                this.mmu.setMarLow(this.operandBuffer1);
                this.mmu.setMarHigh(this.operandBuffer2);
                this.mmu.read();
                this.y = this.mmu.getMdr();
                break;
            case Opcode.TAY:
                this.y = this.a;
                break;
            case Opcode.BRK:
                this.onBreak();
                break;
            case Opcode.CPX:
                this.mmu.setMarLow(this.operandBuffer1);
                this.mmu.setMarHigh(this.operandBuffer2);
                this.mmu.read();
                this.zFlag = this.x === this.mmu.getMdr();
                break;
            case Opcode.INC:
                this.mmu.setMarLow(this.operandBuffer1);
                this.mmu.setMarHigh(this.operandBuffer2);
                this.mmu.read();
                this.pipelineStep = 4;
                break;
            case Opcode.SYS:
                switch (this.x) {
                    case 0x02:
                        let charAddr = this.pc;
                        if (this.operandBuffer1 >= 0x00 && this.operandBuffer1 < 0x80) {
                            charAddr += this.operandBuffer1;
                        }
                        else if (this.operandBuffer1 >= 0x80) {
                            charAddr -= (~this.operandBuffer1 & 0xFF) + 1; //two's compliment
                        }
                        this.mmu.setMar(charAddr);
                        this.mmu.read();
                        let val = this.mmu.getMdr();
                        if (val !== 0x00) {
                            process.stdout.write((0, Ascii_1.encode)(val));
                            this.pipelineStep = 3;
                            this.operandBuffer1++;
                        }
                        break;
                    case 0x03:
                        this.mmu.setMarLow(this.operandBuffer1);
                        this.mmu.setMarHigh(this.operandBuffer2);
                        this.mmu.read();
                        let num = this.mmu.getMdr();
                        if (num !== 0x00) {
                            process.stdout.write((0, Ascii_1.encode)(num));
                            this.pipelineStep = 3;
                            this.operandBuffer1++;
                            if (this.operandBuffer1 === 0x00) {
                                this.operandBuffer2++;
                            }
                        }
                        break;
                }
                break;
        }
    }
    execute2() {
        this.aluBuffer = this.mmu.getMdr();
        this.aluBuffer++;
        this.mmu.setMdr(this.aluBuffer);
    }
    writeBack() {
        this.mmu.write();
    }
    interruptCheck() {
        this.pipelineStep = 0;
        let num = this.interruptController.getInterruptBuffer();
        if (num === null) {
            return;
        }
        process.stdout.write((0, Ascii_1.encode)(num));
    }
}
exports.Cpu = Cpu;
var Opcode;
(function (Opcode) {
    Opcode[Opcode["LDAc"] = 169] = "LDAc";
    Opcode[Opcode["LDAm"] = 173] = "LDAm";
    Opcode[Opcode["STA"] = 141] = "STA";
    Opcode[Opcode["TXA"] = 138] = "TXA";
    Opcode[Opcode["TYA"] = 152] = "TYA";
    Opcode[Opcode["ADC"] = 109] = "ADC";
    Opcode[Opcode["LDXc"] = 162] = "LDXc";
    Opcode[Opcode["LDXm"] = 174] = "LDXm";
    Opcode[Opcode["TAX"] = 170] = "TAX";
    Opcode[Opcode["LDYc"] = 160] = "LDYc";
    Opcode[Opcode["LDYm"] = 172] = "LDYm";
    Opcode[Opcode["TAY"] = 168] = "TAY";
    Opcode[Opcode["NOP"] = 234] = "NOP";
    Opcode[Opcode["BRK"] = 0] = "BRK";
    Opcode[Opcode["CPX"] = 236] = "CPX";
    Opcode[Opcode["BNE"] = 208] = "BNE";
    Opcode[Opcode["INC"] = 238] = "INC";
    Opcode[Opcode["SYS"] = 255] = "SYS";
})(Opcode || (Opcode = {}));
//# sourceMappingURL=Cpu.js.map