// YouTube / Mídia (clean-room)
export function uploadVideo(state, topic, productionQuality) {
  const ctr = 0.03 + (productionQuality || 0) * 0.015;
  const audience = (state.fans || 0) + (state.reputation || 0) * 100;
  const watchTime = Math.max(0, (productionQuality || 0) * 0.6);
  const trending = trendingScore(state, ctr, watchTime);
  const views = Math.round(audience * ctr * (1 + trending));
  const likes = Math.round(views * 0.08);
  const video = { id: ytId(), topic, week: state.week || 0, productionQuality, views, likes };
  state.youtube = state.youtube || [];
  state.youtube.push(video);
  return video;
}

export function trendingScore(state, ctr, watchTime) {
  const novelty = 0.5; // simplificado
  const velocity = 0.5 * ctr + 0.5 * watchTime;
  return Math.max(0, novelty + velocity);
}

export function tick(state) {
  // Atualizações de retenção/engajamento semanais se necessário
}

function ytId() { return 'yt_' + Math.random().toString(36).slice(2); }

export default { uploadVideo, trendingScore, tick };
