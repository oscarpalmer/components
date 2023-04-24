import {Repeated, repeat} from '@oscarpalmer/timer';
import {getTextDirection} from '../helpers';

type Elements = {
	anchor: HTMLElement;
	floater: HTMLElement;
	parent?: HTMLElement;
};

type Parameters = {
	elements: Elements;
	position: ParametersPosition;
};

type ParametersPosition = {
	attribute: string;
	defaultValue: Position;
	preferAbove: boolean;
};

type Position = 'above' | 'above-left' | 'above-right'
	| 'any'
	| 'below' | 'below-left' | 'below-right'
	| 'horizontal' | 'horizontal-bottom' | 'horizontal-top'
	| 'left' | 'left-bottom' | 'left-top'
	| 'right' | 'right-bottom' | 'right-top'
	| 'vertical' | 'vertical-left' | 'vertical-right';

type Rectangles = {
	anchor: DOMRect;
	floater: DOMRect;
};

type Values = {
	left: number;
	top: number;
};

const allPositions: Position[] = [
	'above',
	'above-left',
	'above-right',
	'any',
	'below',
	'below-left',
	'below-right',
	'horizontal',
	'horizontal-bottom',
	'horizontal-top',
	'left',
	'left-bottom',
	'left-top',
	'right',
	'right-bottom',
	'right-top',
	'vertical',
	'vertical-left',
	'vertical-right',
];

const domRectKeys = ['bottom', 'height', 'left', 'right', 'top', 'width'];

const horizontalPositions: Position[] = ['left', 'horizontal', 'right'];
const transformedPositions: Position[] = ['above', 'any', 'below', 'vertical', ...horizontalPositions];

function calculatePosition(position: Position, rectangles: Rectangles, rightToLeft: boolean, preferAbove: boolean): Values {
	if (position !== 'any') {
		const left = getLeft(rectangles, position, rightToLeft);
		const top = getTop(rectangles, position, preferAbove);

		return {top, left};
	}

	const {anchor, floater} = rectangles;

	const left = getAbsolute(anchor.right, anchor.left, floater.width, innerWidth, rightToLeft);
	const top = getAbsolute(anchor.top, anchor.bottom, floater.height, innerHeight, preferAbove);

	return {left, top};
};

function getAbsolute(start: number, end: number, offset: number, max: number, preferMin: boolean): number {
	const maxPosition = end + offset;
	const minPosition = start - offset;

	if (preferMin) {
		return minPosition < 0
			? maxPosition > max
				? minPosition
				: end
			: minPosition;
	}

	return maxPosition > max
		? minPosition < 0
			? end
			: minPosition
		: end;
}

function getActualPosition(original: Position, rectangles: Rectangles, values: Values): Position {
	if (!transformedPositions.includes(original)) {
		return original;
	}

	const {anchor, floater} = rectangles;

	const isHorizontal = horizontalPositions.includes(original);

	const prefix = isHorizontal
		? (values.left === anchor.right
			? 'right'
			: (values.left === (anchor.left - floater.width)
				? 'left'
				: null))
		: (values.top === anchor.bottom
			? 'below'
			: (values.top === (anchor.top - floater.height)
				? 'above'
				: null));

	const suffix = isHorizontal
		? (values.top === anchor.top
			? 'top'
			: (values.top === (anchor.bottom - floater.height)
				? 'bottom'
				: null))
		: (values.left === anchor.left
			? 'left'
			: (values.left === (anchor.right - floater.width)
				? 'right'
			: null));

	return [prefix, suffix]
		.filter(value => value != null)
		.join('-') as never;
}

function getLeft(rectangles: Rectangles, position: Position, rightToLeft: boolean): number {
	const {anchor, floater} = rectangles;

	switch (position) {
		case 'above':
		case 'below':
		case 'vertical':
			return anchor.left + (anchor.width / 2) - (floater.width / 2);

		case 'above-left':
		case 'below-left':
		case 'vertical-left':
			return anchor.left;

		case 'above-right':
		case 'below-right':
		case 'vertical-right':
			return anchor.right - floater.width;

		case 'horizontal':
		case 'horizontal-bottom':
		case 'horizontal-top': {
			return getAbsolute(anchor.left, anchor.right, floater.width, innerWidth, rightToLeft);
		}

		case 'left':
		case 'left-bottom':
		case 'left-top':
			return anchor.left - floater.width;

		case 'right':
		case 'right-bottom':
		case 'right-top':
			return anchor.right;

		default:
			return anchor.left;
	}
}

function getOriginalPosition(currentPosition: string, defaultPosition: Position): Position {
	if (currentPosition == null) {
		return defaultPosition;
	}

	const normalized = currentPosition.trim().toLowerCase();

	const index = allPositions.indexOf(normalized as Position);

	return index > -1
		? allPositions[index] ?? defaultPosition
		: defaultPosition;
}

function getTop(rectangles: Rectangles, position: Position, preferAbove: boolean): number {
	const {anchor, floater} = rectangles;

	switch (position) {
		case 'above':
		case 'above-left':
		case 'above-right':
			return anchor.top - floater.height;

		case 'horizontal':
		case 'left':
		case 'right':
			return anchor.top + (anchor.height / 2) - (floater.height / 2);

		case 'below':
		case 'below-left':
		case 'below-right':
			return anchor.bottom;

		case 'horizontal-bottom':
		case 'left-bottom':
		case 'right-bottom':
			return anchor.bottom - floater.height;

		case 'horizontal-top':
		case 'left-top':
		case 'right-top':
			return anchor.top;

		case 'vertical':
		case 'vertical-left':
		case 'vertical-right': {
			return getAbsolute(anchor.top, anchor.bottom, floater.height, innerHeight, preferAbove);
		}

		default:
			return anchor.bottom;
	}
}

export function updateFloated(parameters: Parameters): Repeated {
	const {anchor, floater, parent} = parameters.elements;

	const rightToLeft = getTextDirection(floater) === 'rtl';

	let previousPosition: string | undefined;
	let previousRectangle: DOMRect | undefined;

	function afterRepeat() {
		anchor.insertAdjacentElement('afterend', floater);
	}

	function onRepeat() {
		const currentPosition = getOriginalPosition((parent ?? anchor).getAttribute(parameters.position.attribute) ?? '', parameters.position.defaultValue);
		const currentRectangle = anchor.getBoundingClientRect();

		if (previousPosition === currentPosition
				&& domRectKeys.every(key => (previousRectangle as any)?.[key] === (currentRectangle as any)[key])) {
			return;
		}

		previousPosition = currentPosition;
		previousRectangle = currentRectangle;

		const rectangles: Rectangles = {
			anchor: currentRectangle,
			floater: floater.getBoundingClientRect(),
		};

		const values = calculatePosition(currentPosition, rectangles, rightToLeft, parameters.position.preferAbove);

		const matrix = `matrix(1, 0, 0, 1, ${values.left}, ${values.top})`;

		if (floater.style.transform === matrix) {
			return;
		}

		floater.style.position = 'fixed';
		floater.style.inset = '0 auto auto 0';
		floater.style.transform = matrix;

		floater.setAttribute('position', getActualPosition(currentPosition, rectangles, values));
	}

	document.body.appendChild(floater);

	floater.hidden = false;

	return repeat(onRepeat, 0, Infinity, afterRepeat);
}
