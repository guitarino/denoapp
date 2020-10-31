import type { Token } from './tokenize.ts';

export type NumberLiteral = {
	type: 'NumberLiteral',
	value: string,
}

export type CallExpressionNode = {
	type: 'CallExpressionNode',
	name: string,
	params: (NumberLiteral | CallExpressionNode)[],
}

export type ProgramNode = {
	type: 'ProgramNode',
	body: CallExpressionNode[],
}

export type Node = ProgramNode | CallExpressionNode | NumberLiteral;

export class UnexpectedTokenError extends Error {}

export class MissingTokenError extends Error {}

function createProgramNode(): ProgramNode {
	return {
		type: 'ProgramNode',
		body: []
	};
}

function createCallExpressionNode(): CallExpressionNode {
	return {
		type: 'CallExpressionNode',
		name: '',
		params: [],
	};
}

type NodeWalk = {
	node: ProgramNode | CallExpressionNode | NumberLiteral,
	state: string,
}

export function parse(tokens: Token[]): ProgramNode {
	const program: ProgramNode = createProgramNode();

	const nodes: NodeWalk[] = [{
		node: program,
		state: ''
	}];

	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		const current = nodes[nodes.length - 1];

		if (current.node.type === 'ProgramNode' &&
			token.type === 'paren' &&
			token.value === '(') {
			const nextNode: CallExpressionNode = createCallExpressionNode();
			nodes.push({ node: nextNode, state: 'name' });
			current.node.body.push(nextNode);
		}

		else if (current.node.type === 'CallExpressionNode' &&
			current.state === 'args' &&
			token.type === 'number') {
			current.node.params.push({
				type: 'NumberLiteral',
				value: token.value,
			});
		}

		else if (current.node.type === 'CallExpressionNode' &&
			current.state === 'args' &&
			token.type === 'paren' &&
			token.value === '(') {
			const nextNode: CallExpressionNode = createCallExpressionNode();
			nodes.push({ node: nextNode, state: 'name' });
			current.node.params.push(nextNode);
		}

		else if (current.node.type === 'CallExpressionNode' &&
			current.state === 'name' &&
			token.type === 'name') {
			current.node.name = token.value;
			current.state = 'args';
		}

		else if (current.node.type === 'CallExpressionNode' &&
			current.state === 'args' &&
			token.type === 'paren' &&
			token.value === ')') {
			nodes.pop();
		}

		else {
			throw new UnexpectedTokenError();
		}
	}

	if (nodes.length > 1) {
		throw new MissingTokenError();
	}

	return program;
}