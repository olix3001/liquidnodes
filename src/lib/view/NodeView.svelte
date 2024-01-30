<script lang="ts">
	import { EDITOR_CONTEXT, type IEditorContext, NodeMoveEvent } from '$lib/core/editor.ts';
	import type NodeTree from '$lib/core/nodeTree.ts';
	import { afterUpdate, getContext } from 'svelte';
	import InterfaceView from './InterfaceView.svelte';
	import Port from './Port.svelte';

	export let tree: NodeTree;
	export let nodeID: string;
	export let zoom: number;

	$: node = tree.nodes[nodeID];
	$: mtype = tree.getNodeType(node.type_id);
	$: position = `left: ${node.position.x}px; top: ${node.position.y}px;`;
	$: id = `liquidnodes_node_${nodeID}`;

	let isDragging: boolean = false;
	let context = getContext<IEditorContext>(EDITOR_CONTEXT);

	$: melement = context.nodes[nodeID];

	function startDrag(event: MouseEvent) {
		if (event.button == 0) {
			isDragging = true;
		}
	}

	function stopDrag(event: MouseEvent) {
		if (event.button == 0) {
			isDragging = false;
		}
	}

	function moveNode(event: MouseEvent) {
		if (isDragging) {
			node.position.x += event.movementX * (1 / zoom);
			node.position.y += event.movementY * (1 / zoom);
		}
	}
	afterUpdate(() => {
		if (melement) melement.dispatchEvent(new NodeMoveEvent());
	});
</script>

<div class="liquidnodes_node" style={position} {id} bind:this={context.nodes[nodeID]}>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="liquidnodes_node_header" on:mousedown|stopPropagation|preventDefault={startDrag}>
		{#if node.flow_in_interface}
			<Port
				{tree}
				isOutput={false}
				isFlow={true}
				inter={node.flow_in_interface}
				parentNodeID={nodeID}
				portID={'__flow_in'}
			/>
		{/if}
		<div class="liquidnodes_node_header_text">
			<p class="liquidnodes_node_title">{mtype.title}</p>
			<p class="liquidnodes_node_desc">{mtype.description}</p>
		</div>
		{#if node.flow_out_interface}
			<Port
				{tree}
				isOutput={true}
				isFlow={true}
				inter={node.flow_out_interface}
				parentNodeID={nodeID}
				portID={'__flow_out'}
			/>
		{/if}
	</div>

	<div class="liquidnodes_node_io">
		<div class="liquidnodes_node_outputs">
			{#each Object.entries(node.output_interfaces) as inter}
				<InterfaceView {tree} parentNodeID={nodeID} interID={inter[0]} inter={inter[1]} />
			{/each}
		</div>
		<div class="liquidnodes_node_inputs">
			{#each Object.entries(node.input_interfaces) as inter}
				<InterfaceView
					{tree}
					parentNodeID={nodeID}
					interID={inter[0]}
					inter={inter[1]}
					isOutput={false}
				/>
			{/each}
		</div>
	</div>
</div>

<!-- Moving nodes -->
<svelte:body on:mousemove={moveNode} on:mouseup={stopDrag} />

<style>
	.liquidnodes_node {
		position: absolute;
		background-color: var(--liquidnodes-node-background);
		border-radius: 10px;
		box-shadow: 3px 2px 5px var(--liquidnodes-node-shadow);
		padding: 3px;
		min-width: 150px;
	}

	.liquidnodes_node_header {
		background-color: var(--liquidnodes-node-box);
		position: relative;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		padding: 0.35em;
		color: var(--liquidnodes-node-text);
		cursor: pointer;
		box-shadow: 0px 0px 3px var(--liquidnodes-node-shadow);
		border-radius: 7px;
	}

	.liquidnodes_node_header_text {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex: 1;
	}

	.liquidnodes_node_header_text > p {
		margin: 0;
	}

	.liquidnodes_node_title {
		font-size: small;
	}

	.liquidnodes_node_desc {
		font-size: xx-small;
		color: var(--liquidnodes-node-detail);
		text-align: center;
	}

	.liquidnodes_node_io {
		padding-bottom: 1em;
	}
</style>
