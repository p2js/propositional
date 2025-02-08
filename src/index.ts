export class Expression {
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
        return new Expression(simplifyAST(this.ast));
    }

    isAtom() {
        return this.ast instanceof AST.Literal;
    }
}
// Imports are below the class definition to resolve problems related to circular imports in the compiled output
import * as AST from './syntax/ast';
import { parse } from './syntax/parse';
import { tokenise } from './syntax/tokenise';
import { toCNF } from './cnf/cnfExpression';
import { toString } from './transform/toString';
import { simplifyAST } from './transform/simplify';