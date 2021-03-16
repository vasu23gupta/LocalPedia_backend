const admin = require('firebase-admin');
require('dotenv').config();

module.exports = admin.initializeApp();