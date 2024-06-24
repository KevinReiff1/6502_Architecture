import {Hardware} from "../Hardware";

export abstract class Interrupt extends Hardware {
	iqr: number;
	priority: number;
	name: string;
	outputBuffer: number;

	protected constructor(iqr: number, priority: number, id: number, name: string) {
		super(id, name);
		this.iqr = iqr;
		this.priority = priority;
		this.name = name;
		this.outputBuffer = 0x00;
	}
}