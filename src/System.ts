import { Cpu } from "./hardware/Cpu";
import { Memory } from "./hardware/Memory";
import { Clock } from "./hardware/Clock";
import { Hardware } from "./hardware/Hardware";
import {Mmu} from "./hardware/Mmu";

const CLOCK_INTERVAL_MS: number = 100;

// This System class represents the entire computer system, extending the basic Hardware functionality
export class System extends Hardware {
    private _CPU: Cpu;
    private _Memory: Memory;
    private _MMU: Mmu;
    private _Clock: Clock;

    // Constructor for the System class, initializing hardware components
    constructor() {
        super(0, 'System');
        this._Memory = new Memory();
        this._MMU = new Mmu(this._Memory);
        this._Clock = new Clock();
        this._CPU = new Cpu(this._MMU, (): void => {this._Clock.stop();});
    }

    // Public method to start the system
    public startSystem(): void {
        this.log("System started.");
        //hello world program
        let programArray: number[] = [0xA2, 0x03, 0xFF, 0x06, 0x00, 0x00, 0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64, 0x21, 0x00];
        for (let i: number = 0x0000; i < programArray.length; i++) {
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

// The program starts here:
let system: System = new System();
system.startSystem();