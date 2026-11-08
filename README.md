# Fortune's Weave Build Companion

A browser-based planner for rosters, class routes, character progress, equipment, abilities, and quests across Cai, Dietrich, Theodora, and Leda's paths.

[Open the live companion](https://hsf-apple.github.io/fortune-weave-guide/)

Progress stays in your browser. JSON export/import works without an account. Google Drive backups are optional; the app runs locally or on GitHub Pages without a backend.

## Set up locally

Install [Node.js 22](https://nodejs.org/en/download) and [Git](https://git-scm.com/downloads), then run:

```sh
git clone https://github.com/hsf-apple/fortune-weave-guide.git
cd fortune-weave-guide
npm ci
npm run dev
```

Open **http://localhost:4173**. Keep the terminal running; press **Ctrl+C** to stop it. If you forked the repository, clone your fork's URL instead.

Google setup is not needed to use the planner or local backups. To enable Drive locally, follow [Connect Google Drive](#connect-google-drive-optional).

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server on port 4173. |
| `npm test` | Run the backup, Google Drive, and data/model tests. |
| `npm run build` | Generate the production site in `dist/`. |
| `npm run preview` | Serve an existing production build on port 4173. |

Stop the development server before starting preview: both use the same port. Use the server URL rather than opening `index.html` directly. Build scripts prepare the required artwork and static files automatically.

## Publish on your own GitHub Pages

1. **Fork this repository** to your GitHub account. A public repository can use GitHub Pages with GitHub Free.
2. In your fork, open **Actions** and enable workflows if GitHub prompts you.
3. Open **Settings → Pages → Build and deployment** and select **GitHub Actions** as the source. The repository already includes the deployment workflow; you do not need to generate another one.
4. If you want Drive backups, complete [Google setup](#connect-google-drive-optional) and add your own client ID to your fork before deploying. See the note below if you want to disable Drive.
5. Open **Actions → Build and deploy GitHub Pages → Run workflow**, select `main`, and run it.
6. When the build and deploy jobs succeed, open the site link shown in **Settings → Pages**. A normal project site uses:

   ```text
   https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/
   ```

For later updates, push to your fork's `main` branch. The workflow installs dependencies, runs tests, builds the site, and deploys `dist/`. Relative asset paths and hash navigation support a different repository name without changing Vite's base path. See [GitHub's Pages setup instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) and [workflow guide](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

**About the included Google client ID:** [.github/workflows/pages.yml](.github/workflows/pages.yml) contains the original site's public client ID as a fallback. Fork owners should configure their own `GOOGLE_DRIVE_CLIENT_ID` repository variable; the original Google application does not automatically authorize your site.

To publish **without Google Drive**, change the workflow's existing `VITE_GOOGLE_CLIENT_ID` line to the following and leave the repository variable unset:

```yaml
VITE_GOOGLE_CLIENT_ID: ${{ vars.GOOGLE_DRIVE_CLIENT_ID }}
```

This removes the fallback for your fork. Planner features and JSON backup/import remain available.

## Connect Google Drive (optional)

The site maintainer completes this setup once. People using that site then connect their own Google accounts; each person's backups go to their own Drive. You do not need to manually replace user access tokens.

### 1. Create a Google project

Open [Google Cloud Console](https://console.cloud.google.com/), create a project, and give it a recognizable name, such as **Fortune Weave Companion**. Under **APIs & Services → Library**, enable **Google Drive API**.

This integration needs a public OAuth web client ID. It does not use an API key, client secret, service account, or backend token service.

### 2. Set up the consent screen

In **Google Auth Platform**:

1. Open **Branding / Get started** and enter your app name, support email, and developer contact email.
2. Choose **External** for personal Google accounts. Start in **Testing**, then add your account and other testers under **Audience → Test users**.
3. Under **Data Access → Add or remove scopes**, add only:

   ```text
   https://www.googleapis.com/auth/drive.appdata
   ```

4. Save the configuration.

Follow [Google's consent screen guide](https://developers.google.com/workspace/guides/configure-oauth-consent) if labels differ. This [non-sensitive scope](https://developers.google.com/workspace/drive/api/guides/appdata) gives access to the app's hidden backup folder, rather than your general Drive files.

### 3. Create a web client ID

Open **Google Auth Platform → Clients → Create client** and choose **Web application**. Under **Authorized JavaScript origins**, add the origins you use:

| Where you run the app | Origin to register |
| --- | --- |
| Local development | `http://localhost` and `http://localhost:4173` |
| Local IP address | `http://127.0.0.1:4173` |
| Your GitHub Pages site | `https://YOUR-USERNAME.github.io` |
| A custom domain | Your exact HTTPS origin, such as `https://planner.example.com` |

Replace the example username/domain. Origins contain no repository path or `#` route: for `https://alice.github.io/my-planner/`, register `https://alice.github.io`.

Leave **Authorized redirect URIs** empty for this app's popup token flow. Create the client and copy the full **Client ID** ending in `.apps.googleusercontent.com`. See [Google's web client setup](https://developers.google.com/identity/oauth2/web/guides/get-google-api-clientid).

### 4. Add the client ID to the app

Configure whichever environments you use. Local and GitHub settings are separate.

**Local development**

In the repository folder:

```sh
cp .env.example .env.local
```

Edit `.env.local` and set:

```dotenv
VITE_GOOGLE_CLIENT_ID=YOUR_FULL_CLIENT_ID.apps.googleusercontent.com
```

Replace the entire example value with the ID copied from Google, including its numeric prefix. Restart `npm run dev`. If using a production preview, rebuild with `npm run build` before restarting preview. `.env.local` is ignored by Git.

**Your GitHub Pages deployment**

In your fork, open **Settings → Secrets and variables → Actions → Variables → New repository variable**:

| Name | Value |
| --- | --- |
| `GOOGLE_DRIVE_CLIENT_ID` | Your complete OAuth web client ID |

Use a repository **variable**, not a secret. Run **Actions → Build and deploy GitHub Pages → Run workflow** again. The workflow embeds the ID at build time; changing a variable alone does not update the published site.

The client ID is public configuration and will appear in the built JavaScript. Never put a client secret or access token in a `VITE_` variable, repository variable, or committed file.

### 5. Test backup and restore

1. Open your local or published site in Chrome or another normal browser tab.
2. Click **Connect Drive** in the header and authorize an account listed in your Google project's test users. Connecting alone does not create a backup.
3. Click **Sync** to save the current progress. You can also use **Navigation → Backup & restore → Save to Google Drive**.
4. Open **Load from Google Drive**, choose a dated backup in the popup, review the preview, and confirm **Restore backup**. Restoring replaces all four paths; export your current progress first if you need to keep it.

Each Save/Sync creates a separate snapshot. Loading and saving happen on button clicks; Sync uploads your current save and does not merge changes from another device.

### 6. Allow users beyond your testers

Publishing on GitHub Pages and publishing your Google OAuth application are separate steps. While Google is in **Testing**, only your listed test users can connect.

For wider use, change the Google application's publishing status to production and complete any review Google requests. Set your own homepage and privacy links in Branding:

```text
Homepage: https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/
Privacy:  https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/privacy.html
```

Review [privacy.html](privacy.html) and update its maintainer/contact link for your fork before using it as your policy. Follow [Google's branding and domain verification requirements](https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification); a non-sensitive scope does not remove separate branding requirements.

## Keep and move your saves

Open **Navigation → Backup & restore** to export a JSON file or import an existing backup. A backup includes all four paths, rosters, plans, progress, notes, loadouts, quests, and spoiler settings. Imports validate the file and require confirmation before replacing your save. Supported backups are limited to 5 MB.

Browser saves belong to a browser profile and site origin. Localhost, your fork, and the original live site have separate saves. Export before changing sites, browsers, devices, or clearing site data; import on the destination site. Clearing browser data cannot be undone without an earlier JSON or Drive backup.

Drive snapshots are hidden from the normal Drive file list and are loaded through the companion. A different Google Cloud application should not be expected to find the original application's backups. Use JSON export/import when moving to your own Google project.

The app remembers that you used Drive, but keeps access tokens only in the current tab's memory. Reloading, closing the tab, or token expiry may require Google authorization again when you click Save, Load, or Reconnect. **Disconnect** clears the local connection preference without deleting cloud backups. See [Drive connection details](docs/google-drive-setup.md) for account switching, retention, and further checks.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| `npm` is not found | Install Node.js 22, then reopen your terminal. |
| Port 4173 is already in use | Stop the other dev/preview server before starting a new one. |
| GitHub Pages fails or shows a 404 | Enable Actions, select GitHub Actions as the Pages source, and inspect the latest build/deploy jobs. Use the URL in Settings → Pages. |
| Drive controls are unavailable | Set the full client ID, then restart local development or rebuild/redeploy the published site. |
| Google reports `origin_mismatch` | Register the exact browser origin in your own web client, including the local port but excluding the repository path. |
| Google blocks a test account | Add that email to Audience → Test users; check that Drive API is enabled in the same project as the client. |
| Google popup fails | Allow popups and use a normal browser tab instead of an embedded in-app browser. |
| Changing `.env.local` did not change GitHub Pages | Set the GitHub repository variable and redeploy; local environment files are not uploaded. |
| No Drive backups appear | Use the same Google account and Google application that created them. For a different application, transfer a JSON export. |
| Connection expired | Click Reconnect, Save, or Load to authorize again. No manual token editing is needed. |
| Save was not confirmed | Check Load for a new snapshot before retrying, to avoid duplicate backups. |

For API quotas and billing terms, consult [Google's current Drive usage policy](https://developers.google.com/workspace/drive/api/guides/limits). This app does not require a paid backend; account storage and service limits still apply.

## Project structure and data

Built with React 19, Tailwind CSS 4, and Vite. Shared components render every path and character.

| Location | Purpose |
| --- | --- |
| `src/App.jsx`, `src/CharacterWorkspace.jsx` | Navigation and character planning workspace. |
| `src/model.js` | Save normalization, migration, and progression logic. |
| `src/backup.js`, `src/googleDrive.js` | JSON backups and Google authorization/Drive requests. |
| `src/catalog.js`, `src/classData.js`, `src/buildData.js` | Characters, classes, and reference builds. |
| `src/sourceData.js`, `src/additionalGuides.js` | Publisher registry and additional reference guides. |
| `src/LoadoutWorkspace.jsx`, `src/loadoutCatalog.js` | Equipment and ability planning. |
| `tests/` | Automated checks and a development-only Drive UI fixture. |
| `.github/workflows/pages.yml` | Test, build, and GitHub Pages deployment. |

The catalog includes 63 characters, each with a local portrait, and 411 reference entries. Sources for the added Eshmel (Type A), Hong Hua, and Troy portraits are recorded in `research/portrait-sources.json`. Source coverage and uncertainty are recorded in `research/build-source-coverage.json` and `research/source-review-status.json`. Guide recommendations and companion-written coaching are planning references, not independently verified in-game guarantees. Equipment, starting records, recruitment rules, and exact class-exam calculations have incomplete coverage. Character artwork belongs to Nintendo / Intelligent Systems and its respective rights holders.
