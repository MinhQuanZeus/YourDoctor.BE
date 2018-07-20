var admin = require("firebase-admin");

var serviceAccount = CONFIG.ACCOUNT;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://yourdoctor7-2db28.firebaseio.com"
});

const sendNotification = function (deviceToken, payload) {
    var options = {
        priority:"high",
        timeToLive: 60 * 60 *24 * 7
    };
    admin.messaging().sendToDevice(deviceToken,payload,options).then(function (response) {
        console.log("successfull", response)}).catch(function (error) {
        console.log("loi roi", error)
    });
}

module.exports.sendNotification = sendNotification;

// sample data
// var payload = {
//     data : {
//         senderId: "ID cua ng nguoi",
//         type: "video call or chat",
//         advisoryId: "id cua cuoc tu van chat hay video call",
//         message: ""
//     }
// };



