const GitTrackStore = {
  keys: {
    history: 'gittrack-search-history',
    favorites: 'gittrack-favorites',
    bookmarks: 'gittrack-repository-bookmarks',
    recentRepos: 'gittrack-recent-repositories'
  },

  read(key, fallback = []) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  },

  write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  addHistory(profile) {
    const history = this.read(this.keys.history);
    const next = history.filter((item) => item.login !== profile.login);
    next.unshift({
      login: profile.login,
      name: profile.name || profile.login,
      avatar_url: profile.avatar_url,
      followers: profile.followers || 0,
      searchedAt: new Date().toISOString()
    });
    this.write(this.keys.history, next.slice(0, 30));
  },

  getHistory() {
    return this.read(this.keys.history);
  },

  removeHistory(login) {
    this.write(this.keys.history, this.getHistory().filter((item) => item.login !== login));
  },

  clearHistory() {
    localStorage.removeItem(this.keys.history);
  },

  getFavorites() {
    return this.read(this.keys.favorites);
  },

  isFavorite(login) {
    return this.getFavorites().some((item) => item.login === login);
  },

  toggleFavorite(profile) {
    const favorites = this.getFavorites();
    const exists = favorites.some((item) => item.login === profile.login);
    const next = exists
      ? favorites.filter((item) => item.login !== profile.login)
      : [{ ...profile, savedAt: new Date().toISOString() }, ...favorites];
    this.write(this.keys.favorites, next);
    return !exists;
  },

  clearFavorites() {
    localStorage.removeItem(this.keys.favorites);
  },

  getBookmarks() {
    return this.read(this.keys.bookmarks);
  },

  isBookmarked(fullName) {
    return this.getBookmarks().some((item) => item.full_name === fullName);
  },

  toggleBookmark(repo) {
    const bookmarks = this.getBookmarks();
    const exists = bookmarks.some((item) => item.full_name === repo.full_name);
    const next = exists
      ? bookmarks.filter((item) => item.full_name !== repo.full_name)
      : [{ ...repo, bookmarkedAt: new Date().toISOString() }, ...bookmarks];
    this.write(this.keys.bookmarks, next);
    return !exists;
  },

  addRecentRepository(repo) {
    const repos = this.read(this.keys.recentRepos);
    const next = repos.filter((item) => item.full_name !== repo.full_name);
    next.unshift({
      full_name: repo.full_name,
      name: repo.name,
      language: repo.language,
      stargazers_count: repo.stargazers_count || 0,
      html_url: repo.html_url,
      viewedAt: new Date().toISOString()
    });
    this.write(this.keys.recentRepos, next.slice(0, 20));
  },

  getRecentRepositories() {
    return this.read(this.keys.recentRepos);
  }
};

window.GitTrackStore = GitTrackStore;
