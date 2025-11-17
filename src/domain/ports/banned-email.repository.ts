/**
 * BannedEmailRepository Port - Domain Port (Interface)
 *
 * This port defines the contract for accessing a banned email list.
 * It abstracts the storage mechanism (Valkey, database, file, etc.)
 * allowing the domain to remain independent of infrastructure.
 *
 * This follows the Repository Pattern and Hexagonal Architecture principles.
 */
export interface BannedEmailRepository {
  /**
   * Check if an email is in the banned list
   *
   * @param email - The email address to check
   * @returns Promise<boolean> - true if email is banned, false otherwise
   */
  isBanned(email: string): Promise<boolean>;

  /**
   * Add an email to the banned list
   *
   * @param email - The email address to ban
   * @returns Promise<void>
   */
  ban(email: string): Promise<void>;

  /**
   * Remove an email from the banned list
   *
   * @param email - The email address to unban
   * @returns Promise<void>
   */
  unban(email: string): Promise<void>;

  /**
   * Get all banned emails
   *
   * @returns Promise<string[]> - Array of banned email addresses
   */
  getAllBanned(): Promise<string[]>;

  /**
   * Clear all banned emails
   *
   * @returns Promise<void>
   */
  clear(): Promise<void>;
}
