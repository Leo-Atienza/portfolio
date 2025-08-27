// src/models/index.js
const { sequelize } = require('../config/sequelize');
const Category = require('./category');
const Project = require('./project');

// Associations are defined inside project.js (Category.hasMany, Project.belongsTo)
module.exports = { sequelize, Category, Project };
