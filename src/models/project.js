const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/sequelize');
const Category = require('./category');
const slugify = require('slugify');

function normalizeList(value) {
  // Accept array or string; output "A, B, C"
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
  return value ?? ''; // keep nullish as empty string
}

class Project extends Model {}

Project.init(
  {
    title:       { type: DataTypes.STRING(120), allowNull: false },  // name
    slug:        { type: DataTypes.STRING(140), allowNull: false, unique: true },
    summary:     { type: DataTypes.TEXT, allowNull: false },
    description: { type: DataTypes.TEXT },                            // long write-up
    liveUrl:     { type: DataTypes.STRING },                          // vercel (or demo) link
    repoUrl:     { type: DataTypes.STRING },                          // github link
    techStack:   { type: DataTypes.TEXT },                            // comma-separated list
    tools:       { type: DataTypes.TEXT },                            // comma-separated list
    details:     { type: DataTypes.TEXT }                             // other details / notes
  },
  {
    sequelize,
    modelName: 'Project',
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