import * as AST from '../syntax/ast';
import { syntactically_equivalent } from '../syntax/equivalence';

export function substitute_variable(expression: AST.Expression, v1: AST.Literal, v2: AST.Literal): AST.Expression {
    switch (true) {
        case expression instanceof AST.Literal:
            return syntactically_equivalent(expression, v1) ? v2 : expression;
        case expression instanceof AST.UnaryExpression:
            return new AST.UnaryExpression(
                expression.operator,
                substitute_variable(expression.inner, v1, v2));
        case expression instanceof AST.BinaryExpression:
            return new AST.BinaryExpression(
                substitute_variable(expression.left, v1, v2),
                expression.operator,
                substitute_variable(expression.right, v1, v2)
            );
    }
}