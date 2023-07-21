export class PalmerDisclosure extends HTMLElement {
	set open(arg: boolean);
	get open(): boolean;
	readonly button: HTMLElement;
	readonly content: HTMLElement;
	toggle(): void;
}
