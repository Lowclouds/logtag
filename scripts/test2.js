import LogTag from '../src/logtag.js'

console.log('\n......... test2, putting tags in LogTag scope -----------\n');

LogTag.init({addTagsToGlobalScope: false});
console.log("LogTag.init({addTagsToGlobalScope: false}); Hello logging. is puts working and LogTag.ALLOF set?");
puts(`Logtag.ALLOF = ${LogTag.ALLOF}`)

LogTag.defTags('WORKER', ['TASK1', 'TASK2']);

try {
   puts(`WORKER_TASK1 = ${WORKER_TASK1} in global scope`);
} catch(e) {
   puts('oops! WORKER_TASK1 is not in global scope')
   puts(`LogTag.WORKER_TASK1 is ${LogTag.WORKER_TASK1} in LogTag scope`);
}

// okay, expected that

LogTag.set(LogTag.WORKER_TASK1);
puts(`LogTag.WORKER_TASK2 is ${LogTag.WORKER_TASK2}`, LogTag.WORKER_TASK1);
puts(`LogTag.WORKER_TASK2 component id is ${LogTag.WORKER_TASK2 & 255}`);
puts(`LogTag.WORKER_TASK2 effective tag is ${LogTag.WORKER_TASK2 >> 8}`);
