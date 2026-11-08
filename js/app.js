const APP_STATE = {
  currentUsername: '',
  profile: null,
  repos: [],
  events: [],
  lastSearch: ''
};

window.APP_STATE = APP_STATE;

const HISTORY_KEY = 'gittrack';

const app = {
  init() {
    Theme.init();
    Dashboard.mount();
    this.bindEvents();
    this.bindSearchSuggestions();
    this.initCharts();
    this.initializeHistory();
  },

  bindEvents() {
    const formIds = ['welcomeSearchForm', 'navSearchForm'];

    formIds.forEach((formId) => {
      const form = document.getElementById(formId);
      if (!form) return;

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = form.querySelector('input');
        if (!input) return;
        const username = input.value.trim();
        this.searchUser(username);
      });
    });

    const repoFilter = document.getElementById('repoFilter');
    if (repoFilter) {
      repoFilter.addEventListener('change', () => {
        Repositories.applyFilter();
        this.syncHistoryControls();
      });
    }

    const repoSearchInput = document.getElementById('repoSearchInput');
    if (repoSearchInput) {
      repoSearchInput.addEventListener('input', () => {
        Repositories.applyFilter();
        this.syncHistoryControls();
      });
    }

    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        Repositories.loadMore();
        this.syncHistoryControls();
      });
    }

    const backButton = document.getElementById('backButton');
    if (backButton) {
      backButton.addEventListener('click', () => this.goBack());
    }

    const homeButton = document.getElementById('homeButton');
    if (homeButton) {
      homeButton.addEventListener('click', () => this.goHome());
    }

    window.addEventListener('popstate', (event) => {
      this.restoreHistoryState(event.state);
    });

    document.addEventListener('theme-change', () => {
      if (Charts.languageChart) {
        Charts.applyTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
      }
    });
  },

  bindSearchSuggestions() {
    document.querySelectorAll('.suggestion-chip').forEach((button) => {
      button.addEventListener('click', () => {
        const username = button.dataset.username;
        if (!username) return;
        const welcomeInput = document.getElementById('welcomeUsernameInput');
        const navInput = document.getElementById('navUsernameInput');

        if (welcomeInput) welcomeInput.value = username;
        if (navInput) navInput.value = username;
        this.searchUser(username);
      });
    });
  },

  initCharts() {
    Charts.init();
  },

  initializeHistory() {
    const currentState = window.history.state;
    if (currentState?.gittrack === HISTORY_KEY && currentState.view === 'profile' && currentState.profile) {
      this.restoreHistoryState(currentState);
      return;
    }

    if (!currentState || currentState.gittrack !== HISTORY_KEY) {
      window.history.replaceState({ gittrack: HISTORY_KEY, view: 'home' }, '', this.homeUrl());
    }

    const params = new URLSearchParams(window.location.search);
    const initialView = params.get('view');
    if (initialView && ['dashboard', 'explore', 'compare', 'repositories', 'favorites', 'history', 'settings'].includes(initialView)) {
      window.history.replaceState({ gittrack: HISTORY_KEY, view: initialView }, '', `${window.location.pathname}?view=${initialView}`);
      Dashboard.showView(initialView, { fromHistory: true });
      return;
    }

    const queryUsername = params.get('user');
    if (queryUsername && queryUsername.trim()) {
      this.searchUser(queryUsername.trim(), { silent: true, historyMode: 'replace' });
    } else {
      Dashboard.showView('dashboard', { fromHistory: true });
    }
  },

  homeUrl() {
    return `${window.location.pathname}${window.location.hash || ''}`;
  },

  userUrl(username) {
    const params = new URLSearchParams({ user: username });
    return `${window.location.pathname}?${params.toString()}`;
  },

  captureHistoryState() {
    return {
      gittrack: HISTORY_KEY,
      view: 'profile',
      username: APP_STATE.currentUsername,
      profile: APP_STATE.profile,
      repos: APP_STATE.repos,
      events: APP_STATE.events,
      repoFilter: document.getElementById('repoFilter')?.value || 'all',
      repoSearch: document.getElementById('repoSearchInput')?.value || ''
    };
  },

  updateHistory(mode = 'push') {
    const method = mode === 'replace' ? 'replaceState' : 'pushState';
    window.history[method](this.captureHistoryState(), '', this.userUrl(APP_STATE.currentUsername));
  },

  syncHistoryControls() {
    if (window.history.state?.gittrack !== HISTORY_KEY || window.history.state.view !== 'profile') return;
    this.updateHistory('replace');
  },

  restoreHistoryState(state) {
    if (!state || state.gittrack !== HISTORY_KEY || state.view === 'home') {
      localStorage.removeItem('gittrack-last-search');
      Dashboard.showView('dashboard', { fromHistory: true });
      return;
    }

    if (state.view === 'profile' && state.profile) {
      this.renderDashboard(state);
      return;
    }

    if (['dashboard', 'explore', 'compare', 'repositories', 'favorites', 'history', 'settings'].includes(state.view)) {
      Dashboard.showView(state.view, { fromHistory: true });
      return;
    }

    Dashboard.showView('dashboard', { fromHistory: true });
  },

  renderDashboard(state) {
    const profile = state.profile;
    const repos = state.repos || [];
    const events = state.events || [];

    APP_STATE.currentUsername = state.username || profile.login || '';
    APP_STATE.lastSearch = APP_STATE.currentUsername;
    APP_STATE.profile = profile;
    APP_STATE.repos = repos;
    APP_STATE.events = events;

    const inputIds = ['welcomeUsernameInput', 'navUsernameInput'];
    inputIds.forEach((id) => {
      const input = document.getElementById(id);
      if (input) input.value = APP_STATE.currentUsername;
    });

    this.renderProfile(profile);
    this.renderStats(profile, repos);
    this.renderLanguageBreakdown(repos);
    this.renderRepoOverview(repos);
    Repositories.render(repos);
    this.renderActivity(events);

    const repoFilter = document.getElementById('repoFilter');
    const repoSearch = document.getElementById('repoSearchInput');
    if (repoFilter) repoFilter.value = state.repoFilter || 'all';
    if (repoSearch) repoSearch.value = state.repoSearch || '';
    Repositories.applyFilter();

    document.getElementById('welcomeSection')?.classList.add('hidden');
    document.getElementById('profileSection')?.classList.remove('hidden');
  },

  goBack() {
    if (window.history.state?.gittrack === HISTORY_KEY && window.history.state.view === 'profile') {
      window.history.back();
      return;
    }

    this.goHome();
  },

  goHome() {
    if (window.history.state?.gittrack === HISTORY_KEY && window.history.state.view === 'home') {
      Dashboard.showView('dashboard');
      return;
    }

    localStorage.removeItem('gittrack-last-search');
    window.history.pushState({ gittrack: HISTORY_KEY, view: 'home' }, '', this.homeUrl());
    Dashboard.showView('dashboard');
    document.getElementById('welcomeUsernameInput')?.focus();
  },

  renderWelcomeState() {
    const welcomeSection = document.getElementById('welcomeSection');
    const profileSection = document.getElementById('profileSection');
    if (welcomeSection && profileSection) {
      welcomeSection.classList.remove('hidden');
      profileSection.classList.add('hidden');
    }
  },

  async searchUser(username, options = {}) {
    const normalized = username.trim();
    if (!normalized) {
      this.showToast('Please enter a GitHub username to search.');
      return;
    }

    const inputIds = ['welcomeUsernameInput', 'navUsernameInput'];
    inputIds.forEach((id) => {
      const input = document.getElementById(id);
      if (input) input.value = normalized;
    });

    APP_STATE.currentUsername = normalized;
    APP_STATE.lastSearch = normalized;
    localStorage.setItem('gittrack-last-search', normalized);

    this.setLoadingState(true);

    try {
      const [profile, repos, events] = await Promise.all([
        Api.getUser(normalized),
        Api.getRepos(normalized),
        Api.getEvents(normalized)
      ]);

      APP_STATE.profile = profile;
      APP_STATE.repos = repos || [];
      APP_STATE.events = events || [];

      this.renderProfile(profile);
      this.renderStats(profile, repos || []);
      this.renderLanguageBreakdown(repos || []);
      this.renderRepoOverview(repos || []);
      Repositories.render(repos || []);
      this.renderActivity(events || []);

      document.getElementById('welcomeSection')?.classList.add('hidden');
      document.getElementById('profileSection')?.classList.remove('hidden');
      Dashboard.showView('profile');
      GitTrackStore.addHistory(profile);
      this.updateHistory(options.historyMode || 'push');

      if (!options.silent) {
        this.showToast(`Loaded profile for @${normalized}.`);
      }
    } catch (error) {
      this.handleError(error);
    } finally {
      this.setLoadingState(false);
    }
  },

  setLoadingState(isLoading) {
    const forms = ['welcomeSearchForm', 'navSearchForm'];
    forms.forEach((id) => {
      const form = document.getElementById(id);
      if (!form) return;
      const button = form.querySelector('button[type="submit"]');
      if (button) {
        button.disabled = isLoading;
        button.classList.toggle('opacity-75', isLoading);
        if (isLoading) {
          button.innerHTML = '<span class="inline-flex items-center gap-2"><span class="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white"></span>Searching...</span>';
        } else {
          const fallback = button.closest('form')?.id === 'welcomeSearchForm' ? 'Explore' : 'Search';
          button.innerHTML = fallback === 'Explore' ? `Explore <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>` : 'Search';
        }
      }
    });
  },

  renderProfile(profile) {
    Profile.render(profile);
  },

  renderStats(profile, repos) {
    const statsContainer = document.getElementById('statsGrid');
    if (!statsContainer) return;

    const totalStars = (repos || []).reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);

    const stats = [
      {
        label: 'Public Repositories',
        value: formatNumber(profile.public_repos || 0),
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z"></path><path d="M8 5v14"></path><path d="M16 5v14"></path></svg>'
      },
      {
        label: 'Followers',
        value: formatNumber(profile.followers || 0),
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1"></path><circle cx="10" cy="7" r="4"></circle><path d="M22 19v-1a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'
      },
      {
        label: 'Following',
        value: formatNumber(profile.following || 0),
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path><circle cx="9.5" cy="7" r="3.5"></circle><path d="M20.5 8.5A3.5 3.5 0 1 1 17 5.5"></path><path d="M19 14v7"></path></svg>'
      },
      {
        label: 'Total Repository Stars',
        value: formatNumber(totalStars),
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 2 2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5L12 2Z"></path></svg>'
      }
    ];

    statsContainer.innerHTML = stats.map((stat) => `
      <div class="stat-card">
        <div class="stat-head">
          <div class="stat-icon">${stat.icon}</div>
        </div>
        <div class="stat-value">${stat.value}</div>
        <div class="stat-label">${stat.label}</div>
      </div>
    `).join('');
  },

  renderLanguageBreakdown(repos) {
    const normalizedRepos = repos.filter((repo) => repo && repo.language);
    const total = normalizedRepos.length || 1;
    const counts = {};

    normalizedRepos.forEach((repo) => {
      counts[repo.language] = (counts[repo.language] || 0) + 1;
    });

    const languageData = Object.entries(counts)
      .map(([name, count]) => ({
        name,
        percentage: (count / total) * 100,
        color: languageColors[name] || getRandomColor(name)
      }))
      .sort((a, b) => b.percentage - a.percentage);

    Charts.renderLanguageChart(languageData);

    if (!languageData.length) {
      const legend = document.getElementById('languageLegend');
      if (legend) {
        legend.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg><h4>No language data</h4><p>No repositories with a detected language were found.</p></div>';
      }
    }
  },

  renderRepoOverview(repos) {
    const repoOverview = document.getElementById('repoOverview');
    if (!repoOverview) return;

    const total = repos.length;
    const forked = repos.filter((repo) => repo.fork).length;
    const original = total - forked;
    const totalForks = repos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
    const averageStars = total ? (repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0) / total).toFixed(1) : '0.0';

    const items = [
      { label: 'Total repositories', value: formatNumber(total) },
      { label: 'Forked repositories', value: formatNumber(forked) },
      { label: 'Original repositories', value: formatNumber(original) },
      { label: 'Total forks', value: formatNumber(totalForks) },
      { label: 'Average stars per repository', value: averageStars }
    ];

    repoOverview.innerHTML = `
      <div class="overview-list">
        ${items.map((item) => `
          <div class="overview-item">
            <span class="overview-label">${item.label}</span>
            <span class="overview-value">${item.value}</span>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderActivity(events) {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;

    if (!events.length) {
      activityList.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v20"></path><path d="M17 6.5c0-1.38-2.24-2.5-5-2.5s-5 1.12-5 2.5S9.24 9 12 9s5 1.12 5 2.5S14.76 14 12 14s-5 1.12-5 2.5S9.24 19 12 19s5-1.12 5-2.5"></path></svg>
          <h4>No public activity</h4>
          <p>This profile does not currently have public GitHub events available.</p>
        </div>
      `;
      return;
    }

    const eventGroups = events.slice(0, 10).map((event) => this.formatEvent(event));
    activityList.innerHTML = eventGroups.map((item) => `
      <div class="activity-item">
        <div class="activity-icon">${item.icon}</div>
        <div class="activity-content">
          <p class="activity-title">${item.title}</p>
          <p class="activity-subtitle">${item.subtitle}</p>
        </div>
        <div class="activity-time">${item.time}</div>
      </div>
    `).join('');
  },

  formatEvent(event) {
    const eventType = event.type || 'Event';
    const repoName = event.repo && event.repo.name ? event.repo.name.replace(/^[^/]+\//, '') : 'Repository';
    const time = event.created_at ? new Date(event.created_at).toLocaleString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
    }) : 'Unknown';

    const iconMap = {
      PushEvent: '<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v20"></path><path d="m5 9 7-7 7 7"></path></svg>',
      CreateEvent: '<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>',
      WatchEvent: '<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 2 2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5L12 2Z"></path></svg>',
      PullRequestEvent: '<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="6" r="3"></circle><circle cx="18" cy="18" r="3"></circle><circle cx="18" cy="6" r="3"></circle><path d="M9 6h6"></path><path d="M9 18h6"></path><path d="M6 9v6"></path><path d="M18 9v6"></path></svg>',
      IssuesEvent: '<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>'
    };

    let title = `${eventType}`;
    let subtitle = repoName ? `Repository: ${repoName}` : 'Repository activity';

    if (eventType === 'PushEvent') {
      const commitCount = event.payload && event.payload.size ? event.payload.size : 1;
      title = `Pushed ${commitCount} commit${commitCount === 1 ? '' : 's'}`;
    } else if (eventType === 'CreateEvent') {
      title = `Created ${event.payload && event.payload.ref_type ? event.payload.ref_type : 'item'}`;
    } else if (eventType === 'WatchEvent') {
      title = 'Starred repository';
    } else if (eventType === 'PullRequestEvent') {
      const action = event.payload && event.payload.action ? event.payload.action : 'updated';
      title = `Pull request ${action}`;
    } else if (eventType === 'IssuesEvent') {
      const action = event.payload && event.payload.action ? event.payload.action : 'updated';
      title = `Issue ${action}`;
    }

    return {
      title,
      subtitle,
      icon: iconMap[eventType] || '<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16"></path><path d="M12 4v16"></path></svg>',
      time
    };
  },

  showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('hidden');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => toast.classList.add('hidden'), 2200);
  },

  handleError(error) {
    const message = error && error.message ? error.message : 'An unexpected error occurred while fetching GitHub data.';
    const normalized = message.toLowerCase();

    let userMessage = 'We could not load that GitHub profile. Please try another username.';

    if (normalized.includes('not found')) {
      userMessage = 'No GitHub profile was found for that username.';
    } else if (normalized.includes('rate limit') || normalized.includes('abuse detection')) {
      userMessage = 'GitHub rate limit reached. Please wait a moment before trying again.';
    } else if (normalized.includes('failed to fetch') || normalized.includes('network')) {
      userMessage = 'Network error. Please check your connection and try again.';
    }

    this.showToast(userMessage);
    Dashboard.showView('dashboard');
    document.getElementById('welcomeSection')?.classList.remove('hidden');
    document.getElementById('profileSection')?.classList.add('hidden');
  }
};

window.app = app;

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value || 0);
}

function getRandomColor(name) {
  const palette = ['#3B82F6', '#06B6D4', '#22C55E', '#F59E0B', '#EF4444', '#38BDF8', '#67E8F9', '#93C5FD'];
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = name.charCodeAt(index) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}
