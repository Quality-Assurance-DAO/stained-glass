#!/usr/bin/env tsx

/**
 * Environment validation script
 * Validates that all required environment variables are set
 */

import { env } from '../src/config/env';
import logger from '../src/utils/logger';

const requiredVars = [
  'DATABASE_URL',
  'FRONTEND_URL',
] as const;

const optionalVars = [
  'OPENAI_API_KEY',
  'ARWEAVE_WALLET_PATH',
  'JWT_SECRET',
] as const;

function validateEnv(): boolean {
  let hasErrors = false;

  console.log('Validating environment variables...\n');

  // Check required variables
  for (const varName of requiredVars) {
    try {
      const value = process.env[varName];
      if (!value) {
        console.error(`❌ Missing required variable: ${varName}`);
        hasErrors = true;
      } else {
        console.log(`✅ ${varName}: ${varName === 'DATABASE_URL' ? '[REDACTED]' : value}`);
      }
    } catch (error) {
      console.error(`❌ Error checking ${varName}:`, error);
      hasErrors = true;
    }
  }

  console.log('\nOptional variables:');
  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${varName.includes('KEY') || varName.includes('SECRET') ? '[SET]' : value}`);
    } else {
      console.log(`⚠️  ${varName}: Not set (optional)`);
    }
  }

  // Validate DATABASE_URL format
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    console.error('\n❌ DATABASE_URL must start with "postgresql://"');
    hasErrors = true;
  }

  // Validate PORT is a number
  const port = parseInt(process.env.PORT || '3000', 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    console.error('\n❌ PORT must be a valid number between 1 and 65535');
    hasErrors = true;
  }

  console.log('\n' + '='.repeat(50));
  if (hasErrors) {
    console.error('❌ Environment validation failed!');
    process.exit(1);
  } else {
    console.log('✅ Environment validation passed!');
    process.exit(0);
  }
}

validateEnv();

