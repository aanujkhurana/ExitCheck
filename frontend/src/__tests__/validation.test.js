const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

describe('Validation patterns', () => {
  describe('Date format (YYYY-MM-DD)', () => {
    it('accepts valid dates', () => {
      expect(DATE_RE.test('2026-06-01')).toBe(true);
      expect(DATE_RE.test('2025-01-31')).toBe(true);
      expect(DATE_RE.test('2024-12-25')).toBe(true);
    });

    it('rejects invalid formats', () => {
      expect(DATE_RE.test('01-06-2026')).toBe(false);
      expect(DATE_RE.test('2026/06/01')).toBe(false);
      expect(DATE_RE.test('not-a-date')).toBe(false);
      expect(DATE_RE.test('')).toBe(false);
    });
  });

  describe('Email format', () => {
    it('accepts valid emails', () => {
      expect(EMAIL_RE.test('agent@test.com')).toBe(true);
      expect(EMAIL_RE.test('user@example.co.uk')).toBe(true);
    });

    it('rejects invalid emails', () => {
      expect(EMAIL_RE.test('not-an-email')).toBe(false);
      expect(EMAIL_RE.test('@test.com')).toBe(false);
      expect(EMAIL_RE.test('')).toBe(false);
    });
  });
});

describe('Config', () => {
  it('API_URL is defined', () => {
    const { API_URL } = require('../config');
    expect(API_URL).toBeDefined();
    expect(API_URL).toContain('http://');
  });
});
