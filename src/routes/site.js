const express = require('express');
const router = express.Router();
const ctl = require('../controllers/portfolioController');

router.get('/', ctl.getHome);
router.get('/about', ctl.getAbout);
router.get('/works', ctl.getWorks);           // uses ?category=ID
router.get('/work/:slug', ctl.getWorkDetail);

module.exports = router;
