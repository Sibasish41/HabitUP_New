const { Sequelize } = require('sequelize');

// In-memory SQLite database for testing
const mockSequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:', // In-memory database
  logging: false, // Set to console.log to see SQL queries
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: false
  }
});

// Test the mock connection
const testMockConnection = async () => {
  try {
    await mockSequelize.authenticate();
    console.log('✅ Mock database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to mock database:', error);
    return false;
  }
};

// Initialize mock database with tables
const initializeMockDatabase = async () => {
  try {
    console.log('🔄 Initializing mock database...');
    
    // Import all models
    const models = require('../backEnd/models');
    
    // Sync all models to create tables
    await mockSequelize.sync({ force: true });
    
    // Seed with some basic test data
    await seedMockData();
    
    console.log('✅ Mock database initialized successfully with test data');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize mock database:', error);
    return false;
  }
};

// Seed mock data for testing
const seedMockData = async () => {
  try {
    const models = require('../backEnd/models');
    
    // Create test admin user
    await models.Admin.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: '$2a$10$hashedPasswordForTesting', // Pre-hashed password: "admin123"
      phoneNo: 9876543210,
      adminType: 'SUPER_ADMIN',
      accountStatus: 'ACTIVE'
    });

    // Create test regular users
    const testUsers = [
      {
        name: 'John Doe',
        email: 'john@test.com',
        password: 'user123', // Will be hashed by the hook
        phoneNo: 9876543211,
        dob: '1990-01-01',
        joinDate: '2024-01-01',
        gender: 'MALE',
        accountStatus: 'ACTIVE',
        subscriptionType: 'FREE',
        userType: 'USER'
      },
      {
        name: 'Jane Smith',
        email: 'jane@test.com',
        password: 'user123',
        phoneNo: 9876543212,
        dob: '1992-05-15',
        joinDate: '2024-01-01',
        gender: 'FEMALE',
        accountStatus: 'ACTIVE',
        subscriptionType: 'PREMIUM',
        userType: 'USER'
      }
    ];

    for (const userData of testUsers) {
      await models.User.create(userData);
    }

    // Create test habits
    const user = await models.User.findOne({ where: { email: 'john@test.com' } });
    if (user) {
      await models.Habit.create({
        userId: user.id,
        title: 'Morning Exercise',
        description: 'Daily morning workout routine',
        category: 'fitness',
        frequency: 'daily',
        targetValue: 1,
        unit: 'session',
        isActive: true
      });

      await models.Habit.create({
        userId: user.id,
        title: 'Read Books',
        description: 'Read for 30 minutes daily',
        category: 'learning',
        frequency: 'daily',
        targetValue: 30,
        unit: 'minutes',
        isActive: true
      });
    }

    // Create test daily thoughts
    await models.DailyThought.create({
      title: 'Test Motivation',
      content: 'This is a test motivational thought for testing purposes.',
      category: 'motivation',
      isActive: true
    });

    console.log('✅ Mock data seeded successfully');
  } catch (error) {
    console.error('❌ Failed to seed mock data:', error);
    throw error;
  }
};

// Clean up mock database
const cleanupMockDatabase = async () => {
  try {
    await mockSequelize.close();
    console.log('✅ Mock database connection closed');
  } catch (error) {
    console.error('❌ Error closing mock database:', error);
  }
};

module.exports = {
  mockSequelize,
  testMockConnection,
  initializeMockDatabase,
  seedMockData,
  cleanupMockDatabase
};
