import { Formula } from '..';
import * as AST from '../syntax/ast';
import { getSubExpressions, getVariables } from './getIntermediate';

let bit = (n: number, b: number) => (n & (2 ** b)) >> b;
let asString = (b: boolean) => b ? "1" : "0";

export type TruthTableOptions = { includeIntermediateExpressions: boolean, pretty: boolean, format: 'text' | 'html' };
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
        tableRows.push([...Object.values(variableValues).map(asString), ...formulae.map(f => asString(f.evaluate(variableValues)))])
    };

    let textRowSeparator = "";

    let stringFormat = options.format == 'text' ?
        {
            start: (textRowSeparator = "+" + tableHead.map(s => '-'.repeat(((s as string).length + 2))).join("+") + "+") + "\n",
            end: textRowSeparator,
            head: "|" + tableHead.map(s => " " + s + " ").join("|") + "|\n",
            rows: tableRows.map(row => "| " + row.map((v, i) => v + " ".repeat(tableHead[i].length - 1)).join(" | ") + " |").join("\n") + "\n"
        } :
        {
            start: "<table>",
            end: "</tbody></table>",
            head: "<thead><tr>" + tableHead.map(s => "<th>" + s + "</th>") + "</tr></thead><tbody>",
            rows: tableRows.map(row => "<tr>" + row.map(v => "<td>" + v + "</td>").join("") + "</tr>").join("")
        }

    return stringFormat.start + stringFormat.head + stringFormat.rows + stringFormat.end;
}