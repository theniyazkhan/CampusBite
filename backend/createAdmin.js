const db = require('./config/db');

async function createAdminAccount() {
  try {
    // Hash for password 'admin@12345'
    const adminHash = '704bf9003b430f545f7ab2b7be2d54f1:d98e8270f9680866f5ace4947dcfc771820524f690c05518e6c132a6253ac6fafdfd03cc67ff5aac9d3b41d0c939f7fc609226af6e9153e2c13fefc95a8cfd0d';

    const [result] = await db.query(
      'INSERT INTO admin (username, password_hash, email) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)',
      ['admin', adminHash, 'admin@campusbite.com']
    );

    console.log('✓ Admin account created/updated successfully');
    console.log('  Username: admin');
    console.log('  Password: admin@12345');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

createAdminAccount();
