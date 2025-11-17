import { BannedEmailRepository } from '../../domain/ports/banned-email.repository.js';
import { GlideClient } from '@valkey/valkey-glide';

/**
 * ValkeyBannedEmailRepository - Infrastructure Adapter
 *
 * This adapter implements the BannedEmailRepository port using Valkey (Redis-compatible)
 * as the storage mechanism.
 *
 * It demonstrates:
 * - Repository Pattern: Abstracting data access
 * - Hexagonal Architecture: Infrastructure adapter for domain port
 * - Dependency Injection: Valkey client injected via constructor
 *
 * Data Structure:
 * - Uses a Valkey Set to store banned emails
 * - Key: 'banned:emails' (configurable)
 * - Members: email addresses
 */
export class ValkeyBannedEmailRepository implements BannedEmailRepository {
  private readonly setKey: string;

  constructor(
    private readonly valkey: GlideClient,
    setKey: string = 'banned:emails'
  ) {
    this.setKey = setKey;
  }

  async isBanned(email: string): Promise<boolean> {
    const result = await this.valkey.sismember(this.setKey, email.toLowerCase());

    return !!result;
  }

  async ban(email: string): Promise<void> {
    await this.valkey.sadd(this.setKey, [email.toLowerCase()]);
  }

  async unban(email: string): Promise<void> {
    await this.valkey.srem(this.setKey, [email.toLowerCase()]);
  }

  async getAllBanned(): Promise<string[]> {
    const members = await this.valkey.smembers(this.setKey);
    return Array.from(members)
      .filter((email): email is string => typeof email === 'string')
      .map((email) => email.toLowerCase());
  }

  async clear(): Promise<void> {
    await this.valkey.del([this.setKey]);
  }
}
