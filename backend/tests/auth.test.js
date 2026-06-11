const request = require('supertest');

// Since the server is already running via our background task on port 5000,
// we can test directly against the URL instead of importing the app.
const API_URL = 'http://localhost:5000';

describe('Authentication Endpoints', () => {
  // Generate a random email for each test run to prevent "User already exists" errors
  const randomSuffix = Math.floor(Math.random() * 1000000);
  const testEmail = `testuser_${randomSuffix}@workhena.com`;
  const testPassword = 'TestPassword123!';
  let authToken = '';

  it('should register a new user successfully', async () => {
    const res = await request(API_URL)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        full_name: 'Automated Test User',
        user_type: 'job_seeker'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', testEmail);
    expect(res.body.user).toHaveProperty('email_verified', false);
  });

  it('should not allow duplicate email registration', async () => {
    const res = await request(API_URL)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        full_name: 'Automated Test User',
        user_type: 'job_seeker'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'User already exists');
  });

  it('should login the user successfully', async () => {
    const res = await request(API_URL)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: testPassword
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', testEmail);
    authToken = res.body.token;
  });

  it('should reject login with wrong password', async () => {
    const res = await request(API_URL)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error', 'Invalid credentials');
  });

  it('should successfully request a password reset email', async () => {
    const res = await request(API_URL)
      .post('/api/auth/forgot-password')
      .send({
        email: testEmail
      });

    // Our endpoint always returns success for security reasons
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

});
