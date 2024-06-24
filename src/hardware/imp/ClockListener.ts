//event listener for receiving pulses from the system clock
export interface ClockListener {
	pulse(): void;
}