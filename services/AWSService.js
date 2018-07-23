const AWS = require('aws-sdk');
const s3Client = new AWS.S3({
    accessKeyId: CONFIG.AWS_S3_ACCESS_KEY,
    secretAccessKey: CONFIG.AWS_S3_SECRET_ACCESS_KEY,
    signatureVersion: 'v2'
});
var wait = require('wait-for-stuff');
const bucket = CONFIG.AWS_BUKET_PUBLIC;

const uploadAvatar = async (part) => {
    if (part.filename) {
        await s3Client.putObject({
            Bucket: bucket,
            Key: part.filename,
            ACL: 'public-read',
            Body: part,
            ContentLength: part.byteCount
        }, async (err, data) => {
            if (err) TE(err);
            console.log("upload done " + part.filename);
            return "done";
        });
    }
}
module.exports.uploadAvatar = uploadAvatar;

// var multer = require('multer');
// var multerS3 = require('multer-s3');
// var express = require('express');
// var app = express();
// //var s3 = new aws.S3({ /* ... */ });
//
// var uploadImage = multer({
//     storage: multerS3({
//         s3: s3,
//         bucket: 'some-bucket',
//         metadata: function (req, file, cb) {
//             cb(null, {fieldName: file.fieldname});
//         },
//         key: function (req, file, cb) {
//             cb(null, Date.now().toString())
//         }
//     })
// })
//
// app.post('/upload', uploadImage.array('photos', 3), function(req, res, next) {
//     res.send('Successfully uploaded ' + req.files.length + ' files!')
// })

// module.exports.uploadImage = uploadImage;