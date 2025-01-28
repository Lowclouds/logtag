import LogTag from '../src/logtag.js'

console.log('\n------------Stress test------------\n');
LogTag.init();

let ta = [];
let nc = 511;
let nt = 32;
let allkeys = [];


for (let c = 0; c< nc; c++) {
  if (c > 0) {
    ta[c] = ['C' + c, []];
  } else {
    ta[c] = ['LT', []];
  }
   for (let a=1; a <=32; a++) {
      ta[c][1].push('AREA' + a);
   }
   ta[c][1].forEach((a) => {
      let cmpt = ta[c][0];
      cmpt = cmpt === '' ? '' : cmpt + '_';
      allkeys[cmpt + a]=undefined;
   });
}

let t0 = performance.now();
for (let c = 0; c< nc; c++) {
   LogTag.defTags(ta[c][0], ta[c][1]);
}
let t1 = performance.now();

console.log(`defTags - ${Object.keys(allkeys).length} tags: ${dround(t1-t0, 3)} ms`);


//console.log(Object.keys(alltags));

Object.keys(allkeys).forEach((k) => {
   allkeys[k] = BigInt(eval(k));
//   console.log(`${k} = ${alltags[k].toString(16)}`);
});

let alltags = Object.values(allkeys);

let ntries = 100000;

t0 = performance.now();
for (let t = 0; t<ntries; t++) {
   let tag = alltags[Math.trunc(alltags.length * Math.random())];
   LogTag.set(tag);
   LogTag.isSet(tag);
   LogTag.clear(tag);
}
t1 = performance.now();

console.log(`\nSet/isSet/clear - ${ntries} times: ${dround(t1-t0, 3)} ms\n`);

t0 = performance.now();
for (let t = 0; t< ntries; t++) {
   let tags = [];
   tags.push( alltags[Math.trunc(alltags.length * Math.random())]);
   tags.push( alltags[Math.trunc(alltags.length * Math.random())]);
   tags.push( alltags[Math.trunc(alltags.length * Math.random())]);

// console.log(tags);
   const [t0,t1,t2] = tags;
   LogTag.set(t0, t1, t2);
   LogTag.areSet(t0, t1, t2);
   LogTag.clear(t0, t1, t2);
}
t1 = performance.now();

console.log(`\nset/areSet/clear with multiple tag parameters- ${ntries} times: ${dround(t1-t0, 3)} ms\n`);

t0 = performance.now();
for (let t = 0; t< ntries; t++) {
   let tags = [];
   tags.push( alltags[Math.trunc(alltags.length * Math.random())]);
   tags.push( alltags[Math.trunc(alltags.length * Math.random())]);
   tags.push( alltags[Math.trunc(alltags.length * Math.random())]);

// console.log(tags);

   LogTag.set(tags);
   LogTag.areSet(tags);
   LogTag.clear(tags);
}
t1 = performance.now();

console.log(`\nset/areSet/clear with array of tags- ${ntries} times: ${dround(t1-t0, 3)} ms\n`);


function dround(f,d) {
   d=Math.round(d);
   if (d < -15 || d>15) {return f;}
   if (d === 0) { return Math.round(f);}
   let s = Math.pow(10,d);
   let ff = s*f;
   return Math.round(ff)/s;
}


// node ./scripts/stress-test.js

// ------------Stress test------------

// defTags - 16352 tags: 24.29 ms

// Set/isSet/clear - 100000 times: 15.71 ms



