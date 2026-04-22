const Storage = (() => {
  const API = '/api';
  const LS  = { SETTINGS: 'ttp_settings' };

  const req = async (method, path, body) => {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body !== undefined) opts.body = JSON.stringify(body);
    const res  = await fetch(`${API}${path}`, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status });
    return data;
  };

  return {
    async getPlayer(username) {
      try { return await req('GET', `/players/${encodeURIComponent(username)}`); }
      catch { return null; }
    },

    async getAllPlayers() {
      try { return await req('GET', '/players'); }
      catch { return []; }
    },

    async getAllGames(username, limit = 200) {
      try {
        const qs = username
          ? `?username=${encodeURIComponent(username)}&limit=${limit}`
          : `?limit=${limit}`;
        return await req('GET', `/games${qs}`);
      } catch { return []; }
    },

    async saveGame(game) {
      try { return await req('POST', '/games', game); }
      catch (e) { console.error('saveGame:', e.message); return null; }
    },

    async getGlobalStats() {
      try { return await req('GET', '/games/stats'); }
      catch { return { totalPlayers: 0, totalGames: 0, xWins: 0, oWins: 0, draws: 0, topRating: 1200 }; }
    },

    getSettings() {
      try { return JSON.parse(localStorage.getItem(LS.SETTINGS) || 'null') || { theme: 'dark' }; }
      catch { return { theme: 'dark' }; }
    },
    saveSettings(s) {
      localStorage.setItem(LS.SETTINGS, JSON.stringify({ ...this.getSettings(), ...s }));
    },
  };
})();
