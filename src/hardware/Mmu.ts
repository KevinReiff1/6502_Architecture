import {Hardware} from "./Hardware";
import {Memory} from "./Memory";

export class Mmu extends Hardware {
	//reference to the memory unit
	private _memory: Memory;

	constructor(memory: Memory) {
		super(0, 'Mmu');
		this.log("created");
		this._memory = memory;
	}

	//Functions to be used by the CPU to access memory

	public setMar(addr: number): void {this._memory.setMAR(addr);}
	public setMarHigh(highByte: number): void {this._memory.setMarHigh(highByte);}
	public setMarLow(lowByte: number): void {this._memory.setMarLow(lowByte);}
	public getMdr(): number {return this._memory.getMDR();}
	public setMdr(value: number): void {this._memory.setMDR(value);}
	public read(): void {this._memory.read();}
	public write(): void {this._memory.write();}
	/**Immediately writes a value to memory.*/
	public writeImmediate(addr: number, value: number): void {
		this._memory.setMAR(addr);
		this._memory.setMDR(value);
		this._memory.write();
	}
	/**Immediately writes every value in the array to memory starting at the starting address.*/
	public flashMemory(startAddr: number, values: number[]): void {
		values.forEach((value, i) => {
			this._memory.setMAR(startAddr + i);
			this._memory.setMDR(value);
			this._memory.write();
		});
	}
}