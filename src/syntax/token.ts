export enum TokenType {
    // parentheses
    PAREN_L,
    PAREN_R,
    // logical operators
    NOT,
    AND,
    OR,
    XOR,
    IF,
    IFF,
    // constants
    FALSE,
    TRUE,
    // logical variables
    VARIABLE
}

export class Token {
    constructor(public type: TokenType, public lexeme: string) { };
}