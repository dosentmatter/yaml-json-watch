#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const chokidar = require('chokidar');
const jsYaml = require('js-yaml');

const argv = require('yargs')
  .options({
    'recursive': {
      default: false,
      type: 'boolean',
    },
  })
  .argv;

const main = () => {
  const rootDirectory = argv._[0];

  let watchPath = '*\.yaml'
  if (argv.recursive) {
    watchPath = `**/${watchPath}`;
  }

  chokidar.watch(watchPath, {
    cwd: rootDirectory,
    ignored: /node_modules|\.git/,
    ignoreInitial: true
  })
    .on('add', convertYamlToJson)
    .on('change', convertYamlToJson);
}

const convertYamlToJson = (pathName) => {
  const yamlObject = jsYaml.safeLoad(fs.readFileSync(pathName), 'utf8');
  const jsonPathName = replaceExtension(pathName);
  console.log(`Convert: ${pathName} -> ${jsonPathName}`);
  try {
    fs.writeFileSync(jsonPathName, `${JSON.stringify(yamlObject, null, 2)}\n`);
  }
  catch(error) {
    console.log(error);
  }
}

const replaceExtension = (pathName, extension = '.json') => {
  const pathObject = path.parse(pathName);
  delete pathObject.base;
  pathObject.ext = extension;
  return path.format(pathObject);
}

main();
