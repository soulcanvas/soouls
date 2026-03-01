/**
 * Namespace: public
 * API:        health
 * Route:      ping — run
 *
 * This is the handler called after validation passes.
 * It receives the typed, validated input and returns the response.
 */
import type { Input } from './constants.js';

export function run(input: Input): { greeting: string; timestamp: string } {
  return {
    greeting: `Hello ${input.name}! SoulCanvas API is healthy.`,
    timestamp: new Date().toISOString(),
  };
}
