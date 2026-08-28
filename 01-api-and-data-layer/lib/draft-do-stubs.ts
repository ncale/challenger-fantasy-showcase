// Minimal RPC surface this API layer calls on the draft Durable Objects.
// The full class implementations live in 03-realtime-draft-engine/.
export interface DraftServerStub {
  getGameId(): Promise<string | null>;
}
