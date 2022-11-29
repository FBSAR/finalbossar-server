const express  = require("express");
const router  = express.Router();
var web3Controller = require('../controller/web3-controller')

router.get('/total-supply', web3Controller.totalSupply);
router.post('/balance-of', web3Controller.balanceOf);

export {};

module.exports = router;