const Patient = require('../models').Patient;
const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if(!body.patientId){
        return ReE(res, 'ERROR0017',400);
    }
    let duplicatePatient = await Patient.findOne({patientId:body.patientId});
           if(duplicatePatient) {
               return ReE(res, 'ERROR0018',409);
    }
    var patient = new Patient({
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
    Patient.find(query, function (err, getPatient) {
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
    Patient.find(
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
    Patient.findOne({patientId:data.patientId}, function (err, patientUpdate) {
        if(!patientUpdate) return ReE(res, "ERROR0016", 404);
        if (err) return ReE(res, "ERROR0029", 404);
        patientUpdate.set(data);

        patientUpdate.save(function (err, updatedPatients) {
            if (err) return ReE(res, "ERROR0029", 404);
            res.send(updatedPatients);
        });
    });
}
module.exports.update = update;

const remove = async function (req, res) {
    const body = req.body;
    Patient.findByIdAndRemove(body.id, function (err, patient) {
        if (err) return ReE(res, "ERROR0030", 404);
        return ReS(res, {message: 'Delete success'}, 204);
    });
};

module.exports.remove = remove;

const getListFavoriteDoctor = async function (req, res) {
    if(!req.params.patientId) return ReE(res, "ERROR0031", 404);
        Patient.findOne(
        {patientId:req.params.patientId}
        )
        .select('patientId -_id')
        .populate({
            path:'favoriteDoctors',
            select:'firstName middleName lastName avatar'
        })
        .exec(function (err, listFavoriteDoctor) {
            if (err) return ReE(res, "ERROR0031", 404);
            return ReS(res, {message: 'Tạo danh sách bác sỹ được yêu thích thành công', listFavoriteDoctor: listFavoriteDoctor}, 200);
        });

}
module.exports.getListFavoriteDoctor = getListFavoriteDoctor;

const addFavoriteDoctor = async function (req, res) {
    let data = req.body
    console.log(data)
    try {
        let objPatient = await Patient.findOne({patientId:data.patientId})
        if(!objPatient) return ReE(res, "ERROR0032", 404);
        console.log(objPatient)
        objPatient.favoriteDoctors.push(data.doctorId)
        await objPatient.save(function (err,objPatientUpdate) {
            if(err) return ReE(res, "ERROR0032", 400);
            return ReS(res, {message: 'Update bác sỹ yêu thích thành công', objPatientUpdate: objPatientUpdate.favoriteDoctors}, 200);
        })
    }catch (e) {
        console.log(e)
    }
}
module.exports.addFavoriteDoctor = addFavoriteDoctor

const removeFavoriteDoctor = async function (req, res) {
    let data = req.body
    console.log(data)
    try {
        let objPatient = await Patient.findOne({patientId:data.patientId})
        if(!objPatient) return ReE(res, "ERROR0033", 404);
        console.log(objPatient)
        objPatient.favoriteDoctors.pull(data.doctorId)
        await objPatient.save(function (err, objPatientUpdate) {
            if(err) return ReE(res, "ERROR0033", 400);
            return ReS(res, {message: 'Xóa bác sỹ yêu thích thành công',objPatientUpdate: objPatientUpdate.favoriteDoctors}, 200);
        })
    }catch (e) {
        console.log(e)
    }
}
module.exports.removeFavoriteDoctor = removeFavoriteDoctor