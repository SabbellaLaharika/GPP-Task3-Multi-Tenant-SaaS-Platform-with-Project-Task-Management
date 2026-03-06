const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Path to the generated openapi.yml
const openapiPath = path.join(__dirname, '../../openapi.yml');
const fileContents = fs.readFileSync(openapiPath, 'utf8');

// Parse the YAML document
const specs = yaml.load(fileContents);

module.exports = specs;
