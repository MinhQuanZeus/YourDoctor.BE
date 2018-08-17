const VideoCallHistory = require('../models').VideoCallHistory;

const getHistoryVideoCall = async function (req, res) {
    try {
        if(req.params.userId){
            let listVideoCallHistory = await VideoCallHistory.find({

            })
        }
        else {
            return ReE(res, {message: 'BAD REQUEST'}, 400);
        }
    }
    catch (e) {

    }
};
module.exports.getHistoryVideoCall = getHistoryVideoCall;