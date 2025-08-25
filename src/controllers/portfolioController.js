const Category = require('../models/category');
const Project  = require('../models/project');

exports.getHome = async (req, res) => {
  try {
    const recent = await Project.findAll({
      include: Category,
      order: [['createdAt', 'DESC']],
      limit: 6
    });
    res.render('index', { title: 'Home', recent });
  } catch (e) {
    console.error(e);
    res.render('index', { title: 'Home', recent: [] });
  }
};

exports.getAbout = (req, res) => {
  res.render('about', { title: 'About' });
};

exports.getWorks = async (req, res, next) => {
  try {
    const { category } = req.query;
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    const where = category ? { categoryId: category } : {};
    const projects = await Project.findAll({
      where,
      include: Category,
      order: [['createdAt', 'DESC']]
    });
    res.render('works', { title: 'Works', categories, projects, selected: category || '' });
  } catch (e) { next(e); }
};

exports.getWorkDetail = async (req, res, next) => {
  try {
    const proj = await Project.findOne({ where: { slug: req.params.slug }, include: Category });
    if (!proj) return res.status(404).render('404', { title: 'Not Found' });
    res.render('work-show', { title: proj.title, proj });
  } catch (e) { next(e); }
};