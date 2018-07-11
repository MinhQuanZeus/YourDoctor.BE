const Doctor = require('../models').Doctor;
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
    }catch (e) {
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
                return ReS(res, {message: 'Lấy thông tin bác sỹ thành công', informationDoctor: informationDoctor}, 200);
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
                if (err)return ReE(res, "ERROR0035", 503);
                return ReS(res, {message: 'Update thông tin bác sỹ thành công', updatedDoctor: updatedDoctor}, 200);
            });
        });
    }catch (e) {
        return ReE(res, "ERROR0035", 503);
    }
}
module.exports.update = update;

const remove = async function (req, res) {
    const body = req.body;
    if(!body) return ReE(res, "ERROR0010", 400);
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
    let query = {}
    if (req.query.perPage) {
        query.perPage = req.query.perPage
    }
    else {
        query.perPage = 2
    }
    if (req.query.page) {
        query.page = req.query.page
    }
    else {
        query.page = 0
    }

    console.log(req.query.page);
    console.log(req.query.perPage);
    try {
        // convert to number
        var perPage = parseInt(req.query.perPage);
        var page = parseInt(req.query.page);
    }
    catch (e) {
        return ReE(res, "ERROR0037", 503);
    }
    try {
        Doctor.find({
            'idSpecialist': {
                '$elemMatch': {
                    'specialistId': req.params.specialistId
                }
            },
            'currentRating': {
                $gte: 3
            }
        })
            .select('currentRating -_id')
            .sort([['currentRating', 'descending']])
            .limit(1 * perPage)
            .skip(1 * perPage * page)
            .populate({
                path: 'doctorId',
                select: 'firstName middleName lastName'
            })
            .exec(function (err, listDoctor) {
                if (err) return ReE(res, "ERROR0037", 503);
                return ReS(res, {message: 'Tạo danh sách bác sỹ thành công', listDoctor: listDoctor}, 200);
            });
    }catch (e) {
        return ReE(res, "ERROR0037", 503);
    }

}

module.exports.getListSpecialistDoctor = getListSpecialistDoctor;


