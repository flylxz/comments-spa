type CaptchaEntry = {
  answer: string;
  expiresAt: number;
};

export class CaptchaStore {
  private readonly entries = new Map<string, CaptchaEntry>();

  constructor(private readonly ttlMs: number) {}

  set(id: string, answer: string): void {
    this.entries.set(id, {
      answer,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  get(id: string): string | null {
    const entry = this.entries.get(id);

    if (entry === undefined) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.entries.delete(id);
      return null;
    }

    return entry.answer;
  }

  delete(id: string): void {
    this.entries.delete(id);
  }
}
