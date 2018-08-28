const uuidv4 = require('uuid/v4');
const path = require('path');
const fs = require('fs');

const uploadService = async (file) => {
	const old_path = file.path;
	const file_ext = file.originalFilename.split('.').pop();
	const file_name = uuidv4();
	const new_path = path.join(__dirname, CONFIG.UPLOAD_FOLDER, file_name + '.' + file_ext);
	return new Promise((resolve, reject) => {
		fs.readFile(old_path, function(err, data) {
			fs.writeFile(new_path, data, async function(err) {
				if (err) {
					reject(err);
				}
				resolve(CONFIG.BASE_UPLOAD_IMAGES_URL + file_name + '.' + file_ext);
			});
		});
	});
};
module.exports.uploadService = uploadService;
