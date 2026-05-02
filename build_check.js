const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log("Running next build...");
  const output = execSync('npx next build', { encoding: 'utf-8', stdio: 'pipe' });
  fs.writeFileSync('build_output.txt', output);
  console.log("Build successful!");
} catch (e) {
  fs.writeFileSync('build_output.txt', e.stdout || e.message);
  console.log("Build failed. Output saved to build_output.txt");
}
