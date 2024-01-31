<script lang="ts">
	import {
		ChangeInterfaceValueNodeEvent,
		type IInterfaceInfo,
		type INodeInterface,
		type NodeUID
	} from '$lib/core/node.ts';
	import type NodeTree from '$lib/core/nodeTree.ts';

	export let node: NodeUID;
	export let info: IInterfaceInfo;
	export let tree: NodeTree;
	export let inter: INodeInterface<string, {}>;

	function handleInput(e: Event) {
		tree.notifyNodeUpdate(
			node,
			new ChangeInterfaceValueNodeEvent({
				newValue: (e.target as HTMLInputElement).value,
				isOutput: info.isOutput,
				port: info.name,
				inter: inter
			})
		);
	}
</script>

<input
	class="liquidnodes_input"
	type="text"
	bind:value={inter.value}
	placeholder="Enter text..."
	on:input={handleInput}
/>

<style>
	.liquidnodes_input {
		outline: none;
		border-radius: 5px;
		background-color: var(--liquidnodes-node-box);
		border: none;
		color: white;
		padding: 0.25em 0.5em;
	}

	.liquidnodes_input:focus {
		outline: 1px solid var(--liquidnodes-node-highlight);
	}

	.liquidnodes_input::-webkit-outer-spin-button,
	.liquidnodes_input::-webkit-inner-spin-button {
		appearance: none;
		margin: 0;
	}
</style>
