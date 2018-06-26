const Rating = require('../models').Rating;

const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if(!body.patientId){
        return ReE(res, '');
    }
    else if(!body.doctorId){
        return ReE(res, '');
    }
    else if(!body.rating){
        return ReE(res, '');
    }
    else {
        var rating = new Rating({
            patientId: body.patientId,
            doctorId: body.doctorId,
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
    Rating.findByIdAndUpdate({patientId:data.patientId,doctorId:data.doctorId}, function (err, updateRating) {
        if (err) TE(err.message);
        if(!updateRating) return ReS(res, 'ERROR0013', 404);
        updateRating.set(data)
        updateRating.save(function (err, updateRating) {
            if (err) TE(err.message);
            // TODO
            console.log(updateRating);
        });
    });
};


module.exports.update = update;



