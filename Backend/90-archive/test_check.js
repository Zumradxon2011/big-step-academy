require('dotenv').config();
try {
  const adminController = require('./src/controllers/adminController');
  const adminRoutes = require('./src/routes/adminRoutes');
  console.log('SUCCESS: adminController and adminRoutes loaded properly!');
  console.log('Controller exported methods:', Object.keys(adminController));
} catch (err) {
  console.error('ERROR:', err);
  process.exit(1);
}
