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
  } catch (err) {
    console.error(err);
    res.status(500).render('500', { title: 'Server Error' });
  }
};

exports.getAbout = (req, res) => {
  res.render('about', { title: 'About' });
};

exports.getWorks = async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });

    const categoryParam = (req.query.category || '').trim();
    let where = {};

    if (categoryParam) {
      const cat = await Category.findOne({
        where: {
          [Op.or]: [
            { slug: categoryParam },
            { id: Number(categoryParam) || 0 },
          ],
        },
      });
      if (cat) where.categoryId = cat.id;
    }

    const projects = await Project.findAll({
      where,
      include: [{ model: Category }],
      order: [['createdAt', 'DESC']],
    });

    res.render('projects', {
      title: 'Projects',
      categories,
      projects,
      selected: categoryParam,
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('500', { title: 'Server Error' });
  }
};

exports.getWorkDetail = async (req, res) => {
  try {
    const { slug } = req.params;
    const project = await Project.findOne({
      where: { slug },
      include: [{ model: Category }],
    });

    if (!project) {
      return res.status(404).render('404', { title: 'Not Found' });
    }

    res.render('project-show', { title: project.title, project });
  } catch (err) {
    console.error(err);
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

// ===== NEW PAGES =====
// Keep arrays empty by default (so we don't invent data).
// You can populate these arrays later.

exports.getEducation = (req, res) => {
  const schools = []; // [{ school, program, location, start, end, details:[] }]
  res.render('education', { title: 'Education', schools });
};

exports.getCertifications = (req, res) => {
  const certs = []; // [{ name, issuer, date, url }]
  res.render('certifications', { title: 'Certifications', certs });
};

exports.getExperience = (req, res) => {
  const roles = []; // [{ title, company, location, start, end, bullets:[] }]
  res.render('experience', { title: 'Experience', roles });
};