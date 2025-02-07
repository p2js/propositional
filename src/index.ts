import * as AST from './parse/ast';
import { parse } from './parse/parse';
import { tokenise } from './parse/tokenise';
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