// server.js — Express app (Vercel-ready, with DB-bypass + /_health)
require('dotenv').config();

const path = require('path');
const express = require('express');

const app = express();

// ---- Paths (your repo uses /src) ----
const VIEWS_DIR = path.join(__dirname, 'src', 'views');
const PUBLIC_DIR = path.join(__dirname, 'public');

// ---- Routes & DB (your repo uses /src) ----
const siteRoutes = require('./src/routes/site');
const { sequelize } = require('./src/config/sequelize'); // Option B you chose

// ---- View engine / static ----
app.set('view engine', 'ejs');
app.set('views', VIEWS_DIR);
app.use(express.static(PUBLIC_DIR));

// ---- Health check BEFORE any DB code ----
app.get('/_health', (req, res) => {
  res.json({
    ok: true,
    node: process.version,
    vercel: !!process.env.VERCEL,
    dbBypassed: process.env.DISABLE_DB === '1',
    dbUrlSet: !!process.env.DATABASE_URL,
    viewsDir: VIEWS_DIR,
    publicDir: PUBLIC_DIR
  });
});

// ---- Init DB once per cold start ----
let dbReady;
async function initDbOnce() {
  if (dbReady) return dbReady;
  dbReady = (async () => {
    await sequelize.authenticate();
    if (process.env.SYNC_DB === '1') await sequelize.sync(); // optional
  })();
  return dbReady;
}

// ---- DB-bypass switch (set DISABLE_DB=1 in Vercel to skip DB while debugging) ----
app.use(async (req, res, next) => {
  if (process.env.DISABLE_DB === '1') return next();
  try {
    await initDbOnce();
    next();
  } catch (e) {
    console.error('[DB INIT FAILED]', {
      name: e?.name,
      message: e?.message,
      code: e?.original?.code || e?.parent?.code,
      stack: e?.stack
    });
    return res.status(500).send('Database connection failed. Check DATABASE_URL/SSL.');
  }
});

// ---- App routes ----
app.use(siteRoutes);

// ---- robots/sitemap (served from /public if present) ----
app.get('/robots.txt', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'robots.txt')));
app.get('/sitemap.xml', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'sitemap.xml')));

// ---- Fallbacks ----
app.use((req, res) => res.status(404).render('404', { title: 'Not Found' }));
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  try { res.status(500).render('500', { title: 'Server Error' }); }
  catch { res.status(500).send('Server Error'); }
});

// ---- Export for Vercel; listen only when run locally ----
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
}
module.exports = app;