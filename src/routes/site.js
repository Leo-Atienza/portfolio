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

// Core pages
router.get('/', ctl.getHome);
router.get('/about', ctl.getAbout);
router.get('/projects', ctl.getWorks);            // list
router.get('/project/:slug', ctl.getWorkDetail);  // detail
router.get('/contact', ctl.getContact);

// New pages
router.get('/education', ctl.getEducation);
router.get('/certifications', ctl.getCertifications);
router.get('/experience', ctl.getExperience);

module.exports = router;