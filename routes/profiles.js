const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/checkAuth");

const ProfileControllers = require("../controllers/profiles");

router.get('/get-profile', checkAuth, ProfileControllers.get_profile);
router.get('/:profile_id', ProfileControllers.get_profile_by_id);
router.patch('/update-profile', checkAuth, ProfileControllers.update_profile);
router.delete('/delete-profile', checkAuth, ProfileControllers.delete_profile);

module.exports = router;