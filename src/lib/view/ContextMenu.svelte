<script lang="ts">
	import type { IPosition } from '$lib/core/common.ts';
	import type NodeTree from '$lib/core/nodeTree.ts';
	import { tick } from 'svelte';
	import { ChevronRight } from 'lucide-svelte';
	import { EditorTickEvent } from '$lib/core/editor.ts';

	let INPUT: HTMLInputElement;

	let isContextMenuOpen: boolean = false;
	let position: IPosition = {
		x: 0,
		y: 0
	};

	$: transformStyle = `transform: translate(${position.x}px, ${position.y}px)`;

	export let tree: NodeTree;
	export let editor: HTMLDivElement;
	export async function handleContextMenu(e: MouseEvent) {
		position = {
			x: e.clientX,
			y: e.clientY
		};
		if (!isContextMenuOpen) isContextMenuOpen = true;
		await tick();
		INPUT.focus();
	}
	function handleCloseContext() {
		isContextMenuOpen = false;
	}
	function insertNode(nodeID: string) {
		tree.insertNodeAt(nodeID, position);
		handleCloseContext();
		// Refresh editor
		INPUT.dispatchEvent(new EditorTickEvent());
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if isContextMenuOpen}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="liquidnodes_context_menu" style={transformStyle} on:click|stopPropagation>
		<input placeholder="Search" bind:this={INPUT} />
		<div class="liquidnodes_context_categories">
			{#each Object.entries(tree.categories) as category (category[0])}
				<div class="liquidnodes_context_category">
					<p>{category[0]}</p>
					<ChevronRight size={15} />
					<div class="liquidnodes_context_node_list">
						{#each category[1] as nodeID (nodeID)}
							<button on:click={() => insertNode(nodeID)}>{tree.getNodeType(nodeID).title}</button>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}

<svelte:body on:click={handleCloseContext} />

<style>
	.liquidnodes_context_menu {
		position: absolute;
		color: var(--liquidnodes-node-text);
		top: 0;
		left: 0;
		background-color: var(--liquidnodes-node-background);
		padding: 5px;
		border-radius: 5px;
	}

	.liquidnodes_context_categories {
		display: flex;
		flex-direction: column;
		margin-top: 0.5em;
		gap: 0.35em;
	}

	.liquidnodes_context_category {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		padding: 0.2em;
		padding-left: 1em;
		padding-right: 0.25em;
		cursor: pointer;
		position: relative;
	}
	.liquidnodes_context_category:hover {
		background-color: var(--liquidnodes-node-box);
		border-radius: 2px;
	}
	.liquidnodes_context_category > p {
		font-size: small;
		margin: 0;
	}

	.liquidnodes_context_menu > input {
		outline: none;
		border: none;
		background-color: var(--liquidnodes-node-box);
		padding: 0.4em;
		color: var(--liquidnodes-node-text);
	}

	.liquidnodes_context_node_list {
		display: none;
		position: absolute;
		right: 0;
		transform: translateX(100%);
		background-color: var(--liquidnodes-node-background);
		border-radius: 2px;
		flex-direction: column;
		font-size: small;
		gap: 0.5em;
		padding: 0.3em;
		border: 1px solid var(--liquidnodes-node-box);
		bottom: 0;
	}
	.liquidnodes_context_node_list > button {
		margin: 0;
		padding: 0.3em 0.75em;
		border-radius: 2px;
		border: none;
		background-color: var(--liquidnodes-node-background);
		cursor: pointer;
		color: var(--liquidnodes-node-text);
		text-align: start;
	}
	.liquidnodes_context_node_list > button:hover {
		background-color: var(--liquidnodes-node-box);
	}
	.liquidnodes_context_category:hover > .liquidnodes_context_node_list {
		display: flex;
	}
</style>
