<script lang="ts">
	import { EDITOR_CONTEXT, type IEditorContext } from '$lib/core/editor.ts';
	import { getContext } from 'svelte';

	export let parentNodeID: string;
	export let portID: string;
	export let isOutput: boolean = true;

	$: id = `${isOutput ? 'out' : 'in'}_${parentNodeID}_${portID}`;
	let context = getContext<IEditorContext>(EDITOR_CONTEXT);
</script>

<div
	class="liquidnodes_port"
	class:liquidnodes_port_right={isOutput}
	class:liquidnodes_port_left={!isOutput}
	id={`liquidnodes_port_${id}`}
	bind:this={context.ports[id]}
></div>

<style>
	.liquidnodes_port {
		width: 10px;
		height: 10px;
		background-color: white;
		border-radius: 50%;
		position: absolute;
		top: 5px;
		cursor: pointer;
	}

	.liquidnodes_port_right {
		right: -7px;
	}

	.liquidnodes_port_left {
		left: -7px;
	}
</style>
