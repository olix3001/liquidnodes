export const EDITOR_CONTEXT = Symbol();
export interface IEditorContext {
	nodes: { [key: string]: HTMLDivElement };
	ports: { [key: string]: HTMLDivElement };
}

export function createConnectionSplinePath(
	source: HTMLElement | undefined,
	target: HTMLElement | undefined
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
