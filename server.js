// server.js — starts the app only after the DB connects

require('dotenv').config();
const path = require('path');
const express = require('express');
const siteRoutes = require('./src/routes/site');
const { sequelize } = require('./src/config/sequelize');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Static assets
app.use(express.static(path.join(__dirname, 'public')));

// in server.js (after static middleware)
app.get('/robots.txt', (_, res) => res.sendFile(path.join(__dirname, 'robots.txt')));
app.get('/sitemap.xml', (_, res) => res.sendFile(path.join(__dirname, 'sitemap.xml')));

// Body parsers (handy for contact form or small APIs)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use('/', siteRoutes);

// 404 (keep after routes)
app.use((req, res) => {
  res.status(404).render('404', { title: 'Not Found' });
});

// 500 error handler (must have 4 params)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('500', { title: 'Server Error' });
});

// Boot only after DB connects
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // creates tables if missing
    app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
  } catch (e) {
    console.error('DB connection failed:', e);
    process.exit(1);
  }
})();