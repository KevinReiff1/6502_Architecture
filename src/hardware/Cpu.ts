import { Hardware } from "./Hardware";
import { ClockListener } from "./imp/ClockListener";
import {Mmu} from "./Mmu";
import {InterruptController} from "./InterruptController";
import {encode} from "../Ascii";

// The Cpu class now implements the ClockListener interface in addition to extending Hardware.
export class Cpu extends Hardware implements ClockListener {
    private cpuClockCount: number;
    private mmu: Mmu;
    private a: number;
    private x: number;
    private y: number;
    private pc: number;
    private ir: Opcode;
    private operandBuffer1: number;
    private operandBuffer2: number;
    private aluBuffer: number;
    private zFlag: boolean;
    private onBreak: () => void;
    private pipelineStep: number;
    private interruptController: InterruptController;

    constructor(mmu: Mmu, onBreak: () => void) {
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
        this.interruptController = new InterruptController();
    }

    // The pulse() method as required by the ClockListener interface.
    // It increments the cpuClockCount and logs a message with the current count.
    pulse(): void {
        this.log(
            `CPU Clock Count: ${
                this.cpuClockCount
            } - PC: 0x${
                this.pc.toString(16).toUpperCase().padStart(4, '0')
            } - IR: ${
                Opcode[this.ir]
            } - Acc: 0x${
                this.a.toString(16).toUpperCase().padStart(2, '0')
            } - xReg: 0x${
                this.x.toString(16).toUpperCase().padStart(2, '0')
            } - yReg: 0x${
                this.y.toString(16).toUpperCase().padStart(2, '0')
            } - zFlag: ${
                this.zFlag
            } - Step: ${
                this.pipelineStep
            }`
        );
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

    firstStep(): number {
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
                return this.x === 3? 1 : 3;
            case Opcode.NOP:
                return 6;
        }
    }

    fetch(): number {
        this.mmu.setMar(this.pc);
        this.mmu.read();
        this.pc++;
        return this.mmu.getMdr();
    }

    decode1(): void {
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
                if (this.zFlag) {break;}
                if (this.operandBuffer1 >= 0x00 && this.operandBuffer1 < 0x80) {
                    this.pc += this.operandBuffer1;
                } else if (this.operandBuffer1 >= 0x80) {
                    this.pc -= (~this.operandBuffer1 & 0xFF) + 1;//two's compliment
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

    decode2(): void {
        this.operandBuffer2 = this.fetch();
        if (this.ir === Opcode.STA) {
            this.mmu.setMdr(this.a);
            this.pipelineStep = 5;
        } else {
            this.pipelineStep = 3;
        }
    }

    execute1(): void {
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
                let num: number = this.mmu.getMdr();
                if (num >= 0x00 && num < 0x80) {
                    this.a += num;
                } else if (this.operandBuffer1 >= 0x80) {
                    this.a -= (~num & 0xFF) + 1;//two's compliment
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
                        let charAddr: number = this.pc;
                        if (this.operandBuffer1 >= 0x00 && this.operandBuffer1 < 0x80) {
                            charAddr += this.operandBuffer1;
                        } else if (this.operandBuffer1 >= 0x80) {
                            charAddr -= (~this.operandBuffer1 & 0xFF) + 1;//two's compliment
                        }
                        this.mmu.setMar(charAddr);
                        this.mmu.read();
                        let val: number = this.mmu.getMdr();
                        if (val !== 0x00) {
                            process.stdout.write(encode(val));
                            this.pipelineStep = 3;
                            this.operandBuffer1++;
                        }
                        break;
                    case 0x03:
                        this.mmu.setMarLow(this.operandBuffer1);
                        this.mmu.setMarHigh(this.operandBuffer2);
                        this.mmu.read();
                        let num: number = this.mmu.getMdr();
                        if (num !== 0x00) {
                            process.stdout.write(encode(num));
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

    execute2(): void {
        this.aluBuffer = this.mmu.getMdr();
        this.aluBuffer++;
        this.mmu.setMdr(this.aluBuffer);
    }

    writeBack(): void {
        this.mmu.write();
    }

    interruptCheck(): void {
        this.pipelineStep = 0;
        let num: number = this.interruptController.getInterruptBuffer();
        if (num === null) {return;}
        process.stdout.write(encode(num));
    }
}

enum Opcode {
    LDAc = 0xA9,
    LDAm = 0xAD,
    STA = 0x8D,
    TXA = 0x8A,
    TYA = 0x98,
    ADC = 0x6D,
    LDXc = 0xA2,
    LDXm = 0xAE,
    TAX = 0xAA,
    LDYc = 0xA0,
    LDYm = 0xAC,
    TAY = 0xA8,
    NOP = 0xEA,
    BRK = 0x00,
    CPX = 0xEC,
    BNE = 0xD0,
    INC = 0xEE,
    SYS = 0xFF
}