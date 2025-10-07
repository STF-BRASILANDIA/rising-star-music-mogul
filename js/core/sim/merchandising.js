// Merchandising (clean-room)
export function weeklyMerch(state) {
  const items = state.merch || [];
  let profit = 0;
  for (const m of items) {
    const demand = Math.max(0, (state.fans || 0) * 0.001 + (state.tourBoost || 0));
    const sold = Math.min(demand, m.stock ?? demand);
    const unitProfit = Math.max(0, (m.price || 0) - (m.cost || 0));
    profit += sold * unitProfit;
    if (m.stock != null) m.stock = Math.max(0, m.stock - sold);
  }
  state.cash = (state.cash || 0) + profit;
  return profit;
}

export default { weeklyMerch };
