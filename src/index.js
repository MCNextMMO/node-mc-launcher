const path = require('path');
const { spawn } = require('child_process');

const startServer = (jarFile = 'paper.jar', serverPath = path.join(__dirname, './server'), options, context = {}) => {
  const {
    minMem = '2G',
    maxMem = '2G',
  } = options || {};
  context.mcProcess = null;

  const mcProcess = spawn('java', [
    Number.isNaN(Number(minMem)) ? `-Xms${minMem}` : `-Xms${minMem}G`,
    Number.isNaN(Number(maxMem)) ? `-Xmx${maxMem}` : `-Xmx${maxMem}G`,
    '-jar',
    jarFile,
    'nogui'
  ], { cwd: serverPath });

  process.on('exit', function () {
    console.log('*** Exited Minecraft server process');
    mcProcess.kill();
  });

  process.on('SIGINT', function () {
    process.exit(0);
  });

  const lineInfoRegex = new RegExp(/^\[[0-9][0-9]:[0-9][0-9]:[0-9][0-9] INFO]/g);
  const lineWarnRegex = new RegExp(/^\[[0-9][0-9]:[0-9][0-9]:[0-9][0-9] WARN]/g);

  let isExiting = false;

  const shutdownCheck = (line) => {
    if (!line.match(lineInfoRegex)) {
      return;
    }
    if (line.match(/^\[[0-9][0-9]:[0-9][0-9]:[0-9][0-9] INFO]: Stopping the server/g) && !isExiting) {
      console.log('Exiting server.');
      isExiting = true;

      setTimeout(() => {
        process.exit();
      }, 5 * 1000);
    }
  }

  const portBindCheck = (line) => {
    if (!line.match(lineWarnRegex)) {
      return;
    }

    if (line.match(/^\[[0-9][0-9]:[0-9][0-9]:[0-9][0-9] WARN]: \*\*\*\* FAILED TO BIND TO PORT!/g)) {
      console.error('**** FAILED TO BIND TO PORT!');
      process.exit(1);
    }
  }

  const middlewares = [
    shutdownCheck,
    portBindCheck,
  ];

  mcProcess.stdout.on('data', (data) => {
    const line = data.toString();

    middlewares.forEach(middleware => middleware(line));
  });

  mcProcess.stdout.pipe(process.stdout);
  mcProcess.stderr.pipe(process.stderr);

  process.stdin.pipe(mcProcess.stdin);

  context.mcProcess = mcProcess;
};

module.exports = { startServer };
