// src/config/sequelize.js — Neon/Vercel safe
const { Sequelize } = require('sequelize');
const pg = require('pg');
require('pg-hstore');

const common = {
  dialect: 'postgres',
  dialectModule: pg,
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
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