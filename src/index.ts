export class Expression {
    ast: AST.Expression;
    constructor(source: string) {
        this.ast = parse(tokenise(source));
    };

    toString(fancy = false) {
        return toString(this.ast, fancy);
    }

    cnf() {
        return toCNF(this.ast);
    }
}
// Imports are below the class definition to resolve problems related to circular imports in the compiled output.
import * as AST from './syntax/ast';
import { parse } from './syntax/parse';
import { tokenise } from './syntax/tokenise';
import { toCNF } from './cnf/cnfExpression';
import { toString } from './string/toString';