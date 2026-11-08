const GITHUB_API_BASE = 'https://api.github.com';

const Api = {
  async fetchJson(url, options = {}) {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(options.headers || {})
      },
      ...options
    });

    if (!response.ok) {
      const errorText = await response.text();
      let message = `GitHub request failed (${response.status}).`;

      try {
        const payload = JSON.parse(errorText);
        if (payload && payload.message) {
          message = payload.message;
        }
      } catch (error) {
        // Ignore parse failures and use fallback message.
      }

      throw new Error(message);
    }

    return response.json();
  },

  async getUser(username) {
    return this.fetchJson(`${GITHUB_API_BASE}/users/${encodeURIComponent(username)}`);
  },

  async getRepos(username) {
    return this.fetchJson(`${GITHUB_API_BASE}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`);
  },

  async getEvents(username) {
    return this.fetchJson(`${GITHUB_API_BASE}/users/${encodeURIComponent(username)}/events/public`);
  },

  async searchRepositories(query, options = {}) {
    const sort = options.sort || 'stars';
    const order = options.order || 'desc';
    const params = new URLSearchParams({ q: query || 'stars:>0', sort, order, per_page: '30' });
    return this.fetchJson(`${GITHUB_API_BASE}/search/repositories?${params.toString()}`);
  },

  async getRateLimit() {
    return this.fetchJson(`${GITHUB_API_BASE}/rate_limit`);
  }
};
