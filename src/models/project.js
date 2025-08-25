const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/sequelize');
const Category = require('./category');
const slugify = require('slugify');

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map(v => String(v).trim()).filter(Boolean).join(', ');
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map(v => v.trim())
      .filter(Boolean)
      .join(', ');
  }
  return '';
}

class Project extends Model {}

Project.init(
  {
    title: { type: DataTypes.STRING(120), allowNull: false },
    slug:  { type: DataTypes.STRING(160), allowNull: false, unique: true },
    summary:     { type: DataTypes.STRING(300), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    liveUrl:     { type: DataTypes.STRING(500), allowNull: true },
    repoUrl:     { type: DataTypes.STRING(500), allowNull: true },
    techStack:   { type: DataTypes.STRING(1000), allowNull: true },
    tools:       { type: DataTypes.STRING(1000), allowNull: true },
    details:     { type: DataTypes.TEXT, allowNull: true },
    categoryId:  { type: DataTypes.INTEGER, allowNull: true }
  },
  {
    sequelize,
    modelName: 'Project',
    indexes: [{ fields: ['slug'], unique: true }],
    hooks: {
      beforeValidate(project) {
        if (!project.slug && project.title) {
          project.slug = slugify(project.title, { lower: true, strict: true });
        }
      },
      beforeSave(project) {
        project.techStack = normalizeList(project.techStack);
        project.tools     = normalizeList(project.tools);
      }
    }
  }
);

// Associations (Category 1—* Project)
Category.hasMany(Project, { foreignKey: 'categoryId' });
Project.belongsTo(Category, { foreignKey: 'categoryId' });

module.exports = Project;