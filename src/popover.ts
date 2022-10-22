import {delay, eventOptions, getFocusableElements, getUuid, setProperty} from './helpers';
import {Floated, Position, Rects} from './helpers/floated';

type Callbacks = {
	click?: (event: Event) => void;
	keydown?: (event: Event) => void;
};

type Elements = {
	anchor?: HTMLElement;
	floater?: HTMLElement;
};

type Values = {
	anchors: WeakMap<PolitePopover, HTMLElement>;
	click: WeakMap<PolitePopover, (event: Event) => void>;
	connected: WeakMap<PolitePopover, void>;
	floaters: WeakMap<PolitePopover, HTMLElement>;
	keydown: WeakMap<PolitePopover, (event: Event) => void>;
};

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

		if (maxValue <= (left ? window.innerWidth : window.innerHeight)) {
			return defaultValue;
		}

		return minValue < 0
			? defaultValue
			: minValue;
	}

	static initialize(component: PolitePopover, anchor: HTMLElement, floater: HTMLElement): void {
		floater.hidden = true;

		if (!floater.id) {
			floater.setAttribute('id', getUuid());
		}

		anchor.setAttribute('aria-controls', floater.id);
		anchor.setAttribute('aria-expanded', 'false');
		floater.setAttribute('tabindex', '-1');

		anchor.addEventListener('click', Manager.toggle.bind(component), eventOptions.passive);

		Store.add(component, anchor, floater);
	}

	static onClick(event: Event): void {
		if (!(this instanceof PolitePopover) || !this.open) {
			return;
		}

		const {anchor, floater} = Store.getElements(this);

		if (event.target !== anchor
				&& event.target !== floater
				&& !(floater?.contains(event.target as Element) ?? false)) {
			Manager.toggle.call(this, false);
		}
	}

	static onKeydown(event: Event): void {
		if (!(this instanceof PolitePopover)
				|| !this.open
				|| !(event instanceof KeyboardEvent)) {
			return;
		}

		const {anchor, floater} = Store.getElements(this);

		if (typeof anchor === 'undefined' || typeof floater === 'undefined') {
			return;
		}

		if (event.key === 'Escape') {
			Manager.toggle.call(this, false);
		}

		if (event.key !== 'Tab') {
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

		const {anchor, floater} = Store.getElements(this);

		if (typeof anchor === 'undefined' || typeof floater === 'undefined') {
			return;
		}

		const expanded = typeof expand === 'boolean'
			? !expand
			: this.open;

		const {click, keydown} = Store.getCallbacks(this);
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
	private static readonly values: Values = {
		anchors: new WeakMap<PolitePopover, HTMLElement>(),
		click: new WeakMap<PolitePopover, (event: Event) => void>(),
		connected: new WeakMap<PolitePopover, void>(),
		floaters: new WeakMap<PolitePopover, HTMLElement>(),
		keydown: new WeakMap<PolitePopover, (event: Event) => void>(),
	};

	static add(component: PolitePopover, button: HTMLElement, content: HTMLElement): void {
		Store.values.anchors?.set(component, button);
		Store.values.floaters?.set(component, content);

		Store.setCallbacks(component);
	}

	static getCallbacks(component: PolitePopover): Callbacks {
		return {
			click: this.values.click.get(component),
			keydown: this.values.keydown.get(component),
		};
	}

	static getElements(component: PolitePopover): Elements {
		return {
			anchor: this.values.anchors.get(component),
			floater: this.values.floaters.get(component),
		};
	}

	static isConnected(component: PolitePopover): boolean {
		return Store.values.connected.has(component);
	}

	private static setCallbacks(component: PolitePopover): void {
		this.values.click?.set(component, Manager.onClick.bind(component));
		this.values.keydown?.set(component, Manager.onKeydown.bind(component));
	}
}

class PolitePopover extends HTMLElement {
	get button(): HTMLElement | undefined {
		return Store.getElements(this).anchor;
	}

	get content(): HTMLElement | undefined {
		return Store.getElements(this).floater;
	}

	get open(): boolean {
		return this.button?.getAttribute('aria-expanded') === 'true';
	}

	set open(open: boolean) {
		Manager.toggle.call(this, open);
	}

	connectedCallback() {
		if (Store.isConnected(this)) {
			return;
		}

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

	toggle() {
		Manager.toggle.call(this);
	}
}

customElements?.define('polite-popover', PolitePopover);
