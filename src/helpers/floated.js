import {Repeated} from '@oscarpalmer/timer';
import {getTextDirection} from './index.js';

/**
 * @typedef AbsoluteParameters
 * @property {number} end
 * @property {number} max
 * @property {number} offset
 * @property {boolean} preferMin
 * @property {number} start
 */

/**
 * @typedef Elements
 * @property {HTMLElement} anchor
 * @property {HTMLElement} floater
 * @property {HTMLElement?} parent
 */

/**
 * @typedef Parameters
 * @property {Elements} elements
 * @property {ParametersPosition} position
 */

/**
 * @typedef ParametersPosition
 * @property {string} attribute
 * @property {string} defaultValue
 * @property {boolean} preferAbove
 */

/**
 * @typedef Rectangles
 * @property {DOMRect} anchor
 * @property {DOMRect} floater
 */

/**
 * @typedef Values = {
 * @property {number} left
 * @property {number} top
 */

const allPositions = [
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

const horizontalPositions = new Set(['left', 'horizontal', 'right']);
const transformedPositions = new Set([
	'above',
	'any',
	'below',
	'vertical',
	...Array.from(horizontalPositions.values),
]);

/**
 * @param {string} position
 * @param {Rectangles} rectangles
 * @param {boolean} rightToLeft
 * @param {boolean} preferAbove
 * @returns {Values}
 */
function calculatePosition(position, rectangles, rightToLeft, preferAbove) {
	if (position !== 'any') {
		const left = getLeft(rectangles, position, rightToLeft);
		const top = getTop(rectangles, position, preferAbove);

		return {top, left};
	}

	const {anchor, floater} = rectangles;

	const left = getAbsolute(
		anchor.right,
		anchor.left,
		floater.width,
		innerWidth,
		rightToLeft,
	);
	const top = getAbsolute(
		anchor.top,
		anchor.bottom,
		floater.height,
		innerHeight,
		preferAbove,
	);

	return {left, top};
}

/**
 * @param {AbsoluteParameters} parameters
 * @returns {number}
 */
function getAbsolute(parameters) {
	const maxPosition = parameters.end + parameters.offset;
	const minPosition = parameters.start - parameters.offset;

	if (parameters.preferMin) {
		return minPosition < 0
			? (maxPosition > parameters.max
				? minPosition
				: parameters.end)
			: minPosition;
	}

	return maxPosition > parameters.max
		? (minPosition < 0
			? parameters.end
			: minPosition)
		: parameters.end;
}

/**
 * @param {string} original
 * @param {Rectangles} rectangles
 * @param {Values} values
 * @returns {string}
 */
function getActualPosition(original, rectangles, values) {
	if (!transformedPositions.has(original)) {
		return original;
	}

	const isHorizontal = horizontalPositions.has(original);

	return [
		getPrefix(rectangles, values, isHorizontal),
		getSuffix(rectangles, values, isHorizontal),
	]
		.filter(value => value !== undefined)
		.join('-');
}

/**
 * @param {Rectangles} rectangles
 * @param {string} position
 * @param {boolean} rightToLeft
 * @returns {number}
 */
function getLeft(rectangles, position, rightToLeft) {
	const {anchor, floater} = rectangles;

	switch (position) {
		case 'above':
		case 'below':
		case 'vertical': {
			return anchor.left + (anchor.width / 2) - (floater.width / 2);
		}

		case 'above-left':
		case 'below-left':
		case 'vertical-left': {
			return anchor.left;
		}

		case 'above-right':
		case 'below-right':
		case 'vertical-right': {
			return anchor.right - floater.width;
		}

		case 'horizontal':
		case 'horizontal-bottom':
		case 'horizontal-top': {
			return getAbsolute(
				anchor.left,
				anchor.right,
				floater.width,
				innerWidth,
				rightToLeft,
			);
		}

		case 'left':
		case 'left-bottom':
		case 'left-top': {
			return anchor.left - floater.width;
		}

		case 'right':
		case 'right-bottom':
		case 'right-top': {
			return anchor.right;
		}

		default: {
			return anchor.left;
		}
	}
}

/**
 * @param {string} currentPosition
 * @param {string} defaultPosition
 * @returns {string}
 */
function getOriginalPosition(currentPosition, defaultPosition) {
	if (currentPosition === null) {
		return defaultPosition;
	}

	const normalized = currentPosition.trim().toLowerCase();

	const index = allPositions.indexOf(normalized);

	return index > -1
		? allPositions[index] ?? defaultPosition
		: defaultPosition;
}

/**
 * @param {Rectangles} rectangles
 * @param {Values} values
 * @param {boolean} isHorizontal
 * @returns {string|undefined}
 */
function getPrefix(rectangles, values, isHorizontal) {
	if (isHorizontal) {
		if (values.left === rectangles.anchor.right) {
			return 'right';
		}

		return values.left === (rectangles.anchor.left - rectangles.floater.width)
			? 'left'
			: undefined;
	}

	if (values.top === rectangles.anchor.bottom) {
		return 'below';
	}

	return values.top === (rectangles.anchor.top - rectangles.floater.height)
		? 'above'
		: undefined;
}

/**
 * @param {Rectangles} rectangles
 * @param {Values} values
 * @param {boolean} isHorizontal
 * @returns {string|undefined}
 */
function getSuffix(rectangles, values, isHorizontal) {
	if (isHorizontal) {
		if (values.top === rectangles.anchor.top) {
			return 'top';
		}

		return values.top === (rectangles.anchor.bottom - rectangles.floater.height)
			? 'bottom'
			: undefined;
	}

	if (values.left === rectangles.anchor.left) {
		return 'left';
	}

	return values.left === (rectangles.anchor.right - rectangles.floater.width)
		? 'right'
		: undefined;
}

/**
 * @param {Rectangles} rectangles
 * @param {string} position
 * @param {boolean} preferAbove
 * @returns {number}
 */
function getTop(rectangles, position, preferAbove) {
	const {anchor, floater} = rectangles;

	switch (position) {
		case 'above':
		case 'above-left':
		case 'above-right': {
			return anchor.top - floater.height;
		}

		case 'horizontal':
		case 'left':
		case 'right': {
			return anchor.top + (anchor.height / 2) - (floater.height / 2);
		}

		case 'below':
		case 'below-left':
		case 'below-right': {
			return anchor.bottom;
		}

		case 'horizontal-bottom':
		case 'left-bottom':
		case 'right-bottom': {
			return anchor.bottom - floater.height;
		}

		case 'horizontal-top':
		case 'left-top':
		case 'right-top': {
			return anchor.top;
		}

		case 'vertical':
		case 'vertical-left':
		case 'vertical-right': {
			return getAbsolute(
				anchor.top,
				anchor.bottom,
				floater.height,
				innerHeight,
				preferAbove,
			);
		}

		default: {
			return anchor.bottom;
		}
	}
}

/**
 * @param {{elements: Elements; position: ParametersPosition;}} parameters
 * @returns {Repeated}
 */
export function updateFloated(parameters) {
	const {anchor, floater, parent} = parameters.elements;

	const rightToLeft = getTextDirection(floater) === 'rtl';

	/** @type {string?} */
	let previousPosition;

	/** @type {DOMRect?} */
	let previousRectangle;

	function afterRepeat() {
		anchor.after('afterend', floater);
	}

	function onRepeat() {
		const currentPosition = getOriginalPosition(
			(parent ?? anchor).getAttribute(parameters.position.attribute) ?? '',
			parameters.position.defaultValue,
		);

		const currentRectangle = anchor.getBoundingClientRect();

		if (
			previousPosition === currentPosition
			&& domRectKeys.every(key => previousRectangle?.[key] === currentRectangle[key])
		) {
			return;
		}

		previousPosition = currentPosition;
		previousRectangle = currentRectangle;

		const rectangles = {
			anchor: currentRectangle,
			floater: floater.getBoundingClientRect(),
		};

		const values = calculatePosition(
			currentPosition,
			rectangles,
			rightToLeft,
			parameters.position.preferAbove,
		);

		const matrix = `matrix(1, 0, 0, 1, ${values.left}, ${values.top})`;

		if (floater.style.transform === matrix) {
			return;
		}

		floater.style.position = 'fixed';
		floater.style.inset = '0 auto auto 0';
		floater.style.transform = matrix;

		floater.setAttribute(
			'position',
			getActualPosition(currentPosition, rectangles, values),
		);
	}

	document.body.append(floater);

	floater.hidden = false;

	return new Repeated(
		onRepeat,
		0,
		Number.POSITIVE_INFINITY,
		afterRepeat,
	).start();
}
