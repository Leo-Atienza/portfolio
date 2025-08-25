// Vercel serverless entry – forwards all traffic to your Express app.
const app = require('../server');
module.exports = (req, res) => app(req, res);
