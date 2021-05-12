#!/bin/node

// Original script from...
// https://dev.to/giacomocerquone/re-thinking-react-native-env-vars-589d
// Alternative script....
// https://itnext.io/the-easiest-way-to-setup-multiple-environments-on-react-native-67b33d073390

const createJsExport = require('./utils/createJsExport');

// Obtain the environment string passed to the node script
const environment = process.argv[2];

const BASE_DIR = '.';
const FILENAME = 'env.active.js';

const distPath = `${BASE_DIR}/${FILENAME}`;

createJsExport.createJSExportFile(`'${environment}'`, distPath);

console.log(`Updated env.js config to '${environment}'.\n`);
