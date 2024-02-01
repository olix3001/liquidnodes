<script lang="ts">
	import { EDITOR_CONTEXT, type IEditorContext, NodeMoveEvent } from '$lib/core/editor.ts';
	import type NodeTree from '$lib/core/nodeTree.ts';
	import { beforeUpdate, getContext, onDestroy } from 'svelte';
	import InterfaceView from './InterfaceView.svelte';
	import Port from './Port.svelte';

	export let tree: NodeTree;
	export let nodeID: string;
	export let zoom: number;

	$: node = tree.nodes[nodeID];
	$: mtype = tree.getNodeType(node.type_id);
	$: position = `left: ${node.position.x}px; top: ${node.position.y}px;`;
	$: id = `liquidnodes_node_${nodeID}`;

	let dragStartTime: number = Date.now();
	let context = getContext<IEditorContext>(EDITOR_CONTEXT);

	let selectedNodes = context.selectedNodes;
	let dragContext = context.dragContext;
	let unsubscribeMovement: any = null;

	$: melement = context.nodes[nodeID];

	function startDrag(event: MouseEvent) {
		if (event.button == 0) {
			$dragContext.delta = { x: 0, y: 0 };
			$dragContext.isDragging = true;
			if (event.shiftKey) {
				context.selectedNodes.update((selectedNodes) => {
					if (!selectedNodes.includes(nodeID)) selectedNodes.push(nodeID);
					return selectedNodes;
				});
			} else if (!$selectedNodes.includes(nodeID)) {
				context.selectedNodes.set([nodeID]);
			} else {
				dragStartTime = Date.now();
			}
			subscribeMovement();
		}
	}

	function subscribeMovement() {
		const startPosition = { x: node.position.x, y: node.position.y };
		if (!unsubscribeMovement)
			unsubscribeMovement = dragContext.subscribe((context) => {
				if ($selectedNodes.includes(nodeID)) {
					node.position.x = startPosition.x + context.delta.x;
					node.position.y = startPosition.y + context.delta.y;
				}
			});
	}
	function tryUnsubscribeMovement() {
		if (unsubscribeMovement) {
			unsubscribeMovement();
			unsubscribeMovement = null;
		}
	}

	function stopDrag(event: MouseEvent) {
		if (event.button == 0) {
			$dragContext.isDragging = false;
			if (Date.now() - dragStartTime < 250) {
				context.selectedNodes.set([nodeID]);
			}
		}
	}

	function moveNode(event: MouseEvent) {
		if ($dragContext.isDragging && $selectedNodes[0] == nodeID) {
			$dragContext.delta.x += event.movementX * (1 / zoom);
			$dragContext.delta.y += event.movementY * (1 / zoom);
		}
	}
	beforeUpdate(async () => {
		if (melement) melement.dispatchEvent(new NodeMoveEvent());
		if (!$selectedNodes.includes(nodeID) || !$dragContext.isDragging) {
			tryUnsubscribeMovement();
		} else if ($dragContext.isDragging) {
			subscribeMovement();
		}
	});
</script>

<div
	class="liquidnodes_node"
	style={position}
	{id}
	bind:this={context.nodes[nodeID]}
	class:liquidnodes_selected={$selectedNodes.includes(nodeID)}
>
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

	.liquidnodes_selected {
		outline: 2px dashed var(--liquidnodes-node-highlight);
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
