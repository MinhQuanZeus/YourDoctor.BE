const Rating = require('../models').Rating;
const Doctor = require('../models').Doctor;
const constants = require('./../constants');
const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    console.log(body)
    if (!body.patientId) {
        return ReE(res, 'Tạo đánh giá thất bại', 400);
    }
    else if (!body.doctorId) {
        return ReE(res, 'Tạo đánh giá thất bại', 400);
    }
    else if (!body.rating) {
        return ReE(res, 'Tạo đánh giá thất bại', 400);
    }
    let duplicateRating = await Rating.findOne({patientId: body.patientId, doctorId: body.doctorId})
    console.log(duplicateRating)
    if (duplicateRating) {
        return ReE(res, 'Tạo đánh giá thất bại', 400);
    }
    var rating = new Rating({
        patientId: body.patientId,
        doctorId: body.doctorId,
        rating: body.rating,
        comment: body.comment
    })
    await  rating.save();
    return ReS(res, {message: 'Đánh giá bác sỹ thành công', rating: rating}, 200);

}

module.exports.create = create;


const update = async function (req, res) {
    let data = req.body;
    console.log(data)
    if (!data) return ReS(res, 'ERROR0010', 400);
    let updateRating = await  Rating.findOne({patientId: data.patientId, doctorId: data.doctorId})
    if (!updateRating) return ReS(res, 'ERROR0013', 404);
    updateRating.set(data)
    updateRating.save(function (err, updateRating) {
        console.log(updateRating);
        if (err) TE(err.message);
    });
    await updateCurrentRating(data.doctorId, res)
};

async function updateCurrentRating(doctorId, res) {
    var averagePatientRate =0;
    console.log(doctorId)
    Rating.aggregate([
        {
            $match:{doctorId:{$eq:doctorId}}
        },
        {
            $group: {
                _id: '$doctorId',  //$doctorId is the column name in collection
                totalRating : {
                    $sum : "$rating"
                },
                count: {$sum: 1}
            }
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } else {
            if(result.length>0){
                averagePatientRate = ((result[0].totalRating + constants.FIRST_RATTING)/(result[0].count+1)).toFixed(2)
                console.log(averagePatientRate)
            }
        }
    });
    // update to doctor table
    let updateToDoctor = await Doctor.findOne({doctorId:doctorId})
    console.log(updateToDoctor)
    if(!updateToDoctor){TE(e)}
    updateToDoctor.set({currentRating:averagePatientRate})
    updateToDoctor.save(function (err, newRating) {
        console.log(newRating)
        if(err) TE(err)
        return ReS(res, {message: 'Update rating bác sỹ thành công', newRating: newRating.currentRating}, 200);
    })
}

module.exports.update = update;



