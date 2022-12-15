const express  = require("express");
const router  = express.Router();
var jobAppController = require('../controller/job-app-controller')

router.post('/submit-app', jobAppController.submitApp);

export {};

module.exports = router;