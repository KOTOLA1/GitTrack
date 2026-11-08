const THEME_KEY = 'gittrack-theme';

const Theme = {
  init() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const preferredTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    const theme = savedTheme || preferredTheme;
    this.apply(theme);
    this.bindToggle();
  },

  apply(theme) {
    const nextTheme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    document.documentElement.classList.toggle('light', nextTheme === 'light');
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');

    const toggleButton = document.getElementById('themeToggle');
    const sunIcon = document.getElementById('themeIconSun');
    const moonIcon = document.getElementById('themeIconMoon');

    if (toggleButton) {
      toggleButton.setAttribute('aria-label', nextTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    }

    if (sunIcon && moonIcon) {
      sunIcon.classList.toggle('hidden', nextTheme !== 'light');
      moonIcon.classList.toggle('hidden', nextTheme !== 'dark');
    }

    document.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: nextTheme } }));
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    this.apply(next);
    localStorage.setItem(THEME_KEY, next);
  },

  bindToggle() {
    const toggleButton = document.getElementById('themeToggle');
    if (!toggleButton) return;

    toggleButton.addEventListener('click', () => this.toggle());
  }
};

window.Theme = Theme;
