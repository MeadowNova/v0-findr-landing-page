/**
 * Environment variable validation utility
 * 
 * This utility validates that all required environment variables are present
 * and properly formatted. It can be used during application startup to ensure
 * the application is properly configured.
 */

/**
 * Environment variable configuration
 */
interface EnvVarConfig {
  name: string;
  required: boolean;
  description: string;
  validator?: (value: string) => boolean;
  errorMessage?: string;
}

/**
 * Validation result
 */
interface ValidationResult {
  valid: boolean;
  missing: string[];
  invalid: Array<{ name: string; message: string }>;
}

/**
 * Environment variable configurations
 */
const ENV_VARS: EnvVarConfig[] = [
  // Supabase Configuration
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'Supabase project URL',
    validator: (value) => value.startsWith('https://') && value.includes('.supabase.co'),
    errorMessage: 'Must be a valid Supabase URL (https://*.supabase.co)',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous key for client-side operations',
    validator: (value) => value.length > 20,
    errorMessage: 'Must be a valid Supabase anon key',
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    description: 'Supabase service role key for server-side operations',
    validator: (value) => value.length > 10,
    errorMessage: 'Must be a valid Supabase service role key',
  },

  // Stripe Configuration
  {
    name: 'STRIPE_SECRET_KEY',
    required: true,
    description: 'Stripe secret key for server-side operations',
    validator: (value) => value.startsWith('sk_'),
    errorMessage: 'Must be a valid Stripe secret key (starts with sk_)',
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    required: true,
    description: 'Stripe webhook secret for verifying webhook signatures',
    validator: (value) => value.startsWith('whsec_'),
    errorMessage: 'Must be a valid Stripe webhook secret (starts with whsec_)',
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: true,
    description: 'Stripe publishable key for client-side operations',
    validator: (value) => value.startsWith('pk_'),
    errorMessage: 'Must be a valid Stripe publishable key (starts with pk_)',
  },

  // Bright Data Configuration
  {
    name: 'BRIGHTDATA_API_KEY',
    required: true,
    description: 'Bright Data API key for MCP operations',
  },
  {
    name: 'BRIGHTDATA_PROXY_HOST',
    required: true,
    description: 'Bright Data proxy host',
    validator: (value) => value.includes('.'),
    errorMessage: 'Must be a valid hostname',
  },
  {
    name: 'BRIGHTDATA_PROXY_PORT',
    required: true,
    description: 'Bright Data proxy port',
    validator: (value) => !isNaN(parseInt(value, 10)),
    errorMessage: 'Must be a valid port number',
  },
  {
    name: 'BRIGHTDATA_PROXY_USERNAME',
    required: true,
    description: 'Bright Data proxy username',
  },
  {
    name: 'BRIGHTDATA_PROXY_PASSWORD',
    required: true,
    description: 'Bright Data proxy password',
  },
  {
    name: 'BRIGHTDATA_ZONE_NAME',
    required: true,
    description: 'Bright Data zone name',
  },

  // Application Configuration
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: true,
    description: 'Application URL for redirects and callbacks',
    validator: (value) => value.startsWith('http'),
    errorMessage: 'Must be a valid URL starting with http:// or https://',
  },
];

/**
 * Validate environment variables
 * @returns Validation result
 */
export function validateEnv(): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    missing: [],
    invalid: [],
  };

  // Check each environment variable
  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name];

    // Check if required variable is missing
    if (envVar.required && (!value || value.trim() === '')) {
      result.valid = false;
      result.missing.push(envVar.name);
      continue;
    }

    // Skip validation if value is not present and not required
    if (!value) {
      continue;
    }

    // Validate format if validator is provided
    if (envVar.validator && !envVar.validator(value)) {
      result.valid = false;
      result.invalid.push({
        name: envVar.name,
        message: envVar.errorMessage || 'Invalid format',
      });
    }
  }

  return result;
}

/**
 * Get environment variable documentation
 * @returns Array of environment variable documentation
 */
export function getEnvVarDocs(): Array<{ name: string; required: boolean; description: string }> {
  return ENV_VARS.map(({ name, required, description }) => ({
    name,
    required,
    description,
  }));
}

/**
 * Validate environment variables and throw error if invalid
 * @param exitOnError Whether to exit the process on error
 */
export function validateEnvOrExit(exitOnError = true): void {
  const result = validateEnv();

  if (!result.valid) {
    console.error('❌ Environment validation failed:');

    if (result.missing.length > 0) {
      console.error('Missing required environment variables:');
      result.missing.forEach((name) => {
        const envVar = ENV_VARS.find((v) => v.name === name);
        console.error(`  - ${name}: ${envVar?.description || ''}`);
      });
    }

    if (result.invalid.length > 0) {
      console.error('Invalid environment variables:');
      result.invalid.forEach(({ name, message }) => {
        console.error(`  - ${name}: ${message}`);
      });
    }

    if (exitOnError) {
      console.error('Exiting due to environment configuration errors.');
      process.exit(1);
    }
  } else {
    console.log('✅ Environment validation passed.');
  }
}