<script lang="ts">
	import type { IPosition } from '$lib/core/common.js';
	import NodeTree from '$lib/core/nodeTree.js';

	export let nodeTree: NodeTree;

	let EDITOR: HTMLDivElement;

	let editorOffset: IPosition = { x: 0, y: 0 };
	let editorZoom: number = 1;

	let isDragging: boolean = false;

	$: transform = `transform: 
		translate(${editorOffset.x}px, ${editorOffset.y}px)
		scale(${editorZoom})
		`;

	function handleMouseDown(event: MouseEvent) {
		if (event.button == 0) {
			isDragging = true;
		}
	}
	function handleMouseUp(event: MouseEvent) {
		if (event.button == 0) {
			isDragging = false;
		}
	}

	function moveEditor(event: MouseEvent) {
		if (isDragging) {
			editorOffset.x += event.movementX;
			editorOffset.y += event.movementY;
		}
	}
	function zoomEditor(event: WheelEvent) {
		event.preventDefault();

		const zoomFactor = event.deltaY * -0.001;
		const zoom = editorZoom + zoomFactor;

		if (zoom > 0.5 && zoom < 2) {
			const oldZoom = editorZoom;
			editorZoom = zoom;

			// Calculate offset so that cursor is kept in one place
			const rect = EDITOR.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			const offsetX = x - (editorZoom / oldZoom) * (x - editorOffset.x);
			const offsetY = y - (editorZoom / oldZoom) * (y - editorOffset.y);

			editorOffset.x = offsetX;
			editorOffset.y = offsetY;
		}
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="liquidnodes_editor"
	bind:this={EDITOR}
	on:mousedown={handleMouseDown}
	on:mouseup={handleMouseUp}
	on:mousemove|preventDefault={moveEditor}
	on:wheel={zoomEditor}
>
	position: {JSON.stringify(editorOffset)}
	<svg class="liquidnodes_editor_background">
		<defs>
			<pattern
				id="grid"
				width={10 * editorZoom}
				height={10 * editorZoom}
				patternUnits="userSpaceOnUse"
				x={editorOffset.x}
				y={editorOffset.y}
			>
				<circle
					cx={editorZoom}
					cy={editorZoom}
					r={editorZoom}
					fill="var(--liquidnodes-background-dots)"
				/>
			</pattern>
		</defs>
		<rect width="100%" height="100%" fill="url(#grid)"></rect>
	</svg>
</div>

<style>
	.liquidnodes_editor {
		position: relative;
		width: 100%;
		height: 100%;
	}
	.liquidnodes_editor_background {
		/* Disable interactions with the background */
		user-select: none;
		pointer-events: none;
		z-index: -100;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: var(--liquidnodes-background-color);
	}
</style>
