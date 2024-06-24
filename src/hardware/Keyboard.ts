import {InterruptController} from "./InterruptController";
import {Interrupt} from "./imp/Interrupt";
import {decode} from "../Ascii";

export class Keyboard extends Interrupt {
	iqr: number;
	name: string;
	outputBuffer: number;
	priority: number;
	interruptController: InterruptController;

	constructor(ic: InterruptController) {
		super(0, 0, 0, "Keyboard");
		this.interruptController = ic;
		this.monitorKeys();
	}

	private monitorKeys() {
		var stdin = process.stdin;
		stdin.setRawMode( true );
		stdin.resume();
		stdin.setEncoding(null);
		stdin.on('data', function(key: {toString: () => String;}): void {
			let keyPressed: String = key.toString();
			this.log("Key pressed - " + keyPressed);
			if (key.toString() === '\u0003') {
				process.exit();
			}
			this.outputBuffer = decode(keyPressed);
			this.interruptController.acceptInterrupt(this);
		}.bind(this));
	}
}

