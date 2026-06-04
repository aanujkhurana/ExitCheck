require('./setup');
const request = require('supertest');
const app = require('../index');
const Report = require('../models/Report');

jest.mock('../utils/helpers', () => ({
  ...jest.requireActual('../utils/helpers'),
  generatePdf: jest.fn().mockResolvedValue('http://localhost/uploads/pdfs/test.pdf'),
  sendEmailWithAttachment: jest.fn().mockResolvedValue(true),
  saveBuffer: jest.fn().mockResolvedValue('http://localhost/uploads/photos/test.jpg'),
  saveFile: jest.fn().mockResolvedValue('http://localhost/uploads/pdfs/test.pdf'),
}));

describe('Reports API', () => {
  let reportId;

  afterAll(async () => {
    await Report.deleteMany({});
  });

  it('POST /api/reports - creates a report', async () => {
    const res = await request(app)
      .post('/api/reports')
      .send({
        address: '123 Test St',
        moveIn: '2026-06-01',
        moveOut: '2026-06-30',
        agentEmail: 'agent@test.com',
      });
    expect(res.status).toBe(201);
    expect(res.body.address).toBe('123 Test St');
    expect(res.body.agentEmail).toBe('agent@test.com');
    expect(res.body._id).toBeDefined();
    reportId = res.body._id;
  });

  it('POST /api/reports/:id/rooms - adds a room', async () => {
    const res = await request(app)
      .post(`/api/reports/${reportId}/rooms`)
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
    // re-add a room first since the previous one was used for photos
    await request(app)
      .post(`/api/reports/${reportId}/rooms`)
      .send({ name: 'Bedroom', condition: 'good' });
    const report = await Report.findById(reportId);
    const roomId = report.rooms[1]._id.toString();

    const res = await request(app).delete(`/api/reports/${reportId}/rooms/${roomId}`);
    expect(res.status).toBe(200);
    expect(res.body.rooms).toHaveLength(1);
    expect(res.body.rooms[0].name).toBe('Kitchen');
  });

  it('POST /api/reports/:id/generate - generates a PDF', async () => {
    // ensure a room exists for PDF generation
    await request(app)
      .post(`/api/reports/${reportId}/rooms`)
      .send({ name: 'Living Room', condition: 'fair' });
    const res = await request(app).post(`/api/reports/${reportId}/generate`);
    expect(res.status).toBe(200);
    expect(res.body.url).toBeDefined();
  });

  it('POST /api/reports/:id/email - emails the PDF', async () => {
    const res = await request(app)
      .post(`/api/reports/${reportId}/email`)
      .send({ to: 'agent@test.com' });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('DELETE /api/reports/:id - deletes a report', async () => {
    const res = await request(app).delete(`/api/reports/${reportId}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    const getRes = await request(app).get(`/api/reports/${reportId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body).toBeNull();
  });
});
