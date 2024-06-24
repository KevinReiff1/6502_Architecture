// Defines a base class for all hardware components within the system
export abstract class Hardware {
	protected id: number;
	protected name: string;
	public debug: boolean;

	// Constructor to initialize hardware components with an ID and name
	protected constructor(id: number, name: string) {
		this.id = id;
		this.name = name;
		this.debug = true;
	}

	// Method to log messages with a timestamp, but only if debugging is enabled
	protected log(message: string): void {
		if (this.debug) {
			console.log(`[HW - ${this.name} id: ${this.id} - ${Date.now()}]: ${message}`);
		}
	}

	// Method to output numbers as properly formatted uppercase hexadecimal strings
	protected hexLog(number: number, desiredLength: number): void {
		this.log(`[hexValue]: 0x${number.toString(16).toUpperCase().padStart(desiredLength, '0')}`);
	}
}