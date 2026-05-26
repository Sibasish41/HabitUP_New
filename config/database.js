const { Sequelize } = require('sequelize');
const environment = require('../backEnd/utils/environment.js');
const { mockSequelize } = require('./mockDatabase.js');

// Get environment-specific configuration
const config = environment.getConfig();
const { database } = config;

// Use mock database if in test mode or if USE_MOCK_DB is set
const useMockDatabase = process.env.NODE_ENV === 'test' || process.env.USE_MOCK_DB === 'true';

const sequelize = useMockDatabase ? mockSequelize : new Sequelize(
  database.name,
  database.user,
  database.password,
  {
    host: database.host,
    port: database.port,
    dialect: 'mysql',
    logging: database.logging ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: false
    }
  }
);

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
