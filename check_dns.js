const dns = require('dns');

dns.resolve4('castileusa.com', (err, addresses) => {
  if (err) {
    console.error('Error resolving A records for castileusa.com:', err);
    return;
  }
  console.log('A records for castileusa.com:');
  console.log(addresses);
});

dns.resolveCname('www.castileusa.com', (err, addresses) => {
  if (err) {
    console.error('Error resolving CNAME for www.castileusa.com:', err.code === 'ENODATA' ? 'No CNAME found' : err);
    return;
  }
  console.log('CNAME records for www.castileusa.com:');
  console.log(addresses);
});
