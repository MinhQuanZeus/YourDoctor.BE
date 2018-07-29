const User = require('./../models').User;
const Patient = require('./../models').Patient;
const Doctor = require('./../models').Doctor;
const validator = require('validator');
const constants = require('./../constants');

const createUser = async (userDetail, avatar) => {
    let userInfo;
    try {
        userInfo = JSON.parse(userDetail);
        userInfo.avatar = avatar;
    }catch(e){
        return TE('ERROR0026');
    }
    let auth_info, err;
    auth_info = {}
    auth_info.status = 'create';
    if (!userInfo.role) {
        return TE('ERROR0026');
    }
    if (!userInfo.phoneNumber) {
        return TE('ERROR0027');
    }
    if (!userInfo.firstName || !userInfo.lastName) {
        return TE('ERROR0025');
    }
    if (!userInfo.password) {
        return TE('ERROR0024');
    }
    if (validator.isMobilePhone(userInfo.phoneNumber, 'any')) {
        auth_info.method = 'phone';
        [err, user] = await to(User.create(userInfo));
        if (err) TE('ERROR0023');
        if (user.role == constants.ROLE_PATIENT) {
            const pat = new Patient({
                patientId: user._id,
                favoriteDoctors: [],
                deletionFlag: constants.NOT_DELETED_ENTITY
            })
            let error, patient;
            [error, patient] = await to(Patient.create(pat));
            if (error) {
                TE('error save patient');
            }
        }
        if (user.role == constants.ROLE_DOCTOR) {
            var doctor = new Doctor({
                doctorId: user._id,
                currentRating: constants.FIRST_RATTING,
                certificates: userInfo.certificates,
                idSpecialist: userInfo.idSpecialist,
                universityGraduate: userInfo.universityGraduate,
                yearGraduate: userInfo.yearGraduate,
                placeWorking: userInfo.placeWorking,
                deletionFlag: constants.NOT_DELETED_ENTITY
            });
            let error, doc;
            [error, doc] = await to(Doctor.create(doctor));
            if (error) {
                TE('error save doctor');
            }
        }
        if (user.role == constants.ROLE_STAFF) {
            //TODO save staff
        }
        return user;
    } else {
        TE('A valid email or phone number was not entered.');
    }
}
module.exports.createUser = createUser;

const authUser = async (userInfo) => { //returns token
    let auth_info = {};
    auth_info.status = 'login';
    console.log(userInfo);
    if (!userInfo.phoneNumber || !userInfo.password) TE('ERROR0021');

    let user;
    if (validator.isMobilePhone(userInfo.phoneNumber, 'any')) { //checks if only phone number was sent
        auth_info.method = 'phone';
        [err, user] = await to(User.findOne({
            phoneNumber: userInfo.phoneNumber
        }));
        if (err) TE(err.message);

    } else {
        TE('ERROR0001');
    }
    if (!user) TE('ERROR0020');
    [err, user] = await to(user.comparePassword(userInfo.password));

    if (err) TE('ERROR0022');

    return user;

}
module.exports.authUser = authUser;

