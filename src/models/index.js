// Barrel export for all models so callers can do: require('../models')
const Category = require('./category');
const Project  = require('./project');

// If associations are defined inside the model files, nothing else is needed here.
// Otherwise (optional), wire them here:
// Category.hasMany(Project, { foreignKey: 'categoryId' });
// Project.belongsTo(Category, { foreignKey: 'categoryId' });

module.exports = { Category, Project };