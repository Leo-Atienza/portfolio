const express = require('express');
const router = express.Router();
const ctl = require('../controllers/portfolioController');

// Legacy redirects (back-compat + SEO)
router.get('/works', (req, res) => {
  const qs = req._parsedUrl.search || '';
  res.redirect(301, '/projects' + qs);
});
router.get('/work/:slug', (req, res) => {
  res.redirect(301, '/project/' + encodeURIComponent(req.params.slug));
});

router.get('/', ctl.getHome);
router.get('/about', ctl.getAbout);
router.get('/projects', ctl.getWorks);            // list
router.get('/project/:slug', ctl.getWorkDetail);  // detail
router.get('/contact', ctl.getContact);

module.exports = router;