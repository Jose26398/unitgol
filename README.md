<div align="center">
    <img src="public/icons/icon-128x128.png" width="128" height="128"> 
    <h3>UnitGol</h3>

[![en](https://img.shields.io/badge/lang-en-17a2b8.svg)](https://github.com/Jose26398/unitgol/blob/master/README.md)
[![es](https://img.shields.io/badge/lang-es-ffc107.svg)](https://github.com/Jose26398/unitgol/blob/master/README.es.md)

[![onrender](https://img.shields.io/badge/onrender-online-1eb854?labelColor=black&logo=render&style=flat-square)](https://unitgol.onrender.com)
[![release](https://img.shields.io/github/v/release/Jose26398/unitgol?labelColor=black&logo=github&style=flat-square)](https://github.com/Jose26398/unitgol/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-ffc107.svg)](https://opensource.org/licenses/MIT)

</div>

<div align="center">
    <h4>Manage football matches between friends and teams.</h4>

Track matches, player statistics, and automatically generate balanced teams based on player data.

</div>

## 📸 Screenshots

![players](https://github.com/user-attachments/assets/3ccbd11d-3676-4719-a77e-3a45a994bcb1)
<div style="display: flex; justify-content: space-between;">

| ![Matches](https://github.com/user-attachments/assets/54d51da2-a17d-4cf9-b5f8-b63629b65db5) | ![Match](https://github.com/user-attachments/assets/244ec828-2f6e-4ad0-ab8c-21d20930012a) | ![Generator](https://github.com/user-attachments/assets/d5ab2d69-cefa-4813-b78b-0597694e1a57) |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |

</div>

## 🌟 Features

| **Category**             | **Description**                                                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| **Match Management**     | - Record match results and journeys.<br>- Track goals, assists, and historical match data.                                       |
| **Player Statistics**    | - Individual player profiles.<br>- Detailed performance stats:<br>  - Goals and assists.<br>  - Win/loss ratios.                 |
| **Smart Team Generator** | - Automatically balance teams based on:<br>  - Win rate.<br>  - Goals and assists per match.<br>  - Overall performance metrics. |
| **Progressive Web App**  | - Supports installation on any device.<br>- Automatic updates.<br>- Local data persistence.                                      |

## 🚀 Getting Started

### Prerequisites

- [Node.js 24 LTS](https://nodejs.org/en/) (24.15.0 or newer; `.nvmrc` selects Node 24).
- [pnpm 12.21.0](https://pnpm.io/), as pinned in `package.json`.

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/Jose26398/unitgol.git
   ```

2. Install dependencies

   ```bash
   cd unitgol
   pnpm install --frozen-lockfile
   ```

3. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` using your Supabase project's URL and public anon key.
   Apply the migrations in `supabase/migrations/` to an empty Supabase project
   before using the application.

4. Start the development server

   ```bash
   pnpm dev
   ```

5. Build for production (includes TypeScript checks)

   ```bash
   pnpm build
   ```

### Project checks

```bash
pnpm lint           # Biome checks
pnpm lint:fix       # Apply safe lint and formatting fixes
pnpm typecheck      # Check application, tests, and build configuration
pnpm test:run       # Run tests once
pnpm test:coverage  # Run tests with coverage thresholds
pnpm preview       # Preview the production build locally
```

### Architecture and current scope

Lazy-loaded views, shared dialogs, React scoring context, and the form, chart and team-generation improvements remain active.

Authentication and repositories use the previous Supabase contract. This version does not require anonymous Auth or new migrations. The authentication, RLS and transactional-write changes are parked in the `auth-db-refactor` stash.

Tests cover business logic and UI behavior with Node/jsdom and retain the previous repository tests. Backend operations retain the permissions and limitations of the existing deployment.

### CI and releases

Pull requests and pushes to `master` or `develop` run independent `Lint`, `Test`,
and `Build` jobs. `Build` includes TypeScript checks. Coverage reports are kept
as workflow artifacts for seven days, including failed test runs when a report
was generated. PR titles are checked on creation, edits, reopening, and new
commits.

After these checks have run on GitHub, configure branch rules for `master` and
`develop` to require a pull request and the `Lint`, `Test`, `Build`, and
`Validate PR title` checks before merging. These rules are repository settings;
the workflow files do not enable them. Use squash merges with the PR title as
the commit message to preserve Conventional Commits for release-please.

Release automation runs only after all three CI jobs succeed on a push to
`master`. Releases are serialized, and a newer push does not cancel a running
release. The reusable release workflow is called by CI.

By default, releases use `GITHUB_TOKEN`. Enable **Allow GitHub Actions to create
and approve pull requests** in the repository's Actions settings for this mode.
CI on release PRs may require a maintainer to select **Approve workflows to
run**. For automatic CI on those PRs, install a GitHub App on this repository
with **Contents: read and write** and **Pull requests: read and write**, then set
the Actions variable `RELEASE_APP_CLIENT_ID` and secret `RELEASE_APP_PRIVATE_KEY`.
The release job will create a temporary token scoped to this repository and
revoke it when the job ends.

### Public assets and search indexing

`public/` contains static icons copied unchanged by Vite. The PWA manifest and
service worker are generated during the build. `robots.txt` is also generated
by Vite, using the same rule as the HTML robots meta tag: production builds allow
indexing; other modes disable it. For a development deployment built in production
mode, set `VITE_ENV=development` (`develop` is also supported). No extra download
or template generation step is needed. Keep private keys out of `VITE_*` variables,
which are included in the browser bundle.

### Player photos

Before deploying this version, apply
`supabase/migrations/20261114000000_player_avatars_and_team_limit.sql` to your
Supabase project. It configures the avatar bucket (public photo reads), limits
each photo to 2 MB and JPG, PNG, or WebP, and enforces a 100-player limit per
team in the database.

## 📁 Project Structure

```text
config/               # Vite build helpers
public/               # Static icons
src/
├── app/              # Application shell and layout
├── components/       # Shared React components
├── db/               # Repositories and database mappings
├── features/         # Application features
├── hooks/            # Shared React hooks
├── types/            # TypeScript type definitions
├── utils/            # Shared utility functions
├── __tests__/        # Vitest tests and setup
└── main.tsx          # Application entry point
supabase/             # Local configuration and SQL migrations
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines

- Write clear and descriptive commit messages
- Update documentation as needed
- Follow the existing code style
- Keep pull requests focused on a single feature or fix

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If UnitGol has been helpful, consider supporting the project by:

- Giving it a ⭐ on GitHub
- Sharing it with friends
- Contributing with code, tests, or ideas.

If you use this project, please provide attribution by linking back to this repository.

## 📧 Contact

Email: <jsg26398@gmail.com>

X (formerly Twitter) - [@Jose26398](https://x.com/Jose26398)

Project Link: [https://github.com/Jose26398/unitgol](https://github.com/Jose26398/unitgol)

---

_Created with ❤️ by Jose26398. Play fair and have fun!_

---
