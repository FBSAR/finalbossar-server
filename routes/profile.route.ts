const express  = require("express");
const router  = express.Router();
var profileController = require('../controller/profile-controller')

router.post('/register-profile', profileController.registerProfile);
router.post('/send-register-code', profileController.sendRegisterCode);
router.post('/login-profile', profileController.loginProfile);
router.post('/change-email', profileController.changeEmail);
router.post('/change-name', profileController.changeName);
router.post('/change-password', profileController.changePassword);


export {};

module.exports = router;