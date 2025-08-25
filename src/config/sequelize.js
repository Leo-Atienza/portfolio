// src/config/sequelize.js — Vercel/Neon safe
const { Sequelize } = require('sequelize');
const pg = require('pg');                // <- force bundle
require('pg-hstore');                    // <- optional, but safe to include

const common = {
  dialect: 'postgres',
  dialectModule: pg,                     // <- tell Sequelize to use this module
  logging: false,
  dialectOptions: {
    // Neon requires SSL in serverless; this avoids cert chain issues
    ssl: { require: true, rejectUnauthorized: false }
  }
};

const dbUrl = process.env.DATABASE_URL;
let sequelize;

if (dbUrl) {
  sequelize = new Sequelize(dbUrl, common);
} else {
  sequelize = new Sequelize(
    process.env.PGDATABASE,
    process.env.PGUSER,
    process.env.PGPASSWORD,
    {
      ...common,
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT) || 5432
    }
  );
}

module.exports = { sequelize };
