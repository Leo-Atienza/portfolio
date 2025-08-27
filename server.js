// server.js — Express app for Vercel (static cache, CSP, health)
require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Paths
const VIEWS_DIR = path.join(__dirname, 'src', 'views');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Views + static
app.set('views', VIEWS_DIR);
app.set('view engine', 'ejs');

app.use(
  express.static(PUBLIC_DIR, {
    maxAge: '1d',
    etag: true,
    lastModified: true,
    setHeaders(res) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    },
  })
);

// Asset version for cache-busting
try {
  app.locals.assetVersion = require('./package.json').version;
} catch {
  app.locals.assetVersion = '1.0.0';
}

// Security + logs
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'"], // inline scripts in header/footer
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:"],
        "connect-src": ["'self'"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "frame-ancestors": ["'self'"],
      },
    },
  })
);
app.use(morgan('dev'));

// Health
app.get('/_health', (req, res) => res.type('text').send('ok'));

// Routes
const siteRoutes = require('./src/routes/site');
app.use(siteRoutes);

// Errors
app.use((req, res) => res.status(404).render('404', { title: 'Not Found' }));
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  try {
    res.status(500).render('500', { title: 'Server Error' });
  } catch {
    res.status(500).send('Server Error');
  }
});

// Export for Vercel; listen locally
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
}
module.exports = app;