const IntroduceAndRule = require('../models').IntroduceAndRule;

const create = async function (req, res) {
    try {
        if (req.body) {
            let objIntroAndRule = IntroduceAndRule({
                type: body.type,
                content: body.content
            });
            let objIntroAndRuleReturn = await objIntroAndRule.save();
            if (objIntroAndRuleReturn) {
                return ReS(res, {message: 'Success', objIntroAndRuleReturn: objIntroAndRuleReturn}, 200);
            }
            else {
                return ReE(res, 'Failed', 503);
            }
        }
        else {
            return ReE(res, 'Bad request', 400);
        }
    }
    catch (e) {
        console.log(e)
        return ReE(res, 'Failed', 503);
    }
};

module.exports.create = create;

const get = async function (req, res) {
    try {
        let objIntroAndRuleReturn = await IntroduceAndRule.find({});
        if (objIntroAndRuleReturn) {
            return ReS(res, {message: 'Success', objIntroAndRuleReturn: objIntroAndRuleReturn}, 200);
        }
        else {
            return ReE(res, 'Failed', 503);
        }
    }
    catch (e) {
        console.log(e)
        return ReE(res, 'Failed', 503);
    }
};

module.exports.get = get;
