import {delay, getAttribute} from '.';

type Callbacks = {
	after?: () => void;
	getPosition: (type: string, elements: Rects) => Position;
	validate: () => boolean;
};

export type Coordinate = {
	left: number;
	top: number;
};

type Elements = {
	anchor: HTMLElement;
	floater: HTMLElement;
	parent?: HTMLElement;
};

export type Position = {
	coordinate: Coordinate;
	type: string;
};

export type Types = {
	all: string[];
	default: string;
};

export type Rects = {
	anchor: DOMRect;
	floater: DOMRect;
	parent?: DOMRect;
};

export class Floated {
	static update(
		elements: Elements,
		types: Types,
		callbacks: Callbacks,
	): void {
		const {anchor, floater, parent} = elements;
		const {after, getPosition, validate} = callbacks;

		function step(): void {
			if (!validate()) {
				return;
			}

			const type = Floated.getType(parent ?? anchor, types);

			const position = getPosition(type, {
				anchor: anchor.getBoundingClientRect(),
				floater: floater.getBoundingClientRect(),
				parent: parent?.getBoundingClientRect(),
			});

			Floated.setPosition(floater, position);

			after?.();

			delay(step);
		}

		delay(step);
	}

	private static getType(element: HTMLElement, types: Types): string {
		const position = getAttribute(element, 'position', types.default);

		return types.all.includes(position)
			? position
			: types.default;
	}

	private static setPosition(floater: HTMLElement, position: Position): void {
		const {left, top} = position.coordinate;

		if (floater.getAttribute('position') !== position.type) {
			floater.setAttribute('position', position.type);
		}

		const matrix = `matrix(1, 0, 0, 1, ${left}, ${top})`;

		if (floater.style.transform === matrix) {
			return;
		}

		floater.style.inset = '0 auto auto 0';
		floater.style.position = 'fixed';
		floater.style.transform = matrix;

		if (floater.hidden) {
			delay(() => {
				floater.hidden = false;
			});
		}
	}
}
