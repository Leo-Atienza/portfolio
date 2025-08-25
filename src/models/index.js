// Barrel export for models so callers can do: require('../models')
const Category = require('./category');
const Project  = require('./project');

// (Associations can be wired here if not already in the model files)
// Category.hasMany(Project, { foreignKey: 'categoryId' });
// Project.belongsTo(Category, { foreignKey: 'categoryId' });

module.exports = { Category, Project };
