const { execSync } = require('child_process');

try {
  execSync('git add src/app/api/auth/login/route.ts', { stdio: 'inherit' });
  execSync('git commit -m "fix: trim whitespace on login credentials"', { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('Done!');
} catch (e) {
  console.error('Failed:', e.message);
}
