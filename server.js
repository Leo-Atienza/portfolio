// server.js — Express app (Vercel-ready)
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();

// ---------- helpers ----------
const has = (p) => fs.existsSync(p);

// Resolve views dir (supports /src/views or /views)
const viewsSrc  = path.join(__dirname, 'src', 'views');
const viewsRoot = path.join(__dirname, 'views');
const viewsPath = has(viewsSrc) ? viewsSrc : viewsRoot;

// Resolve public dir (supports /public or /src/public)
const publicRoot = path.join(__dirname, 'public');
const publicSrc  = path.join(__dirname, 'src', 'public');
const publicPath = has(publicRoot) ? publicRoot : (has(publicSrc) ? publicSrc : null);

// Try to load routes from /src or root
let siteRoutes;
try { siteRoutes = require('./src/routes/site'); }
catch { siteRoutes = require('./routes/site'); }

// Try to load Sequelize config from /src or root
let sequelize;
try { ({ sequelize } = require('./src/config/sequelize')); }
catch { ({ sequelize } = require('./sequelize')); }

// ---------- views / static ----------
app.set('view engine', 'ejs');
app.set('views', viewsPath);
if (publicPath) app.use(express.static(publicPath));

// ---------- DB init (once per cold start) ----------
let dbReady;
async function initDbOnce() {
  if (dbReady) return dbReady;
  dbReady = (async () => {
    await sequelize.authenticate();            // confirm credentials & SSL
    if (process.env.SYNC_DB === '1') {
      await sequelize.sync();                  // optional schema sync
    }
  })();
  return dbReady;
}

// Ensure DB is ready before any route
app.use(async (req, res, next) => {
  try { await initDbOnce(); next(); }
  catch (e) { next(e); }
});

// ---------- routes ----------
app.use(siteRoutes);

// robots.txt / sitemap.xml (serve from /public if present, else repo root)
app.get('/robots.txt', (req, res) => {
  const p1 = publicPath ? path.join(publicPath, 'robots.txt') : null;
  const p2 = path.join(__dirname, 'robots.txt');
  const f  = (p1 && has(p1)) ? p1 : p2;
  return has(f) ? res.sendFile(f) : res.status(404).end();
});
app.get('/sitemap.xml', (req, res) => {
  const p1 = publicPath ? path.join(publicPath, 'sitemap.xml') : null;
  const p2 = path.join(__dirname, 'sitemap.xml');
  const f  = (p1 && has(p1)) ? p1 : p2;
  return has(f) ? res.sendFile(f) : res.status(404).end();
});

// ---------- fallbacks ----------
app.use((req, res) => res.status(404).render('404', { title: 'Not Found' }));
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).render('500', { title: 'Server Error' });
});

// ---------- export for Vercel; listen locally ----------
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
}
module.exports = app;