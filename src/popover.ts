import {delay, eventOptions, getFocusableElements, isNullOrWhitespace, setProperty} from './helpers';
import {Floated, Position, Rects} from './helpers/floated';

type Values = {
	anchors: WeakMap<PolitePopover, HTMLElement>;
	click: WeakMap<PolitePopover, (event: Event) => void>;
	floaters: WeakMap<PolitePopover, HTMLElement>;
	keydown: WeakMap<PolitePopover, (event: Event) => void>;
};

let index = 0;

const types = ['any'].concat(...['above', 'below'].map(position => [position, `${position}-left`, `${position}-right`]));

class Manager {
	static getPosition(type: string, elements: Rects): Position {
		const left = Manager.getValue(type, ['left', 'right'], elements, true);
		const top = Manager.getValue(type, ['below', 'above'], elements, false);

		const suffix = elements.anchor.left === left ? 'left' : 'right';

		if (type !== 'any') {
			return {
				coordinate: {left, top},
				type: ['above', 'below'].includes(type)
					? `${type}-${suffix}`
					: type,
			};
		}

		const prefix = elements.anchor.bottom === top ? 'below' : 'above';

		return {
			coordinate: {left, top},
			type: `${prefix}-${suffix}`,
		};
	}

	static getValue(type: string, types: string[], elements: Rects, left: boolean): number {
		const {anchor, floater} = elements;

		const floaterSize = left ? floater.width : floater.height;

		const defaultValue = left ? anchor.left : anchor.bottom;
		const minValue = (left ? anchor.right : anchor.top) - floaterSize;

		if (types.some(t => type.includes(t))) {
			return type.includes(types[0] ?? '_')
				? defaultValue
				: minValue;
		}

		const maxValue = defaultValue + floaterSize;

		if (maxValue <= (left ? globalThis.innerWidth : globalThis.innerHeight)) {
			return defaultValue;
		}

		return minValue < 0
			? defaultValue
			: minValue;
	}

	static initialize(component: PolitePopover, anchor: HTMLElement, floater: HTMLElement): void {
		floater.hidden = true;

		if (isNullOrWhitespace(floater.id)) {
			floater.setAttribute('id', isNullOrWhitespace(component.id)
				? `polite_popover_${index++}`
				: `${component.id}_content`);
		}

		anchor.setAttribute('aria-controls', floater.id);
		anchor.setAttribute('aria-expanded', 'false');
		floater.setAttribute('tabindex', '-1');

		anchor.addEventListener('click', Manager.toggle.bind(component), eventOptions.passive);
	}

	static onClick(event: Event): void {
		if (!(this instanceof PolitePopover) || !this.open) {
			return;
		}

		const anchor = Store.values.anchors.get(this);
		const floater = Store.values.floaters.get(this);

		if (event.target !== anchor && event.target !== floater
				&& !(floater?.contains(event.target as Element) ?? false)) {
			Manager.toggle.call(this, false);
		}
	}

	static onKeydown(event: Event): void {
		if (!(this instanceof PolitePopover) || !this.open || !(event instanceof KeyboardEvent)) {
			return;
		}

		if (event.key === 'Escape') {
			Manager.toggle.call(this, false);
		}

		const floater = Store.values.floaters.get(this);

		if (event.key !== 'Tab' || floater == null) {
			return;
		}

		event.preventDefault();

		const elements = getFocusableElements(floater);

		if (document.activeElement === floater) {
			delay(() => {
				(elements[event.shiftKey ? elements.length - 1 : 0] ?? floater).focus();
			});

			return;
		}

		const index = elements.indexOf(document.activeElement as HTMLElement);

		let element = floater;

		if (index > -1) {
			let position = index + (event.shiftKey ? -1 : 1);

			if (position < 0) {
				position = elements.length - 1;
			} else if (position >= elements.length) {
				position = 0;
			}

			element = elements[position] ?? floater;
		}

		delay(() => {
			element.focus();
		});
	}

	static toggle(expand?: boolean | Event): void {
		if (!(this instanceof PolitePopover)) {
			return;
		}

		const anchor = Store.values.anchors.get(this);
		const floater = Store.values.floaters.get(this);

		if (anchor == null || floater == null) {
			return;
		}

		const expanded = typeof expand === 'boolean'
			? !expand
			: this.open;

		const click = Store.values.click.get(this);
		const keydown = Store.values.keydown.get(this);

		const method = expanded ? 'removeEventListener' : 'addEventListener';

		if (click != null) {
			document[method]('click', click, eventOptions.passive);
		}

		if (keydown != null) {
			document[method]('keydown', keydown, eventOptions.active);
		}

		if (expanded) {
			floater.parentElement?.removeChild(floater);
		} else {
			document.body.appendChild(floater);
		}

		setProperty(anchor, 'aria-expanded', !expanded);

		this.dispatchEvent(new Event('toggle'));

		if (expanded) {
			anchor.focus();

			return;
		}

		let called = false;

		Floated.update(
			{anchor, floater, parent: this},
			{all: types, default: 'below'},
			{
				after() {
					if (called) {
						return;
					}

					called = true;

					delay(() => {
						(getFocusableElements(floater)[0] ?? floater).focus();
					});
				},
				getPosition: Manager.getPosition,
				validate: () => (this as unknown as PolitePopover).open,
			});
	}
}

class Store {
	static readonly values: Values = {
		anchors: new WeakMap<PolitePopover, HTMLElement>(),
		click: new WeakMap<PolitePopover, (event: Event) => void>(),
		floaters: new WeakMap<PolitePopover, HTMLElement>(),
		keydown: new WeakMap<PolitePopover, (event: Event) => void>(),
	};

	static add(component: PolitePopover): void {
		const button = component.querySelector(':scope > [polite-popover-button]');
		const content = component.querySelector(':scope > [polite-popover-content]');

		if (button == null || content == null) {
			return;
		}

		Store.values.anchors?.set(component, button as HTMLElement);
		Store.values.floaters?.set(component, content as HTMLElement);

		Store.values.click?.set(component, Manager.onClick.bind(component));
		Store.values.keydown?.set(component, Manager.onKeydown.bind(component));
	}

	static remove(component: PolitePopover): void {
		const floater = Store.values.floaters.get(component);

		if (floater != null) {
			floater.hidden = true;

			component.appendChild(floater);
		}

		Store.values.anchors.delete(component);
		Store.values.floaters.delete(component);

		Store.values.click.delete(component);
		Store.values.keydown.delete(component);
	}
}

class PolitePopover extends HTMLElement {
	get button(): HTMLElement | undefined {
		return Store.values.anchors.get(this);
	}

	get content(): HTMLElement | undefined {
		return Store.values.floaters.get(this);
	}

	get open(): boolean {
		return this.button?.getAttribute('aria-expanded') === 'true';
	}

	set open(open: boolean) {
		Manager.toggle.call(this, open);
	}

	constructor() {
		super();

		const anchor = this.querySelector(':scope > [polite-popover-button]');
		const floater = this.querySelector(':scope > [polite-popover-content]');

		if (anchor == null
				|| !((anchor instanceof HTMLButtonElement)
				|| (anchor instanceof HTMLElement && anchor.getAttribute('role') === 'button'))) {
			throw new Error('<polite-popover> must have a <button>-element (or button-like element) with the attribute \'polite-popover-button\'');
		}

		if (floater == null
				|| !(floater instanceof HTMLElement)) {
			throw new Error('<polite-popover> must have an element with the attribute \'polite-popover-content\'');
		}

		Manager.initialize(this, anchor, floater);
	}

	connectedCallback(): void {
		Store.add(this);
	}

	disconnectedCallback(): void {
		Store.remove(this);
	}

	toggle(): void {
		Manager.toggle.call(this);
	}
}

customElements?.define('polite-popover', PolitePopover);
