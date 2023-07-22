export class PalmerDisclosure extends HTMLElement {
	set open(arg: boolean);
	get open(): boolean;
	readonly button: HTMLButtonElement;
	readonly content: HTMLElement;
	toggle(): void;
}
