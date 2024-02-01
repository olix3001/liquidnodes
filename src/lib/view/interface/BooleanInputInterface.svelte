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
	export let inter: INodeInterface<boolean, {}>;

	function handleInput(e: Event) {
		tree.notifyNodeUpdate(
			node,
			new ChangeInterfaceValueNodeEvent({
				newValue: (e.target as HTMLInputElement).checked,
				isOutput: info.isOutput,
				port: info.name,
				inter: inter
			})
		);
	}
</script>

<div class="liquidnodes_input_container">
	<input
		class="liquidnodes_input"
		type="checkbox"
		name="interface_input"
		bind:checked={inter.value}
		on:input={handleInput}
	/>
	<label for="interface_input" class="liquidnodes_input_label">{inter.title}</label>
</div>

<style>
	.liquidnodes_input_container {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.liquidnodes_input {
		appearance: none;
		outline: none;
		border-radius: 5px;
		background-color: var(--liquidnodes-node-box);
		border: none;
		background-color: var(--liquidnodes-node-box);
		width: 1.15em;
		height: 1.15em;
		margin-right: 0.5em;
		transform: translateY(0.075em);
		display: grid;
		place-content: center;
		outline: 1px solid var(--liquidnodes-node-highlight);
	}

	.liquidnodes_input::before {
		content: '';
		width: 0.85em;
		height: 0.85em;
		transform: scale(0);
		transition: 120ms transform ease-in-out;
		box-shadow: inset 1em 1em var(--liquidnodes-inter-color);
		border-radius: 3px;
	}
	.liquidnodes_input:checked::before {
		transform: scale(1);
	}

	.liquidnodes_input:focus {
		outline: 1px solid var(--liquidnodes-node-highlight);
	}

	.liquidnodes_input_label {
		font-size: small;
		color: var(--liquidnodes-node-text);
	}
</style>
