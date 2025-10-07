// Scheduler semanal (clean-room)
/**
 * @typedef {Object} GameState
 * @property {number} week
 * @property {Array<any>} events
 * @property {Array<any>} albums
 * @property {Array<any>} tours
 * @property {Array<any>} social
 */

/** Avança uma semana e processa os sistemas */
export function simulateWeek(state, systems) {
  const next = { ...state, week: (state.week || 0) + 1 };
  systems?.events?.process?.(next);
  systems?.albums?.tick?.(next);
  systems?.tours?.tick?.(next);
  systems?.social?.tick?.(next);
  systems?.awards?.tick?.(next);
  return next;
}

/** Agenda um evento */
export function scheduleEvent(state, event) {
  const events = Array.isArray(state.events) ? state.events.slice() : [];
  events.push(event);
  return { ...state, events };
}
