import type { NodeUID } from './node.ts';

export const EDITOR_CONTEXT = Symbol();
export interface IEditorContext {
	nodes: { [key: string]: HTMLDivElement };
	ports: { [key: string]: HTMLDivElement };
	currently_held: ICurrentlyHeldConnection | null;
}

export function createConnectionSplinePath(
	source: HTMLElement | CustomRectPosition | undefined,
	target: HTMLElement | CustomRectPosition | undefined
): string | null {
	if (!source || !target) {
		return null;
	}
	const source_rect = source.getBoundingClientRect();
	const target_rect = target.getBoundingClientRect();

	const source_center = {
		x: source_rect.left + source_rect.width / 2,
		y: source_rect.top + source_rect.height / 2
	};
	const target_center = {
		x: target_rect.left + target_rect.width / 2,
		y: target_rect.top + target_rect.height / 2
	};

	return `M ${source_center.x} ${source_center.y} \
    C ${source_center.x + 100} ${source_center.y} \
    ${target_center.x - 100} ${target_center.y} \
    ${target_center.x} ${target_center.y}`;
}

export class NodeMoveEvent extends Event {
	constructor() {
		super('node_move');
	}
}
export class EditorTickEvent extends Event {
	constructor() {
		super('editor_tick', {
			bubbles: true,
			cancelable: true
		});
	}
}

export interface ICurrentlyHeldConnection {
	node: NodeUID;
	port: string;
	isOutput: boolean;
}

export class CustomRectPosition {
	left: number;
	top: number;

	constructor(left: number = 0, top: number = 0) {
		this.left = left;
		this.top = top;
	}

	getBoundingClientRect() {
		return {
			left: this.left,
			top: this.top,
			width: 1,
			height: 1
		};
	}
}
