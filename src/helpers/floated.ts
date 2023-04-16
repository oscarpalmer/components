import {Repeated, repeat} from '@oscarpalmer/timer';
import {setAttribute} from '../helpers';

type Elements = {
	anchor: HTMLElement;
	floater: HTMLElement;
	parent?: HTMLElement;
};

type Position = 'above' | 'above-left' | 'above-right' | 'below' | 'below-left' | 'below-right' | 'horizontal' | 'left' | 'right' | 'vertical';

type Rectangles = {
	anchor: DOMRect;
	floater: DOMRect;
};

const positions: Position[] = ['above', 'above-left', 'above-right', 'below', 'below-left', 'below-right', 'horizontal', 'left', 'right', 'vertical'];

function getLeft(rectangles: Rectangles, position: Position): number {
	const {left, right} = rectangles.anchor;
	const {width} = rectangles.floater;

	switch (position) {
		case 'above':
		case 'below':
		case 'vertical':
			return left + (rectangles.anchor.width / 2) - (width / 2);
		case 'above-left':
		case 'below-left':
			return left;
		case 'above-right':
		case 'below-right':
			return right - width;
		case 'horizontal':
			return (right + width) > globalThis.innerWidth
				? (left - width < 0
					? right
					: left - width)
				: right;
		case 'left':
			return left - width;
		case 'right':
			return right;
		default:
			return 0;
	}
}

function getTop(rectangles: Rectangles, position: Position): number {
	const {bottom, top} = rectangles.anchor;
	const {height} = rectangles.floater;

	switch (position) {
		case 'above':
		case 'above-left':
		case 'above-right':
			return top - height;
		case 'below':
		case 'below-left':
		case 'below-right':
			return bottom;
		case 'horizontal':
		case 'left':
		case 'right':
			return top + (rectangles.anchor.height / 2) - (height / 2);
		case 'vertical':
			return (bottom + height) > globalThis.innerHeight
				? (top - height < 0
					? bottom
					: top - height)
				: bottom;
		default:
			return 0;
	}
}

function getPosition(currentPosition: string, defaultPosition: Position): Position {
	if (currentPosition == null) {
		return defaultPosition;
	}

	const normalized = currentPosition.trim().toLowerCase();

	const index = positions.indexOf(normalized as Position);

	return index > -1
		? positions[index] ?? defaultPosition
		: defaultPosition;
}

export function updateFloated(elements: Elements, position: {attribute: string, value: Position}): Repeated {
	const {anchor, floater, parent} = elements;

	function afterRepeat() {
		anchor.insertAdjacentElement('afterend', floater);
	}

	function onRepeat() {
		const floatedPosition = getPosition((parent ?? anchor).getAttribute(position.attribute) ?? '', position.value);

		setAttribute(floater, 'position', floatedPosition);

		const rectangles: Rectangles = {
			anchor: anchor.getBoundingClientRect(),
			floater: floater.getBoundingClientRect(),
		};

		const top = getTop(rectangles, floatedPosition);
		const left = getLeft(rectangles, floatedPosition);

		const matrix = `matrix(1, 0, 0, 1, ${left}, ${top})`;

		floater.style.position = 'fixed';
		floater.style.inset = '0 auto auto 0';
		floater.style.transform = matrix;
	}

	document.body.appendChild(floater);

	floater.hidden = false;

	return repeat(onRepeat, 0, Infinity, afterRepeat);
}
