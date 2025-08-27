const express = require('express');
const router = express.Router();
const { Project, Category } = require('../models');

router.get('/', async (req, res, next) => {
  try {
    const recent = await Project.findAll({
      order: [['createdAt', 'DESC']],
      limit: 6,
      include: [{ model: Category }],
    });
    res.render('index', { title: 'Home', recent });
  } catch (err) { next(err); }
});

router.get('/projects', async (req, res, next) => {
  try {
    const projects = await Project.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: Category }],
    });
    res.render('projects', { title: 'Projects', projects, selectedCategory: null });
  } catch (err) { next(err); }
});

router.get('/projects/:slug', async (req, res, next) => {
  try {
    const project = await Project.findOne({
      where: { slug: req.params.slug },
      include: [{ model: Category }],
    });
    if (!project) return res.status(404).render('404', { title: 'Not Found' });
    res.render('project-show', { title: project.title, project });
  } catch (err) { next(err); }
});

router.get('/about',         (_req, res) => res.render('about', { title: 'About' }));
router.get('/education',     (_req, res) => res.render('education', { title: 'Education', schools: [] }));
router.get('/experience',    (_req, res) => res.render('experience', { title: 'Experience', roles: [] }));
router.get('/certifications',(_req, res) => res.render('certifications', { title: 'Certifications', certs: [] }));
router.get('/contact',       (_req, res) => {
  const contacts = {
    email: 'leooatienza@gmail.com',
    linkedin: process.env.LINKEDIN_URL || null,
    github: process.env.GITHUB_URL || null,
  };
  res.render('contact', { title: 'Contact', contacts });
});

router.get('/works', (_req, res) => res.redirect(301, '/projects'));
router.get('/work/:slug', (req, res) => res.redirect(301, `/projects/${req.params.slug}`));

module.exports = router;
