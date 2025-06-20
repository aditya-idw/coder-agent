import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // Authentication - Ensure minimum security standards
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  
  // AI Services - Validate API key formats
  OPENAI_API_KEY: z.string().startsWith('sk-', 'Invalid OpenAI API key format'),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-', 'Invalid Anthropic API key format'),
  
  // App Config
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3001'),
  FRONTEND_URL: z.string().url('Invalid frontend URL'),
  
  // Security
  BCRYPT_ROUNDS: z.string().transform(Number).pipe(z.number().min(10).max(15)).default('12'),
  RATE_LIMIT_MAX: z.string().transform(Number).pipe(z.number().min(1)).default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().min(1)).default('900000'),
  
  // File Upload
  UPLOAD_PATH: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.string().transform(Number).pipe(z.number().min(1)).default('10485760'),
  
  // Redis
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  
  // Git
  GIT_SIGNING_KEY: z.string().optional(),
  GIT_USER_NAME: z.string().default('AI Coder Bot'),
  GIT_USER_EMAIL: z.string().email('Invalid git user email'),
});

// Validate environment variables
let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
  console.log('✅ Environment variables validated successfully');
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Environment validation failed:');
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

export const config = {
  database: {
    url: env.DATABASE_URL,
  },
  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtRefreshSecret: env.JWT_REFRESH_SECRET,
    bcryptRounds: env.BCRYPT_ROUNDS,
  },
  ai: {
    openai: {
      apiKey: env.OPENAI_API_KEY,
    },
    anthropic: {
      apiKey: env.ANTHROPIC_API_KEY,
    },
  },
  app: {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    frontendUrl: env.FRONTEND_URL,
  },
  security: {
    rateLimitMax: env.RATE_LIMIT_MAX,
    rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
  },
  upload: {
    path: env.UPLOAD_PATH,
    maxFileSize: env.MAX_FILE_SIZE,
  },
  redis: {
    url: env.REDIS_URL,
  },
  git: {
    signingKey: env.GIT_SIGNING_KEY,
    userName: env.GIT_USER_NAME,
    userEmail: env.GIT_USER_EMAIL,
  },
};
