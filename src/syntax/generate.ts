import * as AST from './ast';
import { Token, TokenType } from './token';

// Utility functions to more concisely express generating new AST nodes
export let not = (right: AST.Expression) => new AST.UnaryExpression(new Token(TokenType.NOT, '!'), right);
export let and = (left: AST.Expression, right: AST.Expression) => new AST.BinaryExpression(left, new Token(TokenType.AND, '&'), right);
export let or = (left: AST.Expression, right: AST.Expression) => new AST.BinaryExpression(left, new Token(TokenType.OR, '|'), right);