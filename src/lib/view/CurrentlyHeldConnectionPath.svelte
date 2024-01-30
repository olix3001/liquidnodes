<script lang="ts">
	import { getContext } from 'svelte';
	import {
		type IEditorContext,
		EDITOR_CONTEXT,
		createConnectionSplinePath,
		CustomRectPosition,
		getPortPositions,
		type IPortPositions
	} from '$lib/core/editor.ts';
	import type NodeTree from '$lib/core/nodeTree.ts';

	export let tree: NodeTree;

	let context = getContext<IEditorContext>(EDITOR_CONTEXT);

	let path: string | null;
	let color = '#fff';
	const updatePath = (e: MouseEvent) => {
		if (!context.currently_held) return;
		let held = context.currently_held;
		if (context.currently_held.isOutput) {
			path = createConnectionSplinePath(
				getPortPositions(
					context.ports[`out_${held.node}_${held.port}`],
					new CustomRectPosition(e.clientX, e.clientY)
				) as IPortPositions
			);
		} else {
			path = createConnectionSplinePath(
				getPortPositions(
					new CustomRectPosition(e.clientX, e.clientY),
					context.ports[`in_${held.node}_${held.port}`]
				) as IPortPositions
			);
		}
	};

	const updateColor = () => {
		if (!context.currently_held) return;
		const inter = tree.getInterface(
			context.currently_held.node,
			context.currently_held.port,
			context.currently_held.isOutput
		);

		color = inter.type.color;
	};

	function handleMouseMove(e: MouseEvent) {
		if (!context.currently_held) return;
		updatePath(e);
		updateColor();
	}

	function handleMouseUp(e: MouseEvent) {
		context.currently_held = null;
	}
</script>

{#if path && context.currently_held}
	<path
		stroke={color}
		stroke-width="2"
		d={path}
		fill-opacity="0"
		id="liquidnodes_currently_held_connection"
	/>
{/if}
<svelte:body on:mousemove={handleMouseMove} on:mouseup={handleMouseUp} />
