import dotenv from 'dotenv';
import Joi from 'joi';

// Load .env file
dotenv.config();

const envSchema = Joi.object({
  PORT: Joi.number().default(5000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  MONGO_URI: Joi.string().required().messages({
    'any.required': 'MONGO_URI is required',
  }),
  JWT_SECRET: Joi.string().min(8).required().messages({
    'any.required': 'JWT_SECRET is required and must be at least 8 characters long',
    'string.min': 'JWT_SECRET must be at least 8 characters long'
  }),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
  JWT_REFRESH_SECRET: Joi.string().min(8).required().messages({
    'any.required': 'JWT_REFRESH_SECRET is required and must be at least 8 characters long',
    'string.min': 'JWT_REFRESH_SECRET must be at least 8 characters long'
  }),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  RATE_LIMIT_MAX: Joi.number().default(800),
  
  // Optional placeholders
  GROK_API_KEY: Joi.string().allow('').default(''),

  AWS_ACCESS_KEY: Joi.string().allow('').default(''),
  AWS_SECRET_KEY: Joi.string().allow('').default(''),
  AWS_S3_BUCKET: Joi.string().allow('').default(''),
  AWS_REGION: Joi.string().allow('').default('us-east-1'),
  
  REDIS_URL: Joi.string().allow('').default('redis://localhost:6379'),

  CORS_ORIGIN: Joi.string().allow('').default('*'),

  FIREBASE_SENDER_ID: Joi.string().allow('').default(''),
  FIREBASE_SERVER_KEY: Joi.string().allow('').default(''),
  
  SMTP_HOST: Joi.string().allow('').default('smtp.mailtrap.io'),
  SMTP_PORT: Joi.number().default(2525),
  SMTP_USER: Joi.string().allow('').default(''),
  SMTP_PASS: Joi.string().allow('').default(''),
  SMTP_FROM: Joi.string().email().default('no-reply@cord4backend.com'),
  
  TWILIO_ACCOUNT_SID: Joi.string().allow('').default(''),
  TWILIO_AUTH_TOKEN: Joi.string().allow('').default(''),
  TWILIO_PHONE_NUMBER: Joi.string().allow('').default('')
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  console.error('❌ Invalid environment variables configuration:');
  console.error(error.message);
  process.exit(1);
}

export const env = envVars;
export default env;
