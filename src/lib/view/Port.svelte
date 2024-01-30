<script lang="ts">
	import { EDITOR_CONTEXT, EditorTickEvent, type IEditorContext } from '$lib/core/editor.ts';
	import type { IConnection } from '$lib/core/node.ts';
	import type NodeTree from '$lib/core/nodeTree.ts';
	import { getContext } from 'svelte';

	export let tree: NodeTree;
	export let parentNodeID: string;
	export let portID: string;
	export let isOutput: boolean = true;

	$: id = `${isOutput ? 'out' : 'in'}_${parentNodeID}_${portID}`;
	let context = getContext<IEditorContext>(EDITOR_CONTEXT);

	function beginNewConnection(e: MouseEvent) {
		if (e.shiftKey && tree.hasConnection(parentNodeID, portID)) {
			// This is never null as we check whether this connection exists before.
			let pconn = tree.removeConnection(parentNodeID, portID) as IConnection;
			context.currently_held = {
				node: pconn.source,
				port: pconn.source_port,
				isOutput: true
			};
			context.ports[id].dispatchEvent(new EditorTickEvent());
			return;
		}
		context.currently_held = {
			node: parentNodeID,
			port: portID,
			isOutput
		};
	}

	function tryCreateConnection(e: MouseEvent) {
		if (!context.currently_held) return;
		if (context.currently_held.isOutput == isOutput) return;

		if (isOutput) {
			tree.connect(parentNodeID, portID, context.currently_held.node, context.currently_held.port);
		} else {
			tree.connect(context.currently_held.node, context.currently_held.port, parentNodeID, portID);
		}
		context.currently_held = null;
		// Tick editor to force update in DOM
		context.ports[id].dispatchEvent(new EditorTickEvent());
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="liquidnodes_port"
	class:liquidnodes_port_right={isOutput}
	class:liquidnodes_port_left={!isOutput}
	id={`liquidnodes_port_${id}`}
	bind:this={context.ports[id]}
	on:mousedown|stopPropagation|preventDefault={beginNewConnection}
	on:mouseup|preventDefault={tryCreateConnection}
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

	.liquidnodes_port:hover {
		transform: scale(1.2);
	}

	.liquidnodes_port_right {
		right: -7px;
	}

	.liquidnodes_port_left {
		left: -7px;
	}
</style>
