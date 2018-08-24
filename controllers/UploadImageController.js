const AWS = require('aws-sdk');
const s3Client = new AWS.S3({
	accessKeyId: CONFIG.AWS_S3_ACCESS_KEY,
	secretAccessKey: CONFIG.AWS_S3_SECRET_ACCESS_KEY,
	signatureVersion: 'v2',
});
let wait = require('wait-for-stuff');
const multiparty = require('multiparty');
const bucket = CONFIG.AWS_BUKET_PUBLIC;

const uploadImageChat = async (part) => {
	if (part.filename) {
		await s3Client.putObject({
			Bucket: bucket,
			Key: part.filename,
			ACL: 'public-read',
			Body: part,
			ContentLength: part.byteCount,
		}, async (err, data) => {
			if (err) TE(err);
			console.log('upload done ' + part.filename);
			return 'done';
		});
	}
};
module.exports.uploadImageChat = uploadImageChat;

//////////

const upload = async function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	const form = new multiparty.Form();
	let filePath = '';
	let filePart = '';
	form.on('part', async function (part) {
		if (part.filename) {
			filePart = part;
			let status;
			try {
				status = await to(uploadImageChat(part));
			} catch (ex) {
				RE(res, ex, 422);
			}
		}
	});
	form.on('close', async function () {
		filePath = CONFIG.AWS_S3_DOMAIN + CONFIG.AWS_BUKET_PUBLIC + '/' + filePart.filename;
		return ReS(res, { message: 'Link ảnh chat', filePath: filePath }, 200);
	});
	form.on('error', function (err) {
		if (erro) return ReE(res, err, 422);
	});
	form.parse(req);

};
module.exports.upload = upload;
