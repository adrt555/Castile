const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Hide password input
rl._writeToOutput = function _writeToOutput(stringToWrite) {
  if (rl.stdoutMuted)
    rl.output.write("*");
  else
    rl.output.write(stringToWrite);
};

console.log("\n--- Castile CRM Email Setup ---");
console.log("This script will securely upload your email credentials to Vercel.");
console.log("Note: Your password will be hidden as you type it.\n");

rl.question('1. Enter your SMTP Email Address (e.g. adrian@castileusa.com): ', (user) => {
  rl.stdoutMuted = true;
  rl.question('2. Enter your Email Password: ', (pass) => {
    rl.stdoutMuted = false;
    console.log("\n\nUploading credentials securely to Vercel...");
    
    try {
      execSync(`node -e "process.stdout.write('smtp.office365.com')" | npx vercel env add SMTP_HOST production`, { stdio: 'ignore' });
      execSync(`node -e "process.stdout.write('587')" | npx vercel env add SMTP_PORT production`, { stdio: 'ignore' });
      execSync(`node -e "process.stdout.write('${user.trim()}')" | npx vercel env add SMTP_USER production`, { stdio: 'ignore' });
      execSync(`node -e "process.stdout.write('${pass.trim()}')" | npx vercel env add SMTP_PASS production`, { stdio: 'ignore' });
      
      console.log("\n✅ SUCCESS! Vercel has been updated.");
      console.log("The 'Forgot Password' button on your live website will now send real emails!");
    } catch (error) {
      console.log("\n❌ ERROR: Failed to upload to Vercel. Make sure you are logged in.");
    }
    
    rl.close();
  });
});
