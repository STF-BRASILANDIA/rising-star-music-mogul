// Charts e KPIs (clean-room)
export function computeRank(items, metric, smooth = 0) {
  const arr = items.map(x => ({ item: x, v: (metric(x) || 0) * 1.0 + smooth }));
  arr.sort((a, b) => b.v - a.v);
  arr.forEach((e, i) => { e.item.chartRank = i + 1; e.item.chartPeak = Math.min(e.item.chartPeak || Infinity, e.item.chartRank); });
  return arr.map(e => e.item);
}

export default { computeRank };
