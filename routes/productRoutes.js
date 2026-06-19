const express        = require('express');
const router         = express.Router();
const { upload }     = require('../config/cloudinary');
const {
  addProduct,
  getMyProducts,
  getAllProducts,
  getProductById,
  deleteProduct,
} = require('../controllers/productController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Public
router.get('/',            getAllProducts);
router.get('/my-products', verifyToken, authorizeRoles('vendor'), getMyProducts);
router.get('/:id',         getProductById);

// Vendor only — upload.single('image') handles the file upload
router.post(
  '/add',
  verifyToken,
  authorizeRoles('vendor'),
  upload.single('image'),  // 'image' must match the field name in the form
  addProduct
);

router.delete('/:id', verifyToken, authorizeRoles('vendor'), deleteProduct);

module.exports = router;