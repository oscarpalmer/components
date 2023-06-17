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
 * @typedef Rectangles
 * @property {DOMRect} anchor
 * @property {DOMRect} floater
 */

/**
 * @typedef ValueParameters
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

/**
 * @param {string} position
 * @param {Rectangles} rectangles
 * @param {boolean} rightToLeft
 * @param {boolean} preferAbove
 * @returns {Values}
 */
function calculatePosition(position, rectangles, rightToLeft, preferAbove) {
	const left = getValue(true, position, rectangles, rightToLeft);
	const top = getValue(false, position, rectangles, preferAbove);

	return {top, left};
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
			? maxPosition > parameters.max
				? minPosition
				: parameters.end
			: minPosition;
	}

	return maxPosition > parameters.max
		? minPosition < 0
			? parameters.end
			: minPosition
		: parameters.end;
}

/**
 * @param {string} currentPosition
 * @param {string} defaultPosition
 * @returns {string}
 */
function getPosition(currentPosition, defaultPosition) {
	if (currentPosition === null) {
		return defaultPosition;
	}

	const normalized = currentPosition.trim().toLowerCase();

	const index = allPositions.indexOf(normalized);

	return index > -1 ? allPositions[index] ?? defaultPosition : defaultPosition;
}

/**
 * @param {boolean} x
 * @param {string} position
 * @param {Rectangles} rectangles
 * @param {ValueParameters} parameters
 * @returns {number}
 */
function getValue(x, position, rectangles, preferMin) {
	const {anchor, floater} = rectangles;

	if (x ? position.startsWith('right') : position.endsWith('top')) {
		return x ? anchor.right : anchor.top;
	}

	if (x ? position.startsWith('left') : position.endsWith('bottom')) {
		return (
			(x ? anchor.left : anchor.bottom) - (x ? floater.width : floater.height)
		);
	}

	if (x ? position.endsWith('right') : position.startsWith('above')) {
		return (
			(x ? anchor.right : anchor.top) - (x ? floater.width : floater.height)
		);
	}

	if (
		(x
			? ['above', 'below', 'vertical']
			: ['horizontal', 'left', 'right']
		).includes(position)
	) {
		return (
			(x ? anchor.left : anchor.top)
			+ (x ? anchor.width : anchor.height) / 2
			- (x ? floater.width : floater.height) / 2
		);
	}

	if (x ? position.startsWith('horizontal') : position.startsWith('vertical')) {
		return getAbsolute({
			preferMin,
			end: x ? anchor.right : anchor.bottom,
			max: x ? globalThis.innerWidth : globalThis.innerHeight,
			offset: x ? floater.width : floater.height,
			start: x ? anchor.left : anchor.top,
		});
	}

	return x ? anchor.left : anchor.bottom;
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
		anchor.after(floater);
	}

	function onRepeat() {
		const currentPosition = getPosition(
			(parent ?? anchor).getAttribute(parameters.position.attribute) ?? '',
			parameters.position.defaultValue,
		);

		const currentRectangle = anchor.getBoundingClientRect();

		if (
			previousPosition === currentPosition
			&& domRectKeys.every(
				key => previousRectangle?.[key] === currentRectangle[key],
			)
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
