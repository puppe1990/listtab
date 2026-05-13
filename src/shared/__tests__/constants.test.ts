import { describe, it, expect } from 'vitest';
import { formatSessionName, generateId } from '../constants';

describe('constants', () => {
  describe('formatSessionName', () => {
    it('should format a date into session name', () => {
      const date = new Date('2026-05-13T15:30:00');
      const name = formatSessionName(date);
      expect(name).toContain('2026');
      expect(name).toContain('May');
      expect(name).toContain('13');
    });

    it('should produce unique names for different dates', () => {
      const name1 = formatSessionName(new Date('2026-05-13T10:00:00'));
      const name2 = formatSessionName(new Date('2026-05-14T10:00:00'));
      expect(name1).not.toBe(name2);
    });
  });

  describe('generateId', () => {
    it('should generate a string', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate unique ids', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateId()));
      expect(ids.size).toBe(100);
    });
  });
});
