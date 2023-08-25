export class PalmerColourPicker extends HTMLElement {
	get value(): Value;
	readonly handle: HTMLElement;
	readonly hue: HTMLElement;
	readonly input: HTMLElement;
	readonly well: HTMLElement;
	readonly hsl: HSLColour;
}

export type HSLColour = {
	hue: number;
	saturation: number;
	lightness: number;
};

export type RGBColour = {
	red: number;
	green: number;
	blue: number;
};

export type Value = {
	hex: string;
	hsl: HSLColour;
	rgb: RGBColour;
};
