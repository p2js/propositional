import { Formula } from "..";
import { not, or, and } from "../syntax/generate";
import * as AST from '../syntax/ast';
import { TokenType } from "../syntax/token";
import { simplify } from "../transform/simplify";

export class CNFFormula extends Formula { };

export function toCNF(expression: AST.Expression): CNFFormula {
    let transformedAst = simplify(distributeOrOverAnd(moveNegationInwards(expandNonCNFSymbols(expression))));
    return new CNFFormula(transformedAst);
}

function expandNonCNFSymbols(expression: AST.Expression): AST.Expression {
    switch (true) {
        case expression instanceof AST.BinaryExpression:
            let left = expandNonCNFSymbols(expression.left);
            let right = expandNonCNFSymbols(expression.right);

            switch (expression.operator.type) {
                case TokenType.AND:
                case TokenType.OR:
                    return new AST.BinaryExpression(left, expression.operator, right);
                case TokenType.XOR:
                    return or(and(left, not(right)), and(not(left), right));
                case TokenType.IF:
                    return or(not(left), right);
                case TokenType.IFF:
                    return or(and(left, right), and(not(left), not(right)));
            }
            throw new Error("What");
        case expression instanceof AST.UnaryExpression:
            return new AST.UnaryExpression(expression.operator, expandNonCNFSymbols(expression.inner));
        case expression instanceof AST.Literal:
            return expression;
    }
}

// assumes an expression returned by expandNonCNFSymbols
function moveNegationInwards(expression: AST.Expression): AST.Expression {
    switch (true) {
        case expression instanceof AST.UnaryExpression:
            let { inner } = expression;
            switch (true) {
                case inner instanceof AST.UnaryExpression:
                    // double negation, remove
                    return moveNegationInwards(inner.inner);
                case inner instanceof AST.BinaryExpression:
                    // Apply demorgan's law
                    let notLeft = moveNegationInwards(not(inner.left));
                    let notRight = moveNegationInwards(not(inner.right));
                    switch (inner.operator.type) {
                        case TokenType.AND:
                            return or(notLeft, notRight);
                        case TokenType.OR:
                            return and(notLeft, notRight);
                    }
                case inner instanceof AST.Literal:
                    // Nothing to simplify
                    return expression;
            }
            throw new Error("what");
        case expression instanceof AST.BinaryExpression:
            return new AST.BinaryExpression(moveNegationInwards(expression.left), expression.operator, moveNegationInwards(expression.right));
        case expression instanceof AST.Literal:
            return expression;
    }
}

// assumes an expression returned by moveNegationInwards
function distributeOrOverAnd(expression: AST.Expression): AST.Expression {
    switch (true) {
        case expression instanceof AST.BinaryExpression:
            if (expression.operator.type == TokenType.AND) return and(distributeOrOverAnd(expression.left), distributeOrOverAnd(expression.right));
            let { left, right } = expression;
            if (left instanceof AST.BinaryExpression && left.operator.type == TokenType.AND) {
                // (a and b) or (c) -> (a or c) and (b or c)
                return and(distributeOrOverAnd(or(left.left, right)), distributeOrOverAnd(or(left.right, right)));
            }
            if (right instanceof AST.BinaryExpression && right.operator.type == TokenType.AND) {
                // (a) or (b and c) -> (a or b) and (a and c)
                return and(distributeOrOverAnd(or(left, right.left)), distributeOrOverAnd(or(left, right.right)));
            }
        // Neither left or right are binary expressions, so already simplified
        case expression instanceof AST.UnaryExpression:
        // Negations have been moved inwards and are therefore already simplified
        case expression instanceof AST.Literal:
            return expression;
    }
}