#!/usr/bin/env tsx

/**
 * OpenAI Connection Verification Script
 * Tests the OpenAI API connection and configuration
 */

import OpenAI from 'openai';
import { env } from '../src/config/env';

async function verifyOpenAI(): Promise<void> {
  console.log('🔍 Verifying OpenAI API connection...\n');

  // Check if API key is set
  if (!env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY is not set in environment variables');
    console.log('\n💡 Make sure you have OPENAI_API_KEY in your .env file');
    process.exit(1);
  }

  // Check API key format (should start with 'sk-')
  if (!env.OPENAI_API_KEY.startsWith('sk-')) {
    console.warn('⚠️  Warning: OPENAI_API_KEY does not start with "sk-"');
    console.warn('   This might indicate an invalid API key format');
  }

  console.log('✅ OPENAI_API_KEY is set');
  console.log(`   Key preview: ${env.OPENAI_API_KEY.substring(0, 7)}...${env.OPENAI_API_KEY.substring(env.OPENAI_API_KEY.length - 4)}\n`);

  // Initialize OpenAI client
  let client: OpenAI;
  try {
    client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
    console.log('✅ OpenAI client initialized\n');
  } catch (error: any) {
    console.error('❌ Failed to initialize OpenAI client:', error.message);
    process.exit(1);
  }

  // Test API connection with a simple request
  console.log('🧪 Testing API connection...');
  try {
    const response = await client.models.list();
    console.log('✅ API connection successful!');
    console.log(`   Available models: ${response.data.length} models found`);
    
    // Check if gpt-4o is available (required for vision API)
    const hasGpt4o = response.data.some((model: any) => 
      model.id.includes('gpt-4o') || model.id.includes('gpt-4')
    );
    
    if (hasGpt4o) {
      console.log('✅ GPT-4 Vision models are available');
    } else {
      console.warn('⚠️  Warning: GPT-4 Vision models may not be available');
      console.warn('   The app uses gpt-4o for image analysis');
    }
    
    console.log('\n🎉 OpenAI connection verified successfully!');
    console.log('   The AI Service should work correctly.');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ API connection test failed:');
    
    if (error.status === 401) {
      console.error('   Authentication failed - Invalid API key');
      console.error('   Please check your OPENAI_API_KEY in the .env file');
    } else if (error.status === 429) {
      console.error('   Rate limit exceeded - Too many requests');
      console.error('   Please wait a moment and try again');
    } else if (error.status === 500) {
      console.error('   OpenAI API server error - Service temporarily unavailable');
    } else {
      console.error(`   Error: ${error.message}`);
      if (error.status) {
        console.error(`   Status code: ${error.status}`);
      }
    }
    
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Verify your API key is correct');
    console.error('   2. Check your OpenAI account has credits/quota');
    console.error('   3. Ensure you have internet connectivity');
    console.error('   4. Check OpenAI status page: https://status.openai.com');
    
    process.exit(1);
  }
}

verifyOpenAI().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});

