const express  = require("express");
const router  = express.Router();
var profileController = require('../controller/profile-controller')

router.post('/register-user', profileController.registerUser);

export {};

module.exports = router;