import dotenv from 'dotenv';

// Load .env file
dotenv.config();

interface EnvironmentVariables {
  DATABASE_URL: string;
  JWT_SECRET: string;
  PORT?: string;
  NODE_ENV?: string;
  ALLOWED_ORIGINS?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  EMAIL_FROM?: string;
}

export function validateEnv(): void {
  const requiredEnvVars: (keyof EnvironmentVariables)[] = [
    'DATABASE_URL',
    'JWT_SECRET'
  ];

  const missingVars: string[] = [];

  // Check required environment variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  // Validate environment-specific configurations
  if (process.env.NODE_ENV === 'production') {
    // Production-specific validations
    if (!process.env.ALLOWED_ORIGINS) {
      console.warn('⚠️  ALLOWED_ORIGINS not set in production. Using default value.');
    }

    // Ensure secure JWT secret in production
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long in production');
    }
  }

  // Validate email configuration if any email env var is set
  const emailVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM'];
  const hasAnyEmailVar = emailVars.some(v => process.env[v]);
  
  if (hasAnyEmailVar) {
    const missingEmailVars = emailVars.filter(v => !process.env[v]);
    if (missingEmailVars.length > 0) {
      console.warn(
        `⚠️  Incomplete email configuration. Missing: ${missingEmailVars.join(', ')}\n` +
        'Email functionality may not work properly.'
      );
    }
  }

  // Validate PORT if provided
  if (process.env.PORT) {
    const port = parseInt(process.env.PORT, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error('PORT must be a valid number between 1 and 65535');
    }
  }

  console.log('✅ Environment variables validated successfully');
}