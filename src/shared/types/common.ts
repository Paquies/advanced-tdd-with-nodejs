// Common types used across the application

export interface Entity<T> {
  readonly id: T;
  equals(entity: Entity<T>): boolean;
}

export abstract class ValueObject<T> {
  protected readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  public getValue(): T {
    return this.value;
  }

  public equals(other: ValueObject<T>): boolean {
    return JSON.stringify(this.value) === JSON.stringify(other.value);
  }
}



