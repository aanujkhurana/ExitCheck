require('./setup');
const request = require('supertest');
const app = require('../index');
const Report = require('../models/Report');
const User = require('../models/User');

jest.mock('../utils/helpers', () => ({
  ...jest.requireActual('../utils/helpers'),
  generatePdf: jest.fn().mockResolvedValue('http://localhost/uploads/pdfs/test.pdf'),
  sendEmailWithAttachment: jest.fn().mockResolvedValue(true),
  saveBuffer: jest.fn().mockResolvedValue('http://localhost/uploads/photos/test.jpg'),
  saveFile: jest.fn().mockResolvedValue('http://localhost/uploads/pdfs/test.pdf'),
}));

let defaultAgent = 'agent@test.com';

describe('Reports API', () => {
  let reportId;
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@exitcheck.dev', password: 'testpass123' });
    token = res.body.token;
  });

  afterAll(async () => {
    await Report.deleteMany({});
    await User.deleteMany({});
  });

  it('POST /api/reports - creates a report', async () => {
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .send({
        address: '123 Test St',
        moveIn: '2026-06-01',
        moveOut: '2026-06-30',
        agentEmail: defaultAgent,
      });
    expect(res.status).toBe(201);
    expect(res.body.address).toBe('123 Test St');
    expect(res.body.agentEmail).toBe(defaultAgent);
    expect(res.body._id).toBeDefined();
    reportId = res.body._id;
  });

  it('GET /api/reports/?email= - looks up reports by agent email', async () => {
    const res = await request(app).get(`/api/reports/?email=${defaultAgent}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].address).toBe('123 Test St');
  });

  it('POST /api/reports/:id/rooms - adds a room', async () => {
    const res = await request(app)
      .post(`/api/reports/${reportId}/rooms`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Kitchen',
        notes: 'Looks good',
        condition: 'clean',
        photos: [],
      });
    expect(res.status).toBe(201);
    expect(res.body.rooms).toHaveLength(1);
    expect(res.body.rooms[0].name).toBe('Kitchen');
  });

  it('POST /api/reports/:id/photos - uploads a photo (local)', async () => {
    const res = await request(app)
      .post(`/api/reports/${reportId}/photos`)
      .set('Authorization', `Bearer ${token}`)
      .attach('photo', Buffer.from('fake-image'), 'test.jpg');
    expect(res.status).toBe(200);
    expect(res.body.url).toBeDefined();
  });

  it('POST /api/reports/:id/photos - rejects when over free limit', async () => {
    const report = await Report.findById(reportId);
    report.rooms[0].photos = ['pic1', 'pic2', 'pic3'];
    await report.save();

    const res = await request(app)
      .post(`/api/reports/${reportId}/photos`)
      .set('Authorization', `Bearer ${token}`)
      .attach('photo', Buffer.from('fake-image'), 'test.jpg');
    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Free tier limited');

    report.rooms[0].photos = [];
    await report.save();
  });

  it('GET /api/reports/:id - fetches a report', async () => {
    const res = await request(app).get(`/api/reports/${reportId}`);
    expect(res.status).toBe(200);
    expect(res.body.address).toBe('123 Test St');
    expect(res.body.rooms).toHaveLength(1);
  });

  it('PUT /api/reports/:id - updates a report', async () => {
    const res = await request(app)
      .put(`/api/reports/${reportId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ address: '456 Oak Ave' });
    expect(res.status).toBe(200);
    expect(res.body.address).toBe('456 Oak Ave');
  });

  it('GET /api/reports/:id/export - exports report as JSON', async () => {
    const res = await request(app).get(`/api/reports/${reportId}/export`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body.address).toBe('456 Oak Ave');
    expect(res.body.rooms).toBeDefined();
  });

  it('DELETE /api/reports/:id/rooms/:roomId - deletes a room', async () => {
    await request(app)
      .post(`/api/reports/${reportId}/rooms`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Bedroom', condition: 'fair' });
    const report = await Report.findById(reportId);
    const roomId = report.rooms[1]._id.toString();

    const res = await request(app)
      .delete(`/api/reports/${reportId}/rooms/${roomId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.rooms).toHaveLength(1);
    expect(res.body.rooms[0].name).toBe('Kitchen');
  });

  it('POST /api/reports/:id/generate - generates a PDF', async () => {
    await request(app)
      .post(`/api/reports/${reportId}/rooms`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Living Room', condition: 'fair' });
    const res = await request(app)
      .post(`/api/reports/${reportId}/generate`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.url).toBeDefined();
  });

  it('POST /api/reports/:id/email - emails the PDF', async () => {
    const res = await request(app)
      .post(`/api/reports/${reportId}/email`)
      .set('Authorization', `Bearer ${token}`)
      .send({ to: defaultAgent });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('DELETE /api/reports/:id - deletes a report', async () => {
    const res = await request(app)
      .delete(`/api/reports/${reportId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    const getRes = await request(app).get(`/api/reports/${reportId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body).toBeNull();
  });
});

describe('Auth API', () => {
  afterAll(async () => {
    await User.deleteMany({});
  });

  it('POST /api/auth/register - registers a user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'new@user.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('new@user.com');
  });

  it('POST /api/auth/register - rejects duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'new@user.com', password: 'password123' });
    expect(res.status).toBe(409);
  });

  it('POST /api/auth/register - rejects short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'short@user.com', password: '12345' });
    expect(res.status).toBe(400);
  });

  it('POST /api/auth/login - logs in a user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'new@user.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/auth/login - rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'new@user.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  it('POST /api/reports - rejects unauthenticated request', async () => {
    const res = await request(app)
      .post('/api/reports')
      .send({ address: 'No Auth', moveIn: '2026-01-01', moveOut: '2026-01-31' });
    expect(res.status).toBe(401);
  });
});
