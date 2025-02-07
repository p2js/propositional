import * as AST from './parse/ast';
import { parse } from './parse/parse';
import { tokenise } from './parse/tokenise';

export class Expression {
    ast: AST.Expression;
    constructor(source: string) {
        this.ast = parse(tokenise(source));
    };
}