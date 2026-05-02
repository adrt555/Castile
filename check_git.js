const { execSync } = require('child_process');
try {
  const output = execSync('git log -1', { encoding: 'utf-8' });
  console.log(output);
} catch (e) {
  console.log(e.message);
}
