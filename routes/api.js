const express = require('express');
const router = express.Router();

const UserController = require('./../controllers/UserController');
const PhoneController = require('./../controllers/PhoneController');
const AuthController = require('./../controllers/AuthController');

const ReportController = require('../controllers/ReportController');
const SpecialistController = require('../controllers/SpecialistController');
const RatingController = require('../controllers/RatingController');
const TypeAdvisoriesController = require('../controllers/TypeAdvisoriesController');
const BankingHistoryController = require('../controllers/BankingHistoryController');
const DoctorController = require('../controllers/DoctorController');
const PatientsController = require('../controllers/PatientsController');
const ChatsHistoryController = require('../controllers/ChatsHistoryController');
const PaymentsHistoryController = require('../controllers/PaymentsHistoryController');
const TokenNotificationController = require('../controllers/TokenNotificationController');
const UploadImageController = require('../controllers/UploadImageController');
const NotificationController = require('../controllers/NotificationController');
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
router.put('/users/changePassword', passport.authenticate('jwt', {
    session: false
}), UserController.changePassword);
router.put('/users/forgotPassword', passport.authenticate('jwt', {
    session: false
}), UserController.forgotPassword);
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
router.post('/typeadvisorys',passport.authenticate('jwt', {
    session: false
}), TypeAdvisoriesController.create);
router.get('/typeadvisorys/getAllTypeAdvisories',passport.authenticate('jwt', {
    session: false
}), TypeAdvisoriesController.getAllTypeAdvisories);
router.get('/typeadvisorys/getTypeAdvisoriesById/:id',passport.authenticate('jwt', {
    session: false
}), TypeAdvisoriesController.getTypeAdvisoriesById);
router.put('/typeadvisorys',passport.authenticate('jwt', {
    session: false
}), TypeAdvisoriesController.update);
router.delete('/typeadvisorys',passport.authenticate('jwt', {
    session: false
}), TypeAdvisoriesController.remove);

//---------------Banking_history
router.post('/bankinghistorys', passport.authenticate('jwt', {
    session: false
}),BankingHistoryController.create);
router.get('/bankinghistorys', passport.authenticate('jwt', {
    session: false
}),BankingHistoryController.getAllHistoryBanking);
router.get('/bankinghistorys/:id', passport.authenticate('jwt', {
    session: false
}),BankingHistoryController.getDetailHistoryById);
router.delete('/bankinghistorys/:id',passport.authenticate('jwt', {
    session: false
}), BankingHistoryController.removeLogic);

//---------------Doctor
router.post('/doctors',passport.authenticate('jwt', {
    session: false
}), DoctorController.create);
router.get('/doctors',passport.authenticate('jwt', {
    session: false
}), DoctorController.getDoctor);
router.get('/doctors/getInformationDoctorById/:doctorId',passport.authenticate('jwt', {
    session: false
}), DoctorController.getInformationDoctorById);
router.get('/doctors/getListSpecialistDoctor/:specialistId',passport.authenticate('jwt', {
    session: false
}), DoctorController.getListSpecialistDoctor);
router.put('/doctors',passport.authenticate('jwt', {
    session: false
}), DoctorController.update);
router.delete('/doctors', passport.authenticate('jwt', {
    session: false
}),DoctorController.remove);


//-----------Patient
router.post('/patients', passport.authenticate('jwt', {
    session: false
}),PatientsController.create);
router.get('/patients/getPatients', passport.authenticate('jwt', {
    session: false
}),PatientsController.getPatients);
router.get('/patients/getInformationPatientById/:patientId', passport.authenticate('jwt', {
    session: false
}),PatientsController.getInformationPatientById);
router.get('/patients/getListFavoriteDoctor/:patientId',passport.authenticate('jwt', {
    session: false
}), PatientsController.getListFavoriteDoctor);
router.get('/patients/getListIDFavoriteDoctor/:patientId',passport.authenticate('jwt', {
    session: false
}), PatientsController.getListIDFavoriteDoctor);
router.put('/patients', passport.authenticate('jwt', {
    session: false
}),PatientsController.update);
router.put('/patients/addFavoriteDoctor',passport.authenticate('jwt', {
    session: false
}), PatientsController.addFavoriteDoctor);
router.put('/patients/removeFavoriteDoctor',passport.authenticate('jwt', {
    session: false
}), PatientsController.removeFavoriteDoctor);
router.delete('/patients', passport.authenticate('jwt', {
    session: false
}),PatientsController.remove);

//-----------ChatsHistory
router.post('/chatshistorys', passport.authenticate('jwt', {
    session: false
}),ChatsHistoryController.create);
router.put('/chatshistorys',passport.authenticate('jwt', {
    session: false
}), ChatsHistoryController.updateRecord);
router.get('/chatshistorys/getAllConversationByPatient/:patientId',passport.authenticate('jwt', {
    session: false
}), ChatsHistoryController.getAllConversationByPatient);
router.get('/chatshistorys/getAllConversationByDoctor/:doctorId',passport.authenticate('jwt', {
    session: false
}), ChatsHistoryController.getAllConversationByDoctor);
router.get('/chatshistorys/getConversationByID/:id', passport.authenticate('jwt', {
    session: false
}),ChatsHistoryController.getConversationByID);
router.post('/chatshistorys/checkDoctorReply',passport.authenticate('jwt', {
    session: false
}), ChatsHistoryController.checkDoctorReply);
router.post('/chatshistorys/checkStatusChatsHistory', passport.authenticate('jwt', {
    session: false
}),ChatsHistoryController.checkStatusChatsHistory);

//----------PaymentHistory
router.post('/paymentshistorys',passport.authenticate('jwt', {
    session: false
}), PaymentsHistoryController.create);

//----------TokenNotification
router.post('/tokennotifications',passport.authenticate('jwt', {
    session: false
}), TokenNotificationController.createToken);
router.get('/tokennotifications/:userId',passport.authenticate('jwt', {
    session: false
}), TokenNotificationController.getToken);

// uploadImage
router.post('/uploadImageChat',passport.authenticate('jwt', {
    session: false
}), UploadImageController.upload);

// test insert notification
router.post('/notifications', passport.authenticate('jwt', {
    session: false
}),NotificationController.create);

module.exports = router;
