// server.js — Express app for Vercel (fast static cache, security headers, richer /_health)
require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// --- Paths (your repo uses /src) ---
const VIEWS_DIR = path.join(__dirname, 'src', 'views');
const PUBLIC_DIR = path.join(__dirname, 'public');

// --- View engine / static ---
app.set('view engine', 'ejs');
app.set('views', VIEWS_DIR);

// Long-cache static assets; we’ll bust with ?v=<assetVersion>
app.use(
  express.static(PUBLIC_DIR, {
    maxAge: '1y',
    immutable: true,
    etag: true,
    lastModified: true,
  })
);

// Make a version available to views for cache-busting
app.locals.assetVersion = require('./package.json').version;

// --- Security headers + request logging ---
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "img-src": ["'self'", "data:", "https:"],
        "style-src": ["'self'", "'unsafe-inline'"], // allow Tailwind utilities/inline styles
        // ✅ allow inline scripts so the theme toggle & projects filter work
        "script-src": ["'self'", "'unsafe-inline'"],
        "connect-src": ["'self'"],
        "frame-ancestors": ["'none'"],
        "base-uri": ["'self'"],
        "form-action": ["'self'", "mailto:"]
      }
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    frameguard: { action: 'deny' },
  })
);
app.use(morgan(process.env.VERCEL ? 'tiny' : 'dev'));

// --- DB (Sequelize) ---
const { sequelize } = require('./src/config/sequelize');

let dbReady;
async function initDbOnce() {
  if (dbReady) return dbReady;
  dbReady = (async () => {
    await sequelize.authenticate();
    if (process.env.SYNC_DB === '1') {
      // one-off schema create/update; prefer npm run migrate locally
      await sequelize.sync();
    }
  })();
  return dbReady;
}

// --- Health check BEFORE routes (works even if routes/DB fail) ---
app.get('/_health', async (req, res) => {
  let db = { ok: process.env.DISABLE_DB === '1' ? 'bypassed' : 'unknown' };
  if (process.env.DISABLE_DB !== '1') {
    try {
      await sequelize.query('SELECT 1;');
      db = { ok: true };
    } catch (e) {
      db = { ok: false, message: e.message };
    }
  }
  res.json({
    ok: true,
    node: process.version,
    vercel: !!process.env.VERCEL,
    dbBypassed: process.env.DISABLE_DB === '1',
    db,
    viewsDir: VIEWS_DIR,
    publicDir: PUBLIC_DIR,
  });
});

// --- DB-bypass switch (set DISABLE_DB=1 in Vercel to skip DB while debugging) ---
app.use(async (req, res, next) => {
  if (process.env.DISABLE_DB === '1') return next();
  try {
    await initDbOnce();
    next();
  } catch (e) {
    console.error('[DB INIT FAILED]', e?.message || e);
    return res.status(500).send('Database connection failed. Check DATABASE_URL/SSL.');
  }
});

// --- Routes ---
const siteRoutes = require('./src/routes/site');
app.use(siteRoutes);

// --- robots/sitemap (served from /public) ---
app.get('/robots.txt', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'robots.txt')));
app.get('/sitemap.xml', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'sitemap.xml')));

// --- Fallbacks ---
app.use((req, res) => res.status(404).render('404', { title: 'Not Found' }));
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  try { res.status(500).render('500', { title: 'Server Error' }); }
  catch { res.status(500).send('Server Error'); }
});

// --- Export for Vercel; listen only when run locally ---
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
}
module.exports = app;