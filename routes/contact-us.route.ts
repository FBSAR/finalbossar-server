const express  = require("express");
const router  = express.Router();
var contactUsController = require('../controller/contact-us-controller')

router.post('/send-message', contactUsController.sendMessage);

export {};

module.exports = router;