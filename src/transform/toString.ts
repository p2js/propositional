import * as AST from '../syntax/ast';

let fancyOperator = (lexeme: string): string => {
    switch (lexeme) {
        case '!':
            return '¬';
        case '&':
            return '∧';
        case '|':
            return '∨';
        case '^':
            return '⊕';
        case '=>':
            return '⇒';
        case '<=>':
            return '⇔';
        default:
            return lexeme;
    }
}

export function toString(expression: AST.Expression, pretty = false): string {
    switch (true) {
        case expression instanceof AST.BinaryExpression: {
            let operator = expression.operator.lexeme;
            if (pretty) operator = ' ' + fancyOperator(operator) + ' ';

            return '(' + toString(expression.left, pretty) + operator + toString(expression.right, pretty) + ')';
        }
        case expression instanceof AST.UnaryExpression: {
            let operator = expression.operator.lexeme;
            if (pretty) operator = fancyOperator(operator);

            return operator + toString(expression.inner, pretty);
        }
        case expression instanceof AST.Literal:
            return expression.value.lexeme;
    }
}