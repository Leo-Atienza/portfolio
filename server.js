// server.js
require('dotenv').config();

const path = require('path');
const express = require('express');
const compression = require('compression');

const app = express();

// Trust Vercel/Proxy headers (correct scheme/IP on Vercel)
app.set('trust proxy', 1);

// Compression for faster responses
app.use(compression());

// Parse bodies if/when needed
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View engine: EJS under /src/views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Static assets (served from /public)
// You can keep this simple; Tailwind output is /public/css/main.css
app.use(express.static(path.join(__dirname, 'public')));

// ---- Cache-busting version for CSS/JS links ----
// Prefer the deploy SHA on Vercel, then ASSET_VERSION, then a timestamp.
app.use((req, res, next) => {
  res.locals.assetVersion =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.ASSET_VERSION ||
    Date.now();
  next();
});

// Optional: make a site-wide title helper available
app.use((req, res, next) => {
  res.locals.title = res.locals.title || '';
  next();
});

// Routes
const siteRoutes = require('./src/routes/site');
app.use('/', siteRoutes);

// 404
app.use((req, res) => {
  res.status(404).render('404', { title: 'Not Found' });
});

// 500
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('500', { title: 'Server Error' });
});

// Export for Vercel serverless (api/index.js will import this)
module.exports = app;

// Local dev server: `node server.js`
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
