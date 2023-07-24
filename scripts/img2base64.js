#!/usr/local/bin/node

'use strict';

const {readFileSync, existsSync} = require('fs');
const {join} = require('path');

const fileName = process.argv[2];
if (!fileName) {
    console.error(`No file name provided. Exiting.`);
    process.exit(1);
}

const filePath = join(__dirname, fileName);
if (!existsSync(fileName)) {
    console.error(`Could not file at path: ${filePath}`);
    process.exit(1);
}

const fileData = readFileSync(filePath).toString('base64').replace(/.{100}/g, '$&\n');
console.log(`File data for '${fileName}' base64 encoded:\n${fileData}`);