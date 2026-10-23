// Loaded before every e2e file. Values here win over server/.env.
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI =
  process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/meat_shop_test';
process.env.LOG_LEVEL = 'silent';
process.env.LOG_PRETTY = 'false';
process.env.SWAGGER_WRITE_FILE = 'false';
process.env.JWT_ACCESS_SECRET ??= 'test-access-secret-test-access-secret';
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret-test-refresh-secret';
