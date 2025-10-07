// Premiações e certificações (clean-room)
export function maybeGiveAwards(state) {
  const week = state.week || 0;
  const albums = state.albums || [];
  const candidates = albums.filter(a => (a.stats?.lastWeekSales || 0) > 0);
  const out = [];
  for (const a of candidates) {
    const score = (a.stats.sales || 0) * 0.0001 + (a.chartPeak ? (100 - a.chartPeak) * 0.5 : 0);
    if (score > 5) out.push({ type: 'award', albumId: a.id, week });
  }
  state.events = (state.events || []).concat(out);
  return out;
}

export function tick(state) { maybeGiveAwards(state); }

export default { maybeGiveAwards, tick };
