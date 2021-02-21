const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/checkAuth");
const isNormalUser = require("../middleware/isNormalUser");

const IlanControllers = require("../controllers/ilanlar");

router.get('/:limit/:skip', IlanControllers.get_ilanlar);
router.get('/:ilan_id', IlanControllers.get_ilan_by_id);
router.post('/search', IlanControllers.search);
router.post('/search-category', IlanControllers.search_category);
router.post('/search-price', IlanControllers.search_by_price);
router.patch('/:ilan_id', checkAuth, isNormalUser, IlanControllers.update_ilan);
router.patch('/like/:ilan_id', checkAuth, isNormalUser, IlanControllers.like_ilan);
router.patch('/fav/:ilan_id', checkAuth, isNormalUser, IlanControllers.ilan_favla);
router.post('/', checkAuth, isNormalUser, IlanControllers.ilan_olustur);
router.patch('/unfav/:ilan_id', checkAuth, isNormalUser, IlanControllers.unfav_ilan);
router.patch('/dislike/:ilan_id', checkAuth, isNormalUser, IlanControllers.dislike_ilan);
router.delete('/:ilan_id', checkAuth, isNormalUser, IlanControllers.delete_ilan);
router.get("/my-ilans", checkAuth, isNormalUser, IlanControllers.get_my_ilanlar);

module.exports = router;
