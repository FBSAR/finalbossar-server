const express  = require("express");
const router  = express.Router();
var adminController = require('../controller/admin-controller')

router.post('/login', adminController.loginAdmin);
router.post('/register', adminController.registerAdmin);
router.post('/send-newsletter', adminController.sendNewsletter);
router.get('/get-profiles', adminController.getProfiles);

export {};

module.exports = router; 