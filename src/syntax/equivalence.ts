import * as AST from './ast';
import { TokenType } from './token';

export function syntacticallyEquivalent(e1: AST.Expression, e2: AST.Expression): boolean {
    switch (true) {
        case e1 instanceof AST.BinaryExpression && e2 instanceof AST.BinaryExpression:
            return (e1.operator.type == e2.operator.type) && (
                (syntacticallyEquivalent(e1.left, e2.left) && syntacticallyEquivalent(e1.right, e2.right))
                || // Otherwise, except for =>, binary operators are symmetric, so can check the opposite
                (e1.operator.type != TokenType.IF && syntacticallyEquivalent(e1.left, e2.right) && syntacticallyEquivalent(e1.right, e2.left))
            )
        case e1 instanceof AST.UnaryExpression && e2 instanceof AST.UnaryExpression:
            return syntacticallyEquivalent(e1.inner, e2.inner);
        case e1 instanceof AST.Literal && e2 instanceof AST.Literal:
            return (e1.value.type == e2.value.type) && (e1.value.lexeme == e2.value.lexeme)
        default:
            return false;
    }
}