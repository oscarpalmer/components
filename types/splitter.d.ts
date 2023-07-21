export class PalmerSplitter extends HTMLElement {
	set max(arg: number);
	get max(): number;
	set min(arg: number);
	get min(): number;
	set type(arg: 'horizontal' | 'vertical');
	get type(): 'horizontal' | 'vertical';
	set value(arg: number);
	get value(): number;
	readonly primary: HTMLElement;
	readonly secondary: HTMLElement;
	readonly handle: HTMLElement;
	readonly separator: HTMLElement;
}
