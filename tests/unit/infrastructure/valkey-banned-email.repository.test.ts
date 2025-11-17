import { ValkeyContainer } from '@testcontainers/valkey';
import { GlideClient } from '@valkey/valkey-glide';
import { ValkeyBannedEmailRepository } from '../../../src/infrastructure/repositories/valkey-banned-email.repository.js';

/**
 * Unit Tests: ValkeyBannedEmailRepository
 *
 * Tests the ValkeyBannedEmailRepository implementation using TestContainers
 * to verify it correctly implements the BannedEmailRepository contract.
 *
 * Uses real Valkey instance (via Docker) to ensure correctness of:
 * - Data persistence in Valkey
 * - Case-insensitive email handling
 * - Set operations (add, remove, check membership)
 */
describe('ValkeyBannedEmailRepository', () => {
  let container: ValkeyContainer;
  let valkey: GlideClient;
  let repository: ValkeyBannedEmailRepository;

  beforeAll(async () => {
    // Start Valkey container
    container = new ValkeyContainer();
    const startedContainer = await container.start();

    // Connect to Valkey
    valkey = await GlideClient.createClient({
      addresses: [
        {
          host: startedContainer.getHost(),
          port: startedContainer.getPort(),
        },
      ],
    });

    repository = new ValkeyBannedEmailRepository(valkey);
  });

  afterAll(async () => {
    // Cleanup
    if (valkey) {
   //   await valkey.disconnect();
    }
    if (container) {
     // await container.stop();
    }
  });

  beforeEach(async () => {
    // Clear before each test
    await repository.clear();
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
