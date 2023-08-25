export class PalmerDisclosure extends HTMLElement {
	get open(): boolean;
	set open(open: boolean);
	readonly button: HTMLButtonElement;
	readonly content: HTMLElement;
	hide(): void;
	show(): void;
	toggle(): void;
}
