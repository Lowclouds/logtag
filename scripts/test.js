import LogTag from '../src/logtag.js'

LogTag.init();
console.log("LogTag.init(); Hello logging. is puts working and LogTag.ALLOF set?");
puts(`Logtag.ALLOF = ${LogTag.ALLOF}`)

puts("\nLogTag.defTags('C1', ['AREA1', 'AREA2', 'AREA3'])); Defining some component tags");
LogTag.defTags('C1', ['AREA1', 'AREA2', 'AREA3']);
LogTag.defTags('C2', ['AREA1', 'AREA2', 'AREA3']);
LogTag.defTags('C3', ['AREA1', 'AREA2', 'AREA3']);

puts('\nLogTag.set(C1_AREA1); Setting C1_AREA1, and checking');
LogTag.set(C1_AREA1);
puts("puts('LogTag.isSet(C1_AREA1)'); checks for set tag");
puts(`C1_AREA1 is ${LogTag.isSet(C1_AREA1) ? '' : 'not '}set`);
puts(`C1_AREA2 is ${LogTag.isSet(C1_AREA2) ? '' : 'not '}set`);
puts(`C1_AREA3 is ${LogTag.isSet(C1_AREA3) ? '' : 'not '}set`);
puts(`C2_AREA1 is ${LogTag.isSet(C2_AREA1) ? '' : 'not '}set`);
puts(`C2_AREA2 is ${LogTag.isSet(C2_AREA2) ? '' : 'not '}set`);
puts(`C2_AREA3 is ${LogTag.isSet(C2_AREA3) ? '' : 'not '}set`);
puts(`C3_AREA1 is ${LogTag.isSet(C3_AREA1) ? '' : 'not '}set`);
puts(`C3_AREA2 is ${LogTag.isSet(C3_AREA2) ? '' : 'not '}set`);
puts(`C3_AREA3 is ${LogTag.isSet(C3_AREA3) ? '' : 'not '}set`);

puts("\nputs('Hello from C1_AREA1',[C1_AREA1, C1_AREA2, C1_AREA3]) should log");
puts('...Hello from C1_AREA1', [C1_AREA1, C1_AREA2, C1_AREA3]);

LogTag.clear(C1_AREA1);
puts('\nLogTag.clear(C1_AREA1); Cleared C1_AREA1, next puts should not log');
puts('...Hello from C1_AREA1', [C1_AREA1, C1_AREA2, C1_AREA3]);

LogTag.set(C1_AREA2);
puts('\nLogTag.set(C1_AREA2); Set C1_AREA2, next puts should log');
puts('...Hello from C1_AREA2', [C1_AREA1, C1_AREA2, C1_AREA3]);

puts('\nLogTag.set(LogTag.ALLOF); Testing ALLOF functionality')
LogTag.set(LogTag.ALLOF);
puts(`LogTag.ALLOF is ${LogTag.isSet(LogTag.ALLOF) ? '' : 'not '}set`);
puts("\nputs('Hello from C1_AREA2 with ALLOF set', [C1_AREA1, C1_AREA2, C1_AREA3]) should not log");
puts('...Hello from C1_AREA2 with ALLOF set', [C1_AREA1, C1_AREA2, C1_AREA3]);

puts("\nLogTag.set(C1_AREA1, C1_AREA2, C1_AREA3); Setting all of C1 tags");
LogTag.set(C1_AREA1, C1_AREA2, C1_AREA3);
[C1_AREA1, C1_AREA2, C1_AREA3].forEach((tag) => {
   puts(`Tag: ${tag} is ${LogTag.isSet(tag) ? '' : 'not '}set`);});

puts("\nputs('Hello from C1_AREA2 with ALLOF set globally'), should log");
puts('...Hello from C1_AREA2 with ALLOF set globally', [C1_AREA1, C1_AREA2, C1_AREA3]);

puts("\nLogTag.clear(LogTag.ALLOF); Clearing global ALLOF");
LogTag.clear(LogTag.ALLOF);
puts("puts(`LogTag.ALLOF is ${LogTag.isSet(LogTag.ALLOF) ? '' : 'not '}set`) tests for set bit");
puts("\nputs('Hello from C1_AREA2 with ALLOF set for this call', [LogTag.ALLOF, C1_AREA1, C1_AREA2, C1_AREA3]); should still log");
puts('...Hello from C1_AREA2 with ALLOF set for this call\n', [LogTag.ALLOF, C1_AREA1, C1_AREA2, C1_AREA3]);

puts('\nLogTag.ALLOF requires all _following_ tags to be set');
puts("LogTag.clear(C1_AREA1); Clear first tag, but move ALLOF tage to second position");
LogTag.clear(C1_AREA1);
puts("puts('Hello from C1_AREA2 with ALLOF set for this call', [C1_AREA1, LogTag.ALLOF, C1_AREA2, C1_AREA3]); should still log");
puts('...Hello from C1_AREA2 with ALLOF set for this call\n', [LogTag.ALLOF, C1_AREA1, C1_AREA2, C1_AREA3]);

LogTag.clearAll();
puts('\nLogTag.clearAll(); Clearing  all settings, so next puts should not log');
puts('...Hello from Area1\n', [C1_AREA1, C1_AREA2, C1_AREA3]);


puts("\nLogTag.set(C1_AREA1, C3_AREA3); Setting some tags");
LogTag.set(C1_AREA1, C3_AREA3);
puts("\nputs('Hello from C3_AREA3', [C1_AREA2, C2_AREA2, C3_AREA3]) should log");
puts('...Hello from C3_AREA3\n', [C1_AREA2, C2_AREA2, C3_AREA3]);
