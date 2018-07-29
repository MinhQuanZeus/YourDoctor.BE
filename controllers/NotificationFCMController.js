let admin = require("firebase-admin");

let serviceAccount = CONFIG.ACCOUNT;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://yourdoctor7-2db28.firebaseio.com"
});

const sendNotification = function (topicUserId, payload) {

    let options = {
        priority:"high",
        timeToLive: 60 * 60 *24 * 7
    };
    admin.messaging().sendToTopic(topicUserId,payload,options).then(function (response) {
        console.log("successfull", response)}).catch(function (error) {
        console.log("loi roi", error);
    });
};


module.exports.sendNotification = sendNotification;


