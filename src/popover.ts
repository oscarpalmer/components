import {wait} from '@oscarpalmer/timer';
import {defineProperty, eventOptions, findParent, getFocusableElements, isNullOrWhitespace, setAttribute, setProperty} from './helpers';
import {Floated} from './helpers/floated';
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

	setProperty(popover.button, 'aria-expanded', !expanded);

	if (expanded) {
		popover.content.hidden = true;

		afterToggle(popover, false);
	} else {
		Floated.update({
			anchor: popover.button,
			floater: popover.content,
			parent: popover,
		}, {
			attribute: 'position',
			value: 'below-left',
		});

		wait(() => {
			afterToggle(popover, true);
		}, 0);
	}

	popover.dispatchEvent(new Event('toggle'));
}

function initialise(popover: PolitePopover, button: HTMLButtonElement, content: HTMLElement): void {
	content.hidden = true;

	if (isNullOrWhitespace(popover.id)) {
		setAttribute(popover, 'id', `polite_popover_${++index}`);
	}

	if (isNullOrWhitespace(button.id)) {
		setAttribute(button, 'id', `${popover.id}_button`);
	}

	if (isNullOrWhitespace(content.id)) {
		setAttribute(content, 'id', `${popover.id}_content`);
	}

	setAttribute(button, 'aria-controls', content.id);
	setProperty(button, 'aria-expanded', false);
	setAttribute(button, 'aria-haspopup', 'dialog');

	if (!(button instanceof HTMLButtonElement)) {
		setAttribute(button, 'tabindex', '0');
	}

	setAttribute(content, attribute, '');
	setAttribute(content, 'role', 'dialog');
	setAttribute(content, 'aria-modal', 'false');

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
	button!: HTMLElement;
	content!: HTMLElement;

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

		defineProperty(this, 'button', button);
		defineProperty(this, 'content', content);

		initialise(this, button as HTMLButtonElement, content);
	}

	toggle(): void {
		if (this.button && this.content) {
			toggle.call(this);
		}
	}
}

globalThis.customElements.define('polite-popover', PolitePopover);
