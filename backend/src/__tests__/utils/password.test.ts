import { hashPassword, comparePassword } from '../../utils/password';

describe('Password Utils', () => {
  const testPassword = 'TestPassword123!';

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const hashedPassword = await hashPassword(testPassword);
      
      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword).not.toBe(testPassword);
      expect(hashedPassword.length).toBeGreaterThan(20);
    });

    it('should generate different hashes for the same password', async () => {
      const hash1 = await hashPassword(testPassword);
      const hash2 = await hashPassword(testPassword);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const hashedPassword = await hashPassword(testPassword);
      const result = await comparePassword(testPassword, hashedPassword);
      
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const hashedPassword = await hashPassword(testPassword);
      const result = await comparePassword('WrongPassword', hashedPassword);
      
      expect(result).toBe(false);
    });

    it('should handle empty password', async () => {
      const hashedPassword = await hashPassword(testPassword);
      const result = await comparePassword('', hashedPassword);
      
      expect(result).toBe(false);
    });
  });
});