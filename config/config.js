require('dotenv').config();

CONFIG = {}

CONFIG.app = process.env.APP || 'development';
CONFIG.port = process.env.PORT || '3000';

CONFIG.db_dialect = process.env.DB_DIALECT || 'mongo';
CONFIG.db_host = process.env.DB_HOST || 'yourdoctordb.documents.azure.com';
CONFIG.db_port = process.env.DB_PORT || '10255';
CONFIG.db_name = process.env.DB_NAME || 'yourdoctordbfinal';
CONFIG.db_user = process.env.DB_USER || 'yourdoctordb';
CONFIG.db_password = process.env.DB_PASSWORD || 'bk0zHAmbw4UIoRkJwqUZOugw3oMqZaI7enwnhFb70v0NSYmIOdt6aXvG2aJGtT4tiquCuoYxgo5ucSdxnc0b1g%3D%3D';

CONFIG.jwt_encryption = process.env.JWT_ENCRYPTION || '123@123';
CONFIG.jwt_expiration = process.env.JWT_EXPIRATION || '10000';

CONFIG.SPEED_SMS_URL = "api.speedsms.vn";
CONFIG.SPEED_SMS_AUTH_TOKEN = "dIWnxXVIOUNgoBD1zagC8HXJEBHDCnjT";
CONFIG.SPEED_SMS_TYPE = 2;
CONFIG.EXPIRATION_SMS_CODE = 600000;