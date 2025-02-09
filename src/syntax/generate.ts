import * as AST from './ast';
import { Token, TokenType } from './token';

// Utility functions/constants to more concisely express new AST nodes
export const not = (right: AST.Expression) => new AST.UnaryExpression(new Token(TokenType.NOT, '!'), right);
export const and = (left: AST.Expression, right: AST.Expression) => new AST.BinaryExpression(left, new Token(TokenType.AND, '&'), right);
export const or = (left: AST.Expression, right: AST.Expression) => new AST.BinaryExpression(left, new Token(TokenType.OR, '|'), right);

export const variable = (lexeme: string) => new AST.Literal(new Token(TokenType.VARIABLE, lexeme));
export const FALSE = new AST.Literal(new Token(TokenType.CONSTANT, '0'));
export const TRUE = new AST.Literal(new Token(TokenType.CONSTANT, '1'));