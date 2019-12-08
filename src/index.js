// Require Node.js standard library function to spawn a child process
const spawn = require('child_process').spawn;
const path = require('path');

process.chdir(path.join(__dirname, './server'));

// let 

// Create a child process for the Minecraft server using the same java process
// invocation we used manually before
const mcProcess = spawn('java', [
  '-Xms2G',
  '-Xmx2G',
  '-jar',
  'paper.jar',
  'nogui'
]);

process.stdin.on('data', function (data) {
  const command = data.toString();
  console.log(JSON.stringify(command, null, 2));
  mcProcess.stdin.write(command);
});

process.on('SIGINT', function () {
  mcProcess.stdin.write('stop\n');
});


function log(data) {
  process.stdout.write(data.toString());
}
mcProcess.stdout.on('data', log);
mcProcess.stderr.on('data', log);

mcProcess.stdout.on('end', () => {
  process.exit(1);
});
