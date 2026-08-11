const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getCategories,
  getProductsByCategory,
  createProductReview,
  createProduct
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/category/:category', getProductsByCategory);
router.get('/search', getProducts);
router.post('/', protect, admin, createProduct);
router.get('/:id', getProductById);
router.post('/:id/reviews', protect, createProductReview);

module.exports = router;
