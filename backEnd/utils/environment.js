// Environment configuration utility for backend
const dotenv = require('dotenv');

class Environment {
  constructor() {
    this.NODE_ENV = process.env.NODE_ENV || 'development';
    this.loadEnvironmentVariables();
  }

  loadEnvironmentVariables() {
    // Load base .env file
    dotenv.config();

    // Load environment-specific .env file if it exists
    const envFile = `.env.${this.NODE_ENV}`;
    dotenv.config({ path: envFile });
  }

  isDevelopment() {
    return this.NODE_ENV === 'development';
  }

  isProduction() {
    return this.NODE_ENV === 'production';
  }

  isTesting() {
    return this.NODE_ENV === 'test';
  }

  isStaging() {
    return this.NODE_ENV === 'staging';
  }

  getEnv() {
    return this.NODE_ENV;
  }

  // Environment-specific logging
  log(...args) {
    if (this.isDevelopment() || this.isStaging()) {
      console.log(`[${this.NODE_ENV.toUpperCase()}]`, ...args);
    }
  }

  warn(...args) {
    if (this.isDevelopment() || this.isStaging()) {
      console.warn(`[${this.NODE_ENV.toUpperCase()}]`, ...args);
    }
  }

  error(...args) {
    if (this.isDevelopment() || this.isStaging()) {
      console.error(`[${this.NODE_ENV.toUpperCase()}]`, ...args);
    } else {
      // In production, you might want to send errors to a logging service
      console.error(...args);
    }
  }

  // Get configuration based on environment
  getConfig() {
    const baseConfig = {
      port: process.env.PORT || 5000,
      clientUrl: process.env.CLIENT_URL,
      jwtSecret: process.env.JWT_SECRET,
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    };

    const envConfigs = {
      development: {
        database: {
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          name: process.env.DB_NAME || 'habitup_dev',
          port: process.env.DB_PORT || 3306,
          logging: true,
        },
        cors: {
          origins: ['http://localhost:3000', 'http://localhost:3001'],
          credentials: true,
        },
        rateLimiting: {
          windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
          max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
        },
      },
      staging: {
        database: {
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          name: process.env.DB_NAME || 'habitup_staging',
          port: process.env.DB_PORT || 3306,
          logging: false,
        },
        cors: {
          origins: process.env.CLIENT_URL ? [process.env.CLIENT_URL] : [],
          credentials: true,
        },
        rateLimiting: {
          windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
          max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 75,
        },
      },
      production: {
        database: {
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          name: process.env.DB_NAME || 'habitup_production',
          port: process.env.DB_PORT || 3306,
          logging: false,
        },
        cors: {
          origins: process.env.CLIENT_URL ? [process.env.CLIENT_URL] : [],
          credentials: true,
        },
        rateLimiting: {
          windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
          max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 50,
        },
      },
    };

    return { ...baseConfig, ...envConfigs[this.NODE_ENV] };
  }

  // Validate required environment variables
  validateRequired(requiredVars = []) {
    const missing = [];
    
    // Default required variables for all environments
    const defaultRequired = ['JWT_SECRET'];
    
    // Environment-specific required variables
    const envRequired = {
      production: ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'CLIENT_URL'],
      staging: ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'CLIENT_URL'],
    };

    const allRequired = [
      ...defaultRequired,
      ...(envRequired[this.NODE_ENV] || []),
      ...requiredVars,
    ];

    allRequired.forEach(varName => {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    });

    if (missing.length > 0) {
      this.error(`Missing required environment variables: ${missing.join(', ')}`);
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    this.log('✅ All required environment variables are present');
    return true;
  }

  // Feature flags based on environment
  isFeatureEnabled(featureName) {
    const features = {
      development: {
        detailedLogging: true,
        swaggerDocs: true,
        debugEndpoints: true,
        seedData: true,
      },
      staging: {
        detailedLogging: true,
        swaggerDocs: true,
        debugEndpoints: false,
        seedData: false,
      },
      production: {
        detailedLogging: false,
        swaggerDocs: false,
        debugEndpoints: false,
        seedData: false,
      },
    };

    return features[this.NODE_ENV]?.[featureName] || false;
  }
}

// Export singleton instance
module.exports = new Environment();
