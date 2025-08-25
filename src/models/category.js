const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/sequelize');

class Category extends Model {}

Category.init(
  {
    name: { type: DataTypes.STRING(60), allowNull: false, unique: true },
    slug: { type: DataTypes.STRING(80), allowNull: false, unique: true }
  },
  { sequelize, modelName: 'Category' }
);

module.exports = Category;