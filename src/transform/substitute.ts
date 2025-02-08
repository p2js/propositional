import * as AST from '../syntax/ast';
import { syntacticallyEquivalent } from '../syntax/equivalence';

export function substituteVariable(expression: AST.Expression, v1: AST.Literal, v2: AST.Literal): AST.Expression {
    switch (true) {
        case expression instanceof AST.Literal:
            return syntacticallyEquivalent(expression, v1) ? v2 : expression;
        case expression instanceof AST.UnaryExpression:
            return new AST.UnaryExpression(
                expression.operator,
                substituteVariable(expression.inner, v1, v2));
        case expression instanceof AST.BinaryExpression:
            return new AST.BinaryExpression(
                substituteVariable(expression.left, v1, v2),
                expression.operator,
                substituteVariable(expression.right, v1, v2)
            );
    }
}