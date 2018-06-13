const Rating = require('../models').Rating;

const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if(!body.patient_id){
        return ReE(res, '');
    }
    else if(!body.doctor_id){
        return ReE(res, '');
    }
    else if(!body.rating){
        return ReE(res, '');
    }
    else {
        var rating = new Rating({
            patient_id: body.patient_id,
            doctor_id: body.doctor_id,
            rating: body.rating,
            time: body.time,
        })
        await  rating.save()
        res.json(rating)
        return ReS(res, {message: 'Đánh giá bác sỹ thành công'}, 204);
    }
}

module.exports.create = create;


const update = async function (req, res) {
    const body = req.body;
    Rating.findByIdAndUpdate(body.id, { $set: { rating: body.rating }}, { new: true }, function (err, rating) {
        // ToDO: tính toán và trả lại current_rating cho bác sỹ
        if (err) return handleError(err);
        res.send(rating);
    });
};


module.exports.update = update;



