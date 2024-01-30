<script lang="ts">
	import { getContext } from 'svelte';
	import {
		type IEditorContext,
		EDITOR_CONTEXT,
		createConnectionSplinePath,
		CustomRectPosition
	} from '$lib/core/editor.ts';

	let context = getContext<IEditorContext>(EDITOR_CONTEXT);

	let path: string | null;
	const updatePath = (e: MouseEvent) => {
		if (!context.currently_held) return;
		let held = context.currently_held;
		if (context.currently_held.isOutput) {
			path = createConnectionSplinePath(
				context.ports[`out_${held.node}_${held.port}`],
				new CustomRectPosition(e.clientX, e.clientY)
			);
		} else {
			path = createConnectionSplinePath(
				new CustomRectPosition(e.clientX, e.clientY),
				context.ports[`in_${held.node}_${held.port}`]
			);
		}
	};

	function handleMouseMove(e: MouseEvent) {
		if (!context.currently_held) return;
		updatePath(e);
	}

	function handleMouseUp(e: MouseEvent) {
		context.currently_held = null;
	}
</script>

{#if path && context.currently_held}
	<path
		stroke="#fff"
		stroke-width="2"
		d={path}
		fill-opacity="0"
		id="liquidnodes_currently_held_connection"
	/>
{/if}
<svelte:body on:mousemove={handleMouseMove} on:mouseup={handleMouseUp} />
