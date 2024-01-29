<script lang="ts">
	import type { NumberInterfaceProps } from '$lib/core/interfaces.ts';
	import type { INodeInterface } from '$lib/core/node.ts';
	import type NodeTree from '$lib/core/nodeTree.ts';

	export let tree: NodeTree;
	export let inter: INodeInterface<number, NumberInterfaceProps>;
</script>

<input class="liquidnodes_input" type="number" bind:value={inter.value} />

<style>
	.liquidnodes_input {
		outline: none;
		border-radius: 5px;
		background-color: var(--liquidnodes-node-box);
		border: none;
		color: white;
		padding: 0.25em 0.5em;
	}
</style>
