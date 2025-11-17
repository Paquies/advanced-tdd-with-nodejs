import { ValkeyContainer } from '@testcontainers/valkey';
import { GlideClient } from '@valkey/valkey-glide';
import { ValkeyBannedEmailRepository } from '../../../src/infrastructure/repositories/valkey-banned-email.repository.js';
import { RepositoryAntiSpamAdapter } from '../../../src/infrastructure/external-services/repository-anti-spam.adapter.js';

/**
 * Integration Tests: ValkeyAntiSpamAdapter with TestContainers
 *
 * These tests verify the complete flow:
 * 1. TestContainers spins up a real Valkey instance in Docker
 * 2. ValkeyBannedEmailRepository connects to it
 * 3. ValkeyAntiSpamAdapter uses the repository
 * 4. Tests verify anti-spam functionality against real Valkey
 *
 * This is a true integration test, not a unit test.
 * It tests the adapter against real infrastructure.
 */
describe('RepositoryAntiSpamAdapter Integration Tests with Valkey', () => {
  let container: ValkeyContainer;
  let valkey: GlideClient;
  let repository: ValkeyBannedEmailRepository;
  let adapter: RepositoryAntiSpamAdapter;

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

    // Create repository and adapter
    repository = new ValkeyBannedEmailRepository(valkey);
    adapter = new RepositoryAntiSpamAdapter(repository);
  });

  afterAll(async () => {
    // Cleanup
    if (valkey) {
     // clean up should be done, testContainer(s) should be stopped; ask AI how to do it
    }

  });

  beforeEach(async () => {
    // Clear banned emails before each test
    await repository.clear();
  });

  describe('BannedEmailRepository', () => {
    it('should add an email to the banned list', async () => {
      const email = 'spammer@example.com';

      await repository.ban(email);

      const isBanned = await repository.isBanned(email);
      expect(isBanned).toBe(true);
    });

    it('should check if an email is banned', async () => {
      const bannedEmail = 'blocked@example.com';
      const allowedEmail = 'user@example.com';

      await repository.ban(bannedEmail);

      expect(await repository.isBanned(bannedEmail)).toBe(true);
      expect(await repository.isBanned(allowedEmail)).toBe(false);
    });

    it('should remove an email from the banned list', async () => {
      const email = 'spammer@example.com';

      await repository.ban(email);
      expect(await repository.isBanned(email)).toBe(true);

      await repository.unban(email);
      expect(await repository.isBanned(email)).toBe(false);
    });

    it('should get all banned emails', async () => {
      const emails = ['spam1@example.com', 'spam2@example.com', 'spam3@example.com'];

      for (const email of emails) {
        await repository.ban(email);
      }

      const allBanned = await repository.getAllBanned();
      expect(allBanned).toHaveLength(3);
      expect(allBanned).toEqual(expect.arrayContaining(emails));
    });

    it('should clear all banned emails', async () => {
      const emails = ['spam1@example.com', 'spam2@example.com'];

      for (const email of emails) {
        await repository.ban(email);
      }

      await repository.clear();

      const allBanned = await repository.getAllBanned();
      expect(allBanned).toHaveLength(0);
    });

    it('should handle email case-insensitivity', async () => {
      const email = 'Spammer@Example.COM';

      await repository.ban(email);

      expect(await repository.isBanned('spammer@example.com')).toBe(true);
      expect(await repository.isBanned('SPAMMER@EXAMPLE.COM')).toBe(true);
      expect(await repository.isBanned(email)).toBe(true);
    });
  });

  describe('ValkeyAntiSpamAdapter', () => {
    it('should block emails in the banned list', async () => {
      const email = 'spammer@example.com';

      await repository.ban(email);

      const isBlocked = await adapter.isBlocked(email);
      expect(isBlocked).toBe(true);
    });

    it('should allow emails not in the banned list', async () => {
      const email = 'user@example.com';

      const isBlocked = await adapter.isBlocked(email);
      expect(isBlocked).toBe(false);
    });

    it('should handle multiple banned emails', async () => {
      const bannedEmails = ['spam1@example.com', 'spam2@example.com'];
      const allowedEmails = ['user1@example.com', 'user2@example.com'];

      for (const email of bannedEmails) {
        await repository.ban(email);
      }

      for (const email of bannedEmails) {
        expect(await adapter.isBlocked(email)).toBe(true);
      }

      for (const email of allowedEmails) {
        expect(await adapter.isBlocked(email)).toBe(false);
      }
    });


  });

  describe('End-to-End Workflow', () => {
    it('should manage banned emails through the complete flow', async () => {
      const email1 = 'attacker@example.com';
      const email2 = 'legitimate@example.com';

      // Initially, both emails are allowed
      expect(await adapter.isBlocked(email1)).toBe(false);
      expect(await adapter.isBlocked(email2)).toBe(false);

      // Ban the attacker
      await repository.ban(email1);

      // Now attacker is blocked, legitimate is still allowed
      expect(await adapter.isBlocked(email1)).toBe(true);
      expect(await adapter.isBlocked(email2)).toBe(false);

      // Unban the attacker
      await repository.unban(email1);

      // Now both are allowed again
      expect(await adapter.isBlocked(email1)).toBe(false);
      expect(await adapter.isBlocked(email2)).toBe(false);
    });

    it('should persist data across multiple adapter calls', async () => {
      const email = 'persistent@example.com';

      // Ban email
      await repository.ban(email);

      // Create new adapter instance (simulating app restart)
      const newAdapter = new RepositoryAntiSpamAdapter(repository);

      // Data should still be there
       expect(await newAdapter.isBlocked(email)).toBe(true);

      // verify with getAllBanned
      expect(await repository.getAllBanned()).toContain(email);

    });
  });
});
