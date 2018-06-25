const Doctors = require('../models').Doctors;
const Patients = require('../models').Patients;
const Accounts = require('../models').Accounts;
const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if (!body.doctor_id) {
        return ReE(res, 'ERROR0008', 400);
    }
    else {
        Doctors.findOne({doctor_id: body.doctor_id}, function (err, dupplicateDoctor) {
            // handle
            if (dupplicateDoctor) {
                return ReE(res, 'ERROR0008', 409);
            }
        });
    }
    var doctor = new Doctors({
        doctor_id: body.doctor_id,
        current_rating: body.current_rating,
        certificates: body.certificates,
        id_specialist: body.id_specialist,
        university_graduate: body.university_graduate,
        year_graduate: body.year_graduate,
        place_working: body.place_working,
        create_time: body.create_time,
        update_time: body.update_time,
        deletion_flag: body.deletion_flag
    });
    await  doctor.save();
    return ReS(res, {message: 'Tạo thông tin bác sỹ thành công', doctor: doctor}, 200);
}

module.exports.create = create;


// admin get all doctor to view
const get_doctor = async function (req, res) {
    // get all doctor nếu không có param truyền lên
    // get all doctor nếu có param truyền lên ( chỉ dùng để get all doctor chưa bị xóa logic)
    let query = {}
    if (req.query.deletion_flag) query.deletion_flag = req.query.deletion_flag
    console.log(query);
    Doctors.find(query, function (err, get_doctor) {
        if (err) {
            if (err) return ReE(res, "ERROR0009", 404);
            next();
        }
        console.log(get_doctor);
        res.json(get_doctor);
    });
};
module.exports.get_doctor = get_doctor;


// user get doctor to view
const get_infor_doctor_by_id = async function (req, res) {
    if (!req.doctor_id) {
        return ReE(res, "ERROR0010", 400);
    }
    Doctors.findOne({doctor_id: req.params.doctor_id}, function (err, infor_doctor) {
        if (err) return ReE(res, "ERROR0009", 404);
        res.send(infor_doctor);
    });
}
module.exports.get_infor_doctor_by_id = get_infor_doctor_by_id;


const update = async function (req, res) {
    let data;
    data = req.body;
    if (!data) return ReE(res, "ERROR0010", 400);

    Doctors.findOne({doctor_id: data.doctor_id}, function (err, doctor_update) {
        if (err) TE(err.message);
        if (!doctor_update) return ReE(res, "ERROR0009", 404);
        doctor_update.set(data);

        doctor_update.save(function (err, updatedDoctor) {
            if (err) TE(err.message);
            res.send(updatedDoctor);
        });
    });
}
module.exports.update = update;

const remove = async function (req, res) {
    const body = req.body;
    Doctors.findByIdAndRemove(body.id, function (err, doctor) {
        if (err) TE(err.message);
        return ReS(res, {message: 'Delete success'}, 204);
    });
};

module.exports.remove = remove;

const get_list_specialist_doctor = async function (req, res) {
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

    // convert to number
    var perPage = parseInt(req.query.perPage);
    var page = parseInt(req.query.page);

    // TODO get list doctor
    Doctors.find({
        'id_specialist': {
            '$elemMatch': {
                'specialist_id': req.params.specialist_id
            }
        },
        'current_rating': {
            $gte: 3
        }
    })
        .select('current_rating -_id')
        .sort([['current_rating', 'descending']])
        .limit(1 * perPage)
        .skip(1 * perPage * page)
        .populate({
            path: 'doctor_id',
            select: 'first_name last_name'
        })
        .exec(function (err, list_id_doctor) {
            if (err) TE(err.message);
            return ReS(res, {message: 'Tạo danh sách bác sỹ thành công', list_id_doctor: list_id_doctor}, 200);
        });
}

module.exports.get_list_specialist_doctor = get_list_specialist_doctor;


