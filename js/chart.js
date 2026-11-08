const Charts = {
  languageChart: null,

  init() {
    const ctx = document.getElementById('languageChart');
    if (!ctx) return;

    const theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    this.languageChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          borderWidth: 0,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '64%',
        animation: {
          duration: 700,
          easing: 'easeOutCubic'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label(context) {
                return `${context.label}: ${context.parsed}%`;
              }
            }
          }
        }
      }
    });

    this.applyTheme(theme);
  },

  applyTheme(theme) {
    if (!this.languageChart) return;

    const textColor = theme === 'light' ? '#0f172a' : '#f8fafc';
    const mutedColor = theme === 'light' ? '#64748b' : '#94a3b8';

    this.languageChart.options.plugins.tooltip.titleColor = textColor;
    this.languageChart.options.plugins.tooltip.bodyColor = textColor;
    this.languageChart.options.plugins.tooltip.backgroundColor = theme === 'light' ? '#ffffff' : '#0f172a';
    this.languageChart.options.plugins.tooltip.borderColor = theme === 'light' ? '#e2e8f0' : '#263449';
    this.languageChart.options.plugins.tooltip.borderWidth = 1;
    this.languageChart.options.plugins.legend.labels = {
      color: mutedColor,
      font: { family: 'Inter', size: 12 }
    };

    this.languageChart.update();
  },

  renderLanguageChart(languages) {
    if (!this.languageChart) return;

    const sorted = [...languages].sort((a, b) => b.percentage - a.percentage);
    const labels = sorted.map((item) => item.name);
    const values = sorted.map((item) => item.percentage);
    const colors = sorted.map((item) => item.color);

    this.languageChart.data.labels = labels;
    this.languageChart.data.datasets[0].data = values;
    this.languageChart.data.datasets[0].backgroundColor = colors;
    this.languageChart.update();

    const legend = document.getElementById('languageLegend');
    if (!legend) return;

    legend.innerHTML = sorted.map((item) => `
      <div class="legend-item">
        <span class="legend-swatch" style="background:${item.color};"></span>
        <span>${escapeHtml(item.name)}</span>
        <span class="text-[var(--muted)]">${Number(item.percentage).toFixed(1)}%</span>
      </div>
    `).join('');
  }
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.Charts = Charts;
