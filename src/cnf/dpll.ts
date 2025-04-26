import { Formula } from '..';
import * as AST from '../syntax/ast';
import { syntacticallyEquivalent } from '../syntax/equivalence';
import { FALSE, TRUE } from '../syntax/generate';
import { TokenType } from '../syntax/token';
import { CNFFormula } from './cnfExpression';

export function dpll(formula: CNFFormula): { [key: string]: boolean } {
    let clauses = clauseSet(formula.ast);

    let failed = false;
    let assumptions: { [key: string]: { value: boolean, forced: boolean } } = {};

    while (clauses.length) {
        if (failed) {
            // If the previous set of assumptions led to failure and all the assumptions were natural,
            // the formula is unsatisfiable
            if (Object.keys(assumptions).every(variable => !assumptions[variable].forced)) {
                return null;
            }
            // Otherwise, all assumptions following from the last forced one are invalid
            for (let variable of Object.keys(assumptions).reverse()) {
                if (assumptions[variable].forced) {
                    // The forced assumption is now necessarily incorrect
                    assumptions[variable].value = !assumptions[variable].value;
                    assumptions[variable].forced = false;
                    break;
                }
                // Delete all assumptions made after the last forced assumption
                delete assumptions[variable];
            }
            // Reset clauses and simplify from previous natural assumptions
            clauses = clauseSet(formula.ast);
            for (let [variable, { value }] of Object.entries(assumptions)) {
                clauses = clauses.map(clause => new Formula(clause).substitute(variable, value).simplify().ast).filter(clause => !syntacticallyEquivalent(clause, TRUE));
            }
        }
        // Find the first unit clause
        let forcedAssumption = false;
        let unitClause: AST.Expression = null;
        for (let clause of clauses) {
            if (clause instanceof AST.BinaryExpression) continue;
            unitClause = clause;
            break;
        }
        // If there are none, force an assumption by the first variable of the first clause
        if (!unitClause) {
            forcedAssumption = true;
            unitClause = clauses[0];
            while (unitClause instanceof AST.BinaryExpression) {
                unitClause = unitClause.left;
            }
        }
        // Assume and simplify
        let assumedVariable = ((unitClause instanceof AST.UnaryExpression ? unitClause.inner : unitClause) as AST.Literal).value.lexeme;
        let assumedValue = unitClause instanceof AST.Literal;

        assumptions[assumedVariable] = { value: assumedValue, forced: forcedAssumption };

        // Substitute the assumption, simplify and remove true clauses
        clauses = clauses.map(clause => new Formula(clause).substitute(assumedVariable, assumedValue).simplify().ast)
            .filter(clause => !syntacticallyEquivalent(clause, TRUE));
        // If any of the clauses are 0, the assumptions have failed
        if (clauses.some(clause => syntacticallyEquivalent(clause, FALSE))) {
            failed = true;
        }
    }

    // A solution has been found, return
    let solution = {};
    for (let variable in assumptions) {
        solution[variable] = assumptions[variable].value;
    }
    return solution;
}

function clauseSet(expression: AST.Expression): AST.Expression[] {
    switch (true) {
        case expression instanceof AST.BinaryExpression:
            switch (expression.operator.type) {
                case TokenType.AND:
                    return [...clauseSet(expression.left), ...clauseSet(expression.right)];
                case TokenType.OR:
                    return [expression];
            }
        case expression instanceof AST.UnaryExpression:
        case expression instanceof AST.Literal:
            return [expression];
    }
}