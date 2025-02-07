import { Expression } from "./ast";
import { Token, TokenType } from "./token";

function isLetter(c: string) {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
}

export function tokenise(source: string): Token[] {
    let tokens: Token[] = [];

    let current = 0; // Current token
    let start = 0; // Start of current lexeme

    const advance = () => source[current++];
    const match = (char: string) => {
        if (current > source.length || source[current] != char) return false;
        current++;
        return true;
    }
    const peek = (n = 0) => {
        if (current + n > source.length) return '\0';
        return source[current + n];
    }
    const addToken = (type: TokenType, lexeme = source.substring(start, current)) => {
        tokens.push(new Token(type, lexeme));
    }

    while (current < source.length) {
        // Beginning of current lexeme
        start = current;
        let char = advance();

        switch (char) {
            // parentheses
            case '(': addToken(TokenType.PAREN_L); break;
            case ')': addToken(TokenType.PAREN_R); break;
            // logical operators
            case '!': addToken(TokenType.NOT); break;
            case '|': addToken(TokenType.OR); break;
            case '&': addToken(TokenType.AND); break;
            case '^': addToken(TokenType.XOR); break;
            case '=': match('>') && addToken(TokenType.IF); break;
            case '<': match('=') && match('>') && addToken(TokenType.IFF); break;
            // constants
            case '0': addToken(TokenType.FALSE); break;
            case '1': addToken(TokenType.TRUE); break;
            default:
                if (isLetter(char)) {
                    addToken(TokenType.VARIABLE);
                    break;
                }
                throw Error('Unexpected character ' + char);
        }
    }

    return tokens;
}