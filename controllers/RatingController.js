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
            time: body.time
        })
        await  rating.save();
        return ReS(res, {message: 'Đánh giá bác sỹ thành công',rating:rating}, 204);
    }
}

module.exports.create = create;


const update = async function (req, res) {
    let data = req.body;
    if(!data) return ReS(res, 'ERROR0010', 400);
    Rating.findByIdAndUpdate({patient_id:data.patient_id,doctor_id:data.doctor_id}, function (err, update_rating) {
        if (err) TE(err.message);
        if(!update_rating) return ReS(res, 'ERROR0013', 404);
        update_rating.set(data)
        update_rating.save(function (err, update_rating) {
            if (err) TE(err.message);
            // TODO
            //return ReS(res, {message: 'Cập nhật đánh giá bác sỹ thành công', update_rating : update_rating}, 200);
        });
    });
};


module.exports.update = update;



