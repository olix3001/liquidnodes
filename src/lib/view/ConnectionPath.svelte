<script lang="ts">
	import {
		EDITOR_CONTEXT,
		createConnectionSplinePath,
		type IEditorContext
	} from '$lib/core/editor.ts';
	import type NodeTree from '$lib/core/nodeTree.ts';
	import { getContext, onDestroy, onMount } from 'svelte';

	export let tree: NodeTree;
	export let connectionID: string;
	$: connection = tree.connections[connectionID];
	$: sourcePortID = `out_${connection.source}_${connection.source_port}`;
	$: targetPortID = `in_${connection.target}_${connection.target_port}`;
	let context = getContext<IEditorContext>(EDITOR_CONTEXT);

	let source: HTMLDivElement | undefined;
	let target: HTMLDivElement | undefined;

	let source_node: HTMLDivElement;
	let target_node: HTMLDivElement;

	let path: string | null;
	const updatePath = () => (path = createConnectionSplinePath(source, target));

	function attachListeners() {
		if (!context || !connection) return;
		source = context.ports[sourcePortID];
		target = context.ports[targetPortID];

		source_node = context.nodes[connection.source];
		target_node = context.nodes[connection.target];

		source_node?.addEventListener('node_move', updatePath);
		target_node?.addEventListener('node_move', updatePath);

		updatePath();
	}

	onMount(() => {
		attachListeners();
		return () => {
			source_node?.removeEventListener('node_move', updatePath);
			target_node?.removeEventListener('node_move', updatePath);
		};
	});
</script>

{#if path != null}
	<path stroke="#fff" stroke-width="2" fill-opacity="0" d={path} />
{/if}
