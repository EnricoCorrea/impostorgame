const phaseTimers = new Map<number, ReturnType<typeof setTimeout>>();
const phaseExpirations = new Map<number, number>();

export function setPhaseExpiration(
  gameId: number,
  expiresAt: number,
  timer: ReturnType<typeof setTimeout>,
) {
  clearPhaseExpiration(gameId);
  phaseExpirations.set(gameId, expiresAt);
  phaseTimers.set(gameId, timer);
}

export function clearPhaseExpiration(gameId: number) {
  const timer = phaseTimers.get(gameId);
  if (timer) {
    clearTimeout(timer);
  }

  phaseTimers.delete(gameId);
  phaseExpirations.delete(gameId);
}

export function getPhaseExpiration(gameId: number): number | undefined {
  return phaseExpirations.get(gameId);
}

export function hasPhaseExpired(gameId: number): boolean {
  const expiresAt = phaseExpirations.get(gameId);
  return expiresAt != null && Date.now() > expiresAt;
}
