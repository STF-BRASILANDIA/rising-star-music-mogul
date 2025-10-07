// Economia utilitária (clean-room)
export function applyCash(state, delta) { state.cash = (state.cash || 0) + (delta || 0); return state.cash; }
export default { applyCash };
