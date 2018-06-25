const Patients = require('../models').Patients;
const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if(!body.patient_id){
        return ReE(res, 'ERROR0017',400);
    }
    else {
        Patients.findOne({patient_id:body.patient_id},function (err, dupplcatePatient) {
           if(dupplcatePatient) {
               return ReE(res, 'ERROR0018',409);
           }
    });
    }
    var patient = new Patients({
        patient_id:body.patient_id,
        favorite_doctors: body.favorite_doctors,
        create_time:body.create_time,
        update_time:body.update_time,
        deletion_flag:body.deletion_flag
    });

    await  patient.save();
    return ReS(res, {message: 'Tạo thông tin bác sỹ thành công', patient : patient}, 200);
}

module.exports.create = create;

// admin get all patients to view
const get_patients = async function (req, res) {
    // get all patients nếu không có param truyền lên
    // get all patients nếu có param truyền lên ( chỉ dùng để get all patients chưa bị xóa logic)
    let query = {}
    if ( req.query.deletion_flag) query.deletion_flag = req.query.deletion_flag
    console.log(query);
    Patients.find(query, function (err, get_patient) {
        if(err){
            if (err) return ReE(res, "ERROR0016", 404);
            next();
        }
        return ReS(res, {message: 'Tải danh sách bệnh nhân thành công', get_patient : get_patient}, 200);
    });
};
module.exports.get_patients = get_patients;


// get patient to view
const get_infor_patient_by_id = async function(req, res){
    if(!req.patient_id){
        return ReE(res, "ERROR0010", 400);
    }
    Patients.findOne({patient_id:req.params.patient_id},function (err, infor_patient){
        if (err) ReE(res, "ERROR0016", 404);
        return ReS(res, {message: 'Tải thông tin bệnh nhân thành công', infor_patient : infor_patient}, 200);
    });
}
module.exports.get_infor_patient_by_id = get_infor_patient_by_id;


const update = async function (req, res) {
    let data;
    data = req.body;
    if(!data) return ReE(res, "ERROR0010", 400);
    Patients.findOne({patient_id:data.patient_id}, function (err, patient_update) {
        if(!patient_update) return ReE(res, "ERROR0016", 404);
        if (err) return handleError(err);
        patient_update.set(data);

        patient_update.save(function (err, updatedPatients) {
            if (err) return handleError(err);
            res.send(updatedPatients);
        });
    });
}
module.exports.update = update;

const remove = async function (req, res) {
    const body = req.body;
    Patients.findByIdAndRemove(body.id, function (err, patient) {
        if (err) return handleError(err);
        return ReS(res, {message: 'Delete success'}, 204);
    });
};

module.exports.remove = remove;
