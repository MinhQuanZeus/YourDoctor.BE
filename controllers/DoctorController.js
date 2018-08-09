const Doctor = require('../models').Doctor;
const Patient = require('../models').Patient;
const User = require('../models').User;
const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if (!body.doctorId) {
        return ReE(res, 'ERROR0008', 400);
    }
    try {
        let duplicateDoctor = await Doctor.findOne({doctorId: body.doctorId});

        if (duplicateDoctor) return ReE(res, 'ERROR0008', 409);

        let doctor = new Doctor({
            doctorId: body.doctorId,
            currentRating: body.currentRating,
            certificates: body.certificates,
            idSpecialist: body.idSpecialist,
            universityGraduate: body.universityGraduate,
            yearGraduate: body.yearGraduate,
            placeWorking: body.placeWorking,
            deletionFlag: body.deletionFlag
        });
        await  doctor.save();
        return ReS(res, {message: 'Tạo thông tin bác sỹ thành công', doctor: doctor}, 200);
    }
    catch (e) {
        return ReE(res, 'ERROR0008', 503);
    }
};

module.exports.create = create;

// get detail doctor
const getDetailDoctor = async function (req, res) {
    try {
        if(!req.params.doctorId){
            return ReE(res, 'Bad request', 400);
        }
        else {
            let detailDoctor = await Doctor.findOne({doctorId:req.params.doctorId});
            if(detailDoctor){
                return ReS(res, {message: 'Lấy thông tin bác sỹ thành công', detailDoctor: detailDoctor}, 200);
            }
            else {
                return ReE(res, 'Not found doctor', 503);
            }
        }
    }
    catch (e) {
        console.log(e)
        return ReE(res, 'Not found doctor', 503);
    }
};
module.exports.getDetailDoctor = getDetailDoctor;

// admin get all doctor to view
const getDoctor = async function (req, res) {
    // get all doctor nếu không có param truyền lên
    // get all doctor nếu có param truyền lên ( chỉ dùng để get all doctor chưa bị xóa logic)
    let query = {};
    if (req.query.deletionFlag) query.deletionFlag = req.query.deletionFlag;
    console.log(query);
    try {
        Doctor.find(query, function (err, getDoctor) {
            if (err) {
                if (err) return ReE(res, "ERROR0009", 404);
                next();
            }
            console.log(getDoctor);
            res.json(getDoctor);
        });
    } catch (e) {
        return ReE(res, "ERROR0009", 404);
    }

};
module.exports.getDoctor = getDoctor;


// user get doctor to view
const getInformationDoctorById = async function (req, res) {
    if (!req.params.doctorId) {
        return ReE(res, "ERROR0010", 400);
    }
    try {
        let query = {doctorId: req.params.doctorId};
        Doctor.find(
            query
        )
            .populate(
                {
                    path: 'doctorId',
                    select: '-password'
                }
            )
            .exec(function (err, informationDoctor) {
                if (err) return ReE(res, "ERROR0034", 404);
                return ReS(res, {
                    message: 'Lấy thông tin bác sỹ thành công',
                    informationDoctor: informationDoctor
                }, 200);
            });
    }
    catch (e) {
        return ReE(res, "ERROR0034", 404);
    }
};

module.exports.getInformationDoctorById = getInformationDoctorById;


const update = async function (req, res) {
    let data;
    let objUpdateDoctor;
    let objUpdateUser;
    data = req.body;
    if (!data) return ReE(res, "ERROR0010", 400);
    try {
        // update to doctor
        let doctorUpdate = await Doctor.findOne({doctorId: data.doctorId});
        await doctorUpdate.set(data);
        objUpdateDoctor = await doctorUpdate.save();

        /// update to user
        let userUpdate = await User.findById({_id: data.doctorId});
        await userUpdate.set(data);
        objUpdateUser = await userUpdate.save();

        if (objUpdateUser && objUpdateDoctor) {
            let objReturn = {
                firstName: objUpdateUser.firstName,
                middleName: objUpdateUser.middleName,
                lastName: objUpdateUser.lastName,
                birthday: objUpdateUser.birthday,
                address: objUpdateUser.address,
                avatar: objUpdateUser.avatar,
                gender: objUpdateUser.gender,
                certificates: objUpdateDoctor.certificates,
                idSpecialist: objUpdateDoctor.idSpecialist,
                universityGraduate: objUpdateDoctor.universityGraduate,
                yearGraduate: objUpdateDoctor.yearGraduate,
                placeWorking: objUpdateDoctor.placeWorking
            };
            return ReS(res, {message: 'Update thông tin bác sỹ thành công', informationDoctor: objReturn}, 200);
        }else {
            return ReE(res, "ERROR0035", 503);
        }
    } catch (e) {
        console.log(e)
        return ReE(res, "ERROR0035", 503);
    }
};
module.exports.update = update;

const remove = async function (req, res) {
    const body = req.body;
    if (!body) return ReE(res, "ERROR0010", 400);
    try {
        Doctor.findByIdAndRemove(body.id, function (err, doctor) {
            if (err) return ReE(res, "ERROR0036", 503);
            return ReS(res, {message: 'Delete success'}, 200);
        });
    } catch (e) {
        return ReE(res, "ERROR0036", 503);
    }
};

module.exports.remove = remove;

const getListSpecialistDoctor = async function (req, res) {
    const specialistId = req.query["specialistId"];
    const patientId = req.query["patientId"];
    if (!specialistId || !patientId) {
        ReE(res, "Vui long nhập specialist Id và patient Id");
    }
    try {
        let patient = await Patient.find({
            patientId: patientId
        });
        if (patient.length === 0) {
            ReE(res, "Bệnh nhân không tồn tại");
        }

        const favoriteDoctors = patient[0].favoriteDoctors;
        console.log(favoriteDoctors)

        let doctors = await Doctor.find({
            idSpecialist: {
                $elemMatch: {
                    specialistId: specialistId
                }
            }
        })
            .select("currentRating -_id")
            .sort([["currentRating", "descending"]])
            .populate({
                path: "doctorId",
                select: "firstName middleName lastName avatar"
            });
        let results = [];
        for (let doctor of doctors) {
            const temp = favoriteDoctors.filter(obj => obj === (doctor.doctorId._id + ''));
            console.log(temp)
            var itemInfoDoctor = {
                doctorId: doctor.doctorId._id,
                firstName: doctor.doctorId.firstName,
                middleName: doctor.doctorId.middleName,
                lastName: doctor.doctorId.lastName,
                avatar: doctor.doctorId.avatar,
                currentRating: doctor.currentRating
            };
            if (temp && temp.length > 0) {
                itemInfoDoctor.isFavorited = true;
            } else {
                itemInfoDoctor.isFavorited = false;
            }

            results.push(itemInfoDoctor);
        }
        results.sort(function (a, b) {
            let aSize = a.isFavorited;
            let bSize = b.isFavorited;
            let aLow = a.currentRating;
            let bLow = b.currentRating;
            console.log(aLow + " | " + bLow);

            if (aSize === bSize) {
                return (aLow > bLow) ? -1 : (aLow > bLow) ? 1 : 0;
            }
            else {
                return (aSize > bSize) ? -1 : 1;
            }
        });
        return ReS(res, {message: "success", doctorList: results}, 200);
    } catch (e) {
        console.log(e);
        ReE(res, "Không thể lấy được data");
    }
};

module.exports.getListSpecialistDoctor = getListSpecialistDoctor;

const getDoctorRankingBySpecialist = async function (req, res) {
    if (!req.params.specialistId) {
        return ReE(res, "Bad request", 400);
    }
    else {
        let pageSize = 0;
        let page = 0;
        if (req.query.pageSize) {
            pageSize = req.query.pageSize * 1;
        }
        if (req.query.page) {
            page = req.query.page * 1;
        }
        let listDoctorRanking = await Doctor.find({
            'idSpecialist': {
                '$elemMatch': {
                    'specialistId': req.params.specialistId
                }
            }
        })
            .select('doctorId currentRating -_id')
            .sort([['currentRating', -1]])
            .limit(pageSize)
            .skip(pageSize * page)
            .populate({
                path: 'doctorId',
                select: 'firstName middleName lastName avatar'
            });
        if (!listDoctorRanking) {
            return ReE(res, "Not found list", 404);
        }
        else {
            return ReS(res, {
                message: 'Tạo danh sách xếp hạng bác sỹ theo chuyên khoa thành công',
                listDoctorRanking: listDoctorRanking
            }, 200);
        }
    }
};

module.exports.getDoctorRankingBySpecialist = getDoctorRankingBySpecialist;
