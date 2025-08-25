// server.js — Express app (Vercel-ready, with /_health)
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const has = (p) => { try { return fs.existsSync(p); } catch { return false; } };

// Views & static (supports /src or root)
const viewsSrc  = path.join(__dirname, 'src', 'views');
const viewsRoot = path.join(__dirname, 'views');
const viewsPath = has(viewsSrc) ? viewsSrc : viewsRoot;

const publicRoot = path.join(__dirname, 'public');
const publicSrc  = path.join(__dirname, 'src', 'public');
const publicPath = has(publicRoot) ? publicRoot : (has(publicSrc) ? publicSrc : null);

// Routes (supports /src or root)
let siteRoutes;
try { siteRoutes = require('./src/routes/site'); }
catch { siteRoutes = require('./routes/site'); }

// Sequelize config (try src first per your “option B”, then root fallback)
let sequelize;
try { ({ sequelize } = require('./src/config/sequelize')); }
catch { ({ sequelize } = require('./sequelize')); }

app.set('view engine', 'ejs');
app.set('views', viewsPath);
if (publicPath) app.use(express.static(publicPath));

// Health check (no DB needed) — hit /_health on Vercel to confirm boot
app.get('/_health', (req, res) => {
  res.json({
    ok: true,
    vercel: !!process.env.VERCEL,
    node: process.version,
    dbUrlSet: !!process.env.DATABASE_URL,
    viewsPath,
    hasViews: has(viewsPath),
    hasPublic: !!publicPath
  });
});

// DB init once per cold start
let dbReady;
async function initDbOnce() {
  if (dbReady) return dbReady;
  dbReady = (async () => {
    await sequelize.authenticate();
    if (process.env.SYNC_DB === '1') await sequelize.sync();
  })();
  return dbReady;
}

// Ensure DB ready before handling app routes
app.use(async (req, res, next) => {
  try { await initDbOnce(); next(); }
  catch (e) { next(e); }
});

// App routes
app.use(siteRoutes);

// robots/sitemap (serve from /public if present, else repo root)
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

// Fallbacks
app.use((req, res) => res.status(404).render('404', { title: 'Not Found' }));
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  try { res.status(500).render('500', { title: 'Server Error' }); }
  catch { res.status(500).send('Server Error'); }
});

// Export for Vercel; listen only locally
const PORT = process.env.PORT || 3000;
if (require.main === module) app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
module.exports = app;
