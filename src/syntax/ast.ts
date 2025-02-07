import { Token } from "./token";

export abstract class Expression { };

export class BinaryExpression extends Expression {
    constructor(public left: Expression, public operator: Token, public right: Expression) { super(); }
}

export class UnaryExpression extends Expression {
    constructor(public operator: Token, public inner: Expression) { super(); }
}

export class Literal extends Expression {
    constructor(public value: Token) { super(); }
}