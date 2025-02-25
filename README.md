# Propositional

Propositional is a TypeScript symbolic computation library for propositional logic. It can parse, simplify, evaluate and otherwise manipulate logical formulae.

## Usage

You can install propositional using [npm](https://www.npmjs.org/package/propositional):

```sh
npm install propositional
```

Otherwise, you can build the library yourself by cloning into this repository and running `pnpm build`.

### Building Formulas

You can construct a formula using the provided `Formula` constructor:

```js
import * as propositional from "propositional"; //esm
const propositional = require("propositional"); //commonJS

let f1 = new propositional.Formula("!(a => (b | c)) & (b => (a & c))");

f1.toString(); // "(¬(a ⇒ (b ∨ c)) ∧ (b ⇒ (a ∧ c)))"
```

The constructor will parse a string containing single-letter variables, numbers `0` and `1` as stand-ins for false and true, and the following connectives:

- `!`   for NOT
- `&`   for AND
- `|`   for OR
- `^`   for XOR
- `=>`  for IF (implies)
- `<=>` for IFF (equivalent)

Arranged as a valid formula.

### Formula Manipulation

Formulae can be manipulated using the following provided methods:

- `substitute` will replace a variable with another variable or a constant (true/false):

```js
new propositional.Formula("a => (b & c)").substitute("a", "b").toString();
// "(b ⇒ (b ∧ c))"
```

- `simplify` will simplify a formula according to certain equivalences with connectives and constants, including recursive simplifying for syntactically equivalent expressions:

```js
new propositional.Formula("((a | c) & (a | !!c)) | (!b & !!b)").simplify().toString();
// "(a ∨ c)"
```

- `evaluate` will evaluate the formula as true or false for a given set of variable values:
```js
f1.evaluate({ a: true, b: false, c: false }); // true
```

All of these methods return a new `Formula` rather than modifying the original one, so that the methods can be chained.

### Truth Tables

A formula's `truthTable` method can be used to generate its truth table, either in text or HTML format. The truth table will (optionally, and by default) include all intermediate sub-formulae:

```js
new propositional.Formula("!(a & (b | c))").truthTable();
/*
+---+---+---+---------+---------------+----------------+
| a | b | c | (b ∨ c) | (a ∧ (b ∨ c)) | ¬(a ∧ (b ∨ c)) |
| 0 | 0 | 0 |    0    |       0       |       1        |
| 1 | 0 | 0 |    0    |       0       |       1        |
| 0 | 1 | 0 |    1    |       0       |       1        |
| 1 | 1 | 0 |    1    |       1       |       0        |
| 0 | 0 | 1 |    1    |       0       |       1        |
| 1 | 0 | 1 |    1    |       1       |       0        |
| 0 | 1 | 1 |    1    |       0       |       1        |
| 1 | 1 | 1 |    1    |       1       |       0        |
+---+---+---+---------+---------------+----------------+
*/
```

### Conjunctive Normal Form & DPLL

A formula can be converted to CNF using its `cnf` method. This then enables you to use the DPLL algorithm to find a combination of variable values that will satisfy the formula, if any.

```js
let cf1 = f1.cnf();

cf1.toString(); // "((a ∧ (¬b ∧ ¬c)) ∧ ((¬b ∨ a) ∧ (¬b ∨ c)))"
cf1.dpll(); // { a: true, b: false, c: false }

new propositional.Formula("a & !a").cnf().dpll() // null
```

the `dpll` method exists only on formulas converted to CNF to guarantee accuracy at a type-system level.