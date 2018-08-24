var express = require('express');
var router = express.Router();

// /* GET home page. */
// router.use('/', express.static('public', { redirect: false }));
//
// // rewrite virtual urls to angular app to enable refreshing of internal pages
// router.get('*', function (req, res, next) {
//     res.sendFile(path.resolve('public/index.html'));
// });

router.get('/', function (req, res, next) {
	res.render('index', {title: 'Your Doctor'});
});

module.exports = router;
