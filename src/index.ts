export class Formula {
    ast: AST.Expression;
    constructor(source: string | AST.Expression) {
        if (typeof source == 'string') {
            source = parse(tokenise(source));
        }
        this.ast = source;
    };

    toString(fancy = false) {
        return toString(this.ast, fancy);
    }

    cnf() {
        return toCNF(this.ast);
    }

    simplify() {
        return new Formula(simplify(this.ast));
    }

    substitute(v1: string, v2: string | boolean) {
        let l1 = variable(v1);
        let l2 = typeof v2 == 'string' ? variable(v2) : v2 ? TRUE : FALSE;

        return new Formula(substituteVariable(this.ast, l1, l2));
    }

    isAtom() {
        return this.ast instanceof AST.Literal;
    }

    evaluate(values: { [key: string]: number | boolean }): boolean {
        let ast = this.ast;
        for (let v in values) {
            ast = substituteVariable(ast, variable(v), !!values[v] ? TRUE : FALSE);
        }
        ast = simplify(ast);
        if (!(ast instanceof AST.Literal) || ast.value.type != TokenType.CONSTANT) {
            throw new Error("Unable to evaluate, not all variables were assigned a value");
        }
        return ast.value.lexeme == "1";
    }

    truthTable(options: TruthTableOptions) {
        return generateTruthTable(this.ast, options);
    }
}
// Imports are below the class definition to resolve problems related to circular imports in the compiled output
import * as AST from './syntax/ast';
import { parse } from './syntax/parse';
import { tokenise } from './syntax/tokenise';
import { TRUE, FALSE, variable } from './syntax/generate';

import { toString } from './transform/toString';
import { simplify } from './transform/simplify';
import { substituteVariable } from './transform/substitute';

import { toCNF } from './cnf/cnfExpression';
import { TokenType } from './syntax/token'; import { generateTruthTable, TruthTableOptions } from './truthtable/generateTruthTable';

