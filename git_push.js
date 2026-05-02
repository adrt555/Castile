const { execSync } = require('child_process');

try {
  console.log('Adding files...');
  execSync('git add src/app/data/extracted_products.json src/app/data/collection_projects.json "src/app/(store)/products/[id]/page.tsx" src/app/components/SearchOverlay.tsx', { stdio: 'inherit' });
  
  console.log('Committing...');
  execSync('git commit -m "fix: move data files to src and fix imports"', { stdio: 'inherit' });
  
  console.log('Pushing...');
  execSync('git push origin main --force', { stdio: 'inherit' });
  
  console.log('Done!');
} catch (e) {
  console.error('Failed:', e.message);
}
