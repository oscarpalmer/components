export class PalmerSwitch extends HTMLElement {
	set checked(arg: boolean);
	get checked(): boolean;
	set disabled(arg: boolean);
	get disabled(): boolean;
	get form(): HTMLFormElement;
	get labels(): NodeList;
	set name(arg: string);
	get name(): string;
	set readonly(arg: boolean);
	get readonly(): boolean;
	get validationMessage(): string;
	get validity(): ValidityState;
	get value(): string;
	get willValidate(): boolean;
	private internals;
	checkValidity(): boolean;
	reportValidity(): boolean;
}
