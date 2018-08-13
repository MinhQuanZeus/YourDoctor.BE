const Doctor = require('../models').Doctor;
const Patient = require('../models').Patient;
const User = require('../models').User;
const constants = require('../constants');
const registerDoctor = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if (!body) {
        return ReE(res, 'Bad request', 400);
    }
    let objCheckDuplicate = await User.findOne({phoneNumber:body.phoneNumber});
    if(objCheckDuplicate){
        return ReS(res, {
            status: false,
            message: 'Đăng kí không thành công. Số điện thoại này đã thuộc tài khoản khác.'
        }, 503);
    }
    try {
        let createObjUser = new User({
            phoneNumber: body.phoneNumber,
            password: body.password,
            firstName: body.firstName,
            middleName: body.middleName,
            lastName: body.lastName,
            birthday: body.birthday,
            address: body.address,
            avatar: body.avatar,
            remainMoney: body.remainMoney,
            role: constants.ROLE_DOCTOR,
            gender: body.gender,
            status: constants.STATUS_DOCTOR_PENDING,
        });
        let objUserReturn = await createObjUser.save();
        if (objUserReturn) {
            let doctor = new Doctor({
                doctorId: objUserReturn.id,
                systemRating: 0,
                currentRating: 0,
                certificates: body.certificates,
                idSpecialist: body.idSpecialist,
                universityGraduate: body.universityGraduate,
                yearGraduate: body.yearGraduate,
                placeWorking: body.placeWorking
            });
            let objDoctorReturn = await  doctor.save();

            let patient = new Patient({
                patientId:objUserReturn.id
            });
            let objPatientReturn = patient.save();
            if (objDoctorReturn && objPatientReturn) {
                // send notification to staff or admin
                return ReS(res, {
                    status: true,
                    message: 'Đăng kí thành công. Chờ xác minh và phê duyệt từ hệ thống. Chúng tôi sẽ liên lạc lại với bạn.'
                }, 200);
            }
            else {
                return ReS(res, {
                    status: false,
                    message: 'Đăng kí không thành công.'
                }, 503);
            }
        }
        else {
            return ReS(res, {
                status: false,
                message: 'Đăng kí không thành công.'
            }, 503);
        }
    }
    catch (e) {
        return ReS(res, {
            status: false,
            message: 'Đăng kí không thành công.'
        }, 503);
    }
};

module.exports.registerDoctor = registerDoctor;

// get list doctor pending
const getListDoctorPending = async function (req, res) {
    try {
        let listDoctorPending = await User.find({
            status: constants.STATUS_DOCTOR_PENDING
        }).select('id');
        let finalListInforDoctor = [];
        for(let objUserPending of listDoctorPending){
            console.log(objUserPending._id);
            let objDoctor = await Doctor.find({doctorId:objUserPending.id})
                .populate({
                path:'doctorId'
            });
            finalListInforDoctor.push(objDoctor);
        }
        return ReS(res, {
            status: true,
            message: 'List doctor pending'
        ,finalListInforDoctor:finalListInforDoctor}, 503);
    }
    catch (e) {
        console.log(e)
    }
};

module.exports.getListDoctorPending = getListDoctorPending;

// update status, set system rate
const confirmInforDoctor = async function (req, res) {
    try {
        let data = req.body;
        if(data){
            let objUser = await User.findById({_id:data.id});
            objUser.set({status:data.status});
            let objUserReturn = await objUser.save();
            if(objUserReturn){
                let objDoctor = await Doctor.findOne({doctorId:data.id});
                objDoctor.set({systemRating:data.systemRating,currentRating:data.systemRating});
                let objDoctorReturn = await objDoctor.save();
                if(objDoctorReturn){
                    return ReS(res, {
                        status: true,
                        message: 'Update infor user thành công.'
                    }, 200);
                }
                else {
                    return ReS(res, {
                        status: false,
                        message: 'Update infor user không thành công.'
                    }, 503);
                }
            }
            else {
                return ReS(res, {
                    status: false,
                    message: 'Update infor user không thành công.'
                }, 503);
            }
        }
        else {
            return ReS(res, {
                status: false,
                message: 'Update infor user không thành công.'
            }, 503);
        }
    }
    catch (e) {

    }
};
module.exports.confirmInforDoctor = confirmInforDoctor;

// get detail doctor
const getDetailDoctor = async function (req, res) {
    try {
        if (!req.params.doctorId) {
            return ReE(res, 'Bad request', 400);
        }
        else {
            let detailDoctor = await Doctor.findOne({doctorId: req.params.doctorId});
            if (detailDoctor) {
                return ReS(res, {message: 'Lấy thông tin bác sỹ thành công', detailDoctor: detailDoctor}, 200);
            }
            else {
                return ReE(res, 'Not found doctor', 503)
            }
        }
    }
    catch (e) {
        console.log(e)
        return ReE(res, 'Not found doctor', 503)
    }
}
module.exports.getDetailDoctor = getDetailDoctor

// admin get all doctor to view
const getDoctor = async function (req, res) {
    // get all doctor nếu không có param truyền lên
    // get all doctor nếu có param truyền lên ( chỉ dùng để get all doctor chưa bị xóa logic)
    let query = {}
    if (req.query.deletionFlag) query.deletionFlag = req.query.deletionFlag
    try {
        Doctor.find(query, function (err, getDoctor) {
            if (err) {
                if (err) return ReE(res, 'ERROR0009', 404)
                next()
            }
            res.json(getDoctor)
        })
    } catch (e) {
        return ReE(res, 'ERROR0009', 404)
    }

}
module.exports.getDoctor = getDoctor


// user get doctor to view
const getInformationDoctorById = async function (req, res) {
    if (!req.params.doctorId) {
        return ReE(res, 'ERROR0010', 400)
    }
    try {
        let query = { doctorId: req.params.doctorId }
        Doctor.find(
                query,
        )
        .populate(
                {
                    path: 'doctorId',
                    select: '-password',
                },
        )
        .exec(function (err, informationDoctor) {
            if (err) return ReE(res, 'ERROR0034', 404)
            return ReS(res, {
                message: 'Lấy thông tin bác sỹ thành công',
                informationDoctor: informationDoctor,
            }, 200)
        })
    }
    catch (e) {
        return ReE(res, 'ERROR0034', 404)
    }
}

module.exports.getInformationDoctorById = getInformationDoctorById


const update = async function (req, res) {
    let data
    let objUpdateDoctor
    let objUpdateUser
    data = req.body
    if (!data) return ReE(res, 'ERROR0010', 400)
    try {
        // update to doctor
        let doctorUpdate = await Doctor.findOne({ doctorId: data.doctorId })
        await doctorUpdate.set(data)
        objUpdateDoctor = await doctorUpdate.save()

        /// update to user
        let userUpdate = await User.findById({ _id: data.doctorId })
        await userUpdate.set(data)
        objUpdateUser = await userUpdate.save()

        if (objUpdateUser && objUpdateDoctor) {
            let objReturn = {
                // firstName: objUpdateUser.firstName,
                // middleName: objUpdateUser.middleName,
                // lastName: objUpdateUser.lastName,
                _id: objUpdateUser.id,
                birthday: objUpdateUser.birthday,
                address: objUpdateUser.address,
                avatar: objUpdateUser.avatar,
                gender: objUpdateUser.gender,
                // certificates: objUpdateDoctor.certificates,
                // idSpecialist: objUpdateDoctor.idSpecialist,
                // universityGraduate: objUpdateDoctor.universityGraduate,
                // yearGraduate: objUpdateDoctor.yearGraduate,
                placeWorking: objUpdateDoctor.placeWorking
            };
            return ReS(res, {message: 'Update thông tin bác sỹ thành công', informationDoctor: objReturn}, 200);
        } else {
            return ReE(res, "ERROR0035", 503);
        }
    } catch (e) {
        console.log(e)
        return ReE(res, 'ERROR0035', 503)
    }
}
module.exports.update = update

const remove = async function (req, res) {
    const body = req.body
    if (!body) return ReE(res, 'ERROR0010', 400)
    try {
        Doctor.findByIdAndRemove(body.id, function (err, doctor) {
            if (err) return ReE(res, 'ERROR0036', 503)
            return ReS(res, { message: 'Delete success' }, 200)
        })
    } catch (e) {
        return ReE(res, 'ERROR0036', 503)
    }
}

module.exports.remove = remove

const getListSpecialistDoctor = async function (req, res) {
    const specialistId = req.query['specialistId']
    const patientId = req.query['patientId']
    if (!specialistId || !patientId) {
        ReE(res, 'Vui long nhập specialist Id và patient Id')
    }
    try {
        let patient = await Patient.find({
            patientId: patientId,
        })
        if (patient.length === 0) {
            ReE(res, 'Bệnh nhân không tồn tại')
        }

        const favoriteDoctors = patient[0].favoriteDoctors
        let doctors = await Doctor.find({
            idSpecialist: {
                $elemMatch: {
                    specialistId: specialistId,
                },
            },
        })
        .select('currentRating -_id')
        .sort([['currentRating', 'descending']])
        .populate({
            path: 'doctorId',
            select: 'firstName middleName lastName avatar',
        })
        let results = []
        for (let doctor of doctors) {
            const temp = favoriteDoctors.filter(obj => obj === (doctor.doctorId._id + ''))
            var itemInfoDoctor = {
                doctorId: doctor.doctorId._id,
                firstName: doctor.doctorId.firstName,
                middleName: doctor.doctorId.middleName,
                lastName: doctor.doctorId.lastName,
                avatar: doctor.doctorId.avatar,
                currentRating: doctor.currentRating,
            }
            if (temp && temp.length > 0) {
                itemInfoDoctor.isFavorited = true
            } else {
                itemInfoDoctor.isFavorited = false
            }

            results.push(itemInfoDoctor)
        }
        results.sort(function (a, b) {
            let aSize = a.isFavorited
            let bSize = b.isFavorited
            let aLow = a.currentRating
            let bLow = b.currentRating

            if (aSize === bSize) {
                return (aLow > bLow) ? -1 : (aLow > bLow) ? 1 : 0
            }
            else {
                return (aSize > bSize) ? -1 : 1
            }
        })
        return ReS(res, { message: 'success', doctorList: results }, 200)
    } catch (e) {
        console.log(e)
        ReE(res, 'Không thể lấy được data')
    }
}

module.exports.getListSpecialistDoctor = getListSpecialistDoctor

const getDoctorRankingBySpecialist = async function (req, res) {
    if (!req.params.specialistId) {
        return ReE(res, 'Bad request', 400)
    }
    else {
        let pageSize = 0
        let page = 0
        if (req.query.pageSize) {
            pageSize = req.query.pageSize * 1
        }
        if (req.query.page) {
            page = req.query.page * 1
        }
        let listDoctorRanking = await Doctor.find({
            'idSpecialist': {
                '$elemMatch': {
                    'specialistId': req.params.specialistId,
                },
            },
        })
        .select('doctorId currentRating -_id')
        .sort([['currentRating', -1]])
        .limit(pageSize)
        .skip(pageSize * page)
        .populate({
            path: 'doctorId',
            select: 'firstName middleName lastName avatar',
        })
        if (!listDoctorRanking) {
            return ReE(res, 'Not found list', 404)
        }
        else {
            return ReS(res, {
                message: 'Tạo danh sách xếp hạng bác sỹ theo chuyên khoa thành công',
                listDoctorRanking: listDoctorRanking,
            }, 200)
        }
    }
}

module.exports.getDoctorRankingBySpecialist = getDoctorRankingBySpecialist

const getDoctorsBySpecialist = async function (req, res) {
    const specialistId = req.query['specialistId']
    const patientId = req.query['patientId']
    if (!specialistId || !patientId) {
        ReE(res, 'ERROR0045')
    }
    try {
        let patient = await Patient.find({
            patientId: patientId,
        })
        if (patient.length === 0) {
            ReE(res, 'ERROR0046')
        }

        const favoriteDoctors = patient[0].favoriteDoctors

        let doctors = await Doctor.find({
            idSpecialist: {
                $elemMatch: {
                    specialistId: specialistId,
                },
            },
        })
        .select('currentRating -_id')
        .populate({
            path: 'doctorId',
            select: 'firstName middleName lastName avatar',
        })
        let results = []
        for (let doctor of doctors) {
            const temp = favoriteDoctors.filter(obj => obj === (doctor.doctorId._id + ''))
            var itemInfoDoctor = {
                id: doctor.doctorId._id,
                firstName: doctor.doctorId.firstName,
                middleName: doctor.doctorId.middleName,
                lastName: doctor.doctorId.lastName,
                avatar: doctor.doctorId.avatar,
                currentRating: doctor.currentRating,
            }
            if (temp && temp.length > 0) {
                itemInfoDoctor.isFavorited = true
            } else {
                itemInfoDoctor.isFavorited = false
            }
            results.push(itemInfoDoctor)
        }
        return ReS(res, {
            message: 'success',
            doctorList: results,
        }, 200)
    } catch (e) {
        ReE(res, 'ERROR0047')
    }
}

module.exports.getDoctorsBySpecialist = getDoctorsBySpecialist
