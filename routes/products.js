const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/checkAuth");
const isStoreUser = require("../middleware/isStoreUser");

const ProductControllers = require("../controllers/products");

router.get('/:limit/:skip', ProductControllers.get_my_products);
router.get('/:product_id', ProductControllers.get_product_by_id);
router.get('/search', ProductControllers.search);
router.get('/search-category', ProductControllers.search_category);
router.patch('/:product_id', checkAuth, isStoreUser, ProductControllers.update_product);
router.patch('/like/:product_id', checkAuth, isStoreUser, ProductControllers.like_product);
router.patch('/fav/:product_id', checkAuth, isStoreUser, ProductControllers.fav_product);
router.post('/', checkAuth, isStoreUser, ProductControllers.create_product);
router.patch('/unfav/:product_id', checkAuth, isStoreUser, ProductControllers.unfav_product);
router.patch('/dislike/:product_id', checkAuth, isStoreUser, ProductControllers.dislike_product);
router.delete('/:product_id', checkAuth, isStoreUser, ProductControllers.delete_product);

module.exports = router;