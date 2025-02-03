import {puts} from '../src/puts.macro'
//import LogTag from '../src/logtag.js'
// note, we're not testing LogTag, but the puts macro

puts();
puts('print this!');

puts("print this!", 0);

puts("print this, too!", 0,1,2,4);

puts('and, print this, too!', [1, 2, 3]);

console.log('leave me alone');




