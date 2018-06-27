const express = require('express');
const router = express.Router();

const UserController = require('./../controllers/UserController');
const PhoneController = require('./../controllers/PhoneController');
const AuthController = require('./../controllers/AuthController');

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

module.exports = router;
