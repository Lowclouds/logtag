//import LogTag from '../src/logtag.js'
// note, we're not testing LogTag, but the puts macro

myLogger();
myLogger('print this!');
myTestFn(0) ? myLogger("print this!") : void 0;
myTestFn(0, 1, 2, 4) ? myLogger("print this, too!") : void 0;
myTestFn(...[1, 2, 3]) ? myLogger('and, print this, too!') : void 0;
console.log('leave me alone');