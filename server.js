// server.js
'use strict';

require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

/* ---------- App basics ---------- */
app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

/* ---------- Middleware ---------- */
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* ---------- View locals (fixes 500 due to missing assetVersion) ---------- */
app.use((req, res, next) => {
  // use a stable version tag if provided, otherwise a cache-busting timestamp
  res.locals.assetVersion = process.env.ASSET_VERSION || String(Date.now());
  next();
});

/* ---------- Health check ---------- */
app.get('/_health', (req, res) => res.status(200).json({ ok: true }));

/* ---------- Routes ---------- */
const siteRoutes = require('./src/routes/site'); // uses /projects and renders static pages with required locals
app.use('/', siteRoutes);

/* ---------- 404 ---------- */
app.use((req, res) => {
  res.status(404).render('404', { title: 'Not Found' });
});

/* ---------- 500 ---------- */
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(500).render('500', { title: 'Server Error' });
});

/* ---------- Start server ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

module.exports = app;
