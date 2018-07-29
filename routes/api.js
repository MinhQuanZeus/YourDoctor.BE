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
router.post('/typeadvisorys', TypeAdvisoriesController.create);
router.get('/typeadvisorys/getAllTypeAdvisories', TypeAdvisoriesController.getAllTypeAdvisories);
router.get('/typeadvisorys/getTypeAdvisoriesById/:id', TypeAdvisoriesController.getTypeAdvisoriesById);
router.put('/typeadvisorys', TypeAdvisoriesController.update);
router.delete('/typeadvisorys', TypeAdvisoriesController.remove);

//---------------Banking_history
router.post('/bankinghistorys', BankingHistoryController.create);
router.get('/bankinghistorys', BankingHistoryController.getAllHistoryBanking);
router.get('/bankinghistorys/:id', BankingHistoryController.getDetailHistoryById);
router.delete('/bankinghistorys/:id', BankingHistoryController.removeLogic);

//---------------Doctor
router.post('/doctors', DoctorController.create);
router.get('/doctors', DoctorController.getDoctor);
router.get('/doctors/getInformationDoctorById/:doctorId', DoctorController.getInformationDoctorById);
router.get('/doctors/getListSpecialistDoctor/:specialistId', DoctorController.getListSpecialistDoctor);
router.put('/doctors', DoctorController.update);
router.delete('/doctors', DoctorController.remove);


//-----------Patient
router.post('/patients', PatientsController.create);
router.get('/patients/getPatients', PatientsController.getPatients);
router.get('/patients/getInformationPatientById/:patientId', PatientsController.getInformationPatientById);
router.get('/patients/getListFavoriteDoctor/:patientId', PatientsController.getListFavoriteDoctor);
router.get('/patients/getListIDFavoriteDoctor/:patientId', PatientsController.getListIDFavoriteDoctor);
router.put('/patients', PatientsController.update);
router.put('/patients/addFavoriteDoctor', PatientsController.addFavoriteDoctor);
router.put('/patients/removeFavoriteDoctor', PatientsController.removeFavoriteDoctor);
router.delete('/patients', PatientsController.remove);

//-----------ChatsHistory
router.post('/chatshistorys', ChatsHistoryController.create);
router.put('/chatshistorys', ChatsHistoryController.updateRecord);
router.get('/chatshistorys/getAllConversationByPatient/:patientId', ChatsHistoryController.getAllConversationByPatient);
router.get('/chatshistorys/getAllConversationByDoctor/:doctorId', ChatsHistoryController.getAllConversationByDoctor);
router.get('/chatshistorys/getConversationByID/:id', ChatsHistoryController.getConversationByID);
router.post('/chatshistorys/checkDoctorReply', ChatsHistoryController.checkDoctorReply);
router.get('/chatshistorys/checkStatusChatsHistory/:id', ChatsHistoryController.checkStatusChatsHistory);

//----------PaymentHistory
router.post('/paymentshistorys', PaymentsHistoryController.create);

//----------TokenNotification
router.post('/tokennotifications', TokenNotificationController.createToken);
router.get('/tokennotifications/:userId', TokenNotificationController.getToken);


/// upload image chat
const UploadImageController = require('../controllers/UploadImageController');
router.post('/uploadImageChat', UploadImageController.upload);
// test insert notification
const NotificationController = require('../controllers/NotificationController');
router.post('/notifications', NotificationController.create);

module.exports = router;
