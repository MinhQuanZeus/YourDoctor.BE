const phoneService = require('./../services/PhoneService');
const PhoneVerification = require("../models/PhoneVerification");
const sendPhoneVerifyCode = async function (req, res) {
    // return ReS(res, {
    //     status: "success",
    //     message: "INFO0001"
    // }, 200);
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    const vietnamesePhoneRegex = /(09|01[2|6|8|9])+([0-9]{8})\b/
    if (!body.phoneNumber || !vietnamesePhoneRegex.test(body.phoneNumber)) {
        return ReE(res, 'ERROR0003', 400);
    } else {       
        [errors, status] = await to(phoneService.sendSMSVerification(body.phoneNumber));
        if (errors) {
            return ReE(res, 'ERROR0007', 400);
        } else {
            return ReS(res, {
                status: "success",
                message: "INFO0001"
            }, 200);
        }
    }
};
module.exports.sendPhoneVerifyCode = sendPhoneVerifyCode;

const verifyPhoneVerifyCode = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if (!body.phoneNumber || !body.code) {
        return ReE(res, 'ERROR0004');
    } else {
        PhoneVerification.find({
            phoneNumber: body.phoneNumber,
            code: body.code
        }, (err, results) => {
            if (err) {
                return ReE(res, err, 500);
            }
            if (results && results.length === 0) {
                return ReE(res, 'ERROR0006', 400);
            }
            const phone = results[0];
            if(new Date().getTime() - new Date(phone.updatedAt).getTime() > CONFIG.EXPIRATION_SMS_CODE){
                return ReE(res, 'ERROR0005', 400);
            }
            return ReS(res, {
                status: "success",
                message: "INFO0002"
            }, 200);

        })
    }
};
module.exports.verifyPhoneVerifyCode = verifyPhoneVerifyCode;