// Tours (clean-room)
export function planTour(cities) {
  return { id: 'tour_' + Math.random().toString(36).slice(2), cities, schedule: [], cost: 0, revenue: 0, risk: 0 };
}

export function tick(state) {
  const tours = state.tours || [];
  for (const t of tours) {
    const city = t.cities?.[0];
    if (!city) continue;
    const popularity = (state.cityPopularity?.[city] || 0.5);
    const capacity = 5000;
    const revenue = popularity * capacity * (state.prices?.ticket || 20);
    const cost = capacity * 5;
    t.revenue += revenue; t.cost += cost;
    state.cash = (state.cash || 0) + (revenue - cost);
  }
}

export default { planTour, tick };
