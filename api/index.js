const app = require('../server/src/app');
const connectDB = require('../server/src/config/database');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (error) {
    console.error('Vercel Serverless DB Connection Warning:', error.message);
  }
  return app(req, res);
};
