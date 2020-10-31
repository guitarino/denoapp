import { assert, assertThrows } from "https://deno.land/std/testing/asserts.ts";
import type { Token } from "./tokenize.ts";
import { tokenize, UnexpectedCharacterError } from "./tokenize.ts";

function assertTokenEquals(actualToken: Token, expectedToken: Token) {
	assert(actualToken.type === expectedToken.type);
	assert(actualToken.value === expectedToken.value);
}

function assertSingleToken(input: string, expectedToken: Token) {
	const result = tokenize(input);
	assert(result.length === 1);
	assertTokenEquals(result[0], expectedToken);
}

function assertMultiTokens(input: string, expectedTokens: Token[]) {
	const result = tokenize(input);
	assert(result.length === expectedTokens.length);
	for (let i = 0; i < expectedTokens.length; i++) {
		assertTokenEquals(result[i], expectedTokens[i]);
	}
}

Deno.test("When given empty text, returns empty array", () => {
	const result = tokenize(``);
	assert(result.length === 0);
});

Deno.test("When given only whitespace, returns empty array", () => {
	["   ", " \r\n", "\n ", "\t"].forEach((value: string) => {
		const result = tokenize(value);
		assert(result.length === 0);
	});
});

Deno.test("When given a number, returns a single number token", () => {
	["123", "2", "99", "100.5"].forEach((value: string) => {
		assertSingleToken(value, { type: "number", value });
	});
});

Deno.test("When given a name, returns a single name token", () => {
	["dsasd", "b", "KSD"].forEach((value: string) => {
		assertSingleToken(value, { type: "name", value });
	});
});

Deno.test("When given a paren, returns a single paren token", () => {
	["(", ")"].forEach((value: string) => {
		assertSingleToken(value, { type: "paren", value });
	});
});

Deno.test("An incorrect token throws unexpected character exception", () => {
	["{ ", "!@", "asd !", "hello w@rld"].forEach((value: string) => {
		assertThrows(() => tokenize(value), UnexpectedCharacterError);
	});
});

Deno.test("A name token can have numbers as part of it", () => {
	["b4232", "WIN32", "x_0"].forEach((value: string) => {
		assertSingleToken(value, { type: "name", value });
	});
});

Deno.test("If number is directly followed by non-number symbols, throws an error", () => {
	["123b", "833kre", "000000O"].forEach((value: string) => {
		assertThrows(() => tokenize(value), UnexpectedCharacterError);
	});
});

Deno.test("If a token is surrounded by whitespace, return only the token", () => {
	assertSingleToken(`  123`, { type: "number", value: "123" });
	assertSingleToken(`322 `, { type: "number", value: "322" });
	assertSingleToken(`99.9\n`, { type: "number", value: "99.9" });

	assertSingleToken(`\tDSA`, { type: "name", value: "DSA" });
	assertSingleToken(`\n\nnnn\n`, { type: "name", value: "nnn" });
	assertSingleToken(` hello`, { type: "name", value: "hello" });
});

Deno.test("Number followed by a paren", () => {
	assertMultiTokens(`123)`, [
		{ type: "number", value: "123" },
		{ type: "paren", value: ")" },
	]);
});

Deno.test("Paren followed by a token", () => {
	assertMultiTokens(`(333`, [
		{ type: "paren", value: "(" },
		{ type: "number", value: "333" },
	]);
	assertMultiTokens(`(qwe`, [
		{ type: "paren", value: "(" },
		{ type: "name", value: "qwe" },
	]);
});

Deno.test("Multiple tokens separated by whitespace", () => {
	assertMultiTokens(`512   987`, [
		{ type: "number", value: "512" },
		{ type: "number", value: "987" },
	]);
	assertMultiTokens(`221 b`, [
		{ type: "number", value: "221" },
		{ type: "name", value: "b" },
	]);
	assertMultiTokens(`test1\r\n\ttest2   xyz`, [
		{ type: "name", value: "test1" },
		{ type: "name", value: "test2" },
		{ type: "name", value: "xyz" },
	]);
	assertMultiTokens(`test1\r\n\ttest(2   xy)z`, [
		{ type: "name", value: "test1" },
		{ type: "name", value: "test" },
		{ type: "paren", value: "(" },
		{ type: "number", value: "2" },
		{ type: "name", value: "xy" },
		{ type: "paren", value: ")" },
		{ type: "name", value: "z" },
	]);
	assertMultiTokens(`(add 2 (subtract 4 2))`, [
		{ type: 'paren',  value: '(' },
		{ type: 'name',   value: 'add' },
		{ type: 'number', value: '2' },
		{ type: 'paren',  value: '(' },
		{ type: 'name',   value: 'subtract' },
		{ type: 'number', value: '4' },
		{ type: 'number', value: '2' },
		{ type: 'paren',  value: ')' },
		{ type: 'paren',  value: ')' },
	]);
});