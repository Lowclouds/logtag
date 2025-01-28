import {mkdirSync, rmSync, cpSync} from 'node:fs';

//rm -rf ./dist && mkdir dist && cp ./src/logtag.js ./dist

rmSync('./dist', {force: true, recursive: true},);

mkdirSync('./dist');
cpSync('./src/logtag.js', './dist/logtag.js');




