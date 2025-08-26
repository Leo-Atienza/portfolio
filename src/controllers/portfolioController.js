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

exports.getAbout = (req, res) => {
  res.render('about', { title: 'About' });
};

exports.getWorks = async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });

    const selected = (req.query.category || '').trim();
    const where = {};
    if (selected) {
      const cat = await Category.findOne({
        where: { [Op.or]: [{ slug: selected }, { id: Number(selected) || 0 }] },
      });
      if (cat) where.categoryId = cat.id;
    }

    const projects = await Project.findAll({
      where,
      include: [{ model: Category }],
      order: [['createdAt', 'DESC']],
    });

    res.render('projects', { title: 'Projects', categories, projects, selected });
  } catch (e) {
    console.error(e);
    res.status(500).render('500', { title: 'Server Error' });
  }
};

exports.getWorkDetail = async (req, res) => {
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

exports.getContact = (req, res) => {
  const contacts = {
    email: 'leooatienza@gmail.com',
    linkedin: process.env.LINKEDIN_URL || null,
    github: process.env.GITHUB_URL || null,
  };
  res.render('contact', { title: 'Contact', contacts });
};

// New pages (empty arrays you can fill later)
exports.getEducation = (req, res) => res.render('education', { title: 'Education', schools: [] });
exports.getCertifications = (req, res) => res.render('certifications', { title: 'Certifications', certs: [] });
exports.getExperience = (req, res) => res.render('experience', { title: 'Experience', roles: [] });