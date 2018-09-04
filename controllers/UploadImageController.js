const uploadServices = require('./../services/UploadServices');
const multiparty = require('multiparty');

const upload = async function (req, res) {
	const form = new multiparty.Form();
	form.parse(req, async (error, fields, files) => {
		if(error){
			return ReE(res, 'Upload ảnh không thành công, vui lòng thử lại sau', 400);
		}
		let image = 'http://dnr-live.ru/wp-content/uploads/2017/03/noavatar.png';
		if (files && files.imageChat && files.imageChat.length > 0) {
			let [error, imageURL] = await to(uploadServices.uploadService(files.imageChat[0]));
			if (error) {
				console.log(error);
				return ReE(res, 'Upload ảnh không thành công, vui lòng thử lại sau', 400);
			}
			image = imageURL;
		}
		else {
			return ReE(res, 'Không tồn tại ảnh để upload', 400);
		}
		return ReS(res, { message: 'Link image', filePath: image }, 200);
	});
};
module.exports.upload = upload;
