import dotenv from 'dotenv';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();
if (!envFound) {
  // This error should crash whole process
  throw new Error("Could not find dotenv file");
}

export default {
  port: parseInt(process.env.PORT, 10),
  jwtSecret: process.env.JWT_SECRET,
  logs: {
    level: process.env.LOG_LEVEL || 'silly',
  },
  api: {
    prefix: '/api',
  },
  database: {
    name: process.env.MONGODB_NAME,
    uri: process.env.MONGODB_URI,
  },
};
