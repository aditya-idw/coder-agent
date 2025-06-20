import { config } from '../config/environment';

export function validateSetup(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check API keys
  if (!config.ai.openai.apiKey || !config.ai.openai.apiKey.startsWith('sk-')) {
    errors.push('Invalid or missing OpenAI API key');
  }
  
  if (!config.ai.anthropic.apiKey || !config.ai.anthropic.apiKey.startsWith('sk-ant-')) {
    errors.push('Invalid or missing Anthropic API key');
  }

  // Check JWT secrets strength
  if (config.auth.jwtSecret.length < 32) {
    errors.push('JWT secret must be at least 32 characters long');
  }

  if (config.auth.jwtRefreshSecret.length < 32) {
    errors.push('JWT refresh secret must be at least 32 characters long');
  }

  // Check database connection
  if (!config.database.url.includes('postgresql://')) {
    errors.push('Invalid database URL format');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function printSetupStatus(): void {
  const { valid, errors } = validateSetup();
  
  if (valid) {
    console.log('✅ All security checks passed!');
    console.log('🚀 Server is ready to start');
  } else {
    console.log('❌ Security validation failed:');
    errors.forEach(error => console.log(`  - ${error}`));
    console.log('\n📝 Please check your .env file and try again');
    process.exit(1);
  }
}
