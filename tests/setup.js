const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Set default timeout for tests (in-memory mongo download/spinup might take a moment)
jest.setTimeout(60000);

beforeAll(async () => {
  // Ensure we are disconnected from any other db
  await mongoose.disconnect();

  // Create an in-memory mongodb instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
});

afterEach(async () => {
  // Clear collections after each test to ensure test isolation
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

afterAll(async () => {
  // Close database connections and stop memory server
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
