// src/controllers/portfolioController.js
const { Op } = require('sequelize');
const { Category, Project } = require('../models');

exports.getHome = async (req, res) => {
  try {
    const recent = await Project.findAll({
      order: [['createdAt', 'DESC']],
      limit: 6,
      include: [{ model: Category }],
    });
    res.render('index', { title: 'Home', recent });
  } catch (e) {
    console.error(e);
    res.status(500).render('500', { title: 'Server Error' });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: Category }],
    });
    res.render('projects', { title: 'Projects', projects, selectedCategory: null });
  } catch (e) {
    console.error(e);
    res.status(500).render('500', { title: 'Server Error' });
  }
};

exports.getProjectDetail = async (req, res) => {
  try {
    const project = await Project.findOne({
      where: { slug: req.params.slug },
      include: [{ model: Category }],
    });
    if (!project) return res.status(404).render('404', { title: 'Not Found' });
    res.render('project-show', { title: project.title, project });
  } catch (e) {
    console.error(e);
    res.status(500).render('500', { title: 'Server Error' });
  }
};

exports.getAbout = (req, res) => res.render('about', { title: 'About' });

exports.getContact = (req, res) => {
  const contacts = {
    email: 'leooatienza@gmail.com',
    linkedin: process.env.LINKEDIN_URL || null,
    github: process.env.GITHUB_URL || null,
  };
  res.render('contact', { title: 'Contact', contacts });
};

exports.getEducation = (req, res) => res.render('education', { title: 'Education', schools: [] });
exports.getCertifications = (req, res) => res.render('certifications', { title: 'Certifications', certs: [] });
exports.getExperience = (req, res) => res.render('experience', { title: 'Experience', roles: [] });
