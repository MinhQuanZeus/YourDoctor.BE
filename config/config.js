require('dotenv').config();

CONFIG = {}

CONFIG.app = process.env.APP || 'development';
CONFIG.port = process.env.PORT || '3000';

CONFIG.db_dialect = process.env.DB_DIALECT || 'mongo';
CONFIG.db_host = process.env.DB_HOST || 'yourdoctor.documents.azure.com';
CONFIG.db_port = process.env.DB_PORT || '10255';
CONFIG.db_name = process.env.DB_NAME || 'your-doctor';
CONFIG.db_user = process.env.DB_USER || 'yourdoctor';
CONFIG.db_password = process.env.DB_PASSWORD || 'o1oR7UHsYkq7S8Yk96bDVAYYOTk065bUHXVrDZBBZ5swhLTGd4aFx6s0tfzvuxvDmpPJmTRUOTzKk2Vec2U6vA%3D%3D';

CONFIG.jwt_encryption = process.env.JWT_ENCRYPTION || '123@123';
CONFIG.jwt_expiration = process.env.JWT_EXPIRATION || '10000';
