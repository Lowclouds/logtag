import LogTag from '../src/logtag.js'

LogTag.init();
console.log("LogTag.init(); Hello logging. is puts working and LogTag.ALLOF set?");
puts(`Logtag.ALLOF = ${LogTag.ALLOF}`)

puts("\nLogTag.defTags('C1..', ['AREA1', ..., 'AREA32'])); Defining some component tags");
let ta = [];
for (let c = 0; c< 4; c++) {
  if (c > 0) {
    ta[c] = ['C' + c, []];
  } else {
    ta[c] = ['', []];
  }
  for (let a=1; a <=32; a++) {
    ta[c][1].push('AREA' + a);
    if (c === 0 && a === 31) break;
  }
}

console.log(ta);

for (let c = 0; c< 4; c++) {
  LogTag.defTags(ta[c][0], ta[c][1]);
}

puts('\n **** Setting tags, and checking ****\nLogTag.set(C1_AREA1)');
console.log('LogTag.set(C1_AREA32, C2_AREA1, C2_AREA32)');
console.log('LogTag.set(LogTag.AREA1, LogTag.AREA31)\n');
LogTag.set(C1_AREA1);
LogTag.set(C1_AREA32, C2_AREA1, C2_AREA32);
LogTag.set(LogTag.AREA1,LogTag.AREA31);
console.log(`C1_AREA1 == ${C1_AREA1.toString(16)}`);
puts("puts('LogTag.isSet(tag) checks for set tag");
puts(`C1_AREA1 (0x${C1_AREA1.toString(16)}) is ${LogTag.isSet(C1_AREA1) ? '' : 'not '}set`);
puts(`C1_AREA2 (0x${C1_AREA2.toString(16)}) is ${LogTag.isSet(C1_AREA2) ? '' : 'not '}set`);
puts(`C1_AREA32 (0x${C1_AREA32.toString(16)}) is ${LogTag.isSet(C1_AREA32) ? '' : 'not '}set`);
puts(`C2_AREA1 (0x${C2_AREA1.toString(16)}) is ${LogTag.isSet(C2_AREA1) ? '' : 'not '}set`);
puts(`C2_AREA2 (0x${C2_AREA2.toString(16)}) is ${LogTag.isSet(C2_AREA2) ? '' : 'not '}set`);
puts(`C2_AREA32 (0x${C2_AREA32.toString(16)}) is ${LogTag.isSet(C2_AREA32) ? '' : 'not '}set`);
puts(`LogTag.AREA1 (0x${LogTag.AREA1.toString(16)}) is ${LogTag.isSet(LogTag.AREA1) ? '' : 'not '}set`);
puts(`LogTag.AREA2 (0x${LogTag.AREA2.toString(16)}) is ${LogTag.isSet(LogTag.AREA2) ? '' : 'not '}set`);
puts(`LogTag.AREA31 (0x${LogTag.AREA31.toString(16)}) is ${LogTag.isSet(LogTag.AREA31) ? '' : 'not '}set`);

console.log("\nputs('Hello from C1_AREA1',[C1_AREA1, C1_AREA2, LogTag.AREA3]) should log");
puts('...Hello from C1_AREA1', C1_AREA1, C1_AREA2, LogTag.AREA3);

LogTag.clear(C1_AREA1);
console.log('\nLogTag.clear(C1_AREA1); Cleared C1_AREA1, next puts should not log');
puts('...Hello from C1_AREA1', C1_AREA1, C1_AREA2, C1_AREA3);

LogTag.set(C1_AREA2);
console.log('\nLogTag.set(C1_AREA2); Set C1_AREA2, next puts should log');
puts('...Hello from C1_AREA2', [C1_AREA1, C1_AREA2, C1_AREA3]);

console.log('\nLogTag.set(LogTag.ALLOF); Testing ALLOF functionality')
LogTag.set(LogTag.ALLOF);
console.log(`LogTag.ALLOF is ${LogTag.isSet(LogTag.ALLOF) ? '' : 'not '}set`);
console.log("\nputs('Hello from C1_AREA2 with ALLOF set', [C1_AREA1, C1_AREA2, C1_AREA3]) should not log");
puts('...Hello from C1_AREA2 with ALLOF set', [C1_AREA1, C1_AREA2, C1_AREA3]);

console.log("\nLogTag.set(C1_AREA1, C1_AREA2, C1_AREA3); Setting all of C1 tags");
LogTag.set(C1_AREA1, C1_AREA2, C1_AREA3);
[C1_AREA1, C1_AREA2, C1_AREA3].forEach((tag) => {
   console.log(`Tag: 0x${tag.toString(16)} is ${LogTag.isSet(tag) ? '' : 'not '}set`);});

console.log("\nputs('Hello from C1_AREA2 with ALLOF set globally'), should log");
puts('...Hello from C1_AREA2 with ALLOF set globally', [C1_AREA1, C1_AREA2, C1_AREA3]);

console.log("\nLogTag.clear(LogTag.ALLOF); Clearing global ALLOF");
LogTag.clear(LogTag.ALLOF);
console.log(`puts(LogTag.ALLOF =>; LogTag.isSet(LogTag.ALLOF) ? '' : 'not 'set tests for set bit`);

console.log("\nputs('Hello from C1_AREA2 with ALLOF set for this call', [LogTag.ALLOF, C1_AREA1, C1_AREA2, C1_AREA3]); should still log");
puts('...Hello from C1_AREA2 with ALLOF set for this call\n', [LogTag.ALLOF, C1_AREA1, C1_AREA2, C1_AREA3]);

console.log('\nWhen used as tag argument, LogTag.ALLOF requires all _following_ tags to be set');
console.log("LogTag.clear(C1_AREA1); Clear first tag, but move ALLOF tage to second position");
LogTag.clear(C1_AREA1);
console.log("puts('Hello from C1_AREA2 with ALLOF set for this call', [C1_AREA1, LogTag.ALLOF, C1_AREA2, C1_AREA3]); should still log");
puts('...Hello from C1_AREA2 ^ C1_AREA3 with ALLOF set for this call\n', [C1_AREA1, LogTag.ALLOF, C1_AREA2, C1_AREA3]);

LogTag.clearAll();
console.log('\nLogTag.clearAll(); Clearing  all settings, so next puts should not log');
puts('...Hello from Area1\n', C1_AREA1, C1_AREA2, C1_AREA3);


console.log("\nLogTag.set(C1_AREA1, LogTag.AREA3); Setting some tags");
LogTag.set(C1_AREA1, LogTag.AREA3);
console.log("\nputs('Hello from LogTag.AREA3', C1_AREA2, C2_AREA2, LogTag.AREA3) should log");
puts('...Hello from LogTag.AREA3\n', C1_AREA2, C2_AREA2, LogTag.AREA3);
