const Rating = require('../models').Rating;
const Doctor = require('../models').Doctor;
const constants = require('./../constants');
const create = async function (req, res) {
    const body = req.body;
    if (!body) {
        return ReE(res, 'Tạo đánh giá thất bại', 400);
    }
    else {
        let duplicateRating = await Rating.findOne({patientId: body.patientId, doctorId: body.doctorId});
        if (duplicateRating) {
            await duplicateRating.set(body);
            await duplicateRating.save();
            await updateCurrentRating(body.doctorId, res)
        }
        else {
            let rating = new Rating({
                patientId: body.patientId,
                doctorId: body.doctorId,
                rating: body.rating,
                comment: body.comment
            });
            await rating.save();
            await updateCurrentRating(body.doctorId, res)
            //return ReS(res, {message: 'Đánh giá bác sỹ thành công', rating: rating}, 200);
        }
    }
};

module.exports.create = create;

async function updateCurrentRating(doctorId, res) {
    let averagePatientRate = 0;
    let finalRate = 0;
    // update to doctor table
    let updateToDoctor = await Doctor.findOne({doctorId: doctorId});
    if (!updateToDoctor) {
        ReS(res, 'Update Failed', 503)
    }
    await Rating.aggregate([
        {
            $match: {doctorId: {$eq: doctorId}}
        },
        {
            $group: {
                _id: '$doctorId',  //$doctorId is the column name in collection
                totalRating: {
                    $sum: "$rating"
                },
                count: {$sum: 1}
            }
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } else {
            console.log(result[0].totalRating)
            if (result.length > 0) {
                averagePatientRate = ((result[0].totalRating + updateToDoctor.systemRating) / (result[0].count + 1));
                let count = result[0].count + 1;
                finalRate = (averagePatientRate / 2) + 2.5 * Math.pow(2.718, (-count / constants.Q_MODEL_RATE)).toFixed(2);
            }
        }
    });
    await updateToDoctor.set({currentRating: finalRate});
    await updateToDoctor.save(function (err, newRating) {
        if (err) ReS(res, 'Update Failed', 503);
        return ReS(res, {message: 'Update rating bác sỹ thành công', newRating: newRating.currentRating}, 200);
    });
}

const getCommentAndRating = async function (req, res) {
    let pageSize = 0;
    let page = 0;
    if (req.query.pageSize) {
        pageSize = req.query.pageSize * 1
    }
    if (req.query.page) {
        page = req.query.page * 1
    }
    try {
        let listComment = await Rating.find({
            doctorId: req.params.doctorId
        })
            .select('patientId rating comment createdAt -_id')
            .sort([['createdAt', -1]])
            .limit(pageSize)
            .skip(pageSize * page)
            .populate({
                path: 'patientId',
                select: 'firstName middleName lastName avatar'
            });
        if (!listComment) {
            return ReS(res, {message: 'Not found list comment'}, 404);
        }
        else {
            return ReS(res, {message: 'Get list comment success', listComment: listComment}, 404);
        }
    } catch (e) {
        return ReS(res, {message: 'Not found list comment'}, 503);
    }
};

module.exports.getCommentAndRating = getCommentAndRating;

const countPatientRatingForDoctor = async function (req, res) {
    try {
        Rating.find({
            doctorId: req.params.doctorId
        }).count(function (err, count) {
            if (err) {
                return ReS(res, {message: 'Error count'}, 503);
            }
            else {
                return ReS(res, {message: 'Count success', numberOfRecordRate: count}, 200);
            }
        })
    }
    catch (e) {
        console.log(e)
        return ReS(res, {message: 'Error count'}, 503);
    }
};

module.exports.countPatientRatingForDoctor = countPatientRatingForDoctor;

