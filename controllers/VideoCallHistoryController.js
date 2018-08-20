const VideoCallHistory = require('../models').VideoCallHistory;

const getHistoryVideoCallPatient = async function (req, res) {
    try {
        let pageSize = 0;
        let page = 0;
        if (req.query.pageSize) {
            pageSize = req.query.pageSize * 1;
        }
        if (req.query.page) {
            page = req.query.page * 1;
        }
        if (req.params.patientId) {
            let listVideoCallHistory = await VideoCallHistory.find({
                patientId: req.params.patientId,
                deletionFlag: 1
            })
                .select('timeStart timeEnd linkVideo createdAt')
                .sort([['createdAt', -1]])
                .limit(pageSize)
                .skip(pageSize * page)
                .populate({
                    path: 'doctorId',
                    select: 'firstName middleName lastName avatar'
                });
            if(listVideoCallHistory){
                return ReS(res, {
                    status: true,
                    message: 'Danh sách lịch sử video call.',
                    listVideoCallHistory: listVideoCallHistory
                }, 200);
            }
        }
        else {
            return ReE(res, {message: 'BAD REQUEST'}, 400);
        }
    }
    catch (e) {
        return ReE(res, {message: 'ERROR'}, 400);
    }
};
module.exports.getHistoryVideoCallPatient = getHistoryVideoCallPatient;

const getHistoryVideoCallDoctor = async function (req, res) {
    try {
        let pageSize = 0;
        let page = 0;
        if (req.query.pageSize) {
            pageSize = req.query.pageSize * 1;
        }
        if (req.query.page) {
            page = req.query.page * 1;
        }
        if (req.params.doctorId) {
            let listVideoCallHistory = await VideoCallHistory.find({
                doctorId: req.params.doctorId,
                deletionFlag: 1
            })
                .select('timeStart timeEnd linkVideo createdAt')
                .sort([['createdAt', -1]])
                .limit(pageSize)
                .skip(pageSize * page)
                .populate({
                    path: 'patientId',
                    select: 'firstName middleName lastName avatar'
                });
            if(listVideoCallHistory){
                return ReS(res, {
                    status: true,
                    message: 'Danh sách lịch sử video call.',
                    listVideoCallHistory: listVideoCallHistory
                }, 200);
            }
        }
        else {
            return ReE(res, {message: 'BAD REQUEST'}, 400);
        }
    }
    catch (e) {
        return ReE(res, {message: 'ERROR'}, 400);
    }
};
module.exports.getHistoryVideoCallDoctor = getHistoryVideoCallDoctor;