// Redes sociais (clean-room)
export function postSocial(state, platform, topic, quality) {
  const baseAudience = (state.fans || 0);
  const ctr = Math.min(1, Math.max(0, 0.02 + (quality || 0) * 0.01));
  const freshness = 1.0; // simplificação; ajustar com cooldown
  const impact = Math.round(baseAudience * ctr * freshness);
  const post = { id: cryptoRandomId(), platform, topic, quality, week: state.week || 0, impact };
  state.social = state.social || [];
  state.social.push(post);
  state.fans = (state.fans || 0) + Math.round(impact * 0.1);
  return post;
}

export function tick(state) {
  // Decaimento de impacto, limpeza de posts muito antigos etc.
}

export function cryptoRandomId() {
  return 'sp_' + Math.random().toString(36).slice(2);
}

export default { postSocial, tick };
