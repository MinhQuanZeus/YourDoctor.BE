require('dotenv').config();

CONFIG = {}

CONFIG.app = process.env.APP || 'development';
CONFIG.port = process.env.PORT || '3000';

CONFIG.db_dialect = process.env.DB_DIALECT || 'mongo';
CONFIG.db_host = process.env.DB_HOST || 'ds125841.mlab.com';
CONFIG.db_port = process.env.DB_PORT || '25841';
CONFIG.db_name = process.env.DB_NAME || 'heroku_9s7l353d';
CONFIG.db_user = process.env.DB_USER || 'yourdoctoruser';
CONFIG.db_password = process.env.DB_PASSWORD || '123abc';

CONFIG.jwt_encryption = process.env.JWT_ENCRYPTION || '123@123';
CONFIG.jwt_expiration = process.env.JWT_EXPIRATION || '10000';

CONFIG.SPEED_SMS_URL = "api.speedsms.vn";
CONFIG.SPEED_SMS_AUTH_TOKEN = "dIWnxXVIOUNgoBD1zagC8HXJEBHDCnjT";
CONFIG.SPEED_SMS_TYPE = 2;
CONFIG.EXPIRATION_SMS_CODE = 600000;

CONFIG.AWS_S3_ACCESS_KEY = "AKIAIQD4W23G426GBFTQ";
CONFIG.AWS_S3_SECRET_ACCESS_KEY = "MgdRazGWZlLsKCgK2bgzriorrHyf8glXTb+TlfRh";
CONFIG.AWS_BUKET_PUBLIC = "yourdoctor-assets-public";
CONFIG.AWS_S3_DOMAIN = "https://s3-ap-southeast-1.amazonaws.com/";
