const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.ufjhktejyxxtczkwuowr:adrt555@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});
client.connect()
  .then(() => {
    console.log('Success!');
    client.end();
  })
  .catch(err => {
    console.error('Failure:', err.message);
    process.exit(1);
  });
