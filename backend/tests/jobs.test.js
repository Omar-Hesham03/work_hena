const request = require('supertest');

const API_URL = 'http://localhost:5000';

describe('Job Endpoints', () => {
  const randomSuffix = Math.floor(Math.random() * 1000000);
  const seekerEmail = `seeker_${randomSuffix}@workhena.com`;
  const recruiterEmail = `recruiter_${randomSuffix}@workhena.com`;
  const testPassword = 'TestPassword123!';
  
  let seekerToken = '';
  let recruiterToken = '';

  beforeAll(async () => {
    // 1. Create a Job Seeker
    let res = await request(API_URL)
      .post('/api/auth/register')
      .send({ email: seekerEmail, password: testPassword, full_name: 'Seeker', user_type: 'job_seeker' });
    seekerToken = res.body.token;

    // 2. Create a Recruiter
    res = await request(API_URL)
      .post('/api/auth/register')
      .send({ email: recruiterEmail, password: testPassword, full_name: 'Recruiter', user_type: 'recruiter', company_name: 'Test Inc' });
    recruiterToken = res.body.token;
  });

  it('should prevent an unauthenticated user from posting a job', async () => {
    const res = await request(API_URL)
      .post('/api/jobs')
      .send({
        title: 'Software Engineer',
        description: 'Test description',
        location: 'Remote'
      });
    expect(res.statusCode).toBe(401);
  });

  it('should prevent a Job Seeker from posting a job', async () => {
    const res = await request(API_URL)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${seekerToken}`)
      .send({
        title: 'Software Engineer',
        description: 'Test description',
        location: 'Remote'
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/Only recruiters can perform this action/i);
  });

  it('should block Recruiter from posting a job if they have 0 credits', async () => {
    const res = await request(API_URL)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        title: 'Software Engineer',
        description: 'Test description',
        location: 'Remote',
        salary_range: '$100k-$150k',
        job_type: 'full-time'
      });
    
    // By default, a new recruiter has 0 credits.
    // Assuming the backend returns 403 or 400 for insufficient credits
    expect([400, 403]).toContain(res.statusCode);
  });

  it('should allow fetching jobs without authentication', async () => {
    const res = await request(API_URL).get('/api/jobs');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.jobs)).toBeTruthy();
  });

});
