const { execSync } = require('child_process');
try {
  const output = execSync('npx vercel ls', { encoding: 'utf-8' });
  console.log(output);
} catch (e) {
  console.error(e.message);
}
