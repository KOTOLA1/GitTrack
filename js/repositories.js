const Repositories = {
  repoList: [],
  filtered: [],
  visibleCount: 8,

  render(repos) {
    this.repoList = repos || [];
    this.filtered = [...this.repoList];
    this.applyFilter();
  },

  applyFilter() {
    const searchQuery = document.getElementById('repoSearchInput')?.value.trim().toLowerCase() || '';
    const filterValue = document.getElementById('repoFilter')?.value || 'all';
    let items = [...this.repoList];

    if (searchQuery) {
      items = items.filter((repo) => {
        const text = `${repo.name} ${repo.description || ''} ${repo.language || ''}`.toLowerCase();
        return text.includes(searchQuery);
      });
    }

    switch (filterValue) {
      case 'starred':
        items.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));
        break;
      case 'updated':
        items.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        break;
      case 'created':
        items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'forked':
        items = items.filter((repo) => repo.fork);
        break;
      default:
        items.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        break;
    }

    this.filtered = items;
    this.visibleCount = 8;
    this.renderList();
  },

  renderList() {
    const repoListEl = document.getElementById('repoList');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const repoCountBadge = document.getElementById('repoCountBadge');

    if (!repoListEl) return;

    repoCountBadge.textContent = `${this.filtered.length} repositories`;

    if (!this.filtered.length) {
      repoListEl.innerHTML = `
        <div class="empty-state col-span-full">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16v12H4z"></path><path d="M4 9h16"></path><path d="M9 4v5"></path><path d="M15 4v5"></path></svg>
          <h4>No repositories found</h4>
          <p>Try adjusting your selected filter or search keyword to find matching repositories.</p>
        </div>
      `;
      loadMoreBtn.classList.add('hidden');
      return;
    }

    const visibleRepos = this.filtered.slice(0, this.visibleCount);
    repoListEl.innerHTML = visibleRepos.map((repo) => this.renderCard(repo)).join('');

    loadMoreBtn.classList.toggle('hidden', visibleRepos.length >= this.filtered.length);
  },

  renderCard(repo) {
    const repoDesc = repo.description ? escapeHtml(repo.description) : 'No description provided.';
    const language = repo.language || 'Unknown';
    const languageColor = languageColors[language] || '#3B82F6';
    const updatedAt = repo.updated_at ? new Date(repo.updated_at).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    }) : 'Unknown';
    const visibility = repo.private ? 'Private' : 'Public';

    return `
      <article class="repo-card">
        <div class="repo-top">
          <h4 class="repo-name">${escapeHtml(repo.name)}</h4>
          <a href="${repo.html_url}" target="_blank" rel="noreferrer" class="repo-link" data-repository-view="${escapeHtml(repo.full_name)}" aria-label="Open ${escapeHtml(repo.name)} on GitHub">
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7"></path><path d="M9 7h8v8"></path></svg>
          </a>
          <button type="button" class="repo-link" data-bookmark-repo="${escapeHtml(repo.full_name)}" aria-label="Bookmark ${escapeHtml(repo.name)}">★</button>
        </div>
        <div class="repo-description">${repoDesc}</div>
        <div class="repo-meta">
          <span class="language-badge"><span class="language-dot" style="background:${languageColor};"></span>${escapeHtml(language)}</span>
          <span class="visibility-badge">${visibility}</span>
          ${repo.fork ? '<span class="fork-badge">Forked</span>' : ''}
        </div>
        <div class="repo-stats">
          <div class="repo-stat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 2 2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5L12 2Z"></path></svg> ${formatNumber(repo.stargazers_count || 0)}</div>
          <div class="repo-stat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 7V4h8v3"></path><path d="M18 7H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"></path><path d="M8 11h8"></path></svg> ${formatNumber(repo.forks_count || 0)}</div>
          <div class="repo-stat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 9h8"></path><path d="M8 13h5"></path><path d="M8 17h8"></path><rect x="3" y="4" width="18" height="16" rx="2"></rect></svg> ${formatNumber(repo.open_issues_count || 0)}</div>
          <div class="repo-stat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8v4l3 3"></path><circle cx="12" cy="12" r="9"></circle></svg> ${escapeHtml(updatedAt)}</div>
        </div>
      </article>
    `;
  },

  loadMore() {
    this.visibleCount += 6;
    this.renderList();
  }
};

window.Repositories = Repositories;

const languageColors = {
  JavaScript: '#FCD34D',
  TypeScript: '#60A5FA',
  Python: '#60A5FA',
  HTML: '#F97316',
  CSS: '#38BDF8',
  Java: '#F59E0B',
  Ruby: '#EF4444',
  Go: '#22C55E',
  Rust: '#FB7185',
  PHP: '#38BDF8',
  CSharp: '#3B82F6',
  'C++': '#4ADE80',
  C: '#60A5FA',
  Shell: '#34D399',
  Vue: '#22C55E',
  React: '#22D3EE',
  Swift: '#F59E0B',
  Kotlin: '#06B6D4',
  Dart: '#5EEAD4',
  Markdown: '#94A3B8',
  Dockerfile: '#2563EB'
};

function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
