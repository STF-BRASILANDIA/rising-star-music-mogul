// Eventos gerais (clean-room)
export function process(state) {
  const now = state.week || 0;
  state.events = (state.events || []).filter(e => {
    if (e.expiresWeek && e.expiresWeek < now) return false;
    // Aplicar efeitos se for da semana
    if (e.week === now && e.apply) e.apply(state);
    return true;
  });
}

export default { process };
