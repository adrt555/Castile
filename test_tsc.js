const { execSync } = require('child_process');
try {
  const output = execSync('npx tsc --noEmit', { encoding: 'utf-8' });
  console.log("SUCCESS:", output);
} catch (e) {
  console.log("FAILED:", e.stdout);
}
