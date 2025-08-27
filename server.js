// server.js
require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

// Optional compression (safe if not installed)
let compression;
try { compression = require('compression'); } catch { /* noop */ }

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------------- Views (prefer src/views) ---------------- */
const SRC_VIEWS = path.join(__dirname, 'src', 'views');
const ROOT_VIEWS = path.join(__dirname, 'views');
const VIEWS_DIR = fs.existsSync(SRC_VIEWS) ? SRC_VIEWS : ROOT_VIEWS;

app.set('views', VIEWS_DIR);
app.set('view engine', 'ejs');

/* ---------------- Cache-busting token ---------------- */
app.locals.assetVersion = Date.now().toString(36);
app.use((req, res, next) => {
  res.locals.assetVersion = app.locals.assetVersion;
  next();
});

/* ---------------- Core middleware ---------------- */
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        // allow tiny inline helpers used in header/footer partials
        "script-src": ["'self'", "'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:"],
      },
    },
  })
);

app.use(morgan('dev'));
if (compression) app.use(compression());

/* ---------------- Static files ---------------- */
const PUBLIC_DIR = path.join(__dirname, 'public');

// Serve /public/*
app.use('/public', express.static(PUBLIC_DIR, {
  maxAge: '1y',
  etag: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-store, must-revalidate');
  },
}));

// Friendly aliases: /css/* and /images/*
app.use('/css', express.static(path.join(PUBLIC_DIR, 'css')));
app.use('/images', express.static(path.join(PUBLIC_DIR, 'images')));

/* ---------------- Health check ---------------- */
app.get('/_health', (_req, res) => res.status(200).json({ ok: true, t: Date.now() }));

/* ---------------- Router loader (EXACT match) ---------------- */
function tryRequireExact(mod) {
  try {
    const r = require(mod);
    return r;
  } catch (e) {
    // Only ignore MODULE_NOT_FOUND if it's for THIS module path
    const isModuleNotFound = e && e.code === 'MODULE_NOT_FOUND';
    const mentionsThisModule = typeof e?.message === 'string' && e.message.includes(`'${mod}'`);
    if (isModuleNotFound && mentionsThisModule) return null;

    // Otherwise, bubble up (helps catch nested errors instead of swallowing them)
    throw e;
  }
}

let siteRouter = null;
const candidates = ['./src/routes/site', './routes/site', './site'];

for (const c of candidates) {
  try {
    const r = tryRequireExact(c);
    if (r) {
      siteRouter = r;
      console.log(`[router] Found and loaded: ${c}`);
      break;
    } else {
      console.log(`[router] Not found at: ${c}`);
    }
  } catch (err) {
    console.error(`[router] Error while loading ${c}:`, err && err.stack ? err.stack : err);
    // Stop at first real error so we don't hide problems
    break;
  }
}

if (siteRouter) {
  app.use('/', siteRouter);
  console.log('[router] Mounted site router');
} else {
  console.warn('[router] No site router mounted — check paths or build output');
}

/* ---------------- 404 ---------------- */
app.use((req, res) => {
  res.status(404);
  try { res.render('404', { title: 'Not Found' }); }
  catch { res.type('text').send('404 Not Found'); }
});

/* ---------------- 500 ---------------- */
/* eslint-disable no-unused-vars */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500);
  try { res.render('500', { title: 'Server Error', error: err }); }
  catch { res.type('text').send('500 Server Error\n\n' + (err?.stack || err)); }
});
/* eslint-enable no-unused-vars */

/* ---------------- Export / listen ---------------- */
module.exports = app;

if (require.main === module) {
  const R = '\x1b[0m', B = '\x1b[1m', G = '\x1b[32m', C = '\x1b[36m';
  app.listen(PORT, () => {
    console.log(`\n${B}${G}✔ Server running:${R} ${C}http://localhost:${PORT}${R}\n`);
  });
}
