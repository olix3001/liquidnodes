<script lang="ts">
	import type { IPosition } from '$lib/core/common.ts';
	import type NodeTree from '$lib/core/nodeTree.ts';
	import { tick } from 'svelte';
	import { ChevronRight } from 'lucide-svelte';
	import { EditorTickEvent } from '$lib/core/editor.ts';
	import { type INode } from '$lib/core/node.ts';

	let INPUT: HTMLInputElement;

	let isContextMenuOpen: boolean = false;
	let position: IPosition = {
		x: 0,
		y: 0
	};
	let searchResult: string[] | null = null;

	$: transformStyle = `transform: translate(${position.x}px, ${position.y}px)`;

	export let tree: NodeTree;
	export let editor: HTMLDivElement;
	export let offset: IPosition;
	export let zoom: number;
	export async function handleContextMenu(e: MouseEvent) {
		const editorBB = editor.getBoundingClientRect();
		position = {
			x: e.clientX - editorBB.x,
			y: e.clientY - editorBB.y
		};
		if (!isContextMenuOpen) isContextMenuOpen = true;
		await tick();
		INPUT.focus();
	}
	function handleCloseContext() {
		if (INPUT) INPUT.value = '';
		searchResult = null;
		isContextMenuOpen = false;
	}
	function insertNode(nodeID: string) {
		tree.insertNodeAt(nodeID, {
			x: (position.x - offset.x) / zoom,
			y: (position.y - offset.y) / zoom
		});
		handleCloseContext();
		// Refresh editor
		INPUT.dispatchEvent(new EditorTickEvent());
	}

	function matchesSearch(search: string, node: INode<any, any, any>): boolean {
		return node.title.toLowerCase().includes(search.toLowerCase());
	}

	function updateSearch(e: Event) {
		const search = (e.target as HTMLInputElement).value;
		if (search === '') {
			searchResult = null;
		} else {
			const searchR: string[] = [];
			for (let category of Object.values(tree.categories)) {
				for (let node of category) {
					if (matchesSearch(search, tree.getNodeType(node))) searchR.push(node);
				}
			}
			searchResult = searchR;
		}
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if isContextMenuOpen}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="liquidnodes_context_menu" style={transformStyle} on:click|stopPropagation>
		<input placeholder="Search" bind:this={INPUT} on:input={updateSearch} />
		<div class="liquidnodes_context_categories">
			{#if searchResult == null}
				{#each Object.entries(tree.categories) as category (category[0])}
					<div class="liquidnodes_context_category">
						<p>{category[0]}</p>
						<ChevronRight size={15} />
						<div class="liquidnodes_context_node_list">
							{#each category[1] as nodeID (nodeID)}
								<button on:click={() => insertNode(nodeID)}>{tree.getNodeType(nodeID).title}</button
								>
							{/each}
						</div>
					</div>
				{/each}
			{:else}
				<div class="liquidnodes_context_categories">
					{#each searchResult as nodeID (nodeID)}
						<button on:click={() => insertNode(nodeID)}>{tree.getNodeType(nodeID).title}</button>
					{/each}
				</div>
			{/if}
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

	.liquidnodes_context_categories > button {
		margin: 0;
		padding: 0.3em 0.75em;
		border-radius: 2px;
		border: none;
		background-color: var(--liquidnodes-node-background);
		cursor: pointer;
		color: var(--liquidnodes-node-text);
		text-align: start;
	}
	.liquidnodes_context_categories > button:hover {
		background-color: var(--liquidnodes-node-box);
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
