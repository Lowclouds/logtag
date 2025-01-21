import {exec} from 'node:child_process';
let tests = ['test.js', 'test2.js', 'stress-test.js']

tests.forEach((t) => {
   exec(`node ./scripts/${t}`, (error, stdout, stderr) => {
      console.log(`******************* Running test: ${t} *******************\n`);
      if (error) {
         console.error(`exec error: ${error}`);
         return;
      }
      console.log(stdout);
      if (stderr != '') {
         console.error(`stderr: ${stderr}`);
      }
   });
});
