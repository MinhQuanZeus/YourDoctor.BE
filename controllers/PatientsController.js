const Patients = require('../models').Patients;
const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if(!body.patientId){
        return ReE(res, 'ERROR0017',400);
    }
    let duplicatePatient = await Patients.findOne({patientId:body.patientId});
           if(duplicatePatient) {
               return ReE(res, 'ERROR0018',409);
    }
    var patient = new Patients({
        patientId:body.patientId,
        favoriteDoctors: body.favoriteDoctors,
        deletionFlag:body.deletionFlag
    });
    await  patient.save();
    return ReS(res, {message: 'Tạo thông tin bác sỹ thành công', patient : patient}, 200);
}

module.exports.create = create;

// admin get all patients to view
const getPatients = async function (req, res) {
    // get all patients nếu không có param truyền lên
    // get all patients nếu có param truyền lên ( chỉ dùng để get all patients chưa bị xóa logic)
    let query = {}
    if ( req.query.deletionFlag) query.deletionFlag = req.query.deletionFlag
    console.log(query);
    Patients.find(query, function (err, getPatient) {
        if(err){
            if (err) return ReE(res, "ERROR0016", 404);
            next();
        }
        return ReS(res, {message: 'Tải danh sách bệnh nhân thành công', getPatient : getPatient}, 200);
    });
};
module.exports.getPatients = getPatients;


// get patient to view
const getInformationPatientById = async function(req, res){
    if(!req.params.patientId){
        return ReE(res, "ERROR0010", 400);
    }
    var query = {patientId:req.params.patientId}
    console.log(query)
    Patients.find(
        query
    )
        .populate(
            {
                path: 'patientId',
                select: '-password'
            }
        )
        .exec(function (err, informationPatient) {
            if (err) TE(err.message);
            return ReS(res, {message: 'Lấy thông tin bệnh nhân thành công', informationPatient: informationPatient}, 200);
        });
}
module.exports.getInformationPatientById = getInformationPatientById;


const update = async function (req, res) {
    let data;
    data = req.body;
    if(!data) return ReE(res, "ERROR0010", 400);
    Patients.findOne({patientId:data.patientId}, function (err, patientUpdate) {
        if(!patientUpdate) return ReE(res, "ERROR0016", 404);
        if (err) TE(err.message);
        patientUpdate.set(data);

        patientUpdate.save(function (err, updatedPatients) {
            if (err) TE(err.message);
            res.send(updatedPatients);
        });
    });
}
module.exports.update = update;

const remove = async function (req, res) {
    const body = req.body;
    Patients.findByIdAndRemove(body.id, function (err, patient) {
        if (err) TE(err.message);
        return ReS(res, {message: 'Delete success'}, 204);
    });
};

module.exports.remove = remove;
