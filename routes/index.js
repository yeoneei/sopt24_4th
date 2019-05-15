var express = require('express');
var router = express.Router();

/* GET home page. */
router.use('/homework', require('./homework/index'));
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
