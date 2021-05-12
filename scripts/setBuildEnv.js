#!/bin/node

//Obtain the environment string passed to the node script
const environment = process.argv[2];

console.log('\x1b[32m%s\x1b[0m', `\nBuilding ${environment} environment.\n`);

require('./setEnv');
