import * as AST from '../syntax/ast';
import { TokenType } from '../syntax/token';
import { not, TRUE, FALSE } from '../syntax/generate';
import { syntactically_equivalent } from '../syntax/equivalence';

/**
 * Simplify an expression under the following principles:
 * - !!a        <=>  a

 * - (a & a)    <=>  a
 * - (a | a)    <=>  a
 * - (a ^ a)    <=>  0
 * - (a => a)   <=>  1
 * - (a <=> a)  <=>  1
 * 
 * - (a & !a)   <=>  0
 * - (a | !a)   <=>  1
 * - (a ^ !a)   <=>  1
 * - (a <=> !a) <=>  0
 * 
 * - (a => !a)  <=> !a 
 * - (!a => a)  <=>  a
 *  
 * - (0 & a)    <=>  0
 * - (0 | a)    <=>  a
 * - (0 ^ a)    <=>  a
 * - (0 => a)   <=>  1
 * - (0 <=> a)  <=> !a
 * 
 * - (1 & a)    <=>  a
 * - (1 | a)    <=>  1
 * - (1 ^ a)    <=> !a
 * - (1 => a)   <=>  a
 * - (1 <=> a)  <=>  a
 *
 * - (a => 0)   <=> !a
 * - (a => 1)   <=>  1
 */
export function simplifyAST(expression: AST.Expression): AST.Expression {
    switch (true) {
        case expression instanceof AST.UnaryExpression:
            // !!a <=> a
            if (expression.inner instanceof AST.UnaryExpression) {
                return simplifyAST(expression.inner.inner);
            }
            return not(simplifyAST(expression.inner));
        case expression instanceof AST.Literal:
            return expression;
        case expression instanceof AST.BinaryExpression:
            let left = simplifyAST(expression.left);
            let right = simplifyAST(expression.right);
            // left == right
            if (syntactically_equivalent(left, right)) {
                switch (expression.operator.type) {
                    case TokenType.AND:
                    case TokenType.OR:
                        return left;
                    case TokenType.XOR:
                        return FALSE;
                    case TokenType.IF:
                    case TokenType.IFF:
                        return TRUE;
                }
            }
            // !left = right
            if (syntactically_equivalent(not(left), right) || syntactically_equivalent(left, not(right))) {
                switch (expression.operator.type) {
                    case TokenType.AND:
                    case TokenType.IFF:
                        return FALSE;
                    case TokenType.OR:
                    case TokenType.XOR:
                        return TRUE;
                    case TokenType.IF:
                        return right;
                }
            }
            // Simplify logic for 1s and 0s by swapping right 1s and 0s to the left
            if ((syntactically_equivalent(right, TRUE) || syntactically_equivalent(right, FALSE))
                && expression.operator.type != TokenType.IF) {
                let temp = left;
                left = right;
                right = temp;
            }
            // left == 0
            if (syntactically_equivalent(left, FALSE)) {
                switch (expression.operator.type) {
                    case TokenType.AND:
                        return FALSE;
                    case TokenType.OR:
                    case TokenType.XOR:
                        return right;
                    case TokenType.IF:
                        return TRUE;
                    case TokenType.IFF:
                        throw not(right);
                }
            }
            // left == 1
            if (syntactically_equivalent(left, TRUE)) {
                switch (expression.operator.type) {
                    case TokenType.OR:
                        return TRUE;
                    case TokenType.XOR:
                        return not(right);
                    case TokenType.AND:
                    case TokenType.IF:
                    case TokenType.IFF:
                        return right;
                }
            }
            // a => 0
            if (syntactically_equivalent(right, FALSE)) {
                return not(left);
            }
            // a => 1
            if (syntactically_equivalent(right, TRUE)) {
                return TRUE;
            }
            // Otherwise, no simplification available
            return new AST.BinaryExpression(left, expression.operator, right);
    }
}