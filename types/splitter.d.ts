export class PalmerSplitter extends HTMLElement {
	get max(): number;
	set max(max: number);
	get min(): number;
	set min(min: number);
	get type(): 'horizontal' | 'vertical';
	set type(type: 'horizontal' | 'vertical');
	get value(): number;
	set value(value: number);
	readonly primary: HTMLElement;
	readonly secondary: HTMLElement;
	readonly handle: HTMLElement;
	readonly separator: HTMLElement;
}
