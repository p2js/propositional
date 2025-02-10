import { Token, TokenType } from './token';
import * as AST from './ast';

// The parser will assume non-bracketed binary expressions are to be treated as right-associative.

export function parse(tokenStream: Token[]): AST.Expression {
    let currentToken = 0;

    let peek = () => tokenStream[currentToken];
    let previous = () => tokenStream[currentToken - 1];
    let advance = () => tokenStream[currentToken++];

    let check = (type: TokenType) => currentToken >= tokenStream.length ? false : (peek().type == type);
    let match = (...types: TokenType[]) => {
        for (let type of types) {
            if (check(type)) {
                advance();
                return true;
            }
        }
        return false;
    };
    let expect = (type: TokenType, message: string) => {
        if (check(type)) return advance();
        throw Error('[' + (peek()?.lexeme || 'end') + '] ' + message);
    }

    // Grammar implementation
    function expression() {
        return binary();
    }

    function binary() {
        let left = unary();

        while (match(TokenType.AND, TokenType.OR, TokenType.XOR, TokenType.IF, TokenType.IFF)) {
            let operator = previous();
            let right = unary();
            left = new AST.BinaryExpression(left, operator, right);
        }

        return left;
    }

    function unary() {
        if (match(TokenType.NOT)) {
            let operator = previous();
            let right = unary();

            return new AST.UnaryExpression(operator, right);
        }
        return primary();
    }

    function primary() {
        // literals
        if (match(TokenType.CONSTANT, TokenType.VARIABLE)) {
            return new AST.Literal(previous());
        }
        // groupings
        if (match(TokenType.PAREN_L)) {
            let inner = expression();
            expect(TokenType.PAREN_R, 'unclosed grouping');
            return inner;
        }
        // something else
        let token = peek()?.lexeme;
        if (token) {
            throw Error('Unexpected token ' + token);
        } else {
            throw Error('Unexpected end of input');
        }
    }

    let expr = expression();

    if (peek()?.lexeme) {
        throw Error('Unexpected token ' + peek().lexeme);
    }

    return expr;
}