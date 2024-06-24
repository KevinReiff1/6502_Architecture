import { Hardware } from "./Hardware";
import { ClockListener } from "./imp/ClockListener";

// The Clock class is responsible for timing and notifying all registered ClockListeners.
export class Clock extends Hardware {
	private clockListeners: ClockListener[] = [];
	private clockInterval: NodeJS.Timeout;

	constructor() {
		super(3, 'Clock');
		this.log("created");
	}

	// Method to add a ClockListener to the array of listeners.
	public addClockListener(listener: ClockListener): void {
		this.clockListeners.push(listener);
	}

	// Method to start the clock. It sets up an interval timer that triggers pulseAll at regular intervals.
	public start(clockInterval: number): void {
		this.clockInterval = setInterval((): void => {this.pulseAll();}, clockInterval);
	}

	// Method to stop the clock. Clears the interval timer.
	public stop(): void {
		if (this.clockInterval) {
			clearInterval(this.clockInterval);
			this.clockInterval = null;
			process.stdout.write('\n');//force stdout to flush
			process.exit(0);
		}
	}

	// Method called at each interval tick to pulse all registered listeners and log specific events.
	private pulseAll(): void {
		this.clockListeners.forEach(listener => listener.pulse());
	}
}