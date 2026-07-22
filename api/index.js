const app = require('../server/src/app');
const connectDB = require('../server/src/config/database');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Vercel Serverless DB Warning:', err.message);
  }
  return app(req, res);
};
