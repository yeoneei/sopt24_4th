var express = require('express');
var router = express.Router();


/* GET home page. */

router.use('/signup', require('./signup'));
router.use('/signin', require('./signin'));
router.use('/board', require('./board/index'));
module.exports = router;
