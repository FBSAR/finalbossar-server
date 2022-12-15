const express  = require("express");
const router  = express.Router();
var adminController = require('../controller/admin-controller')

router.post('/login', adminController.loginAdmin);
router.get('/register', adminController.registerAdmin);
router.post('/send-newsletter', adminController.sendNewsletter);
router.get('/get-profiles', adminController.getProfiles);
router.get('/get-job-apps', adminController.getJobApps);
router.post('/save-app', adminController.saveApp);
router.post('/delete-app', adminController.denyApp);

export {};

module.exports = router; 