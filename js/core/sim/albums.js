// Álbuns: demanda, vendas e certificações (clean-room)
export function demandAt(base, decay, t, marketingPulse = 0) {
  const exp = Math.exp(-Math.max(0, decay) * Math.max(0, t));
  return Math.max(0, base * exp + (marketingPulse || 0));
}

export function computeWeeklySales(album, week, ctx) {
  const t = week - (album.releaseWeek || week);
  const demand = demandAt(album.demandBase || 0, album.decay || 0.2, t, ctx?.marketingPulse?.(album, week) || 0);
  const physical = Math.min(demand, album.stock ?? 0);
  const digital = Math.max(0, demand - physical);
  const sold = physical + digital;
  if (album.stock != null) album.stock = Math.max(0, (album.stock || 0) - physical);
  album.stats = album.stats || {}; 
  album.stats.sales = (album.stats.sales || 0) + sold;
  album.stats.lastWeekSales = sold;
  return sold;
}

export function checkCertifications(album, regions) {
  const out = [];
  const sales = album.stats?.sales || 0;
  for (const [region, tiers] of Object.entries(regions || {})) {
    for (const [name, threshold] of Object.entries(tiers)) {
      if (!album.certifications?.includes?.(`${region}:${name}`) && sales >= threshold) {
        album.certifications = album.certifications || [];
        album.certifications.push(`${region}:${name}`);
        out.push({ region, name, sales });
      }
    }
  }
  return out;
}

export function tick(state) {
  const week = state.week || 0;
  const regions = state.config?.certifications || {};
  (state.albums || []).forEach(a => {
    computeWeeklySales(a, week, state);
    checkCertifications(a, regions);
  });
}

export default { demandAt, computeWeeklySales, checkCertifications, tick };
