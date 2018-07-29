const TokenNotification = require('../models').TokenNotification;


const createToken = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    let body = req.body;
    if (!body.userId || !body.tokenDevice ) {
        return ReE(res, 'ERROR0028', 400);
    }
    let existsToken = await TokenNotification.findOne({userId:body.userId});
    if(existsToken) {
        try {
            existsToken.set(body);
            existsToken.save(function (err, updatedToken) {
                    if (err)return ReE(res, "ERROR0042", 503);
                    return ReS(res, {message: 'Update token thành công', updatedToken: updatedToken}, 200);
            });
        }catch (e) {
            return ReE(res, "ERROR0042", 503);
        }
    }
    else {
        try{
            let tokenNotification = new TokenNotification({
                userId : body.userId,
                tokenDevice :body.tokenDevice
            });
            await  tokenNotification.save();
            return ReS(res, {message: 'Tạo token device thành công', tokenNotification: tokenNotification}, 200);
        }catch (e) {
            ReS(res, e.message, 503);
        }
    }
};

module.exports.createToken = createToken;


const getToken = async function (req, res) {
    let objToken = await TokenNotification.findOne({userId:req.params.userId});
    if(!objToken) return ReE(res, "ERROR0042", 404);
    return ReS(res, {message: 'Tạo token device thành công', tokenDevice: objToken.tokenDevice}, 200);
};

module.exports.getToken = getToken;