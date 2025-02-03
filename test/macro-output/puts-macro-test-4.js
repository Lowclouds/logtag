//import LogTag from '../src/logtag.js'
// note, we're not testing LogTag, but the puts macro

console.log();
console.log('print this!');
false && dummy(0) ? console.log("print this!") : void 0;
false && dummy(0, 1, 2, 4) ? console.log("print this, too!") : void 0;
false && dummy(...[1, 2, 3]) ? console.log('and, print this, too!') : void 0;
console.log('leave me alone');