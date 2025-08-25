const { Sequelize } = require('sequelize');

const dbUrl = process.env.DATABASE_URL;
let sequelize;

if (dbUrl) {
  // Prefer single DATABASE_URL when provided (Neon/Render etc.)
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      // Neon typically requires SSL
      ssl: { require: true }
    }
  });
} else {
  // Fallback to individual env vars
  sequelize = new Sequelize(
    process.env.PGDATABASE,
    process.env.PGUSER,
    process.env.PGPASSWORD,
    {
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT) || 5432,
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: { require: true } // safe for Neon; harmless locally if disabled by server
      }
    }
  );
}

module.exports = { sequelize };