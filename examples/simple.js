const path = require('path');

const { startServer } = require('../src');

const middlewares = [
  (line) => {},
];

const context = {};

// mem without units is measured in GB
startServer('paper.jar', path.join(__dirname, '../server'), { minMem: 2, maxMem: 2, middlewares }, context);
