var http = require('http');
var https = require('https');
const phoneRepository = require('./../repositories/PhoneVerificationRepository');
const ACCESS_TOKEN = CONFIG.SPEED_SMS_AUTH_TOKEN;

const sendSMSVerification = async (phoneNumber) => {
    const code = Math.floor(10000 + 89999 * Math.random());
    const mesage = "Your doctor! " + code + " là mã xác thực số điện thoại của Quý khách";
    try {
        const statusSendSMS = await sendSMS(phoneNumber, mesage);
        // if (statusSendSMS === "success") {
        console.log('send scuuess');
        await phoneRepository.savePhoneVerification(phoneNumber, code);
        return Promise.resolve("success");
        // }
    } catch (error) {
        console.log(error);
        return Promise.reject("ERROR0007");
    }
};
module.exports.sendSMSVerification = sendSMSVerification;

const sendSMSPassword = async (phoneNumber, newPassword) => {
    const mesage = "Your doctor! Mật khẩu tài khoản của Quý khách là: " +newPassword;
    try {
        const statusSendSMS = await sendSMS(phoneNumber, mesage);
    } catch (error) {
        console.log(error);
        return Promise.reject("ERROR0007");
    }
};
module.exports.sendSMSPassword = sendSMSPassword;

const adminSendSMS = async (phoneNumber, message) => {
    try {
        const statusSendSMS = await sendSMS(phoneNumber, message);
    } catch (error) {
        console.log(error);
        return Promise.reject("ERROR0007");
    }
};
module.exports.adminSendSMS = adminSendSMS;



const sendSMSVerifyBanking = async (phoneNumber, verifyCode) => {
    const mesage = "Mã xác nhận giao dịch của bạn là: " +verifyCode;
    try {
        const statusSendSMS = await sendSMS(phoneNumber, mesage);
    } catch (error) {
        console.log(error);
        return Promise.reject("ERROR0007");
    }
};
module.exports.sendSMSVerifyBanking = sendSMSVerifyBanking;


const sendSMS = async (phoneNumber, content) => {
    var url = CONFIG.SPEED_SMS_URL;
    var params = JSON.stringify({
        to: [phoneNumber + ''],
        content: content,
        sms_type: CONFIG.SPEED_SMS_TYPE,
        sender: ''
    });

    var buf = new Buffer(ACCESS_TOKEN + ':x');
    var auth = "Basic " + buf.toString('base64');
    const options = {
        hostname: url,
        port: 443,
        path: '/index.php/sms/send',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': auth
        }
    };

    const req = await https.request(options, function (res) {
        res.setEncoding('utf8');
        var body = '';
        res.on('data', function (d) {
            body += d;
        });
        res.on('end', function () {
            var json = JSON.parse(body);
            if (json.status == 'success') {
                console.log("sended");
                return Promise.resolve("success");
            } else {
                console.log("send sms failed");
                Promise.reject("send sms failed " + body);
            }
        });
    });

    req.on('error', function (e) {
        console.log(e);
        Promise.reject("send sms failed " + e);
    });

    req.write(params);
    req.end();
};
module.exports.sendSMS = sendSMS;