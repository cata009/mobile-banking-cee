export function createRoboTradeEventId() {
  return `robo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
