import {Repeated, wait} from '@oscarpalmer/timer';
import {eventOptions, getFocusableElements, findParent, isNullOrWhitespace} from './helpers';
import {updateFloated} from './helpers/floated';
import {attribute} from './focus-trap';

const clickCallbacks = new WeakMap<PolitePopover, (event: Event) => void>();
const keydownCallbacks = new WeakMap<PolitePopover, (event: Event) => void>();

let index = 0;

function afterToggle(popover: PolitePopover, active: boolean): void {
	handleCallbacks(popover, active);

	if (active && popover.content) {
		(getFocusableElements(popover.content)?.[0] ?? popover.content).focus();
	} else {
		popover.button?.focus();
	}
}

function handleCallbacks(popover: PolitePopover, add: boolean): void {
	const clickCallback = clickCallbacks.get(popover);
	const keydownCallback = keydownCallbacks.get(popover);

	if (clickCallback == null || keydownCallback == null) {
		return;
	}

	const method = add
		? 'addEventListener'
		: 'removeEventListener';

	document[method]('click', clickCallback, eventOptions.passive);
	document[method]('keydown', keydownCallback, eventOptions.passive);
}

function handleGlobalEvent(event: Event, popover: PolitePopover, target: HTMLElement): void {
	const {button, content} = popover;

	if (button == null || content == null) {
		return;
	}

	const floater = findParent(target, '[polite-popover-content]');

	if (floater == null) {
		handleToggle(popover, false);

		return;
	}

	event.stopPropagation();

	const children = Array.from(document.body.children);
	const difference = children.indexOf(floater) - children.indexOf(content);

	if (difference < (event instanceof KeyboardEvent ? 1 : 0)) {
		handleToggle(popover, false);
	}
}

function handleToggle(popover: PolitePopover, expand?: boolean | Event): void {
	const expanded = typeof expand === 'boolean'
		? !expand
		: popover.open;

	popover.button.setAttribute('aria-expanded', !expanded as never);

	if (expanded) {
		popover.content.hidden = true;

		popover.timer?.stop();

		afterToggle(popover, false);
	} else {
		popover.timer?.stop();

		popover.timer = updateFloated({
			elements: {
				anchor: popover.button,
				floater: popover.content,
				parent: popover,
			},
			position: {
				attribute: 'position',
				defaultValue: 'vertical',
				preferAbove: false,
			},
		});

		wait(() => {
			afterToggle(popover, true);
		}, 50);
	}

	popover.dispatchEvent(new Event('toggle'));
}

function initialise(popover: PolitePopover, button: HTMLButtonElement, content: HTMLElement): void {
	content.hidden = true;

	if (isNullOrWhitespace(popover.id)) {
		popover.id = `polite_popover_${++index}`;
	}

	if (isNullOrWhitespace(button.id)) {
		button.id = `${popover.id}_button`;
	}

	if (isNullOrWhitespace(content.id)) {
		content.id = `${popover.id}_content`;
	}

	button.setAttribute('aria-controls', content.id);

	button.ariaExpanded = 'false';
	button.ariaHasPopup = 'dialog';

	if (!(button instanceof HTMLButtonElement)) {
		(button as HTMLElement).tabIndex = 0;
	}

	content.setAttribute(attribute, '');

	content.role = 'dialog';
	content.ariaModal = 'false';

	clickCallbacks.set(popover, onClick.bind(popover));
	keydownCallbacks.set(popover, onKeydown.bind(popover));

	button.addEventListener('click', toggle.bind(popover), eventOptions.passive);
}

function onClick(this: PolitePopover, event: Event): void {
	if ((this instanceof PolitePopover) && this.open) {
		handleGlobalEvent(event, this, event.target as never);
	}
}

function onKeydown(this: PolitePopover, event: Event): void {
	if ((this instanceof PolitePopover) && this.open && (event instanceof KeyboardEvent) && event.key === 'Escape') {
		handleGlobalEvent(event, this, document.activeElement as never);
	}
}

function toggle(this: PolitePopover, expand?: boolean | Event): void {
	if (this instanceof PolitePopover) {
		handleToggle(this, expand);
	}
}

class PolitePopover extends HTMLElement {
	readonly button!: HTMLElement;
	readonly content!: HTMLElement;

	timer: Repeated | undefined;

	get open(): boolean {
		return this.button?.getAttribute('aria-expanded') === 'true';
	}

	set open(open: boolean) {
		toggle.call(this, open);
	}

	constructor() {
		super();

		const button = this.querySelector(':scope > [polite-popover-button]');
		const content = this.querySelector(':scope > [polite-popover-content]');

		if (button == null
				|| !((button instanceof HTMLButtonElement)
				|| (button instanceof HTMLElement && button.getAttribute('role') === 'button'))) {
			throw new Error('<polite-popover> must have a <button>-element (or button-like element) with the attribute \'polite-popover-button\'');
		}

		if (content == null || !(content instanceof HTMLElement)) {
			throw new Error('<polite-popover> must have an element with the attribute \'polite-popover-content\'');
		}

		this.button = button;
		this.content = content;

		initialise(this, button as HTMLButtonElement, content);
	}

	toggle(): void {
		if (this.button && this.content) {
			toggle.call(this);
		}
	}
}

customElements.define('polite-popover', PolitePopover);
