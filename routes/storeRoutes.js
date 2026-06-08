const express = require('express');
const router = express.Router();
const { createStore, getMyStore, getAllStores } = require('../controllers/storeController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Public route — anyone can see approved stores
router.get('/', getAllStores);

// Vendor only routes
router.post('/create', verifyToken, authorizeRoles('vendor'), createStore);
router.get('/my-store', verifyToken, authorizeRoles('vendor'), getMyStore);

module.exports = router;