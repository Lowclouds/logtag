import {execFileSync} from 'node:child_process';
let tests = ['test1.js', 'test2.js', 'stress-test.js', 'do-macro-tests.js']

tests.forEach((t) => {
//   exec(`node ./test/${t}`, (error, stdout, stderr) => {
   try {
      console.log(`******************* Running test: ${t} *******************\n`);
      const stdout = execFileSync('node', [`./test/${t}`]);

      console.log(stdout.toString());
  } catch(err) {
      if (err.code) {
         console.error(`exec error: ${err.code}`);
      } else {
         const {stdout, stderr}  = err;
         console.error({stdout, stderr});
      }
   }
});

