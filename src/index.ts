/**
 * Representation of a propositional logic formula.
 */
export class Formula {
    /**
     * Abstract Syntax Tree (AST) expression representing the formula.
     */
    ast: AST.Expression;

    /**
     * @param source The expression to construct the formula, 
     * either as a string or already parsed AST expression.
     * 
     * @throws Will throw an error on a malformed string input.
     */
    constructor(source: string | AST.Expression) {
        if (typeof source == 'string') {
            source = parse(tokenise(source));
        }
        this.ast = source;
    };

    /**
     * Converts the formula to a string.
     * 
     * @param pretty Whether or not to use traditional, non-ascii symbols in the string for operators
     * @returns String representation of the formula
     */
    toString(pretty = true) {
        return toString(this.ast, pretty);
    }

    /**
     * Converts the formula to Conjunctive Normal Form.
     * 
     * @returns The formula in CNF
     */
    cnf() {
        return toCNF(this.ast);
    }


    /**
     * Simplify a formula according to some equivalences involving constants (false, true) and 
     * syntactically equivalent expressions.
     * 
     * @returns The formula transformed with simplifications
     */
    simplify() {
        return new Formula(simplify(this.ast));
    }

    /**
     * Substitute a variable in the formula with either another variable or a constant 
     * (false, true).
     * @param v1 Variable to substitute
     * @param v2 Value to substitute the variable with
     * @returns The formula with the substitution applied
     */
    substitute(v1: string, v2: string | boolean) {
        let l1 = variable(v1);
        let l2 = typeof v2 == 'string' ? variable(v2) : v2 ? TRUE : FALSE;

        return new Formula(substituteVariable(this.ast, l1, l2));
    }

    /**
     * Check whether the formula is an atom, ie an instance of either a single variable 
     * or a constant.
     */
    isAtom() {
        return this.ast instanceof AST.Literal;
    }

    /**
     * Evaluate whether an expression is true or false with a given combination of variable values.
     * 
     * @param values An object mapping variables in the formula to boolean values
     * (eg. `{ a: false, b: true }`)
     * @returns The result of the formula evaluation, true or false
     * @throws Will throw an error if not enough variables have been assigned to simplify a formula completely.
     */
    evaluate(values: { [key: string]: number | boolean }): boolean {
        let ast = this.ast;
        for (let v in values) {
            ast = substituteVariable(ast, variable(v), !!values[v] ? TRUE : FALSE);
        }
        ast = simplify(ast);
        if (!(ast instanceof AST.Literal) || ast.value.type != TokenType.CONSTANT) {
            throw new Error('Unable to evaluate, not enough variables were assigned a value');
        }
        return ast.value.lexeme == '1';
    }

    /**
     * Generate a truth table string for the formula, evaluating it for every possible combination of variables.
     * Includes sub-formulas in the output, unless otherwise specified.
     * 
     * @param options Truth table formatting options.
     * @returns A string containing the truth table for the formula.
     */
    truthTable(options: TruthTableOptions) {
        return generateTruthTable(this.ast, options);
    }
}
// Imports are below the class definition to resolve problems related to circular imports in the compiled output
import * as AST from './syntax/ast';
import { parse } from './syntax/parse';
import { TokenType } from './syntax/token';
import { tokenise } from './syntax/tokenise';
import { TRUE, FALSE, variable } from './syntax/generate';

import { toString } from './transform/toString';
import { simplify } from './transform/simplify';
import { substituteVariable } from './transform/substitute';

import { toCNF } from './cnf/cnfExpression';
import { generateTruthTable, TruthTableOptions } from './truthtable/generateTruthTable';

