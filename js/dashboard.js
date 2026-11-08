const Dashboard = {
  currentView: 'dashboard',
  repositoryResults: [],

  mount() {
    const main = document.getElementById('appMain');
    if (!main || document.getElementById('appSidebar')) return;

    document.body.classList.add('dashboard-app');
    document.body.insertAdjacentHTML('afterbegin', `
      <aside id="appSidebar" class="app-sidebar" aria-label="Primary navigation">
        <div class="sidebar-brand">
          <div class="brand-mark">GT</div>
          <div><strong>GitTrack</strong><span>Developer intelligence</span></div>
        </div>
        <nav class="sidebar-nav">
          <button class="sidebar-link is-active" data-view="dashboard"><span>▦</span>Dashboard</button>
          <button class="sidebar-link" data-view="explore"><span>⌕</span>Explore Developers</button>
          <button class="sidebar-link" data-view="compare"><span>⇄</span>Compare Developers</button>
          <button class="sidebar-link" data-view="repositories"><span>▤</span>Repositories</button>
          <button class="sidebar-link" data-view="favorites"><span>★</span>Favorites</button>
          <button class="sidebar-link" data-view="history"><span>◷</span>Search History</button>
          <button class="sidebar-link" data-view="settings"><span>⚙</span>Settings</button>
        </nav>
        <div class="sidebar-footer">Public GitHub data<br><span>Built for curious builders</span></div>
      </aside>
      <button id="mobileSidebarBackdrop" class="mobile-sidebar-backdrop hidden" type="button" aria-label="Close navigation"></button>
    `);

    main.insertAdjacentHTML('afterbegin', `
      <section id="dashboardView" class="dashboard-view hidden" aria-live="polite">
        <div id="dashboardContent"></div>
      </section>
    `);

    this.bindNavigation();
    this.showView('dashboard', { fromHistory: true });
  },

  bindNavigation() {
    document.querySelectorAll('.sidebar-link').forEach((button) => {
      button.addEventListener('click', () => {
        this.showView(button.dataset.view);
        document.getElementById('appSidebar')?.classList.remove('is-open');
        document.getElementById('mobileSidebarBackdrop')?.classList.add('hidden');
      });
    });

    document.getElementById('mobileSidebarBackdrop')?.addEventListener('click', () => {
      document.getElementById('appSidebar')?.classList.remove('is-open');
      document.getElementById('mobileSidebarBackdrop')?.classList.add('hidden');
    });
    document.getElementById('mobileNavToggle')?.addEventListener('click', () => {
      document.getElementById('appSidebar')?.classList.add('is-open');
      document.getElementById('mobileSidebarBackdrop')?.classList.remove('hidden');
    });

    document.addEventListener('click', (event) => {
      const profileButton = event.target.closest('[data-profile-login]');
      if (profileButton) {
        app.searchUser(profileButton.dataset.profileLogin);
        return;
      }

      const favoriteButton = event.target.closest('[data-favorite-login]');
      if (favoriteButton) {
        const profile = GitTrackStore.getFavorites().find((item) => item.login === favoriteButton.dataset.favoriteLogin)
          || GitTrackStore.getHistory().find((item) => item.login === favoriteButton.dataset.favoriteLogin);
        if (profile) {
          GitTrackStore.toggleFavorite(profile);
          this.renderCurrentView();
        }

        return;
      }

      const profileFavorite = event.target.closest('[data-profile-favorite]');
      if (profileFavorite && APP_STATE.profile) {
        GitTrackStore.toggleFavorite(APP_STATE.profile);
        profileFavorite.textContent = GitTrackStore.isFavorite(APP_STATE.profile.login) ? 'Remove favorite' : 'Save favorite';
        return;
      }

      const historyButton = event.target.closest('[data-remove-history]');
      if (historyButton) {
        GitTrackStore.removeHistory(historyButton.dataset.removeHistory);
        this.renderCurrentView();
        return;
      }

      const bookmarkButton = event.target.closest('[data-bookmark-repo]');
      if (bookmarkButton) {
        const repo = this.repositoryResults.find((item) => item.full_name === bookmarkButton.dataset.bookmarkRepo)
          || (window.APP_STATE?.repos || []).find((item) => item.full_name === bookmarkButton.dataset.bookmarkRepo)
          || GitTrackStore.getRecentRepositories().find((item) => item.full_name === bookmarkButton.dataset.bookmarkRepo);
        if (repo) {
          GitTrackStore.toggleBookmark(repo);
          this.renderCurrentView();
        }
      }

      const repositoryLink = event.target.closest('[data-repository-view]');
      if (repositoryLink && window.APP_STATE?.repos) {
        const repo = window.APP_STATE.repos.find((item) => item.full_name === repositoryLink.dataset.repositoryView);
        if (repo) GitTrackStore.addRecentRepository(repo);
      }
    });
  },

  showView(view, options = {}) {
    if (!options.fromHistory && view !== 'profile' && window.history.state?.view !== view) {
      window.history.pushState({ gittrack: 'gittrack', view }, '', view === 'dashboard' ? app.homeUrl() : `${app.homeUrl()}?view=${view}`);
    }

    this.currentView = view;
    document.querySelectorAll('.sidebar-link').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.view === view);
    });

    const dashboard = document.getElementById('dashboardView');
    const welcome = document.getElementById('welcomeSection');
    const profile = document.getElementById('profileSection');
    if (!dashboard) return;

    if (view === 'profile') {
      dashboard.classList.add('hidden');
      return;
    }

    dashboard.classList.remove('hidden');
    welcome?.classList.add('hidden');
    profile?.classList.add('hidden');
    this.renderCurrentView();
  },

  renderCurrentView() {
    const content = document.getElementById('dashboardContent');
    if (!content) return;
    const renderers = {
      dashboard: () => this.renderOverview(),
      explore: () => this.renderExplore(),
      compare: () => this.renderCompare(),
      repositories: () => this.renderRepositories(),
      favorites: () => this.renderFavorites(),
      history: () => this.renderHistory(),
      settings: () => this.renderSettings()
    };
    (renderers[this.currentView] || renderers.dashboard)();
  },

  shell(title, subtitle, body) {
    return `
      <div class="dashboard-container">
        <div class="dashboard-heading">
          <div><p class="eyebrow">GitTrack workspace</p><h1>${title}</h1><p>${subtitle}</p></div>
          <div class="dashboard-breadcrumb">Workspace / <strong>${title}</strong></div>
        </div>
        ${body}
      </div>
    `;
  },

  renderOverview() {
    const history = GitTrackStore.getHistory();
    const favorites = GitTrackStore.getFavorites();
    const bookmarks = GitTrackStore.getBookmarks();
    const recentRepos = GitTrackStore.getRecentRepositories();
    const profiles = history.slice(0, 4);

    document.getElementById('dashboardContent').innerHTML = this.shell('Welcome to GitTrack.', 'Your gateway to developer insights and GitHub analytics.', `
      <div class="dashboard-welcome panel">
        <div><span class="dashboard-kicker">Explore the public web of code</span><h2>Find the signal behind every profile.</h2><p>Search a GitHub username to uncover repositories, languages, activity, and developer momentum.</p></div>
        <button class="secondary-btn dashboard-compare-button" data-view-link="compare" type="button">Compare developers</button>
        <form id="dashboardSearchForm" class="dashboard-search"><input name="username" placeholder="Search a GitHub username..." aria-label="Search a GitHub username"><button class="primary-btn" type="submit">Explore Developers</button></form>
      </div>
      <div class="dashboard-stats">
        ${this.statCard('Profiles explored', history.length, '◉')}
        ${this.statCard('Favorite developers', favorites.length, '★')}
        ${this.statCard('Repositories bookmarked', bookmarks.length, '▤')}
        ${this.statCard('Recent searches', Math.min(history.length, 5), '◷')}
      </div>
      <div class="dashboard-grid">
        <section class="panel dashboard-panel"><div class="section-heading"><div><h2>Recently viewed developers</h2><p>Your latest GitHub profile explorations.</p></div><button class="text-button" data-view-link="history">View history</button></div><div class="developer-list">${profiles.length ? profiles.map((item) => this.profileRow(item)).join('') : this.empty('No profiles explored yet.', 'Start with a username above.')}</div></section>
        <section class="panel dashboard-panel"><div class="section-heading"><div><h2>Favorite developers</h2><p>Keep important profiles one click away.</p></div><button class="text-button" data-view-link="favorites">Manage</button></div><div class="developer-list">${favorites.slice(0, 4).map((item) => this.profileRow(item, true)).join('') || this.empty('No favorites yet.', 'Save a developer from their profile.')}</div></section>
      </div>
      <section class="panel dashboard-panel"><div class="section-heading"><div><h2>Recently explored repositories</h2><p>Repositories you opened or bookmarked.</p></div><button class="text-button" data-view-link="repositories">Explore repos</button></div><div class="repo-mini-grid">${recentRepos.slice(0, 4).map((repo) => this.repoRow(repo)).join('') || this.empty('No repositories explored yet.', 'Open a profile to discover repositories.')}</div></section>
    `);
    this.bindDashboardForms();
  },

  statCard(label, value, icon) {
    return `<article class="dashboard-stat"><span class="dashboard-stat-icon">${icon}</span><strong>${formatNumber(value)}</strong><span>${label}</span></article>`;
  },

  profileRow(item, favorite = false) {
    return `<article class="developer-row"><img src="${item.avatar_url || ''}" alt="${escapeHtml(item.login)} avatar"><div><strong>${escapeHtml(item.name || item.login)}</strong><span class="code-text">@${escapeHtml(item.login)}</span><small>${formatNumber(item.followers || 0)} followers</small></div><button class="compact-button" data-profile-login="${escapeHtml(item.login)}">View</button>${favorite ? `<button class="icon-button" data-favorite-login="${escapeHtml(item.login)}" aria-label="Remove ${escapeHtml(item.login)} from favorites">×</button>` : ''}</article>`;
  },

  repoRow(repo) {
    const bookmarked = GitTrackStore.isBookmarked(repo.full_name);
    return `<article class="repo-mini-card"><div><strong class="code-text">${escapeHtml(repo.name || repo.full_name)}</strong><span>${escapeHtml(repo.language || 'Unknown')} · ${formatNumber(repo.stargazers_count || 0)} stars</span></div><a class="compact-button" href="${repo.html_url}" target="_blank" rel="noreferrer">Open</a><button class="icon-button ${bookmarked ? 'is-bookmarked' : ''}" data-bookmark-repo="${escapeHtml(repo.full_name)}" aria-label="Bookmark ${escapeHtml(repo.full_name)}">★</button></article>`;
  },

  empty(title, text) {
    return `<div class="dashboard-empty"><strong>${title}</strong><span>${text}</span></div>`;
  },

  renderExplore() {
    document.getElementById('dashboardContent').innerHTML = this.shell('Explore Developers', 'Search public profiles and jump into a complete analytics view.', `<div class="panel explore-hero"><form id="dashboardSearchForm" class="dashboard-search"><input name="username" placeholder="Enter a GitHub username..." aria-label="Enter a GitHub username"><button class="primary-btn" type="submit">View profile</button></form><div class="suggestion-row">Try <button data-profile-login="torvalds">torvalds</button><button data-profile-login="gaearon">gaearon</button><button data-profile-login="sindresorhus">sindresorhus</button></div></div><section class="panel dashboard-panel"><div class="section-heading"><div><h2>Recent discoveries</h2><p>Jump back into profiles you have already explored.</p></div></div><div class="developer-list">${GitTrackStore.getHistory().slice(0, 8).map((item) => this.profileRow(item)).join('') || this.empty('Your discovery list is empty.', 'Search for a username to get started.')}</div></section>`);
    this.bindDashboardForms();
  },

  renderFavorites() {
    const favorites = GitTrackStore.getFavorites();
    document.getElementById('dashboardContent').innerHTML = this.shell('Favorite Developers', 'Your saved developer profiles, persisted locally in this browser.', `<div class="panel filter-bar"><input id="favoriteFilter" placeholder="Search favorites..." aria-label="Search favorites"></div><section class="panel dashboard-panel"><div id="favoriteList" class="developer-list">${favorites.map((item) => this.profileRow(item, true)).join('') || this.empty('No favorite developers.', 'Save profiles from the profile dashboard.')}</div></section>`);
    document.getElementById('favoriteFilter')?.addEventListener('input', (event) => {
      const query = event.target.value.toLowerCase();
      document.getElementById('favoriteList').innerHTML = favorites.filter((item) => `${item.login} ${item.name || ''}`.toLowerCase().includes(query)).map((item) => this.profileRow(item, true)).join('') || this.empty('No matches found.', 'Try a different search.');
    });
  },

  renderHistory() {
    const history = GitTrackStore.getHistory();
    document.getElementById('dashboardContent').innerHTML = this.shell('Search History', 'Revisit profiles without repeating your search.', `<div class="section-actions"><button id="clearHistoryButton" class="secondary-btn">Clear all history</button></div><section class="panel dashboard-panel"><div class="history-list">${history.map((item) => `<article class="history-row"><div>${this.profileRow(item)}</div><time>${new Date(item.searchedAt).toLocaleDateString()}</time><button class="icon-button" data-remove-history="${escapeHtml(item.login)}" aria-label="Remove ${escapeHtml(item.login)} from history">×</button></article>`).join('') || this.empty('No search history.', 'Your searched profiles will appear here.')}</div></section>`);
    document.getElementById('clearHistoryButton')?.addEventListener('click', () => { GitTrackStore.clearHistory(); this.renderCurrentView(); });
  },

  renderRepositories() {
    const bookmarks = GitTrackStore.getBookmarks();
    document.getElementById('dashboardContent').innerHTML = this.shell('Repository Explorer', 'Discover public repositories and keep a local reading list.', `<form id="repositorySearchForm" class="panel explorer-controls"><input name="query" placeholder="Search repositories, topics, or languages..." aria-label="Search repositories"><select name="language" aria-label="Filter by programming language"><option value="">All languages</option><option>JavaScript</option><option>TypeScript</option><option>Python</option><option>Java</option><option>Go</option><option>Rust</option></select><select name="sort" aria-label="Sort repositories"><option value="stars">Most starred</option><option value="updated">Recently updated</option></select><button class="primary-btn" type="submit">Search repositories</button></form><div id="repositoryResults" class="repo-explorer-grid">${bookmarks.map((repo) => this.repoExplorerCard(repo)).join('') || this.empty('Search for repositories.', 'Results and bookmarks will appear here.')}</div>`);
    document.getElementById('repositorySearchForm')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.target;
      const query = form.query.value.trim();
      if (!query) return;
      const languageQuery = form.language.value ? ` language:${form.language.value}` : '';
      try {
        const result = await Api.searchRepositories(`${query}${languageQuery}`, { sort: form.sort.value });
        this.repositoryResults = result.items || [];
        const resultsElement = document.getElementById('repositoryResults');
        if (resultsElement) {
          resultsElement.innerHTML = this.repositoryResults.map((repo) => this.repoExplorerCard(repo)).join('') || this.empty('No repositories found.', 'Try a broader search.');
        }
      } catch (error) {
        const resultsElement = document.getElementById('repositoryResults');
        if (resultsElement) {
          resultsElement.innerHTML = this.empty('Repository search unavailable.', error.message || 'Please try again.');
        }
      }
    });
  },

  repoExplorerCard(repo) {
    const bookmarked = GitTrackStore.isBookmarked(repo.full_name);
    return `<article class="repo-explorer-card"><div class="repo-card-header"><strong class="code-text">${escapeHtml(repo.full_name)}</strong><button class="icon-button ${bookmarked ? 'is-bookmarked' : ''}" data-bookmark-repo="${escapeHtml(repo.full_name)}" aria-label="Bookmark ${escapeHtml(repo.full_name)}">★</button></div><p>${escapeHtml(repo.description || 'No description provided.')}</p><div class="repo-explorer-meta"><span>${escapeHtml(repo.language || 'Unknown')}</span><span>★ ${formatNumber(repo.stargazers_count || 0)}</span><span>⑂ ${formatNumber(repo.forks_count || 0)}</span></div><a class="text-button" href="${repo.html_url}" target="_blank" rel="noreferrer">View on GitHub ↗</a></article>`;
  },

  renderCompare() {
    document.getElementById('dashboardContent').innerHTML = this.shell('Compare Developers', 'Compare 2–4 public GitHub profiles side by side with live API data.', `
      <form id="compareForm" class="panel compare-form" novalidate>
        <div class="compare-input-grid">
          ${[1, 2, 3, 4].map((number) => `<label><span>Developer ${number}${number < 3 ? ' <b>*</b>' : ' <em>optional</em>'}</span><input name="username${number}" placeholder="@username" autocomplete="off" ${number < 3 ? 'required' : ''}></label>`).join('')}
        </div>
        <div class="compare-form-footer">
          <p id="compareStatus" class="compare-status" role="status" aria-live="polite">Enter at least two unique GitHub usernames.</p>
          <button class="primary-btn" type="submit">Compare developers</button>
        </div>
      </form>
      <div id="compareResults"></div>
    `);
    document.getElementById('compareForm')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.target;
      const status = document.getElementById('compareStatus');
      const usernames = Array.from(form.querySelectorAll('input'))
        .map((input) => input.value.trim())
        .filter(Boolean);
      const invalid = usernames.find((username) => !/^[a-z\d](?:[a-z\d-]{0,37})$/i.test(username));
      const uniqueUsernames = [...new Set(usernames.map((username) => username.toLowerCase()))];
      if (usernames.length < 2 || usernames.length > 4 || invalid || uniqueUsernames.length !== usernames.length) {
        if (status) status.textContent = invalid ? `"${invalid}" is not a valid GitHub username.` : usernames.length < 2 ? 'Enter at least two unique GitHub usernames.' : 'Each username can only be entered once.';
        status?.classList.add('is-error');
        return;
      }

      status?.classList.remove('is-error');
      status?.classList.add('is-loading');
      if (status) status.innerHTML = '<span class="loading-dot"></span> Loading GitHub profiles and repositories…';
      const resultsElement = document.getElementById('compareResults');
      if (resultsElement) resultsElement.innerHTML = '<div class="panel compare-loading"><span class="spinner"></span><strong>Building your comparison</strong><span>Fetching public profile, repository, and activity data.</span></div>';
      form.querySelector('button[type="submit"]').disabled = true;
      try {
        const results = await Promise.all(usernames.map((username) => this.getComparisonData(username)));
        if (resultsElement) resultsElement.innerHTML = this.comparisonMarkup(results);
        if (status) status.textContent = `Comparing ${results.length} public GitHub profiles.`;
      } catch (error) {
        if (resultsElement) {
          resultsElement.innerHTML = `<div class="panel compare-error"><strong>Comparison unavailable</strong><span>${escapeHtml(error.message || 'Please check the usernames and try again.')}</span></div>`;
        }
        if (status) status.textContent = 'We could not load every profile. Please check the usernames and try again.';
      } finally {
        form.querySelector('button[type="submit"]').disabled = false;
        status?.classList.remove('is-loading');
      }
    });
  },

  async getComparisonData(username) {
    const [profile, repos, events] = await Promise.all([Api.getUser(username), Api.getRepos(username), Api.getEvents(username)]);
    return { profile, repos: repos || [], events: events || [] };
  },

  comparisonMarkup(developers) {
    const metrics = [
      ['Followers', (item) => item.profile.followers || 0],
      ['Following', (item) => item.profile.following || 0],
      ['Public repositories', (item) => item.profile.public_repos || 0],
      ['Total stars', (item) => item.repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0)],
      ['Total forks', (item) => item.repos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0)],
      ['Public activity', (item) => item.events.length]
    ];
    const values = metrics.map(([, getter]) => developers.map(getter));
    const ageValues = developers.map((item) => Math.max(0, new Date().getFullYear() - new Date(item.profile.created_at).getFullYear()));
    return `
      <div class="compare-cards">${developers.map((item) => `<article class="panel compare-profile">
        <img src="${item.profile.avatar_url || ''}" alt="${escapeHtml(item.profile.login)} avatar">
        <div class="compare-profile-info"><h2>${escapeHtml(item.profile.name || item.profile.login)}</h2><span class="code-text">@${escapeHtml(item.profile.login)}</span><p>${escapeHtml(item.profile.bio || 'No public bio provided.')}</p></div>
        <a class="compact-button" href="${item.profile.html_url || '#'}" target="_blank" rel="noreferrer">GitHub ↗</a>
        <div class="compare-profile-meta"><span>${formatNumber(item.profile.followers || 0)} followers</span><span>${formatNumber(item.profile.following || 0)} following</span><span>Joined ${new Date(item.profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span></div>
      </article>`).join('')}</div>
      <section class="comparison-grid">${metrics.map(([label, getter], metricIndex) => {
        const metricValues = values[metricIndex];
        const maximum = Math.max(...metricValues, 1);
        const winner = Math.max(...metricValues);
        return `<article class="panel comparison-card"><span>${label}</span><div class="comparison-values">${developers.map((item, index) => `<div class="${metricValues[index] === winner && winner > 0 ? 'is-winner' : ''}"><strong>${formatNumber(metricValues[index])}</strong><small>${escapeHtml(item.profile.login)}</small><div class="metric-track"><i style="width:${(metricValues[index] / maximum) * 100}%"></i></div></div>`).join('')}</div></article>`;
      }).join('')}</section>
      <section class="panel comparison-card account-age-card"><span>Account age</span><div class="comparison-values">${developers.map((item, index) => `<div class="${ageValues[index] === Math.max(...ageValues) ? 'is-winner' : ''}"><strong>${ageValues[index]} yrs</strong><small>${escapeHtml(item.profile.login)}</small><span class="muted-copy">${new Date(item.profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span></div>`).join('')}</div></section>
      <section class="panel language-comparison"><div class="section-heading"><div><h2>Most-used programming languages</h2><p>Based on the languages detected across each developer's public repositories.</p></div></div><div class="language-comparison-grid">${developers.map((item) => `<div><strong class="code-text">@${escapeHtml(item.profile.login)}</strong>${this.languageBars(item.repos)}</div>`).join('')}</div></section>
      <section class="panel activity-comparison"><div class="section-heading"><div><h2>Contribution & activity snapshot</h2><p>Recent public events available from GitHub's API.</p></div></div><div class="activity-comparison-grid">${developers.map((item) => `<div class="activity-snapshot"><strong>${formatNumber(item.events.length)}</strong><span>recent public events</span><small>${item.events[0] ? `Last seen ${new Date(item.events[0].created_at).toLocaleDateString()}` : 'No recent public activity returned'}</small><b>${escapeHtml(item.profile.login)}</b></div>`).join('')}</div></section>
    `;
  },

  languageBars(repos) {
    const counts = {};
    repos.forEach((repo) => { if (repo.language) counts[repo.language] = (counts[repo.language] || 0) + 1; });
    const values = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const max = values[0]?.[1] || 1;
    return values.map(([language, count]) => `<div class="language-bar-row"><span>${escapeHtml(language)}</span><div><i style="width:${(count / max) * 100}%"></i></div><small>${count}</small></div>`).join('') || '<span class="muted-copy">No language data</span>';
  },

  renderSettings() {
    document.getElementById('dashboardContent').innerHTML = this.shell('Settings', 'Manage local preferences and inspect the public API connection.', `<div class="settings-grid"><section class="panel settings-card"><h2>Appearance</h2><p>Choose the interface theme used by GitTrack.</p><div class="settings-actions"><button class="secondary-btn" data-theme-choice="dark">Dark mode</button><button class="secondary-btn" data-theme-choice="light">Light mode</button></div></section><section class="panel settings-card"><h2>Local data</h2><p>Favorites, history, and bookmarks are stored only in this browser.</p><div class="settings-actions"><button id="settingsClearHistory" class="secondary-btn">Clear search history</button><button id="settingsClearFavorites" class="secondary-btn">Clear favorites</button></div></section><section class="panel settings-card"><h2>GitHub API status</h2><p id="rateLimitStatus">Checking public API rate limit…</p></section><section class="panel settings-card"><h2>About GitTrack</h2><p>GitTrack is a browser-based developer analytics workspace powered by GitHub's public REST API.</p></section></div>`);
    document.querySelectorAll('[data-theme-choice]').forEach((button) => button.addEventListener('click', () => { Theme.apply(button.dataset.themeChoice); localStorage.setItem('gittrack-theme', button.dataset.themeChoice); }));
    document.getElementById('settingsClearHistory')?.addEventListener('click', () => { GitTrackStore.clearHistory(); this.renderCurrentView(); });
    document.getElementById('settingsClearFavorites')?.addEventListener('click', () => { GitTrackStore.clearFavorites(); this.renderCurrentView(); });
    Api.getRateLimit().then((data) => {
      const statusElement = document.getElementById('rateLimitStatus');
      if (!statusElement) return;
      const core = data.resources?.core;
      statusElement.textContent = core ? `${formatNumber(core.remaining)} of ${formatNumber(core.limit)} requests remaining.` : 'Rate limit information unavailable.';
    }).catch(() => {
      const statusElement = document.getElementById('rateLimitStatus');
      if (statusElement) statusElement.textContent = 'Rate limit information unavailable.';
    });
  },

  bindDashboardForms() {
    document.getElementById('dashboardSearchForm')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const username = event.target.username.value.trim();
      if (username) app.searchUser(username);
    });
    document.querySelectorAll('[data-view-link]').forEach((button) => button.addEventListener('click', () => this.showView(button.dataset.viewLink)));
  }
};

window.Dashboard = Dashboard;

function dashboardEscape(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

if (typeof escapeHtml === 'undefined') {
  var escapeHtml = dashboardEscape;
}

if (typeof formatNumber === 'undefined') {
  var formatNumber = (value) => new Intl.NumberFormat('en-US').format(value || 0);
}
