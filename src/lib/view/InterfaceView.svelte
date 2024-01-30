<script lang="ts">
	import NodeTree from '$lib/core/nodeTree.ts';
	import { type INodeInterface } from '$lib/core/node.ts';
	import Port from './Port.svelte';

	type Ty = $$Generic;

	export let tree: NodeTree;
	export let interID: string;
	export let inter: INodeInterface<Ty, any>;
	export let parentNodeID: string;
	export let isOutput: boolean = true;

	$: isConnected = tree.hasConnection(parentNodeID, interID);
	$: showInterface = !(isConnected && inter.hideWhenConnected);
</script>

<div class="liquidnodes_interface" class:liquidnodes_interface_output={isOutput}>
	<div class="liquidnodes_interface_content">
		{#if inter.displayDefaultTitle || !showInterface}
			<p class="liquidnodes_interface_title">{inter.title}</p>
		{/if}
		{#if inter.component && showInterface}
			<svelte:component this={inter.component} {tree} {inter} />
		{/if}
	</div>
	<Port {tree} {isOutput} {inter} {parentNodeID} portID={interID} />
</div>

<style>
	.liquidnodes_interface {
		width: 100%;
		position: relative;
		margin-top: 0.75em;
	}

	.liquidnodes_interface_output .liquidnodes_interface_title {
		text-align: right;
	}

	.liquidnodes_interface_content {
		padding: 0 10px;
		display: flex;
		flex-direction: column;
		row-gap: 0.5em;
	}

	.liquidnodes_interface_title {
		font-size: small;
		color: var(--liquidnodes-node-text);
		margin: 0;
		padding-top: 3px;
		width: 100%;
	}
</style>
