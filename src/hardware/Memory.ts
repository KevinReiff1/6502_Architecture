import { Hardware } from "./Hardware";
import { ClockListener } from "./imp/ClockListener";

// The Memory class extends Hardware and implements the ClockListener interface.
export class Memory extends Hardware implements ClockListener {
	private memory: number[];
	private mar: number;
	private mdr: number;

	constructor() {
		super(2, 'Memory');
		this.memory = new Array(0x10000);
		this.reset();
		this.log("Memory has been initialized. Addressable space: 0x0000 - 0xFFFF");
	}

	// Method to handle clock pulses as required by the ClockListener interface.
	pulse(): void {
		this.log("received clock pulse");
	}

	// Function to display the contents of the memory from address 0x00 to 0x14
	public displayMemory(startAddress: number, endAddress: number): void {
		this.log("Memory Dump -----------------------------");
		for (; startAddress <= endAddress; startAddress++) {
			if (startAddress >= this.memory.length) {
				this.hexLog(startAddress, 4);
				this.log(`Address : 0x${startAddress} Contains Value: ERR [hexValue conversion]: number undefined`);
				break;
			}
			const value: number = this.memory[startAddress];
			//this.hexLog(startAddress, 4);
			this.log(`Address: 0x${startAddress.toString(16).toUpperCase().padStart(4, '0')} | Value: 0x${value.toString(16).toUpperCase().padStart(2, '0')}`);
		}
		this.log("End of Memory Dump ----------------------");
	}

	public reset(): void {
		this.mdr = 0x00;
		this.mar = 0x0000;
		this.memory.fill(0x00);
	}
	public getMDR(): number {return this.mdr;}
	public setMDR(value: number): void {this.mdr = value;}
	public setMAR(address: number): void {this.mar = address;}
	public setMarHigh(highByte: number): void {this.mar = (this.mar & 0xFF) | ((highByte & 0xFF) << 8);}
	public setMarLow(lowByte: number): void {this.mar = (this.mar & 0xFF00) | (lowByte & 0xFF);}
	public read(): void {this.mdr = this.memory[this.mar];}
	public write(): void {this.memory[this.mar] = this.mdr;}
}