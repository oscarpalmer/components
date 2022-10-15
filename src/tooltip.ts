import {delay, eventOptions, focusableSelector} from './helpers';
import {Floated, Position, Rects} from './helpers/floated';

type Callbacks = {
	click: (event: Event) => void;
	hide: (event: Event) => void;
	key: (event: Event) => void;
	show: (event: Event) => void;
};

const attribute = 'toasty-tooltip';
const store = new WeakMap<HTMLElement, Tooltip>();
const types = ['above', 'below', 'horizontal', 'left', 'right', 'vertical'];

class Manager {
	static getPosition(type: string, elements: Rects): Position {
		const left = Manager.getValue(type, ['horizontal', 'left', 'right'], elements, true);
		const top = Manager.getValue(type, ['vertical', 'above', 'below'], elements, false);

		if (!['horizontal', 'vertical'].includes(type)) {
			return {coordinate: {left, top}, type};
		}

		return {
			coordinate: {left, top},
			type: type === 'horizontal'
				? (left === elements.anchor.right ? 'right' : 'left')
				: (top === elements.anchor.bottom ? 'below' : 'above'),
		};
	}

	static getValue(type: string, types: string[], elements: Rects, left: boolean): number {
		const {anchor, floater} = elements;

		const anchorMax = left ? anchor.right : anchor.bottom;
		const anchorMin = left ? anchor.left : anchor.top;

		const floaterSize = left ? floater.width : floater.height;

		const index = types.indexOf(type);

		if (index === -1) {
			return ((anchorMin + ((left ? anchor.width : anchor.height) / 2)) - (floaterSize / 2));
		}

		const minValue = anchorMin - floaterSize;

		if (index > 0) {
			return index === 1 ? minValue : anchorMax;
		}

		const maxValue = anchorMax + floaterSize;

		if (maxValue <= (left ? window.innerWidth : window.innerHeight)) {
			return anchorMax;
		}

		return minValue < 0
			? anchorMax
			: minValue;
	}

	static observer(entries: MutationRecord[]): void {
		for (const entry of entries) {
			if (entry.type !== 'attributes') {
				continue;
			}

			const element = entry.target as HTMLElement;

			if (element.getAttribute(attribute) == null) {
				Tooltip.destroy(element);
			} else {
				Tooltip.create(element);
			}
		}
	}
}

class Tooltip {
	private readonly floater: HTMLElement;

	readonly callbacks: Callbacks;

	readonly focusable: boolean;

	constructor(private readonly anchor: HTMLElement) {
		this.focusable = anchor.matches(focusableSelector);

		this.callbacks = {
			click: this.onClick.bind(this),
			hide: this.onHide.bind(this),
			key: this.onKey.bind(this),
			show: this.onShow.bind(this),
		};

		this.floater = this.createFloater();

		this.handleCallbacks(true);
	}

	static create(anchor: HTMLElement): void {
		if (!store.has(anchor)) {
			store.set(anchor, new Tooltip(anchor));
		}
	}

	static destroy(element: HTMLElement): void {
		const tooltip = store.get(element);

		if (tooltip == null) {
			return;
		}

		tooltip.handleCallbacks(false);

		store.delete(element);
	}

	onClick(): void {
		this.handleFloater(false);
	}

	onHide() {
		this.handleFloater(false);
	}

	onKey(event: Event): void {
		if (event instanceof KeyboardEvent && event.key === 'Escape') {
			this.handleFloater(false);
		}
	}

	onShow() {
		const {anchor, floater} = this;

		if (floater.parentElement != null) {
			return;
		}

		const content = this.getContent();

		if (content == null) {
			return;
		}

		floater.innerHTML = content.innerHTML;

		this.handleFloater(true);

		Floated.update(
			{anchor, floater},
			{all: types, default: 'above'},
			Manager.getPosition,
			() => floater.parentElement == null);
	}

	private createFloater(): HTMLElement {
		const floater = document.createElement('div');

		floater.setAttribute('aria-hidden', 'true');
		floater.setAttribute(`${attribute}-content`, '');

		floater.hidden = true;

		return floater;
	}

	private getContent(): HTMLElement | undefined {
		const id = this.anchor.getAttribute('aria-describedby') ?? this.anchor.getAttribute('aria-labelledby');

		if (id == null) {
			return undefined;
		}

		return document.getElementById(id) ?? undefined;
	}

	private handleCallbacks(add: boolean): void {
		const {anchor, callbacks, focusable} = this;

		const method = add ? 'addEventListener' : 'removeEventListener';

		anchor[method]('mouseenter', callbacks.show, eventOptions.passive);
		anchor[method]('mouseleave', callbacks.hide, eventOptions.passive);
		anchor[method]('touchstart', callbacks.show, eventOptions.passive);

		if (focusable) {
			anchor[method]('blur', callbacks.hide, eventOptions.passive);
			anchor[method]('focus', callbacks.show, eventOptions.passive);
		}
	}

	private handleFloater(show: boolean): void {
		const {callbacks, floater} = this;

		const method = show ? 'addEventListener' : 'removeEventListener';

		document[method]('keydown', callbacks.key, eventOptions.passive);
		document[method]('pointerdown', callbacks.click, eventOptions.passive);

		if (show) {
			document.body.appendChild(floater);
		} else {
			this.floater.parentElement?.removeChild(this.floater);
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
