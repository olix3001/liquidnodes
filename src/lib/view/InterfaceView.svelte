<script lang="ts">
	import NodeTree from '$lib/core/nodeTree.ts';
	import { type INodeInterface } from '$lib/core/node.ts';
	import Port from './Port.svelte';

	type Ty = $$Generic;

	export let tree: NodeTree;
	export let inter: INodeInterface<Ty, any>;
	export let isOutput: boolean = true;
</script>

<div class="liquidnodes_interface" class:liquidnodes_interface_output={isOutput}>
	<div class="liquidnodes_interface_content">
		{#if inter.displayDefaultTitle}
			<p class="liquidnodes_interface_title">{inter.title}</p>
		{/if}
		{#if inter.component}
			<svelte:component this={inter.component} {tree} {inter} />
		{/if}
	</div>
	<Port {isOutput} />
</div>

<style>
	.liquidnodes_interface {
		width: 100%;
		position: relative;
		margin-top: 0.75em;
	}

	.liquidnodes_interface_output .liquidnodes_interface_content {
		display: flex;
		justify-content: flex-end;
	}
	:not(.liquidnodes_interface_output) .liquidnodes_interface_content {
		display: flex;
		justify-content: flex-start;
	}

	.liquidnodes_interface_content {
		padding: 0 10px;
	}

	.liquidnodes_interface_title {
		font-size: small;
		color: var(--liquidnodes-node-text);
		margin: 0;
		padding-top: 3px;
	}
</style>
