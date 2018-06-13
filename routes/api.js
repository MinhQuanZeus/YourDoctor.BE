const express = require('express');
const router = express.Router();

const UserController = require('./../controllers/UserController');
const PhoneController = require('./../controllers/PhoneController');
const AuthController = require('./../controllers/AuthController');

const ReportController = require('../controllers/ReportController');
const SpecialistController = require('../controllers/SpecialistController');
const RatingController = require('../controllers/RatingController');
const Type_advisoriesController = require('../controllers/Type_advisoriesController');
const passport = require('passport');
const path = require('path');


require('./../middleware/passport')(passport)
/* GET home page. */
router.get('/', function (req, res, next) {
    res.json({
        status: "success",
        message: "Your doctor api",
        data: {
            "version_number": "v1.0.0"
        }
    })
});
//Auth controller
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);

//User controllerss
router.get('/users', passport.authenticate('jwt', {
    session: false
}), UserController.get);
router.put('/users', passport.authenticate('jwt', {
    session: false
}), UserController.update);
router.delete('/users', passport.authenticate('jwt', {
    session: false
}), UserController.remove);


//Phone
router.post('/phone/sms', PhoneController.sendPhoneVerifyCode);
router.post('/phone/verify', PhoneController.verifyPhoneVerifyCode);

//--------------- Report
router.post('/reports', ReportController.create);
router.get('/reports', ReportController.get);
router.delete('/reports', ReportController.remove);


//--------------- Specialist
router.post('/specialists', SpecialistController.create);
router.get('/specialists', SpecialistController.get);
router.put('/specialists', SpecialistController.update);
router.delete('/specialists', SpecialistController.remove);

//--------------- Rating
router.post('/ratings', RatingController.create);
router.put('/ratings', RatingController.update);

//--------------- Type_advisories
router.post('/type_advisoriess', Type_advisoriesController.create);
router.get('/type_advisoriess', Type_advisoriesController.get_all_type);
router.get('/type_advisoriess/:id', Type_advisoriesController.get_by_id);
router.put('/type_advisoriess', Type_advisoriesController.update);
router.delete('/type_advisoriess', Type_advisoriesController.remove);
module.exports = router;
