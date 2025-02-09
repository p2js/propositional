import * as AST from '../syntax/ast';
import { TokenType } from '../syntax/token';

export function getVariables(expression: AST.Expression): Set<string> {
    let variables = new Set<string>();
    switch (true) {
        case expression instanceof AST.Literal:
            if (expression.value.type == TokenType.VARIABLE) variables.add(expression.value.lexeme);
            break;
        case expression instanceof AST.UnaryExpression:
            variables = new Set([...variables, ...getVariables(expression.inner)]);
            break;
        case expression instanceof AST.BinaryExpression:
            variables = new Set([...variables, ...getVariables(expression.left), ...getVariables(expression.right)]);
            break;
    }
    return variables;
}

export function getSubExpressions(expression: AST.Expression): AST.Expression[] {
    switch (true) {
        case expression instanceof AST.Literal:
            return [];
        case expression instanceof AST.UnaryExpression:
            return [expression, ...getSubExpressions(expression.inner)];
        case expression instanceof AST.BinaryExpression:
            return [expression, ...getSubExpressions(expression.right), ...getSubExpressions(expression.left)];
    }
}