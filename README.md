# GitTrack

GitTrack is a browser-based GitHub profile explorer and developer analytics dashboard. It uses GitHub's public REST API to help you discover developers, inspect repositories, understand language usage, and compare public developer metrics.

## Features

- Search and explore GitHub developer profiles
- Profile avatars, bios, links, followers, following, and account details
- Repository browsing with filtering, search, sorting, and bookmarks
- Repository stars, forks, languages, and recent activity
- Developer comparison for 2–4 GitHub usernames
- Comparison of followers, following, repositories, stars, forks, account age, languages, and activity
- Winner highlighting and visual progress bars for comparison metrics
- Developer Insights with comparison leaders, language trends, account experience, scores, and a summary
- Dashboard navigation for profiles, repositories, favorites, history, settings, and comparisons
- Favorites, search history, bookmarks, and recent repositories stored locally in the browser
- Responsive layouts for desktop, tablet, and mobile
- Dark and light themes
- Electric Blue and Cyan visual design system

## Getting Started

GitTrack is a static web application and does not require a build step or package installation.

### Run locally

Open `index.html` in a browser, or serve the project with a local HTTP server:

```bash
python -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

Serving the project over HTTP is recommended for consistent browser behavior.

## Usage

1. Search for a GitHub username from the landing page or dashboard.
2. Select a profile to inspect repositories, languages, and activity.
3. Use the sidebar to open **Compare Developers**.
4. Enter 2–4 unique GitHub usernames and select **Compare developers**.
5. Use the dashboard sections to revisit profiles, favorites, bookmarks, and history.

## GitHub API

GitTrack uses the unauthenticated GitHub REST API:

- `GET /users/{username}`
- `GET /users/{username}/repos`
- `GET /users/{username}/events/public`
- `GET /search/repositories`
- `GET /rate_limit`

The app sends GitHub's recommended JSON media type and API version headers. Because requests are unauthenticated, GitHub's public rate limits apply. API errors are displayed in the interface.

## Project Structure

```text
GitTrack/
├── index.html          Main application shell
├── css/
│   └── style.css       Theme and responsive styles
├── js/
│   ├── api.js          GitHub API client
│   ├── app.js          Profile search and application state
│   ├── chart.js        Chart.js language visualizations
│   ├── dashboard.js    Dashboard navigation and comparison views
│   ├── profile.js      Profile rendering
│   ├── repositories.js Repository rendering and filtering
│   ├── storage.js      Local browser storage
│   └── theme.js        Theme initialization and switching
├── assets/             Static assets
└── favicon.svg         Application icon
```

## Technology

- HTML
- CSS
- JavaScript
- Tailwind CSS via CDN
- Chart.js via CDN
- GitHub REST API

## Privacy

GitTrack does not require a GitHub login. Favorites, search history, bookmarks, and recent repositories are stored in the browser's local storage. Public profile and repository data is requested directly from GitHub.

  KOTOLA YACOB.
## License

See [LICENSE](./LICENSE).