const express  = require("express");
const router  = express.Router();
var contactUsController = require('../controller/contact-us-controller')

router.get('/test', contactUsController.contactUsTest);
router.post('/send-message', contactUsController.sendMessage);


export {};

module.exports = router;