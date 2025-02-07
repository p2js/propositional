let Logic = require("./lib/index.js");

let e = new Logic.Expression("!(a=>(b|c))&(b=>(a&c))");

console.log(e.cnf().toString(true));