export type Token = { type: "number" | "paren" | "name", value: string };

export class UnexpectedCharacter extends Error {}

function isWhitespace(c: string): boolean {
	return " \r\n\t".indexOf(c) >= 0;
}

function isNumber(c: string): boolean {
	return "0123456789.".indexOf(c) >= 0;
}

function isParen(c: string): boolean {
	return "()".indexOf(c) >= 0;
}

function isName(c: string): boolean {
	return "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_".indexOf(c) >= 0;
}

export function tokenize(input: string): Token[] {
	const result: Token[] = [];

	if (input.length === 0)
		return result;
	
	let token: null | Token = null;

	for (let i = 0; i < input.length; i++) {
		const c = input[i];

		if (!token && isNumber(c)) {
			token = { type: "number", value: c };
			result.push(token);
		}
		else if (!token && isName(c)) {
			token = { type: "name", value: c };
			result.push(token);
		}
		else if (token && token.type === 'number' && isNumber(c)) {
			token.value += c;
		}
		else if (token && token.type === 'name' && (isName(c) || isNumber(c))) {
			token.value += c;
		}
		else if (isParen(c)) {
			token = null;
			result.push({ type: "paren", value: c });
		}
		else if (isWhitespace(c)) {
			token = null;
		}
		else {
			throw new UnexpectedCharacter();
		}
	}

	return result;
}