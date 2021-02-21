const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/checkAuth");

const isStoreUser = require("../middleware/isStoreUser");
const StoreControllers = require("../controllers/stores");

router.get('/', checkAuth, isStoreUser, StoreControllers.get_store);
router.get('/:profile_id', StoreControllers.get_store_by_id);
router.patch('/update-store', checkAuth, isStoreUser, StoreControllers.update_store);
router.delete('/delete-store', checkAuth, isStoreUser, StoreControllers.delete_store);

module.exports = router;