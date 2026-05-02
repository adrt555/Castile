const { execSync } = require('child_process');

try {
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "feat: migrate CRM to Vercel Postgres using Prisma Server Actions"', { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('Done!');
} catch (e) {
  console.error('Failed:', e.message);
}
