import { InMemoryBannedEmailRepository } from '../../../src/infrastructure/repositories/in-memory-banned-email.repository.js';

/**
 * Unit Tests: InMemoryBannedEmailRepository
 *
 * Verifies that InMemoryBannedEmailRepository behaves identically to
 * ValkeyBannedEmailRepository. Both should pass the same tests.
 */
describe('InMemoryBannedEmailRepository', () => {
  let repository: InMemoryBannedEmailRepository;

  beforeEach(() => {
    repository = new InMemoryBannedEmailRepository();
  });

  describe('ban & isBanned', () => {
    it('should ban and check emails', async () => {
      await repository.ban('spammer@example.com');
      expect(await repository.isBanned('spammer@example.com')).toBe(true);
    });

    it('should return false for non-banned emails', async () => {
      expect(await repository.isBanned('user@example.com')).toBe(false);
    });

    it('should be case-insensitive', async () => {
      await repository.ban('Spammer@Example.COM');
      expect(await repository.isBanned('spammer@example.com')).toBe(true);
      expect(await repository.isBanned('SPAMMER@EXAMPLE.COM')).toBe(true);
    });

    it('should be idempotent when banning', async () => {
      await repository.ban('spam@example.com');
      await repository.ban('spam@example.com');
      expect(await repository.isBanned('spam@example.com')).toBe(true);
    });
  });

  describe('unban', () => {
    it('should remove banned emails', async () => {
      await repository.ban('spammer@example.com');
      await repository.unban('spammer@example.com');
      expect(await repository.isBanned('spammer@example.com')).toBe(false);
    });

    it('should handle unbanning non-existent emails', async () => {
      await expect(repository.unban('nonexistent@example.com')).resolves.not.toThrow();
    });

    it('should be case-insensitive', async () => {
      await repository.ban('Spammer@Example.COM');
      await repository.unban('spammer@example.com');
      expect(await repository.isBanned('SPAMMER@EXAMPLE.COM')).toBe(false);
    });
  });

  describe('getAllBanned', () => {
    it('should return empty array initially', async () => {
      expect(await repository.getAllBanned()).toEqual([]);
    });

    it('should return all banned emails in lowercase', async () => {
      await repository.ban('Spam1@Example.COM');
      await repository.ban('spam2@example.com');
      
      const allBanned = await repository.getAllBanned();
      expect(allBanned).toHaveLength(2);
      expect(allBanned).toEqual(expect.arrayContaining([
        'spam1@example.com',
        'spam2@example.com',
      ]));
    });

    it('should not include duplicates', async () => {
      await repository.ban('spam@example.com');
      await repository.ban('SPAM@EXAMPLE.COM');
      
      expect(await repository.getAllBanned()).toHaveLength(1);
    });

    it('should reflect unban operations', async () => {
      await repository.ban('spam1@example.com');
      await repository.ban('spam2@example.com');
      await repository.unban('spam1@example.com');
      
      const allBanned = await repository.getAllBanned();
      expect(allBanned).toHaveLength(1);
      expect(allBanned).toContain('spam2@example.com');
    });
  });

  describe('clear', () => {
    it('should remove all banned emails', async () => {
      await repository.ban('spam1@example.com');
      await repository.ban('spam2@example.com');
      await repository.clear();
      
      expect(await repository.getAllBanned()).toHaveLength(0);
    });

    it('should allow banning after clear', async () => {
      await repository.ban('spam1@example.com');
      await repository.clear();
      await repository.ban('spam2@example.com');
      
      expect(await repository.getAllBanned()).toContain('spam2@example.com');
    });
  });


});
