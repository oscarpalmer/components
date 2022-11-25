import {delay, eventOptions, findParent, focusableSelector, setAttribute, setProperty} from './helpers';
import {Floated} from './helpers/floated';

type Callbacks = {
	click: (event: Event) => void;
	hide: (event: Event) => void;
	keydown: (event: Event) => void;
	show: (event: Event) => void;
};

const attribute = 'toasty-tooltip';
const contentAttribute = `${attribute}-content`;
const store = new WeakMap<HTMLElement, Tooltip>();

class Manager {
	static observer(records: MutationRecord[]): void {
		for (const record of records) {
			if (record.type !== 'attributes') {
				continue;
			}

			const element = record.target as HTMLElement;

			if (element.getAttribute(attribute) == null) {
				Tooltip.destroy(element);
			} else {
				Tooltip.create(element);
			}
		}
	}
}

class Tooltip {
	private readonly callbacks: Callbacks = {
		click: this.onClick.bind(this),
		hide: this.onHide.bind(this),
		keydown: this.onKeyDown.bind(this),
		show: this.onShow.bind(this),
	};

	private readonly floater: HTMLElement;
	private readonly focusable: boolean;

	constructor(private readonly anchor: HTMLElement) {
		this.focusable = anchor.matches(focusableSelector);

		this.floater = Tooltip.createFloater(anchor);

		this.handleCallbacks(true);
	}

	static create(anchor: HTMLElement): void {
		if (!store.has(anchor)) {
			store.set(anchor, new Tooltip(anchor));
		}
	}

	static destroy(element: HTMLElement): void {
		const tooltip = store.get(element);

		if (typeof tooltip === 'undefined') {
			return;
		}

		tooltip.handleCallbacks(false);

		store.delete(element);
	}

	private static createFloater(anchor: HTMLElement): HTMLElement {
		const id = anchor.getAttribute('aria-describedby') ?? anchor.getAttribute('aria-labelledby');

		const element = id == null
			? null
			: document.getElementById(id);

		if (element == null) {
			throw new Error(`A '${attribute}'-attributed element must have a valid id reference in either the 'aria-describedby' or 'aria-labelledby'-attribute.`);
		}

		element.hidden = true;

		setAttribute(element, contentAttribute, '');
		setAttribute(element, 'role', 'tooltip');
		setProperty(element, 'aria-hidden', true);

		return element;
	}

	onClick(event: Event): void {
		if (findParent(event.target as never, element => [this.anchor, this.floater].includes(element)) == null) {
			this.toggle(false);
		}
	}

	onHide() {
		this.toggle(false);
	}

	onKeyDown(event: Event): void {
		if ((event instanceof KeyboardEvent) && event.key === 'Escape') {
			this.toggle(false);
		}
	}

	onShow() {
		this.toggle(true);
	}

	toggle(show: boolean): void {
		const method = show
			? 'addEventListener'
			: 'removeEventListener';

		document[method]('click', this.callbacks.click, eventOptions.passive);
		document[method]('keydown', this.callbacks.keydown, eventOptions.passive);

		if (show) {
			Floated.update(this as never, 'above');
		} else {
			this.floater.hidden = true;
		}
	}

	private handleCallbacks(add: boolean): void {
		const {anchor, floater, focusable} = this;

		const method = add
			? 'addEventListener'
			: 'removeEventListener';

		for (const element of [anchor, floater]) {
			element[method]('mouseenter', this.callbacks.show, eventOptions.passive);
			element[method]('mouseleave', this.callbacks.hide, eventOptions.passive);
			element[method]('touchstart', this.callbacks.show, eventOptions.passive);
		}

		if (focusable) {
			anchor[method]('blur', this.callbacks.hide, eventOptions.passive);
			anchor[method]('focus', this.callbacks.show, eventOptions.passive);
		}
	}
}

const observer = new MutationObserver(Manager.observer);

observer.observe(document, {
	attributeFilter: [attribute],
	attributeOldValue: true,
	attributes: true,
	childList: true,
	subtree: true,
});

delay(() => {
	const tooltips = Array.from(document.querySelectorAll(`[${attribute}]`));

	for (const tooltip of tooltips) {
		tooltip.setAttribute(attribute, '');
	}
});
