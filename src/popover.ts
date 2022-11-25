import {delay, eventOptions, findParent, getFocusableElements, isNullOrWhitespace, setAttribute, setProperty} from './helpers';
import {Floated} from './helpers/floated';
import {attribute} from './focus-trap';

type Callbacks = {
	click: (event: Event) => void;
	keydown: (event: Event) => void;
};

type Elements = {
	anchor: HTMLElement;
	floater: HTMLElement;
};

let index = 0;

class Manager {
	static initialize(component: PolitePopover, anchor: HTMLElement, floater: HTMLElement): void {
		floater.hidden = true;

		if (isNullOrWhitespace(component.id)) {
			setAttribute(component, 'id', `polite_popover_${index++}`);
		}

		if (isNullOrWhitespace(anchor.id)) {
			setAttribute(anchor, 'id', `${component.id}_button`);
		}

		if (isNullOrWhitespace(floater.id)) {
			setAttribute(floater, 'id', `${component.id}_content`);
		}

		setAttribute(anchor, 'aria-controls', floater.id);
		setProperty(anchor, 'aria-expanded', false);
		setAttribute(anchor, 'aria-haspopup', 'dialog');

		setAttribute(floater, attribute, '');
		setAttribute(floater, 'role', 'dialog');
		setAttribute(floater, 'aria-modal', 'false');

		anchor.addEventListener('click', Manager.toggle.bind(component), eventOptions.passive);
	}

	static onClick(event: Event): void {
		if ((this instanceof PolitePopover) && this.open) {
			Manager.handleGlobalEvent(event, this, event.target as never);
		}
	}

	static onKeydown(event: Event): void {
		if ((this instanceof PolitePopover) && this.open && (event instanceof KeyboardEvent) && event.key === 'Escape') {
			Manager.handleGlobalEvent(event, this, document.activeElement as never);
		}
	}

	static toggle(expand?: boolean | Event): void {
		const elements = this instanceof PolitePopover
			? Store.elements.get(this)
			: null;

		if (elements != null) {
			Manager.handleToggle(this as never, elements, expand);
		}
	}

	private static afterToggle(component: PolitePopover, elements: Elements, active: boolean): void {
		Manager.handleCallbacks(component, active);

		if (active) {
			(getFocusableElements(elements.floater)?.[0] ?? elements.floater).focus();
		} else {
			elements.anchor.focus();
		}
	}

	private static handleCallbacks(component: PolitePopover, add: boolean): void {
		const callbacks = Store.callbacks.get(component);

		if (callbacks == null) {
			return;
		}

		const method = add
			? 'addEventListener'
			: 'removeEventListener';

		document[method]('click', callbacks.click, eventOptions.passive);
		document[method]('keydown', callbacks.keydown, eventOptions.passive);
	}

	private static handleGlobalEvent(event: Event, component: PolitePopover, target: HTMLElement): void {
		const elements = Store.elements.get(component);

		if (elements == null) {
			return;
		}

		const floater = findParent(target, '[polite-popover-content]');

		if (floater == null) {
			this.handleToggle(component, elements, false);

			return;
		}

		event.stopPropagation();

		const children = Array.from(document.body.children);
		const difference = children.indexOf(floater) - children.indexOf(elements.floater);

		if (difference < (event instanceof KeyboardEvent ? 1 : 0)) {
			Manager.handleToggle(component, elements, false);
		}
	}

	private static handleToggle(component: PolitePopover, elements: Elements, expand?: boolean | Event): void {
		const expanded = typeof expand === 'boolean'
			? !expand
			: component.open;

		setProperty(elements.anchor, 'aria-expanded', !expanded);

		if (expanded) {
			elements.floater.hidden = true;

			Manager.afterToggle(component, elements, false);
		} else {
			Floated.update({
				anchor: elements.anchor,
				floater: elements.floater,
				parent: component,
			}, 'below-left');

			delay(() => {
				Manager.afterToggle(component, elements, true);
			});
		}

		component.dispatchEvent(new Event('toggle'));
	}
}

class Store {
	static readonly callbacks = new WeakMap<PolitePopover, Callbacks>();
	static readonly elements = new WeakMap<PolitePopover, Elements>();

	static add(component: PolitePopover): void {
		const anchor = component.querySelector(':scope > [polite-popover-button]');
		const floater = component.querySelector(':scope > [polite-popover-content]');

		if (anchor == null || floater == null) {
			return;
		}

		Store.callbacks.set(component, {
			click: Manager.onClick.bind(component),
			keydown: Manager.onKeydown.bind(component),
		});

		Store.elements.set(component, {
			anchor: anchor as never,
			floater: floater as never,
		});
	}

	static remove(component: PolitePopover): void {
		const elements = Store.elements.get(component);

		if (elements?.floater instanceof HTMLElement) {
			elements.floater.hidden = true;

			elements.anchor?.insertAdjacentElement('afterend', elements.floater);
		}

		Store.callbacks.delete(component);
		Store.elements.delete(component);
	}
}

class PolitePopover extends HTMLElement {
	get button(): HTMLElement | undefined {
		return Store.elements.get(this)?.anchor;
	}

	get content(): HTMLElement | undefined {
		return Store.elements.get(this)?.floater;
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

		if (floater == null || !(floater instanceof HTMLElement)) {
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
