// Estúdio e produção de faixas (clean-room)
export function produceTrack(musician, studioLevel = 1) {
  const talent = (musician?.attributes?.talent || 0);
  const creativity = (musician?.attributes?.creativity || 0);
  const rng = Math.random() * 10;
  const quality = Math.round((talent * 0.6 + creativity * 0.4) * 0.1 + studioLevel * 2 + rng);
  return { id: 'trk_' + Math.random().toString(36).slice(2), title: 'New Track', quality, genre: 'pop', stats: {} };
}

export default { produceTrack };
