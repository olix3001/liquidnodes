<script lang="ts">
	import Editor from '$lib/view/Editor.svelte';
	import NodeTree from '$lib/core/nodeTree.ts';
	import {
		FlowState,
		defineNode,
		NewConnectionNodeEvent,
		RemoveConnectionNodeEvent
	} from '$lib/core/node.ts';
	import '$lib/style/defaultEditorStyle.css';
	import {
		BaseTypes,
		BooleanInterface,
		FlowInterface,
		NodeInterface,
		NumberInterface,
		TextInterface
	} from '$lib/core/interfaces.ts';
	import ForwardEngine from '$lib/engine/forwardEngine.ts';

	let tree = new NodeTree();

	const GreaterThanNode = defineNode(
		{
			category: 'Comparison',
			id: 'greaterthan',
			title: 'Greater Than',
			description: 'Check if A > B.',
			flow: FlowState.IN_OUT,
			inputs: {
				a: () => new NumberInterface('A'),
				b: () => new NumberInterface('B')
			},

			outputs: {
				result: () => new NodeInterface('Result', BaseTypes.BOOLEAN)
			}
		},
		({ a, b }) => {
			return {
				result: a > b
			};
		}
	);

	const AddNode = defineNode(
		{
			category: 'Math',
			id: 'addition',
			title: 'Add',
			description: 'Add two numbers together.',
			inputs: {
				a: () => new NumberInterface('Number'),
				b: () => new NumberInterface('Number')
			},
			outputs: {
				result: () => new NodeInterface('Result', BaseTypes.NUMBER)
			}
		},
		({ a, b }) => {
			return {
				result: a + b
			};
		}
	);
	const ConsoleLogNode = defineNode(
		{
			category: 'Util',
			id: 'consolelog',
			title: 'Debug Print',
			description: 'Prints value to the console.',
			flow: FlowState.IN_OUT,
			inputs: {
				value: () => new NodeInterface('Value', BaseTypes.ANY)
			}
		},
		({ value }) => {
			console.log(value);
			return {};
		}
	);

	const ConstantTextNode = defineNode(
		{
			category: 'Util',
			id: 'consttext',
			title: 'Constant text',
			description: 'Returns whatever text you enter.',
			inputs: {
				text: () => new TextInterface('Text').setPort(false).hideDefaultTitle()
			},
			outputs: {
				text: () => new NodeInterface('Text', BaseTypes.STRING)
			}
		},
		(inputs) => inputs
	);

	const ConstantBooleanNode = defineNode(
		{
			category: 'Util',
			id: 'constbool',
			title: 'Constant boolean',
			description: 'Returns true if checkbox is selected.',
			inputs: {
				value: () => new BooleanInterface('Value').setPort(false)
			},
			outputs: {
				value: () => new NodeInterface('Value', BaseTypes.BOOLEAN)
			}
		},
		(inputs) => inputs
	);

	const StartNode = defineNode({
		category: 'Flow',
		id: 'start',
		title: 'Start',
		description: 'Entry point for your program.',
		flow: FlowState.OUT
	});

	const ConcatNode = defineNode(
		{
			category: 'Util',
			id: 'concattext',
			title: 'Concatenate',
			description: 'Concatenate text.',
			inputs: {
				frag1: () => new TextInterface('Fragment').hideDefaultTitle()
			},
			outputs: {
				result: () => new NodeInterface('Text', BaseTypes.STRING)
			},
			onUpdate(event, node, tree) {
				if (event instanceof NewConnectionNodeEvent && !event.isOutgoing) {
					node.addInputInterface(
						`frag${Object.keys(node.input_interfaces).length + 1}`,
						new TextInterface('Fragment').hideDefaultTitle()
					);
				} else if (event instanceof RemoveConnectionNodeEvent && !event.isOutgoing) {
					node.removeInputInterfaces(tree, [`frag${Object.keys(node.input_interfaces).length}`]);
				}
			}
		},
		(inputs: any) => {
			return { result: Object.values(inputs).join(' ') };
		}
	);

	const SwitchNode = defineNode(
		{
			category: 'Flow',
			id: 'dataswitch',
			title: 'Switch',
			description: 'Output data based on boolean',
			flow: FlowState.IN_OUT,
			inputs: {
				condition: () => new BooleanInterface('Condition'),
				data_true: () => new NodeInterface<any>('True', BaseTypes.ANY),
				data_false: () => new NodeInterface<any>('False', BaseTypes.ANY)
			},
			outputs: {
				data: () => new NodeInterface<any>('Data', BaseTypes.ANY)
			},
			onCreate(node, tree) {
				node.data.current_type = BaseTypes.ANY;
			},
			onUpdate(event, node, tree) {
				function updateAllPortTypes() {
					node.changeInputNIType(tree, 'data_true', node.data.current_type);
					node.changeInputNIType(tree, 'data_false', node.data.current_type);
					node.changeOutputNIType(tree, 'data', node.data.current_type);
				}

				if (event instanceof NewConnectionNodeEvent) {
					if (event.port != 'condition') {
						if (node.data.current_type.id == 'ANY') {
							node.data.current_type = event.port == 'data' ? event.types.in : event.types.out;
							updateAllPortTypes();
						}
					}
				} else if (event instanceof RemoveConnectionNodeEvent) {
					if (event.port != 'condition') {
						const isAnyConnected =
							tree.hasConnection(node.id, 'data_true', false) ||
							tree.hasConnection(node.id, 'data_false', false) ||
							tree.hasConnection(node.id, 'data', true);

						if (!isAnyConnected) {
							node.data.current_type = BaseTypes.ANY;
							updateAllPortTypes();
						}
					}
				}
			}
		},
		({ condition, data_true, data_false }) => {
			return {
				data: condition ? data_true : data_false
			};
		}
	);

	const BranchNode = defineNode(
		{
			category: 'Flow',
			id: 'branchflow',
			title: 'Branch',
			description: 'Branches based on condition variable',
			flow: FlowState.IN,
			inputs: {
				condition: () => new BooleanInterface('Condition'),
				flow_true: () => new FlowInterface('True'),
				flow_false: () => new FlowInterface('False')
			}
		},
		({ condition, flow_true, flow_false }) => {
			if (condition) flow_true.fire();
			else flow_false.fire();
			return {};
		}
	);

	const UserInputNode = defineNode(
		{
			category: 'Interaction',
			id: 'userinput',
			title: 'User input',
			description: 'Asks user for an input.',
			flow: FlowState.IN_OUT,
			inputs: {
				prompt: () => new TextInterface('Prompt')
			},
			outputs: {
				answer: () => new NodeInterface('Answer', BaseTypes.STRING)
			}
		},
		({ prompt }) => {
			return {
				answer: window.prompt(prompt)
			};
		}
	);

	const ParseIntNode = defineNode(
		{
			category: 'Util',
			id: 'parseint',
			title: 'Parse Integer',
			description: 'Parse text as an integer. Warning: may return undefined/null!',
			inputs: {
				text: () => new NodeInterface('Text', BaseTypes.STRING)
			},
			outputs: {
				result: () => new NodeInterface('Number', BaseTypes.NUMBER)
			}
		},
		({ text }) => ({ result: parseInt(text) })
	);

	const AlertNode = defineNode(
		{
			category: 'Interaction',
			id: 'alert',
			title: 'Alert',
			description: 'Shows browser native alert with custom text.',
			flow: FlowState.IN_OUT,
			inputs: {
				text: () => new TextInterface('Text')
			}
		},
		({ text }) => {
			window.alert(text);
			return {};
		}
	);

	tree.registerNodeType(new AddNode());
	tree.registerNodeType(new GreaterThanNode());
	tree.registerNodeType(new ConsoleLogNode());
	tree.registerNodeType(new StartNode());
	tree.registerNodeType(new ConstantTextNode());
	tree.registerNodeType(new ConstantBooleanNode());
	tree.registerNodeType(new ConcatNode());
	tree.registerNodeType(new SwitchNode());
	tree.registerNodeType(new BranchNode());
	tree.registerNodeType(new UserInputNode());
	tree.registerNodeType(new ParseIntNode());
	tree.registerNodeType(new AlertNode());

	function runTree() {
		const engine = new ForwardEngine(tree);
		engine.runFromType('start');
	}
</script>

<div class="screen">
	<Editor {tree} />
	<div class="runner">
		<button on:click={runTree}>Run from start</button>
	</div>
</div>

<style>
	.screen {
		width: 100vw;
		height: 100vh;
		margin: 0;
		padding: 0;
		position: relative;
	}

	:global(body) {
		padding: 0;
		margin: 0;
	}

	.runner {
		position: absolute;
		right: 0;
		top: 0;
		backdrop-filter: blur(2px) saturate(180%);
		border-radius: 10px;
		padding: 1em;
	}
</style>
