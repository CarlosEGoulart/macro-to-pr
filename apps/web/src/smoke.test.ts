import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('vitest + jsdom está funcionando', () => {
    expect(document).toBeDefined();
    expect(1 + 1).toBe(2);
  });
});
