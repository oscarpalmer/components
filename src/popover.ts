import {delay, eventOptions, getFocusableElements, getUuid} from './helpers';
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
	floaters: WeakMap<PolitePopover, HTMLElement>;
	keydown: WeakMap<PolitePopover, (event: Event) => void>;
};

const types = ['any'].concat(...['above', 'below'].map(position => [position, `${position}-left`, `${position}-right`]));

class Manager {
	static getPosition(type: string, elements: Rects): Position {
		const left = Manager.getValue(type, ['left', 'right'], elements, true);
		const top = Manager.getValue(type, ['below', 'above'], elements, false);

		if (type !== 'any') {
			return {
				coordinate: {left, top},
				type: ['above', 'below'].includes(type)
					? `??? ${type}-${elements.anchor.left === left ? 'left' : 'right'}`
					: type,
			};
		}

		return {coordinate: {left, top}, type: '???'};
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

	static onClick(event: Event): void {
		if (!(this instanceof PolitePopover)) {
			return;
		}

		const {anchor, floater} = Store.getElements(this);

		if (anchor == null || floater == null || anchor.getAttribute('aria-expanded') !== 'true') {
			return;
		}

		if (event.target !== anchor
				&& event.target !== floater
				&& !(floater?.contains(event.target as Element) ?? false)) {
			Manager.toggle.call(this, false);
		}
	}

	static onKeydown(event: Event): void {
		if (!(this instanceof PolitePopover) || !(event instanceof KeyboardEvent)) {
			return;
		}

		const {anchor, floater} = Store.getElements(this);

		if (anchor == null || floater == null || anchor.getAttribute('aria-expanded') !== 'true') {
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

		if (anchor == null || floater == null) {
			return;
		}

		const expanded = typeof expand === 'boolean'
			? !expand
			: anchor.getAttribute('aria-expanded') === 'true';

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

		anchor.setAttribute('aria-expanded', String(!expanded));

		(expanded ? anchor : (getFocusableElements(floater)[0] ?? floater)).focus();

		Floated.update(
			{anchor, floater, parent: this},
			{all: types, default: 'below'},
			Manager.getPosition,
			() => anchor.getAttribute('aria-expanded') !== 'true');
	}
}

class Store {
	private static readonly values: Values = {
		anchors: new WeakMap<PolitePopover, HTMLElement>(),
		click: new WeakMap<PolitePopover, (event: Event) => void>(),
		floaters: new WeakMap<PolitePopover, HTMLElement>(),
		keydown: new WeakMap<PolitePopover, (event: Event) => void>(),
	};

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

	static remove(component: PolitePopover): void {
		this.values.anchors.delete(component);
		this.values.click.delete(component);
		this.values.floaters.delete(component);
		this.values.keydown.delete(component);
	}

	static setCallbacks(component: PolitePopover): void {
		this.values.click?.set(component, Manager.onClick.bind(component));
		this.values.keydown?.set(component, Manager.onKeydown.bind(component));
	}

	static setElements(component: PolitePopover, button: HTMLElement, content: HTMLElement): void {
		this.values.anchors?.set(component, button);
		this.values.floaters?.set(component, content);
	}
}

class PolitePopover extends HTMLElement {
	get content(): HTMLElement | undefined {
		return Store.getElements(this).floater;
	}

	close() {
		Manager.toggle.call(this, false);
	}

	connectedCallback() {
		const anchor = this.querySelector(':scope > [polite-popover-button]') as HTMLElement | undefined;
		const floater = this.querySelector(':scope > [polite-popover-content]') as HTMLElement | undefined;

		if (anchor == null) {
			throw new Error('a');
		}

		if (!(anchor instanceof HTMLButtonElement) && anchor.getAttribute('role') !== 'button') {
			throw new Error('b');
		}

		if (floater == null) {
			throw new Error('c');
		}

		floater.parentElement?.removeChild(floater);

		floater.hidden = true;

		if (!floater.id) {
			floater.setAttribute('id', getUuid());
		}

		anchor.setAttribute('aria-controls', floater.id);
		anchor.setAttribute('aria-expanded', 'false');
		floater.setAttribute('tabindex', '-1');

		Store.setElements(this, anchor, floater);
		Store.setCallbacks(this);

		anchor.addEventListener('click', Manager.toggle.bind(this), eventOptions.passive);
	}

	disconnectedCallback(): void {
		Store.remove(this);
	}

	open() {
		Manager.toggle.call(this, true);
	}

	toggle() {
		Manager.toggle.call(this);
	}
}

customElements?.define('polite-popover', PolitePopover);
