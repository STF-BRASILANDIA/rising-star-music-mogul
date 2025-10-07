// Streaming platforms (clean-room)
// Distribui streams semanalmente por plataforma considerando pesos, CTR e trending.

export function distributeWeeklyStreams(state) {
  const week = state.week || 0;
  const platforms = state.streamingPlatforms || defaultPlatforms();
  const releases = (state.albums || []).flatMap(a => a.tracks || []);
  const baseAudience = (state.fans || 0) * 10 + (state.reputation || 0) * 1000;

  for (const p of platforms) {
    const weight = Math.max(0, p.weight || 1);
    const ctr = Math.max(0, p.ctr || 0.03);
    const trending = Math.max(0, p.trending || 0);
    const audience = baseAudience * weight * (1 + trending);
    const views = Math.round(audience * ctr);
    p.weekly = { week, streams: views };
    p.total = (p.total || 0) + views;

    // Atribuir streams às faixas recentes
    const recent = releases.filter(t => (week - (t.releaseWeek || week)) <= 12);
    const per = Math.max(1, Math.floor(views / Math.max(1, recent.length)));
    for (const t of recent) {
      t.stats = t.stats || {}; t.stats.streams = (t.stats.streams || 0) + per;
    }
  }
  state.streamingPlatforms = platforms;
  return platforms;
}

export function defaultPlatforms() {
  return [
    { id: 'streamify', name: 'Streamify', weight: 1.0, ctr: 0.035 },
    { id: 'peach', name: 'Peach Music', weight: 0.7, ctr: 0.03 },
    { id: 'megazon', name: 'Megazon Music', weight: 0.6, ctr: 0.028 },
    { id: 'youmusic', name: 'YouMusic', weight: 0.9, ctr: 0.033 },
    { id: 'pandora', name: "Pandora's Box", weight: 0.5, ctr: 0.02 },
    { id: 'kazaam', name: 'Kazaam', weight: 0.4, ctr: 0.022 },
    { id: 'musiccloud', name: 'MusicCloud', weight: 0.4, ctr: 0.02 },
  ];
}

export default { distributeWeeklyStreams, defaultPlatforms };
