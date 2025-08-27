// api/index.js — Vercel serverless entry
const app = require('../server');
module.exports = (req, res) => app(req, res);
