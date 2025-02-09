import { Formula } from '..';
import * as AST from '../syntax/ast';
import { getSubExpressions, getVariables } from './getIntermediate';

let bit = (n: number, b: number) => (n & (2 ** b)) >> b;
let asString = (b: boolean) => b ? '1' : '0';

export type TruthTableOptions = {
    /** Whether the truth table should include sub-formulas in its output */
    includeIntermediateExpressions: boolean,
    /** Whether or not to use traditional, non-ascii symbols in the string for operators */
    pretty: boolean,
    /** Format for the output string (ascii-like text table or HTML `<table>`)*/
    format: 'text' | 'html'
};

export function generateTruthTable(
    expression: AST.Expression,
    options: TruthTableOptions = { includeIntermediateExpressions: true, pretty: true, format: 'text' }
): string {
    let variables = [...getVariables(expression)];
    let expressions = [expression];
    if (options.includeIntermediateExpressions) {
        expressions = getSubExpressions(expressions[0]).reverse();
    }
    let formulae = expressions.map(e => new Formula(e));

    let tableHead = [...variables, ...formulae.map(f => f.toString(options.pretty))];

    let tableRows: string[][] = [];

    // process all combinations of variables as binary state
    for (let state = 0; state < 2 ** variables.length; state++) {
        let variableValues: Record<string, boolean> = {};
        variables.forEach((variable, index) => variableValues[variable] = !!bit(state, index));
        tableRows.push([
            ...Object.values(variableValues).map(asString),
            ...formulae.map(f => asString(f.evaluate(variableValues)))
        ]);
    };

    // build table string
    switch (options.format) {
        case 'html':
            let thead = tableHead.map(s => '<th>' + s + '</th>').join('');
            let tbody = tableRows.map(row => '<tr>' + row.map(v => '<td>' + v + '</td>').join('') + '</tr>').join('');
            return `<table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>`;
        case 'text':
        default:
            let line = '+' + tableHead.map(s => '-'.repeat(((s as string).length + 2))).join('+') + '+';
            let firstRow = '|' + tableHead.map(s => ' ' + s + ' ').join('|') + '|';
            let rows = tableRows.map(row => '|'
                + row.map((v, i) => {
                    let maxLength = tableHead[i].length + 2;
                    return v.padStart((maxLength + v.length) / 2).padEnd(maxLength);
                }).join('|')
                + '|'
            ).join('\n');

            return line + '\n' + firstRow + '\n' + rows + '\n' + line;
    }
}