const AWS = require('aws-sdk');
const bluebird = require('bluebird');
const bucket = CONFIG.AWS_BUKET_PUBLIC;

const s3Client = new AWS.S3({
	accessKeyId: CONFIG.AWS_S3_ACCESS_KEY,
	secretAccessKey: CONFIG.AWS_S3_SECRET_ACCESS_KEY,
	signatureVersion: 'v2'
});

AWS.config.update({
	accessKeyId: CONFIG.AWS_S3_ACCESS_KEY,
	secretAccessKey: CONFIG.AWS_S3_SECRET_ACCESS_KEY,
	signatureVersion: 'v2',
});

AWS.config.setPromisesDependency(bluebird);
// create S3 instance
const s3 = new AWS.S3();
const uploadFile = (buffer, name, type) => {
	const params = {
		ACL: 'public-read',
		Body: buffer,
		Bucket: bucket,
		ContentType: type.mime,
		Key: `${name}.${type.ext}`,
	};
	return s3.upload(params).promise();
};
module.exports.uploadFile = uploadFile;

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
			return 'done';
		});
	}
};
module.exports.uploadAvatar = uploadAvatar;

