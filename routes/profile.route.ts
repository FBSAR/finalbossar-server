const express  = require("express");
const router  = express.Router();
var profileController = require('../controller/profile-controller')

router.post('/register-user', profileController.registerUser);
router.post('/login-user', profileController.loginUser);

export {};

module.exports = router;