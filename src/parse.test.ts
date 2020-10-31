import { assert, assertEquals, assertThrows } from "https://deno.land/std/testing/asserts.ts";
import { MissingTokenError, parse, ProgramNode, UnexpectedTokenError } from "./parse.ts";

Deno.test("Empty program", () => {
	const result = parse([]);
	assert(result.body.length === 0);
});

Deno.test("Wrong program node throws exception", () => {
	assertThrows(
		() => parse([{type:'paren',value:')'}]),
		UnexpectedTokenError
	);
	assertThrows(
		() => parse([{type:'number',value:'222'}]),
		UnexpectedTokenError
	);
	assertThrows(
		() => parse([{type:'name',value:'grE3'}]),
		UnexpectedTokenError
	);
});

Deno.test("Throws if program paren is not closed", () => {
	assertThrows(
		() => parse([{type:'paren',value:'('}]),
		MissingTokenError
	);
	assertThrows(
		() => parse([
			{type:'paren',value:'('},
			{type:'name',value:'add'},
		]),
		MissingTokenError
	);
});

Deno.test("Simplest expression", () => {
	assertEquals(parse([
		{type:'paren',value:'('},
		{type:'name',value:'callFun'},
		{type:'paren',value:')'},
	]), <ProgramNode> {
		type: 'ProgramNode',
		body: [{
			type: 'CallExpressionNode',
			name: 'callFun',
			params: [],
		}]
	});
});

Deno.test("Throws if no names are provided", () => {
	assertThrows(
		() => parse([
			{type:'paren',value:'('},
			{type:'paren',value:')'},
		]),
		UnexpectedTokenError
	);
});

Deno.test("Throws if two names are provided", () => {
	assertThrows(
		() => parse([
			{type:'paren',value:'('},
			{type:'name',value:'callFun1'},
			{type:'name',value:'callFun2'},
			{type:'paren',value:')'},
		]),
		UnexpectedTokenError
	);
});

Deno.test("Simple call with a number", () => {
	assertEquals(parse([
		{type:'paren',value:'('},
		{type:'name',value:'showNum'},
		{type:'number',value:'100.5'},
		{type:'paren',value:')'},
	]), <ProgramNode> {
		type: 'ProgramNode',
		body: [{
			type: 'CallExpressionNode',
			name: 'showNum',
			params: [{
				type: 'NumberLiteral',
				value: '100.5',
			}],
		}]
	});
});

Deno.test("A call with a nested call", () => {
	assertEquals(parse([
		{ type: 'paren',  value: '(' },
		{ type: 'name',   value: 'add' },
		{ type: 'number', value: '2' },
		{ type: 'paren',  value: '(' },
		{ type: 'name',   value: 'subtract' },
		{ type: 'number', value: '4' },
		{ type: 'number', value: '2' },
		{ type: 'paren',  value: ')' },
		{ type: 'paren',  value: ')' },
	]), <ProgramNode> {
		type: 'ProgramNode',
		body: [{
			type: 'CallExpressionNode',
			name: 'add',
			params: [{
				type: 'NumberLiteral',
				value: '2',
			}, {
				type: 'CallExpressionNode',
				name: 'subtract',
				params: [{
					type: 'NumberLiteral',
					value: '4',
				}, {
					type: 'NumberLiteral',
					value: '2',
				}]
			}],
		}]
	});
});
