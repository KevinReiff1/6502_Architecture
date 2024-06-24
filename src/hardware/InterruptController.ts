import {Hardware} from "./Hardware";
import PriorityQueue = require("priorityqueuejs");
import {Keyboard} from "./Keyboard";
import {Interrupt} from "./imp/Interrupt";

export class InterruptController extends Hardware {
	devices: Map<number, Interrupt>;
	interrupts: PriorityQueue<{iqr: number, priority: number}>;

	constructor() {
		super(0, "InterruptController");
		//create and keep track of the keyboard in a hash map
		this.devices = new Map();
		let keyboard: Keyboard = new Keyboard(this);
		keyboard.debug = false;
		this.devices.set(keyboard.iqr, keyboard);
		//priority queue to track interrupts
		this.interrupts = new PriorityQueue<{iqr: number; priority: number}>(
			(a: {iqr: number; priority: number}, b: {iqr: number; priority: number}) => {return a.priority - b.priority;}
		);
	}

	//Enqueues the devices iqr and priority. This should be called when the device wants to interrupt the cpu
	acceptInterrupt(device: Interrupt): void {
		this.interrupts.enq({iqr: device.iqr, priority: device.priority});
	}

	//Dequeues and returns the value in the output buffer from the device with the iqr. Returns null if it can't return a number
	getInterruptBuffer(): number {
		try {
			return this.devices.get(this.interrupts.deq().iqr).outputBuffer;
		} catch (error) {
			return null;
		}
	}
}