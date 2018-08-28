require('dotenv').config();

CONFIG = {};

CONFIG.app = process.env.APP || 'development';
CONFIG.port = process.env.PORT || '3000';

CONFIG.db_dialect = process.env.DB_DIALECT || 'mongo';
CONFIG.db_host = process.env.DB_HOST || '103.221.220.186';
CONFIG.db_port = process.env.DB_PORT || '27017';
CONFIG.db_name = process.env.DB_NAME || 'yourdoctordb';
CONFIG.db_user = process.env.DB_USER || 'yourdoctoradmin';
CONFIG.db_password = process.env.DB_PASSWORD || 'abc123';

CONFIG.jwt_encryption = process.env.JWT_ENCRYPTION || '123@123';
CONFIG.jwt_expiration = process.env.JWT_EXPIRATION || '10000';

CONFIG.SPEED_SMS_URL = 'api.speedsms.vn';
CONFIG.SPEED_SMS_AUTH_TOKEN = 'dIWnxXVIOUNgoBD1zagC8HXJEBHDCnjT';
CONFIG.SPEED_SMS_TYPE = 2;
CONFIG.EXPIRATION_SMS_CODE = 600000;
CONFIG.UPLOAD_FOLDER = '../public/uploads/images/';
CONFIG.BASE_UPLOAD_IMAGES_URL = 'https://yourdoctorfu.com/uploads/images/';

CONFIG.ACCOUNT =
{
	'type': 'service_account',
	'project_id': 'yourdoctor7-2db28',
	'private_key_id': 'a99c424a3e33653daaba457e549a6bc9bff16f88',
	'private_key': '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCJGfRLHiPGWnoe\neSzPCKoICoHYGuhk9WB/Wa5suU6gVaDEXYZesUpLYCFmmjPxnsQUcrwE26690ZiE\n389z03yV0YgQp1gl465suTJ5IylIXUYXMiFxIhi/o9B+h1yUXMpN0PmeFQzEU3Sd\n2FrKDCU4PHPSnkXnba4U2ZxIj1H/KhCLByick7kKEN6RcGaNxvblT0J+KzRO0nHS\nBD89CP0VNPUasotE/KkmvIlPDOUQ7j52phwbTcs0mICV3FWf4h0hX0TrtDe1fq2S\nhyKTxGrZM2bjnvvo8tkWx7XdsJOZGl+3+oxULdcnlVbaOY4npHWCe1FesqW2TfT9\nQeE/CXEDAgMBAAECggEABKtVnplQLpk2P4Nw+zwYTl3NPkbsU0PoHW44eot1GhDQ\ngN+Oi/sNxLNpb80gp8H4e5nMvX2d3ekdgKj+r7ssKw4PzEFmxyOR9TH5fhaseUJz\n+KZEbU3z+dLibuy9QnBGk4/icHfXD3ioKBgOP4NaYSft6eZqCw+5NgyTPgVjjYUc\neEhI71JqSCh3l5ogOmMLh/gxAvSYZxbmcU2UVz7nrnrJthUGcXHoUUr47hVVZazM\nRQettt19otrfVd1rJwndwwGY5KUAbQHtM2PL5V7Jg0VGcRZlMOuAxeQ2zOjgo/NC\n/EAbrvuDDF+GwBAlUfxNzYne3Gj2xYtKHtiyiw42QQKBgQC8CJRFmpAIIE5cESfS\ntkEWyKhzNvpeqAmnmbAzYJPLKmtPVJLavaeuLMKva3gAI1F2+RvSzg3/67ra5E2X\niZ5bTJzIwDMzjL7cY/0bmpLEZYZ2mU1S1eAe2Ar8C446zt7c69lu066gJGtAUAui\n06Xoz8iDBeS29PhPRABiZ6uVtQKBgQC6qHDpedS2H5SpB+K/Xgd9lkKuzW3tFeOu\nq3rarUoxTK8ELt7w7vnwhCaOhxtgdD4MGRKwPF2Or5MSzIoJu8SVOq7E2+rfOenF\nj6+6rpBJisDtubT0ZKgYmBYb3wRZJ2BV5Ix6R7NIdZB/MGKFO/OQKC8XCBQ4VNNk\nVOsVzwWe1wKBgGYI1cTLcbsnJL5rBMwf4EQn0NjsjYJN9yc+i9HlZ23I8ABVaXdP\nkS0/1slwLOcOQ0enOAT1kb09QuFDICPKJuduNGnvehlQF8XqcE/JWjk+ym+TEtWP\nf5XdMGDDOIQK+/6v8QZl0g3OlXCJvza1WQNztV/8E7eASTpiMT80+HQ9AoGAfCLD\nnPKSPWD5XATLjtt4/dOtm1Ux0yfomOSgOshefDT0fEKzr+YuwP8SKV2/HkGQdjlC\njYRH8DniBPGUp+6BSYGSc4eSR0zbpLDvfKbVfKNTtYX4y0QZ6ulSYszJtoUSc20g\n473FhN3y8DN8ggEh9XBUCOwtjl0TjTlQctuQcFcCgYEAr7RlFIzdVyc8Bj4Jlw99\n4K8Wqu/90SnsSkQG9GXwDhgLudpFjOgsDkMo3eqpStWhy0rsGMTzGK0lOGNvtdX2\n1T1DCphWy7IIuz+Jg5noktfMetRo07MWMj75Q2HK4tMXyVURASwU5CWRGUWwdgav\n+xytDySCszKij2IaXcc6KkU=\n-----END PRIVATE KEY-----\n',
	'client_email': 'firebase-adminsdk-3unoc@yourdoctor7-2db28.iam.gserviceaccount.com',
	'client_id': '114691812790361929851',
	'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
	'token_uri': 'https://accounts.google.com/o/oauth2/token',
	'auth_provider_x509_cert_url': 'https://www.googleapis.com/oauth2/v1/certs',
	'client_x509_cert_url': 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-3unoc%40yourdoctor7-2db28.iam.gserviceaccount.com'
};

CONFIG.REPORT_HANDLE = {
	1: 'Trừ 1 sao đánh giá hệ thống',
	2: 'Trừ 1.5 sao đánh giá hệ thống',
	3: 'Trừ 2 sao đánh giá hệ thống',
	4: 'Trừ 2.5 sao đánh giá hệ thống',
	5: 'Block',
	6: 'Không xử lý',
};
