require('./setup');
const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const Report = require('../models/Report');

jest.mock('../utils/helpers', () => ({
  ...jest.requireActual('../utils/helpers'),
  generatePdf: jest.fn().mockResolvedValue('http://localhost/uploads/pdfs/test.pdf'),
  sendEmailWithAttachment: jest.fn().mockResolvedValue(true),
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
    expect(res.status).toBe(200);
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
    expect(res.status).toBe(200);
    expect(res.body.rooms).toHaveLength(1);
    expect(res.body.rooms[0].name).toBe('Kitchen');
  });

  it('POST /api/reports/:id/photos - uploads a photo (local)', async () => {
    const res = await request(app)
      .post(`/api/reports/${reportId}/photos`)
      .attach('photo', Buffer.from('fake-image'), 'test.jpg');
    expect(res.status).toBe(200);
    expect(res.body.url).toBeDefined();
    expect(res.body.url).toContain('/uploads/');
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

  it('POST /api/reports/:id/generate - generates a PDF', async () => {
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
});
