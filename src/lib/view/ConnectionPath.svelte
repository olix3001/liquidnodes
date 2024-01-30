<script lang="ts">
	import {
		EDITOR_CONTEXT,
		createConnectionSplinePath,
		type IEditorContext,
		getPortPositions,
		type IPortPositions
	} from '$lib/core/editor.ts';
	import type NodeTree from '$lib/core/nodeTree.ts';
	import { beforeUpdate, getContext, onDestroy, onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';

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
	let color: string = '-';
	let gradient: {
		name: string;
		start: string;
		stop: string;
		positions: IPortPositions;
	} | null = null;
	const updatePath = () => {
		const positions = getPortPositions(context.editor as HTMLDivElement, source, target);
		if (positions == null) return;
		path = createConnectionSplinePath(positions);
		updateConnectionColor(positions);
	};

	function updateConnectionColor(positions: IPortPositions) {
		const source_inter = tree.getInterface(connection.source, connection.source_port, true);
		const target_inter = tree.getInterface(connection.target, connection.target_port, false);

		if (source_inter.type.color == target_inter.type.color) {
			color = source_inter.type.color;
			return;
		}

		// Create gradient
		// TODO: use one gradient where viable
		let gradientUID = uuidv4();
		color = `url(#type_grad_${gradientUID})`;
		gradient = {
			name: `type_grad_${gradientUID}`,
			start: source_inter.type.color,
			stop: target_inter.type.color,
			positions
		};
	}

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
	{#if gradient != null}
		<defs>
			<linearGradient
				id={gradient.name}
				x1={gradient.positions.sx}
				y1={gradient.positions.sy}
				x2={gradient.positions.tx}
				y2={gradient.positions.ty}
				gradientUnits="userSpaceOnUse"
			>
				<stop offset="0" stop-color={gradient.start} />
				<stop offset="1" stop-color={gradient.stop} />
			</linearGradient>
		</defs>
	{/if}
	<path stroke={color} stroke-width="2" fill-opacity="0" d={path} />
{/if}
