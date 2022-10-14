import {delay, eventOptions, focusableSelector} from './helpers';
import {Coordinate, Floated, Rects} from './helpers/floated';

type Callbacks = {
	click: (event: Event) => void;
	hide: (event: Event) => void;
	key: (event: KeyboardEvent) => void;
	show: (event: Event) => void;
};

const attribute = 'toasty-tooltip';
const positions = ['above', 'below', 'horizontal', 'left', 'right', 'vertical'];

class Manager {
	static getCoordinate(position: string, elements: Rects): Coordinate {
		return {
			left: Manager.getLeft(position, elements),
			top: Manager.gettop(position, elements),
		};
	}

	static getLeft(position: string, elements: Rects): number {
		const {left, right} = elements.anchor;
		const {width} = elements.floater;

		const xMax = right + width;
		const xMin = left - width;

		return position === 'horizontal'
			? (xMax > window.innerWidth
				? (xMin < 0
					? right
					: xMin)
				: right)
			: (position === 'left' || position === 'right')
				? (position === 'left'
					? (left - width)
					: right)
				: ((left + (elements.anchor.width / 2)) - (width / 2));
	}

	static gettop(position: string, elements: Rects): number {
		const {bottom, top} = elements.anchor;
		const {height} = elements.floater;

		const yMax = bottom + height;
		const yMin = top - height;

		return position === 'vertical'
			? (yMax > window.innerHeight
				? (yMin < 0
					? bottom
					: yMin)
				: bottom)
			: (position === 'above' || position === 'below')
				? (position === 'above'
					? (top - height)
					: bottom)
				: ((top + (elements.anchor.height / 2)) - (height / 2));
	}

	static observer(entries: MutationRecord[]): void {
		for (const entry of entries) {
			if (entry.type !== 'attributes') {
				continue;
			}

			const element = entry.target as HTMLElement;

			if (element.getAttribute(attribute) == null) {
				Tooltip.destroy(element);

				return;
			}

			const id = element.getAttribute('aria-describedby') ?? element.getAttribute('aria-labelledby');
			const content = id == null ? null : document.getElementById(id);

			if (content != null) {
				Tooltip.create(element, content);
			}
		}
	}
}

class Store {
	static readonly elements = new WeakMap<HTMLElement, Tooltip>();
}

class Tooltip {
	private readonly floater: HTMLElement;

	readonly callbacks: Callbacks;

	readonly focusable: boolean;

	constructor(private readonly anchor: HTMLElement, content: HTMLElement) {
		this.focusable = anchor.matches(focusableSelector);

		this.callbacks = {
			click: this.onClick.bind(this),
			hide: this.onHide.bind(this),
			key: this.onKey.bind(this),
			show: this.onShow.bind(this),
		};

		this.addCallbacks();

		this.floater = this.createFloater(content);
	}

	static create(anchor: HTMLElement, content: HTMLElement): void {
		if (!Store.elements.has(anchor)) {
			Store.elements.set(anchor, new Tooltip(anchor, content));
		}
	}

	static destroy(element: HTMLElement): void {
		const tooltip = Store.elements.get(element);

		if (tooltip == null) {
			return;
		}

		tooltip.removeCallbacks();

		Store.elements.delete(element);
	}

	onClick(): void {
		this.onHide();
	}

	onHide() {
		document.removeEventListener('keydown', this.callbacks.key, eventOptions.passive);
		document.removeEventListener('pointerdown', this.callbacks.click, eventOptions.active);

		this.floater.parentElement?.removeChild(this.floater);
	}

	onKey(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			this.onHide();
		}
	}

	onShow() {
		if (this.floater.parentElement != null) {
			return;
		}

		document.addEventListener('keydown', this.callbacks.key, eventOptions.passive);
		document.addEventListener('pointerdown', this.callbacks.click, eventOptions.active);

		document.body.appendChild(this.floater);

		Floated.update(
			{anchor: this.anchor, floater: this.floater},
			{all: positions, default: 'above'},
			Manager.getCoordinate,
			() => this.floater.parentElement == null);
	}

	private addCallbacks(): void {
		const {anchor, callbacks, focusable} = this;

		anchor.addEventListener('mouseenter', callbacks.show, eventOptions.passive);
		anchor.addEventListener('mouseleave', callbacks.hide, eventOptions.passive);

		if (focusable) {
			anchor.addEventListener('blur', callbacks.hide, eventOptions.passive);
			anchor.addEventListener('focus', callbacks.show, eventOptions.passive);
		}
	}

	private createFloater(content: HTMLElement): HTMLElement {
		const floater = document.createElement('div');

		floater.setAttribute('aria-hidden', 'true');
		floater.setAttribute(`${attribute}-content`, '');

		floater.hidden = true;
		floater.innerHTML = content.innerHTML;

		return floater;
	}

	private removeCallbacks(): void {
		const {anchor, callbacks, focusable} = this;

		anchor.removeEventListener('mouseenter', callbacks.show, eventOptions.passive);
		anchor.removeEventListener('mouseleave', callbacks.hide, eventOptions.passive);
		anchor.removeEventListener('touchstart', callbacks.show, eventOptions.passive);

		if (focusable) {
			anchor.removeEventListener('blur', callbacks.hide, eventOptions.passive);
			anchor.removeEventListener('focus', callbacks.show, eventOptions.passive);
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
