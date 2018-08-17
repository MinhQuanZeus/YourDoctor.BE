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
const BankController = require('../controllers/BankController');
const IntroduceAndRuleController = require('../controllers/IntroduceAndRuleController');
const StaffController = require('../controllers/StaffController');
const ReportConversationController = require('../controllers/ReportConversationController');
const passport = require('passport');
const path = require('path');


require('./../middleware/passport')(passport);
/* GET home page. */
router.get('/', function (req, res, next) {
    res.json({
        status: 'success',
        message: 'Your doctor api',
        data: {
            'version_number': 'v1.0.0',
        },
    })
});
//Auth controller
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);

//User controllerss
router.get('/users', passport.authenticate('jwt', {
    session: false,
}), UserController.get);
router.put('/users', passport.authenticate('jwt', {
    session: false,
}), UserController.update);
router.put('/users/changePassword', passport.authenticate('jwt', {
    session: false
}), UserController.changePassword);
router.get('/users/forgotPassword/:phoneNumber', UserController.forgotPassword);
router.delete('/users', passport.authenticate('jwt', {
    session: false,
}), UserController.remove);

router.get('/users/get-all-user', passport.authenticate('jwt', {
    session: false
}), UserController.getAllUser);

// Introduce and Rule
router.post('/IntroduceAndRule', IntroduceAndRuleController.create);
router.get('/IntroduceAndRule', IntroduceAndRuleController.get);

//Phone
router.post('/phone/sms', PhoneController.sendPhoneVerifyCode);
router.post('/phone/verify', PhoneController.verifyPhoneVerifyCode);

//--------------- Report
router.post('/reports', passport.authenticate('jwt', {
    session: false
}), ReportController.create);
router.get('/reports/get-list-report-doctor', passport.authenticate('jwt', {
    session: false
}), ReportController.get);
router.put('/reports/update-report-doctor/:id', passport.authenticate('jwt', {
    session: false
}), ReportController.updateReportDoctorProcessing);


//--------------- Specialist
router.post('/specialists', SpecialistController.create);
router.get('/specialists/get-all-specialist',passport.authenticate('jwt', {
    session: false
}), SpecialistController.getAllSpecialist);
router.get('/specialists/getListSpecialist', SpecialistController.getListSpecialist);
router.get('/specialists/getDetailSpecialist/:specialistId', SpecialistController.getDetailSpecialist);
router.put('/specialists',passport.authenticate('jwt', {
    session: false
}), SpecialistController.update);
router.delete('/specialists',passport.authenticate('jwt', {
    session: false
}), SpecialistController.remove);

//--------------- Rating
router.post('/ratings', passport.authenticate('jwt', {
    session: false,
}), RatingController.create);
router.get('/ratings/:doctorId', passport.authenticate('jwt', {
    session: false,
}), RatingController.getCommentAndRating);
router.get('/ratings/countPatientRatingForDoctor/:doctorId', passport.authenticate('jwt', {
    session: false,
}), RatingController.countPatientRatingForDoctor);

//--------------- Type_advisories
router.post('/typeadvisorys', passport.authenticate('jwt', {
    session: false,
}), TypeAdvisoriesController.create);
router.get('/typeadvisorys/getAllTypeAdvisories', passport.authenticate('jwt', {
    session: false,
}), TypeAdvisoriesController.getAllTypeAdvisories);
router.get('/typeadvisorys/getTypeAdvisoriesById/:id', passport.authenticate('jwt', {
    session: false,
}), TypeAdvisoriesController.getTypeAdvisoriesById);
router.put('/typeadvisorys', passport.authenticate('jwt', {
    session: false,
}), TypeAdvisoriesController.update);
router.delete('/typeadvisorys', passport.authenticate('jwt', {
    session: false,
}), TypeAdvisoriesController.remove);

//---------------Banking_history
router.post('/bankinghistorys/doctorWithdrawal', passport.authenticate('jwt', {
    session: false,
}), BankingHistoryController.doctorWithdrawal);

router.post('/bankinghistorys/checkCodeVerify', BankingHistoryController.checkCodeVerify);

router.get('/bankinghistorys', passport.authenticate('jwt', {
    session: false,
}), BankingHistoryController.getHistoryBanking);
router.get('/bankinghistorys/:id', passport.authenticate('jwt', {
    session: false,
}), BankingHistoryController.getDetailHistoryById);
router.get('/bankinghistorys/getHistoryBanking/:userId', passport.authenticate('jwt', {
    session: false,
}),BankingHistoryController.getHistoryBanking);
router.delete('/bankinghistorys/:id', passport.authenticate('jwt', {
    session: false,
}), BankingHistoryController.removeLogic);

//---------------Doctor
router.post('/doctors', DoctorController.registerDoctor);
router.get('/doctors', passport.authenticate('jwt', {
    session: false,
}), DoctorController.getDoctor);
router.get('/doctors/getInformationDoctorById/:doctorId', passport.authenticate('jwt', {
    session: false,
}), DoctorController.getInformationDoctorById);
router.get('/doctors/getListSpecialistDoctor', passport.authenticate('jwt', {
    session: false,
}), DoctorController.getListSpecialistDoctor);
router.get('/doctors/getDoctorRankingBySpecialist/:specialistId', passport.authenticate('jwt', {
    session: false,
}), DoctorController.getDoctorRankingBySpecialist);
router.get('/doctors/getDetailDoctor/:doctorId', passport.authenticate('jwt', {
    session: false,
}), DoctorController.getDetailDoctor);
router.put('/doctors', passport.authenticate('jwt', {
    session: false,
}), DoctorController.update);
router.delete('/doctors', passport.authenticate('jwt', {
    session: false
}), DoctorController.remove);

router.get('/doctors/getListDoctorPending',passport.authenticate('jwt', {
    session: false
}),DoctorController.getListDoctorPending);
router.put('/doctors/confirmInforDoctor',passport.authenticate('jwt', {
    session: false
}),DoctorController.confirmInforDoctor);
router.get('/doctors/doctors-by-specialist', DoctorController.getDoctorsBySpecialist);


//-----------Patient
router.post('/patients', passport.authenticate('jwt', {
    session: false,
}), PatientsController.create);
router.get('/patients/getPatients', passport.authenticate('jwt', {
    session: false,
}), PatientsController.getPatients);
router.get('/patients/getInformationPatientById/:patientId', passport.authenticate('jwt', {
    session: false,
}), PatientsController.getInformationPatientById);
router.get('/patients/getListFavoriteDoctor/:patientId', passport.authenticate('jwt', {
    session: false,
}), PatientsController.getListFavoriteDoctor);
router.get('/patients/getListIDFavoriteDoctor/:patientId', passport.authenticate('jwt', {
    session: false,
}), PatientsController.getListIDFavoriteDoctor);
router.put('/patients', passport.authenticate('jwt', {
    session: false,
}), PatientsController.update);
router.put('/patients/addFavoriteDoctor', passport.authenticate('jwt', {
    session: false,
}), PatientsController.addFavoriteDoctor);
router.put('/patients/removeFavoriteDoctor', passport.authenticate('jwt', {
    session: false,
}), PatientsController.removeFavoriteDoctor);
router.delete('/patients', passport.authenticate('jwt', {
    session: false,
}), PatientsController.remove);

//-----------ChatsHistory
router.post('/chatshistorys', passport.authenticate('jwt', {
    session: false,
}), ChatsHistoryController.create);
router.put('/chatshistorys', passport.authenticate('jwt', {
    session: false,
}), ChatsHistoryController.updateRecord);
router.get('/chatshistorys/getAllConversationByPatient/:patientId', passport.authenticate('jwt', {
    session: false,
}), ChatsHistoryController.getAllConversationByPatient);
router.get('/chatshistorys/getAllConversationByDoctor/:doctorId', passport.authenticate('jwt', {
    session: false,
}), ChatsHistoryController.getAllConversationByDoctor);
router.get('/chatshistorys/getConversationByID/:id', passport.authenticate('jwt', {
    session: false,
}), ChatsHistoryController.getConversationByID);
router.get('/chatshistorys/getListConversationPending/:patientId', passport.authenticate('jwt', {
    session: false,
}), ChatsHistoryController.getListConversationPending);
router.post('/chatshistorys/checkDoctorReply', passport.authenticate('jwt', {
    session: false,
}), ChatsHistoryController.checkDoctorReply);
router.post('/chatshistorys/checkStatusChatsHistory', passport.authenticate('jwt', {
    session: false,
}), ChatsHistoryController.checkStatusChatsHistory);
router.get('/chatshistorys/doctorDenyRequestChat/:id', passport.authenticate('jwt', {
    session: false,
}),ChatsHistoryController.doctorDenyRequestChat);

//----------PaymentHistory
router.post('/paymentshistorys', passport.authenticate('jwt', {
    session: false,
}), PaymentsHistoryController.create);
router.get('/paymentshistorys/getPaymentHistoryByUser/:userID', passport.authenticate('jwt', {
    session: false,
}), PaymentsHistoryController.getPaymentHistoryByUser);

//----------TokenNotification
router.post('/tokennotifications', passport.authenticate('jwt', {
    session: false,
}), TokenNotificationController.createToken);
router.get('/tokennotifications/:userId', passport.authenticate('jwt', {
    session: false,
}), TokenNotificationController.getToken);

// uploadImage
router.post('/uploadImageChat', UploadImageController.upload);

// test insert notification
router.post('/notifications', NotificationController.create);
router.get('/notifications/getAllNotificationByUser/:receiverId', passport.authenticate('jwt', {
    session: false,
}), NotificationController.getAllNotificationByUser);

/// Stafff
router.post('/staffs', StaffController.createStaff);


/// ReportConversationController
router.post('/reportConversations', passport.authenticate('jwt', {
    session: false
}), ReportConversationController.createReportConveration);
router.put('/reportConversations/update-report-conversation/:id', passport.authenticate('jwt', {
    session: false
}), ReportConversationController.updateReportConversationProcessing);
router.get('/reportConversations/get-list-report-conversation', passport.authenticate('jwt', {
    session: false
}), ReportConversationController.getListReport);
//
router.post('/banks',passport.authenticate('jwt', {
    session: false
}), BankController.create);
router.get('/banks',passport.authenticate('jwt', {
    session: false
}), BankController.get);
module.exports = router;
