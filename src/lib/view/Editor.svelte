<script lang="ts">
	import { type IPosition } from '$lib/core/common.js';
	import NodeTree from '$lib/core/nodeTree.js';
	import NodeView from './NodeView.svelte';
	import ConnectionPath from './ConnectionPath.svelte';
	import CurrentlyHeldConnectionPath from './CurrentlyHeldConnectionPath.svelte';
	import { onMount, setContext } from 'svelte';
	import { EDITOR_CONTEXT, EditorTickEvent, type IEditorContext } from '$lib/core/editor.ts';
	import ContextMenu from './ContextMenu.svelte';
	import { writable, type Writable } from 'svelte/store';
	import { ZoomInIcon } from 'lucide-svelte';

	export let tree: NodeTree;

	let EDITOR: HTMLDivElement;
	let EDITOR_MAIN: HTMLDivElement;
	let handleContextMenu: (e: MouseEvent) => Promise<void>;

	let editorOffset: IPosition = { x: 0, y: 0 };
	let editorZoom: number = 1;

	let isDragging: boolean = false;

	$: transform = `transform: translate(${editorOffset.x}px, ${editorOffset.y}px) scale(${editorZoom});`;
	$: inverseTransform = `transform: scale(${1 / editorZoom});`;

	// Initialize context to pass data about ports and nodes
	let context = setContext<IEditorContext>(EDITOR_CONTEXT, {
		nodes: {},
		ports: {},
		currently_held: null,
		editor: null,
		selectedNodes: writable([]),
		dragContext: writable({
			isDragging: false,
			delta: { x: 0, y: 0 }
		})
	});
	tree.updateEditorContext(context);
	let selectedNodes = context.selectedNodes;

	function handleMouseDown(event: MouseEvent) {
		if (event.button == 1) {
			isDragging = true;
		}
	}
	function handleMouseUp(event: MouseEvent) {
		if (event.button == 1) {
			isDragging = false;
		}
	}

	function handleKeypress(event: KeyboardEvent) {
		if (event.key == 'Delete') {
			for (let selectedNode of $selectedNodes) {
				tree.removeNode(selectedNode);
			}
			EDITOR.dispatchEvent(new EditorTickEvent());
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

	function updateEditor(e: EditorTickEvent) {
		// This may allow nested editors (not tested)
		e.stopPropagation();
		tree = tree;
	}

	onMount(() => {
		EDITOR.addEventListener('editor_tick', updateEditor);
		context.editor = EDITOR_MAIN;
		return () => {
			EDITOR.removeEventListener('editor_tick', updateEditor);
		};
	});
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="liquidnodes_editor"
	bind:this={EDITOR}
	on:mousedown={handleMouseDown}
	on:mouseup={handleMouseUp}
	on:mousemove|preventDefault={moveEditor}
	on:wheel={zoomEditor}
	on:contextmenu|preventDefault={handleContextMenu}
>
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

	<ContextMenu
		{tree}
		editor={EDITOR}
		offset={editorOffset}
		zoom={editorZoom}
		bind:handleContextMenu
	/>
	<div class="liquidnodes_editor_main" style={transform} bind:this={EDITOR_MAIN}>
		<svg class="liquidnodes_connections" style={inverseTransform}>
			{#each Object.keys(tree.connections) as connectionUID (connectionUID)}
				<ConnectionPath {tree} connectionID={connectionUID} />
			{/each}

			<CurrentlyHeldConnectionPath {tree} />
		</svg>
		{#each Object.keys(tree.nodes) as node (node)}
			<!-- <p style="color: white">{node}</p> -->
			<NodeView {tree} nodeID={node} zoom={editorZoom} />
		{/each}
	</div>
	<div class="liquidnodes_zoom_info">
		<ZoomInIcon />
		<p>{(editorZoom * 100).toFixed(0)}%</p>
	</div>
</div>

<svelte:window on:keydown={handleKeypress} />

<style>
	.liquidnodes_editor {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: clip;
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

	.liquidnodes_editor_main {
		z-index: 100;
		position: absolute;
		top: 0;
		left: 0;
		transform-origin: top left;
	}

	.liquidnodes_connections {
		position: absolute;
		top: 0;
		left: 0;
		overflow: visible;
		pointer-events: none;
		user-select: none;
		z-index: 101;
		transform-origin: top left;
	}

	.liquidnodes_zoom_info {
		color: white;
		position: absolute;
		bottom: 0;
		right: 0;
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5em;
		padding: 1em 2em;
	}
</style>
