import {mkdirSync, rmSync, cpSync, renameSync} from 'node:fs';
import {execFileSync, execSync} from 'node:child_process';

let babelProg = 'node_modules/@babel/cli/bin/babel.js';
let configprefix = 'puts-macro-config-';

rmSync('./test/macro-output', {force: true, recursive: true});
mkdirSync('./test/macro-output', {force: true, recursive: true});

for (let config = 1; config < 6; config++) {
   const configFile = configprefix + config;
   cpSync(`./test/${configFile}`, './babel.config.json', {force: true});
 
   try {
      console.log(`\n******* macro test ${config} **************\n`);
      const stdout = execFileSync('node', [babelProg, './test/puts-macro-test.js', '--out-dir', './test/macro-output']);
      renameSync('./test/macro-output/puts-macro-test.js', `./test/macro-output/puts-macro-test-${config}.js`);
      console.log(stdout.toString());
   } catch(err) {
      if (err.code) {
         console.error(`exec error: ${err.code}`);
      } else {
         const {stdout, stderr}  = err;
         console.error({stdout, stderr});
      }
   }
}

rmSync('./babel.config.json');
