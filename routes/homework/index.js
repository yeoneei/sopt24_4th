var express = require('express');
var router = express.Router();


/* GET home page. */

router.use('/signup', require('./signup'));
module.exports = router;
