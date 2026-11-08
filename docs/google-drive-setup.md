# Google Drive backup setup

The companion uses manual **Save to Google Drive** and **Load from Google Drive** buttons. No normal edit, page load, timer, or browser-storage event uploads or downloads a backup. Connecting only authorizes access. Each Save creates a dated JSON file in the app's private Drive data folder. Load lists backups newest first, lets the user select an earlier copy, and requires a preview and confirmation before replacing browser progress. Earlier cloud backups are never overwritten or automatically deleted.

The owner’s public OAuth client ID is configured locally and as the Pages workflow default. The owner has configured Google authorization and confirmed real Save/Load works in Chrome. The UI and HTTP client have automated tests and a development-only simulated browser harness.

## 1. Create the Google project and enable Drive

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project, for example **Fortune Weave Companion**, or use a dedicated existing project.
3. Open **APIs & Services → Library**, search for **Google Drive API**, and enable it.

No paid backend, API key, client secret, service account, Google Picker, or refresh-token service is used. Standard Drive API use is available without extra API charges within Google's quotas; see the [current usage and billing policy](https://developers.google.com/workspace/drive/api/guides/limits). A Google Cloud free-trial subscription is not required for this setup. Do not enable paid billing just to follow these instructions.

## 2. Configure Google authorization

In **Google Auth Platform**:

1. Open **Branding** (or **Get started**). Enter the app name, your support email, and your developer contact email. Review and accept Google's applicable terms yourself.
2. Choose audience **External** for personal Gmail accounts or a public application.
3. Start in **Testing**. In **Audience → Test users**, add the Google email addresses that will test Save/Load. These are the users' accounts; each user's backups stay in their own Drive.
4. In **Data Access → Add or remove scopes**, add only:

   ```text
   https://www.googleapis.com/auth/drive.appdata
   ```

   Google classifies this as a non-sensitive scope. It accesses only this app's private Drive folder. Do not substitute broad `drive`, `drive.readonly`, or Gmail scopes.

5. Save the configuration. Follow [Google's consent setup guide](https://developers.google.com/workspace/guides/configure-oauth-consent) if console labels differ.

## 3. Create the public web client ID

1. Open **Google Auth Platform → Clients → Create client**.
2. Select **Web application** and give it a name.
3. Under **Authorized JavaScript origins**, add the exact origins where you will use the app. For this repository's default GitHub Pages address:

   ```text
   https://hsf-apple.github.io
   ```

   Do **not** include `/fortune-weave-guide/`, a trailing route, or a `#` fragment. If the site uses a custom domain, add that HTTPS origin as well.

4. For local testing, also add:

   ```text
   http://localhost
   http://localhost:4173
   http://127.0.0.1:4173
   ```

   Use the origin matching the address in the browser. Google's localhost setup specifically recommends both the bare localhost origin and the port-specific origin.

5. Leave **Authorized redirect URIs** empty for this browser token-popup integration.
6. Create the client and copy the **Client ID**, which ends in `.apps.googleusercontent.com`. This client ID is public configuration; it is not a secret or a user token. Do not send or put a client secret in the repository.

See [Google's web authorization setup](https://developers.google.com/identity/oauth2/web/guides/get-google-api-clientid).

## 4. Configure the companion

### GitHub Pages build

The owner’s public web client ID is already the Pages workflow default. No repository variable is required for this configured project. To override the ID later, open the [repository](https://github.com/hsf-apple/fortune-weave-guide):

**Settings → Secrets and variables → Actions → Variables → New repository variable**

Set:

| Name | Value |
| --- | --- |
| `GOOGLE_DRIVE_CLIENT_ID` | Your complete public web client ID |

The Pages workflow passes the override, or its configured default, into Vite as `VITE_GOOGLE_CLIENT_ID`. The value is embedded at build time, so changing the variable requires a new build/deploy. Once the code is merged/published, run **Actions → Build and deploy GitHub Pages → Run workflow** to rebuild, or let the normal push-to-main workflow run.

Outside the configured Pages workflow, if `VITE_GOOGLE_CLIENT_ID` is absent or malformed, Drive controls remain unavailable and local export/import still works. There is no development client ID or demo token in the production build.

### Local development

Copy `.env.example` to `.env.local`, set the public ID, and restart Vite:

```dotenv
VITE_GOOGLE_CLIENT_ID=YOUR_PUBLIC_WEB_CLIENT_ID.apps.googleusercontent.com
```

Use the actual full ID copied from Google, including its numeric prefix. `.env.local` is ignored by Git.

## 5. Test with your account

1. Open **Navigation → Backup & restore** in a normal browser. Google may reject sign-in in embedded in-app browsers; use a browser tab if necessary.
2. Click **Connect Google Drive**, select an authorized test account, and grant app-data access. Connecting must not upload or load progress.
3. Click **Save to Google Drive**. Check the success message and **Last saved** date.
4. Change a harmless value in the planner. Return to backups and click **Load from Google Drive**. A valid connection is retained while navigating; if authorization is needed, the button opens Google authorization and then continues loading. Review the chosen backup, check the replacement box, and click **Restore backup**. Confirm the earlier value returns and survives reload.
5. On another browser or device, connect the same Google account and click Load. No previously stored browser-side file ID is needed to find the backups.
6. Test canceling Google authorization and canceling the restore preview. Both must leave current progress unchanged.

Tokens stay only in memory in the current browser tab and survive navigation around the tracker. Reloading or closing the tab discards the token; it also expires according to Google’s authorization response. Only a non-secret “used Drive before” preference is saved locally, separately from progress backups. This keeps Save/Load available on returning visits without claiming that the account is still authorized. Clicking Save or Load authorizes again only when necessary, then continues that action. Reconnect skips a forced account chooser for returning users where Google permits it; **Switch account** explicitly requests the chooser. No authorization, refresh, upload or download occurs just because a remembered preference exists. **Disconnect** clears the token and preference; it does not revoke authorization or delete cloud backups. Users can revoke permission in [Google Account connections](https://myaccount.google.com/connections) and manage app data in Google Drive Settings → Manage apps.

Saves are independent snapshots, not an automatic merge or live multi-device sync. On an uncertain upload result, the UI asks the user to check Load before retrying. This avoids pretending that a timed-out request definitely failed or definitely succeeded.

## 6. Make it available to other users

Testing mode only permits listed test accounts. When ready, move the app's Google audience/publishing status to production and complete any branding/domain review Google requests. Scope classification and brand verification are separate: `drive.appdata` avoids requesting sensitive/restricted Drive access, but does not waive Google's other production requirements.

For the default Pages address, configure the public app homepage and the included privacy page after they are deployed:

- Homepage: `https://hsf-apple.github.io/fortune-weave-guide/`
- Privacy: `https://hsf-apple.github.io/fortune-weave-guide/privacy.html`

Use your actual custom-domain URLs if applicable. Review the privacy description, contact details and any terms Google requires before publishing. Google may require ownership verification through Search Console; follow its [production requirements](https://developers.google.com/identity/protocols/oauth2/production-readiness/policy-compliance) and [brand verification guide](https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification). Separate development and production projects may be needed under those policies. Keep the production project stable: app-data backups belong to that Google application, so a replacement project should not be assumed to discover the old project's backups.

The public client ID has been configured in the local environment and Pages workflow. Google authorization audience, billing, and app-verification settings remain managed by the owner in Google Cloud. GitHub Pages deployment runs from the repository workflow on pushes to `main`.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Drive is unavailable in the UI | Set the complete OAuth client ID and rebuild/restart. |
| `origin_mismatch` | Register the browser's exact origin, without the repository path. |
| Access blocked while testing | Add that account under Audience → Test users. Confirm Drive API is enabled in the client ID's project. |
| Popup blocked or closed | Allow Google authorization popups for this site and click Connect again. |
| Session expired/revoked | Click Save, Load, or Reconnect to authorize again. No token needs to be copied or edited. |
| No backups found | Connect the same Google account and use the same Google Cloud application/project used to save them. |
| Rate limit, storage full, offline | Address the reported issue, then retry the button. There are no automatic upload retries. |
| A newer backup is damaged | Choose an earlier backup from the list; malformed data is rejected before restore. |

## Validation

`npm test` covers manual request boundaries, least-privilege authorization, token expiry/revocation, denied/blocked popups, account-session changes, multipart snapshots, fresh-browser discovery, pagination, malformed/oversized downloads, network errors, and quota/storage failures. Existing full-backup round-trip and model tests also run. `npm run build` checks the production bundle.

For UI verification without a real Google client, start the dev server and open `/tests/fixtures/drive.html`. This harness uses the real UI and HTTP client with explicitly simulated Google responses; it is not part of `dist/`. It cannot establish that Google's real OAuth configuration is correct.
