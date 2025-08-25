/*
# PROJECT (example structure for reference only)
title:
category:            # e.g., Web, Backend, Data, Mobile (I'll create it if missing)
repoUrl:             # https://github.com/...
liveUrl:             # https://... (Vercel/Render). Leave blank if none.
summary:             # 1–2 sentences
description: |       # multi-line ok
  ...
techStack:           # comma-separated (e.g., Node.js, Express, EJS, Postgres, TailwindCSS, daisyUI)
tools:               # comma-separated (e.g., VS Code, Git, Render, Neon)
details: |           # optional, multi-line notes / bullet points
  - ...
  - ...
*/

require('dotenv').config();
const { sequelize } = require('./src/config/sequelize');
const Category = require('./src/models/category');
const Project  = require('./src/models/project');

(async () => {
  try {
    // Recreate tables to match current schema
    await sequelize.sync({ force: true });

    // Seed categories
    const web     = await Category.create({ name: 'Web',     slug: 'web' });
    const backend = await Category.create({ name: 'Backend', slug: 'backend' });

    // Common strings
    const stack1 = 'Node.js, Express, EJS, Postgres, TailwindCSS, daisyUI';
    const tools1 = 'VS Code, Git, Render, Neon';

    await Project.create({
      title: 'Dine-In Digital',
      summary: 'Restaurant ordering system with clean routing and EJS templating.',
      description: 'Semester project refactored as a read-only portfolio sample. Focus on MVC structure, route design, and DB relations.',
      liveUrl: 'https://example-dinein.vercel.app',
      repoUrl: 'https://github.com/yourname/dine-in-digital',
      techStack: stack1,
      tools: tools1,
      details: 'Features: menu browse, order flow, and receipt summary.\nRole: full-stack developer.',
      categoryId: web.id
    });

    await Project.create({
      title: 'NotesTok',
      summary: 'Short-form learning prototype with tagging and feed logic.',
      description: 'Explores content modeling and simple ranking. Built as a quick MVP.',
      liveUrl: 'https://example-notestok.vercel.app',
      repoUrl: 'https://github.com/yourname/notestok',
      techStack: stack1,
      tools: tools1,
      details: 'Key ideas: tag-based discovery, minimal UI, server-rendered pages.',
      categoryId: web.id
    });

    await Project.create({
      title: 'Portfolio Backend API',
      summary: 'Tiny Node API demonstrating Sequelize models and relations.',
      description: 'Emphasis on service layer and testing approach.',
      liveUrl: '',
      repoUrl: 'https://github.com/yourname/portfolio-backend',
      techStack: 'Node.js, Express, Sequelize, Postgres',
      tools: 'VS Code, Git',
      details: 'Includes pagination, basic validation, and error handling.',
      categoryId: backend.id
    });

    console.log('✅ Seed complete. (Tables rebuilt and projects inserted.)');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();