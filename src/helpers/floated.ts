import {delay} from '.';

export type Coordinate = {
	left: number;
	top: number;
};

type Elements = {
	anchor: HTMLElement;
	floater: HTMLElement;
	parent?: HTMLElement;
};

export type Positions = {
	all: string[];
	default: string;
};

export type Rects = {
	anchor: DOMRect;
	floater: DOMRect;
	parent?: DOMRect;
};

export class Floated {
	static setCoordinate(floater: HTMLElement, coordinates: Coordinate): void {
		const {left, top} = coordinates;

		floater.style.inset = '0 auto auto 0';
		floater.style.position = 'fixed';
		floater.style.transform = `translate3d(${left}px, ${top}px, 0)`;

		if (floater.hidden) {
			delay(() => {
				floater.hidden = false;
			});
		}
	}

	static update(
		elements: Elements,
		positions: Positions,
		getCoordinate: (position: string, elements: Rects) => Coordinate,
		stopUpdate: () => boolean,
	): void {
		const {anchor, floater, parent} = elements;

		function step() {
			if (stopUpdate()) {
				return;
			}

			const position = Floated.getPosition(parent ?? anchor, positions);

			floater.setAttribute('position', position);

			const coordinates = getCoordinate(position, {
				anchor: anchor.getBoundingClientRect(),
				floater: floater.getBoundingClientRect(),
				parent: parent?.getBoundingClientRect(),
			});

			Floated.setCoordinate(floater, coordinates);

			delay(step);
		}

		delay(step);
	}

	private static getPosition(element: HTMLElement, positions: Positions): string {
		const position = element.getAttribute('position');
		const normalized = position?.trim().toLowerCase();

		return normalized != null && positions.all.includes(normalized)
			? normalized
			: positions.default;
	}
}
