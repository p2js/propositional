import * as AST from './syntax/ast';
import { parse } from './syntax/parse';
import { tokenise } from './syntax/tokenise';
import { toString } from './string/toString';

export class Expression {
    ast: AST.Expression;
    constructor(source: string) {
        this.ast = parse(tokenise(source));
    };

    toString(fancy = false) {
        return toString(this.ast, fancy);
    }
}