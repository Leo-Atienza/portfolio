// scripts/migrate.js
require('dotenv').config();
const { sequelize } = require('../src/config/sequelize');

(async () => {
  try {
    console.log('Authenticating...');
    await sequelize.authenticate();
    console.log('Syncing schema...');
    await sequelize.sync(); // change to { alter: true } if you want auto-migrations (be careful)
    console.log('Done.');
    process.exit(0);
  } catch (e) {
    console.error('Migration failed:', e);
    process.exit(1);
  }
})();