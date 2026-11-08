const Profile = {
  render(profile) {
    const profileHeader = document.getElementById('profileHeader');
    if (!profileHeader) return;

    const location = profile.location ? ` <span class="detail-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6-4.35-6-10A6 6 0 1 1 18 11c0 5.65-6 10-6 10Z"></path><circle cx="12" cy="11" r="2.5"></circle></svg>${escapeHtml(profile.location)}</span>` : '';
    const company = profile.company ? ` <span class="detail-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21V7l9-4 9 4v14"></path><path d="M9 21v-5h6v5"></path><path d="M7 10h10"></path></svg>${escapeHtml(profile.company)}</span>` : '';
    const blog = profile.blog ? ` <span class="detail-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L13 5"></path><path d="M14 11a5 5 0 0 1-7.07 0L4.1 8.17a5 5 0 1 1 7.07-7.07L11 3"></path></svg><a href="${formatLink(profile.blog)}" target="_blank" rel="noreferrer">${escapeHtml(displayUrl(profile.blog))}</a></span>` : '';
    const twitter = profile.twitter_username ? ` <span class="detail-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 4.01c-1 .47-2.06.8-3.18 1A5.05 5.05 0 0 0 21.4 2a9.7 9.7 0 0 1-3.06 1.17A4.84 4.84 0 0 0 12 7.22c0 .38.04.76.12 1.12A13.68 13.68 0 0 1 3.4 3.12a4.82 4.82 0 0 0 1.5 6.43A4.8 4.8 0 0 1 3 9.2v.06c0 2.32 1.63 4.26 3.8 4.7a4.84 4.84 0 0 1-2.18.08c.62 1.94 2.42 3.35 4.55 3.39A9.7 9.7 0 0 1 2 18.53 13.7 13.7 0 0 0 12.4 21c7.46 0 11.54-6.18 11.54-11.54 0-.17 0-.34-.01-.5A8.27 8.27 0 0 0 22 4.01Z"></path></svg><a href="https://x.com/${encodeURIComponent(profile.twitter_username)}" target="_blank" rel="noreferrer">@${escapeHtml(profile.twitter_username)}</a></span>` : '';
    const createdDate = profile.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown';

    const html = `
      <div class="profile-inner fade-in">
        <div class="flex items-center justify-center md:justify-start">
          <img src="${profile.avatar_url || ''}" alt="${escapeHtml(profile.login)} avatar" class="profile-avatar" />
        </div>
        <div class="profile-meta">
          <h2 class="profile-name">${escapeHtml(profile.name || profile.login)}</h2>
          <span class="profile-login">${escapeHtml(profile.login)}</span>
          ${profile.bio ? `<p class="profile-bio">${escapeHtml(profile.bio)}</p>` : ''}
          <div class="profile-details">
            ${location}
            ${company}
            ${blog}
            ${twitter}
            <span class="detail-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v4"></path><path d="M16 2v4"></path><path d="M3 10h18"></path><rect x="3" y="5" width="18" height="16" rx="2"></rect></svg>Joined ${escapeHtml(createdDate)}</span>
          </div>
        </div>
        <div class="profile-actions">
          <a href="${profile.html_url || '#'}" target="_blank" rel="noreferrer" class="primary-btn">
            View on GitHub
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7"></path><path d="M9 7h8v8"></path></svg>
          </a>
          <button type="button" class="secondary-btn" data-profile-favorite="${escapeHtml(profile.login)}">
            ${window.GitTrackStore && GitTrackStore.isFavorite(profile.login) ? 'Remove favorite' : 'Save favorite'}
          </button>
          <div class="follow-row">
            <span class="follow-pill"><strong>${formatNumber(profile.followers || 0)}</strong> followers</span>
            <span class="follow-pill"><strong>${formatNumber(profile.following || 0)}</strong> following</span>
            <span class="follow-pill"><a href="${profile.html_url || '#'}?tab=repositories" target="_blank" rel="noreferrer">Public profile</a></span>
          </div>
        </div>
      </div>
    `;

    profileHeader.innerHTML = html;
  },

  renderSkeleton() {
    const profileHeader = document.getElementById('profileHeader');
    if (!profileHeader) return;

    profileHeader.innerHTML = `
      <div class="profile-inner">
        <div class="animate-pulse rounded-full bg-slate-200/20 h-24 w-24 md:h-32 md:w-32"></div>
        <div class="profile-meta space-y-3">
          <div class="h-8 w-48 rounded-xl bg-slate-200/20 animate-pulse"></div>
          <div class="h-4 w-32 rounded-lg bg-slate-200/20 animate-pulse"></div>
          <div class="h-4 w-full max-w-xl rounded-lg bg-slate-200/20 animate-pulse"></div>
          <div class="h-4 w-3/4 rounded-lg bg-slate-200/20 animate-pulse"></div>
          <div class="flex flex-wrap gap-3">
            <div class="h-5 w-28 rounded-full bg-slate-200/20 animate-pulse"></div>
            <div class="h-5 w-24 rounded-full bg-slate-200/20 animate-pulse"></div>
            <div class="h-5 w-24 rounded-full bg-slate-200/20 animate-pulse"></div>
          </div>
        </div>
        <div class="profile-actions">
          <div class="h-11 w-full rounded-xl bg-slate-200/20 animate-pulse"></div>
          <div class="flex gap-2">
            <div class="h-8 w-24 rounded-full bg-slate-200/20 animate-pulse"></div>
            <div class="h-8 w-24 rounded-full bg-slate-200/20 animate-pulse"></div>
          </div>
        </div>
      </div>
    `;
  }
};

window.Profile = Profile;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}

function formatLink(url) {
  if (!url) return '#';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function displayUrl(url) {
  if (!url) return '';
  let cleaned = url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  if (cleaned.length > 26) {
    cleaned = `${cleaned.slice(0, 23)}...`;
  }
  return cleaned;
}
