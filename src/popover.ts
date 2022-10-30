import {delay, eventOptions, getFocusableElements, isNullOrWhitespace, setAttribute, setProperty} from './helpers';
import {Floated, Position, Rects} from './helpers/floated';
import {attribute} from './focus-trap';

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
			setAttribute(floater, 'id', isNullOrWhitespace(component.id)
				? `polite_popover_${index++}`
				: `${component.id}_content`);
		}

		setAttribute(anchor, 'aria-controls', floater.id);
		setProperty(anchor, 'aria-expanded', false);

		setAttribute(floater, 'role', 'dialog');
		setAttribute(floater, attribute, '');
		setProperty(floater, 'aria-modal', true);

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
		if ((this instanceof PolitePopover) && this.open && (event instanceof KeyboardEvent) && event.key === 'Escape') {
			Manager.toggle.call(this, false);
		}
	}

	static toggle(expand?: boolean | Event): void {
		if (!(this instanceof PolitePopover)) {
			return;
		}

		const anchor = Store.values.anchors.get(this);
		const floater = Store.values.floaters.get(this);

		if (anchor != null && floater != null) {
			Manager.handleToggle(this, anchor, floater, expand);
		}
	}

	private static handleCallbacks(component: PolitePopover, add: boolean): void {
		const click = Store.values.click.get(component);
		const keydown = Store.values.keydown.get(component);

		const method = add ? 'addEventListener' : 'removeEventListener';

		if (click != null) {
			document[method]('click', click, eventOptions.passive);
		}

		if (keydown != null) {
			document[method]('keydown', keydown, eventOptions.active);
		}
	}

	private static handleToggle(component: PolitePopover, anchor: HTMLElement, floater: HTMLElement, expand?: boolean | Event): void {
		const expanded = typeof expand === 'boolean'
			? !expand
			: component.open;

		Manager.handleCallbacks(component, !expanded);

		floater.hidden = expanded;

		setProperty(anchor, 'aria-expanded', !expanded);

		component.dispatchEvent(new Event('toggle'));

		if (expanded) {
			anchor.focus();

			return;
		}

		let called = false;

		Floated.update(
			{anchor, floater, parent: component},
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
				validate: () => component.open,
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

globalThis.customElements.define('polite-popover', PolitePopover);
