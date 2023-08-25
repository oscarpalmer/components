export class PalmerDialog extends HTMLElement {
	get alert(): boolean;
	get open(): boolean;
	set open(open: boolean);
	hide(): void;
	show(): void;
}
