import {delay, eventOptions, getFocusableElements, getUuid} from './_helpers';

type Callbacks = {
	click?: (event: Event) => void;
	keydown?: (event: Event) => void;
};

type Coordinate = {
	x: number;
	y: number;
};

type Elements = {
	button?: HTMLElement;
	content?: HTMLElement;
};

type Values = {
	buttons: WeakMap<PolitePopover, HTMLElement>;
	click: WeakMap<PolitePopover, (event: Event) => void>;
	content: WeakMap<PolitePopover, HTMLElement>;
	keydown: WeakMap<PolitePopover, (event: Event) => void>;
};

const positions = ['any'].concat(...['above', 'below'].map(position => [position, `${position}-left`, `${position}-right`]));

class Manager {
	static onClick(event: Event): void {
		if (!(this instanceof PolitePopover)) {
			return;
		}

		const {button, content} = Store.getElements(this);

		if (button == null || content == null || button.getAttribute('aria-expanded') !== 'true') {
			return;
		}

		if (event.target !== button
				&& event.target !== content
				&& !(content?.contains(event.target as Element) ?? false)) {
			Manager.toggle.call(this, false);
		}
	}

	static onKeydown(event: Event): void {
		if (!(this instanceof PolitePopover) || !(event instanceof KeyboardEvent)) {
			return;
		}

		const {button, content} = Store.getElements(this);

		if (button == null || content == null || button.getAttribute('aria-expanded') !== 'true') {
			return;
		}

		if (event.key === 'Escape') {
			Manager.toggle.call(this, false);
		}

		if (event.key !== 'Tab') {
			return;
		}

		event.preventDefault();

		const elements = getFocusableElements(content);

		if (document.activeElement === content) {
			delay(() => {
				(elements[event.shiftKey ? elements.length - 1 : 0] ?? content).focus();
			});

			return;
		}

		const index = elements.indexOf(document.activeElement as HTMLElement);

		let element = content;

		if (index > -1) {
			let position = index + (event.shiftKey ? -1 : 1);

			if (position < 0) {
				position = elements.length - 1;
			} else if (position >= elements.length) {
				position = 0;
			}

			element = elements[position] ?? content;
		}

		delay(() => {
			element.focus();
		});
	}

	static setCoordinates(content: HTMLElement, coordinates: Coordinate): void {
		content.style.inset = '0 auto auto 0';
		content.style.position = 'fixed';
		content.style.transform = `translate3d(${coordinates.x}px, ${coordinates.y}px, 0)`;
	}

	static toggle(expand?: boolean | Event): void {
		if (!(this instanceof PolitePopover)) {
			return;
		}

		const {button, content} = Store.getElements(this);

		if (button == null || content == null) {
			return;
		}

		const expanded = typeof expand === 'boolean'
			? !expand
			: button.getAttribute('aria-expanded') === 'true';

		const {click, keydown} = Store.getCallbacks(this);
		const method = expanded ? 'removeEventListener' : 'addEventListener';

		if (click != null) {
			document[method]('click', click, eventOptions.passive);
		}

		if (keydown != null) {
			document[method]('keydown', keydown, eventOptions.active);
		}

		if (expanded) {
			content.parentElement?.removeChild(content);
		} else {
			document.body.appendChild(content);
		}

		button.setAttribute('aria-expanded', String(!expanded));

		(expanded ? button : (getFocusableElements(content)[0] ?? content)).focus();

		Manager.update(this);
	}

	private static getCoordinates(position: string, button: HTMLElement, content: HTMLElement): Coordinate {
		const {bottom, left, right, top} = button.getBoundingClientRect();
		const {height, width} = content.getBoundingClientRect();

		let x = 0;
		let y = 0;

		if (position.includes('above')) {
			y = top - height;
		} else if (position.includes('below')) {
			y = bottom;
		} else {
			const max = bottom + height;
			const min = top - height;

			y = max > window.innerHeight
				? (min < 0 ? bottom : min)
				: bottom;
		}

		if (position.includes('left')) {
			x = left;
		} else if (position.includes('right')) {
			x = right - width;
		} else {
			const max = left + width;
			const min = right - width;

			x = max > window.innerWidth
				? (min < 0 ? left : min)
				: left;
		}

		return {x, y};
	}

	private static getPosition(component: PolitePopover): string {
		const position = component.getAttribute('position');
		const normalized = position?.trim().toLowerCase();

		return normalized != null && positions.includes(normalized)
			? normalized
			: 'below';
	}

	private static update(component: PolitePopover): void {
		const {button, content} = Store.getElements(component);

		if (button == null || content == null) {
			return;
		}

		function step() {
			if (button?.getAttribute('aria-expanded') !== 'true' || content == null) {
				return;
			}

			const position = Manager.getPosition(component);
			const coordinates = Manager.getCoordinates(position, button, content);

			Manager.setCoordinates(content, coordinates);

			delay(step);
		}

		delay(step);
	}
}

class Store {
	private static readonly values: Values = {
		buttons: new WeakMap<PolitePopover, HTMLElement>(),
		click: new WeakMap<PolitePopover, (event: Event) => void>(),
		content: new WeakMap<PolitePopover, HTMLElement>(),
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
			button: this.values.buttons.get(component),
			content: this.values.content.get(component),
		};
	}

	static remove(component: PolitePopover): void {
		this.values.buttons.delete(component);
		this.values.click.delete(component);
		this.values.content.delete(component);
		this.values.keydown.delete(component);
	}

	static setCallbacks(component: PolitePopover): void {
		this.values.click?.set(component, Manager.onClick.bind(component));
		this.values.keydown?.set(component, Manager.onKeydown.bind(component));
	}

	static setElements(component: PolitePopover, button: HTMLElement, content: HTMLElement): void {
		this.values.buttons?.set(component, button);
		this.values.content?.set(component, content);
	}
}

class PolitePopover extends HTMLElement {
	close() {
		Manager.toggle.call(this, false);
	}

	connectedCallback() {
		const button = this.querySelector(':scope > [polite-popover-button]') as HTMLElement | undefined;
		const content = this.querySelector(':scope > [polite-popover-content]') as HTMLElement | undefined;

		if (button == null) {
			throw new Error('a');
		}

		if (!(button instanceof HTMLButtonElement) && button.getAttribute('role') !== 'button') {
			throw new Error('b');
		}

		if (content == null) {
			throw new Error('c');
		}

		content.parentElement?.removeChild(content);

		if (!content.id) {
			content.setAttribute('id', getUuid());
		}

		Manager.setCoordinates(content, {x: -100000, y: -100000});

		button.setAttribute('aria-controls', content.id);
		button.setAttribute('aria-expanded', 'false');
		content.setAttribute('tabindex', '-1');

		Store.setElements(this, button, content);
		Store.setCallbacks(this);

		button.addEventListener('click', Manager.toggle.bind(this), eventOptions.passive);
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
