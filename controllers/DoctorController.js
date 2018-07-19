const Doctor = require('../models').Doctor;
const Patient = require('../models').Patient;
const mongoose = require('mongoose');
const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if (!body.doctorId) {
        return ReE(res, 'ERROR0008', 400);
    }
    try {
        let dupplicateDoctor = await Doctor.findOne({doctorId: body.doctorId});

        if (dupplicateDoctor) return ReE(res, 'ERROR0008', 409);

        var doctor = new Doctor({
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
}

module.exports.create = create;


// admin get all doctor to view
const getDoctor = async function (req, res) {
    // get all doctor nếu không có param truyền lên
    // get all doctor nếu có param truyền lên ( chỉ dùng để get all doctor chưa bị xóa logic)
    let query = {}
    if (req.query.deletionFlag) query.deletionFlag = req.query.deletionFlag
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
        var query = {doctorId: req.params.doctorId}
        console.log(query)
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
}

module.exports.getInformationDoctorById = getInformationDoctorById;


const update = async function (req, res) {
    let data;
    data = req.body;
    if (!data) return ReE(res, "ERROR0010", 400);
    console.log(data);
    try {
        Doctor.findOne({doctorId: data.doctorId}, function (err, doctorUpdate) {
            if (err) return ReE(res, "ERROR0035", 503);
            if (!doctorUpdate) return ReE(res, "ERROR0009", 404);
            doctorUpdate.set(data);
            doctorUpdate.save(function (err, updatedDoctor) {
                if (err) return ReE(res, "ERROR0035", 503);
                return ReS(res, {message: 'Update thông tin bác sỹ thành công', updatedDoctor: updatedDoctor}, 200);
            });
        });
    } catch (e) {
        return ReE(res, "ERROR0035", 503);
    }
}
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
    // query - get params
    let arrayDoctor = [typeof String]
    try {
        //get list favorite doctor
        let objPatient = await Patient.findOne({patientId: req.query.patientId});
        if (objPatient) {
            for (var i = 0; i < objPatient.favoriteDoctors.length; i++) {
                let objDoctor = await Doctor.findOne({doctorId: objPatient.favoriteDoctors[i]})
                for (var j = 0; j < objDoctor.idSpecialist.length; j++) {
                    if (objDoctor.idSpecialist[j].specialistId === req.params.specialistId) {
                        arrayDoctor.push(objDoctor.doctorId)
                    }
                }
            }
        }

        var listDoctor = await Doctor.find({
            'idSpecialist': {
                '$elemMatch': {
                    'specialistId': req.params.specialistId
                }
            },
            'currentRating': {
                $gte: 3
            }
        })
        for (var i = 0; i < listDoctor.length; i++) {
            arrayDoctor.push(listDoctor[i].doctorId)
        }
        // delete duplicate id
        var index = {};
        for (var i = arrayDoctor.length - 1; i >= 0; i--) {
            if (arrayDoctor[i] in index) {
                // remove this item
                arrayDoctor.splice(i, 1);
            } else {
                // add this value to index
                index[arrayDoctor[i]] = true;
            }
        }
        //return ReS(res, {message: 'Tạo danh sách bác sỹ thành công', listDoctor: arrayDoctor}, 200);


        // let itemDoctorSchema = new mongoose.Schema({
        //     doctorId: {type: String},
        //     firstName: {type: String},
        //     middleName: {type: String},
        //     lastName: {type: String},
        //     currentRating: {type: String}
        // })
        var listDoctor = []
        // loop
        for (var i = 0; i <= arrayDoctor.length; i++) {

            let itemDoctor = await Doctor.findOne({
                'idSpecialist': {
                    '$elemMatch': {
                        'specialistId': req.params.specialistId
                    }
                },
                'currentRating': {
                    $gte: 3
                },
                'doctorId': arrayDoctor[i]
            })
                .select('currentRating -_id')
                .sort([['currentRating', 'descending']])
                .populate({
                    path: 'doctorId',
                    select: 'firstName middleName lastName avatar'
                })
            console.log(itemDoctor)
            if (itemDoctor) {
                var itemInfoDoctor = {
                    doctorId: itemDoctor.doctorId._id,
                    firstName: itemDoctor.doctorId.firstName,
                    middleName: itemDoctor.doctorId.middleName,
                    lastName: itemDoctor.doctorId.lastName,
                    avatar:itemDoctor.doctorId.avatar,
                    currentRating: itemDoctor.currentRating
                };
                listDoctor.push(itemInfoDoctor)
            }
        }
        return ReS(res, {message: 'Tạo danh sách bác sỹ theo chuyên khoa thành công', listDoctor: listDoctor}, 200);
    } catch (e) {
        console.log(e)
        return ReE(res, "ERROR0037", 503);
    }
}

module.exports.getListSpecialistDoctor = getListSpecialistDoctor;

