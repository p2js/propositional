import * as AST from "../syntax/ast";

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

export function toString(expression: AST.Expression, fancy = false) {
    switch (true) {
        case expression instanceof AST.BinaryExpression: {
            let operator = expression.operator.lexeme;
            if (fancy) operator = ' ' + fancyOperator(operator) + ' ';

            return '(' + toString(expression.left, fancy) + operator + toString(expression.right, fancy) + ')';
        }
        case expression instanceof AST.UnaryExpression: {
            let operator = expression.operator.lexeme;
            if (fancy) operator = fancyOperator(operator);

            return operator + toString(expression.inner, fancy);
        }
        case expression instanceof AST.Grouping:
            return '(' + toString(expression.inner, fancy) + ')';

        case expression instanceof AST.Literal:
            return expression.value.lexeme;
    }
}