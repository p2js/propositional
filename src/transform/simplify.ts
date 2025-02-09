import * as AST from '../syntax/ast';
import { TokenType } from '../syntax/token';
import { not, TRUE, FALSE } from '../syntax/generate';
import { syntacticallyEquivalent } from '../syntax/equivalence';

/**
 * Simplify an expression under the following principles:
 * - !0         <=>  1
 * - !1         <=>  0
 * 
 * - !!a        <=>  a
 * 
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
export function simplify(expression: AST.Expression): AST.Expression {
    switch (true) {
        case expression instanceof AST.UnaryExpression:
            let inner = simplify(expression.inner);
            // !0, !1
            if (inner instanceof AST.Literal && inner.value.type == TokenType.CONSTANT) {
                if (syntacticallyEquivalent(inner, FALSE)) {
                    return TRUE;
                } else {
                    return FALSE;
                }
            }
            // !!a <=> a
            if (inner instanceof AST.UnaryExpression) {
                return simplify(inner.inner);
            }
            return not(inner);
        case expression instanceof AST.Literal:
            return expression;
        case expression instanceof AST.BinaryExpression:
            let left = simplify(expression.left);
            let right = simplify(expression.right);
            // left == right
            if (syntacticallyEquivalent(left, right)) {
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
            if (syntacticallyEquivalent(not(left), right) || syntacticallyEquivalent(left, not(right))) {
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
            if ((syntacticallyEquivalent(right, TRUE) || syntacticallyEquivalent(right, FALSE))
                && expression.operator.type != TokenType.IF) {
                let temp = left;
                left = right;
                right = temp;
            }
            // left == 0
            if (syntacticallyEquivalent(left, FALSE)) {
                switch (expression.operator.type) {
                    case TokenType.AND:
                        return FALSE;
                    case TokenType.OR:
                    case TokenType.XOR:
                        return right;
                    case TokenType.IF:
                        return TRUE;
                    case TokenType.IFF:
                        return simplify(not(right));
                }
            }
            // left == 1
            if (syntacticallyEquivalent(left, TRUE)) {
                switch (expression.operator.type) {
                    case TokenType.OR:
                        return TRUE;
                    case TokenType.XOR:
                        return simplify(not(right));
                    case TokenType.AND:
                    case TokenType.IF:
                    case TokenType.IFF:
                        return right;
                }
            }
            // a => 0
            if (syntacticallyEquivalent(right, FALSE)) {
                return simplify(not(left));
            }
            // a => 1
            if (syntacticallyEquivalent(right, TRUE)) {
                return TRUE;
            }
            // Otherwise, no simplification available
            return new AST.BinaryExpression(left, expression.operator, right);
    }
}