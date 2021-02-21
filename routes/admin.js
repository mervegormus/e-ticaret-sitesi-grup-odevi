const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/checkAuth");
const isAdmin = require("../middleware/isAdmin");

const AdminControllers = require("../controllers/admin");

router.post('/add-category', checkAuth, isAdmin, AdminControllers.add_category);
router.delete('/delete-category', checkAuth, isAdmin, AdminControllers.delete_category);
router.get('/get-approvals', checkAuth, isAdmin, AdminControllers.get_approvals);
router.get('/get-categories', checkAuth, isAdmin, AdminControllers.get_categories);
router.post('/approve-ilan', checkAuth, isAdmin, AdminControllers.approve_ilan);
router.post('/disapprove-ilan', checkAuth, isAdmin, AdminControllers.disapprove_ilan);
router.post('/approve-product', checkAuth, isAdmin, AdminControllers.approve_product);
router.post('/disapprove-product', checkAuth, isAdmin, AdminControllers.disapprove_product);

module.exports = router;