import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  // Database
  DATABASE_URL: string;

  // Server
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';

  // Arweave
  ARWEAVE_WALLET_PATH?: string;
  ARWEAVE_GATEWAY: string;

  // Cardano
  CARDANO_NETWORK: 'testnet' | 'mainnet';
  CARDANO_NODE_URL: string;

  // AI/ML
  OPENAI_API_KEY?: string;

  // JWT
  JWT_SECRET?: string;

  // CORS
  FRONTEND_URL: string;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue!;
}

export const env: EnvConfig = {
  DATABASE_URL: getEnvVar('DATABASE_URL'),
  PORT: parseInt(getEnvVar('PORT', '3000'), 10),
  NODE_ENV: (getEnvVar('NODE_ENV', 'development') as EnvConfig['NODE_ENV']) || 'development',
  ARWEAVE_WALLET_PATH: process.env.ARWEAVE_WALLET_PATH,
  ARWEAVE_GATEWAY: getEnvVar('ARWEAVE_GATEWAY', 'https://arweave.net'),
  CARDANO_NETWORK: (getEnvVar('CARDANO_NETWORK', 'testnet') as 'testnet' | 'mainnet') || 'testnet',
  CARDANO_NODE_URL: getEnvVar('CARDANO_NODE_URL', 'https://testnet.cardano.org'),
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  FRONTEND_URL: getEnvVar('FRONTEND_URL', 'http://localhost:5173'),
};

