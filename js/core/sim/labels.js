// Gravadoras e contratos (clean-room)
export function applyContractObligations(state) {
  const c = state.labelContract;
  if (!c) return;
  c.weeksElapsed = (c.weeksElapsed || 0) + 1;
  if (c.minReleases && (state.albums?.length || 0) < (c.minReleases || 0) * (c.weeksElapsed / (c.termWeeks || 1))) {
    state.events = (state.events || []).concat({ type: 'contract-warning', week: state.week || 0 });
  }
}

export function computeRoyaltyPayouts(state) {
  const c = state.labelContract; if (!c) return 0;
  const rate = Math.min(1, Math.max(0, c.royalty || 0.15));
  const gross = (state.albums || []).reduce((s, a) => s + (a.stats?.lastWeekSales || 0) * (state.prices?.unit || 1), 0);
  const payout = gross * rate;
  state.cash = (state.cash || 0) + (gross - payout);
  state.events = (state.events || []).concat({ type: 'royalty', amount: payout, week: state.week || 0 });
  return payout;
}

export default { applyContractObligations, computeRoyaltyPayouts };
