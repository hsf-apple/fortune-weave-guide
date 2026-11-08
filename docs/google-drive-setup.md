# Google Drive connection details

For the complete Google Cloud, local environment, and GitHub Pages configuration, start with [Connect Google Drive in the README](../README.md#connect-google-drive-optional). Fork owners should use their own Google project and client ID.

## Configuration locations

| Environment | Setting |
| --- | --- |
| Local development | `VITE_GOOGLE_CLIENT_ID` in the ignored `.env.local` file. |
| GitHub Pages | `GOOGLE_DRIVE_CLIENT_ID` in repository Settings → Secrets and variables → Actions → Variables. |
| Deployment workflow | `.github/workflows/pages.yml` passes the repository variable, or the original site's fallback ID, to Vite. |
| App | `src/googleDrive.js` reads the client ID embedded by Vite at build time. |

Restart Vite after editing `.env.local`. Rebuild/redeploy after changing the GitHub variable. Local configuration does not change a deployed site. The README also explains how to remove the original fallback in a fork that does not use Drive.

## Connection behavior

Tokens stay in memory in the current browser tab and survive navigation around the companion. Reloading or closing the tab discards the token; it also expires according to Google's response. Only a non-secret “used Drive before” preference is saved locally, separately from progress backups. It contains no token or Google account details.

When authorization is needed, clicking Save, Load, or Reconnect opens Google's authorization window. Save and Load continue the requested action after authorization succeeds. Returning connections avoid forcing an account chooser where Google permits it; **Switch account** explicitly requests the chooser. The maintainer does not manually renew tokens. See [Google's browser token model](https://developers.google.com/identity/oauth2/web/guides/use-token-model).

The app may load Google's Identity Services library when Drive is configured. Loading that library or remembering a previous connection does not authorize an account or upload/download backups. Connecting authorizes access without saving or loading progress.

**Disconnect** clears the in-memory token and local preference. It does not revoke Google authorization or delete existing backups. Users can revoke access through [Google Account connections](https://myaccount.google.com/connections).

## Snapshot storage and moving between sites

Save to Google Drive and the header's Sync button both upload a dated JSON snapshot of all four paths. Older snapshots remain intact. These actions do not merge saves across devices. If a save result is uncertain, check Load before retrying.

The companion requests only `https://www.googleapis.com/auth/drive.appdata`. Backups live in the app's hidden Drive data folder, outside the normal Drive file list. Load discovers snapshots from the connected account and application, with pagination for older copies. A downloaded backup is validated and previewed before the user confirms replacement of browser progress. See [Google's application data folder documentation](https://developers.google.com/workspace/drive/api/guides/appdata).

Use the same Google account and Google application to retrieve existing Drive backups. A replacement Google Cloud project should not be assumed to find an earlier project's files. To move to a fork with its own project, export a JSON backup on the original site and import it on the fork, then save a new Drive snapshot there.

Users can manage hidden app data in **Google Drive Settings → Manage apps**. Deleting app data removes that cloud backup history. Downloaded JSON copies and browser saves are separate.

## Check your real Google configuration

1. Use a normal Chrome or other browser tab at an origin registered in your web client.
2. Connect an authorized test account. Confirm connecting alone does not save or load progress.
3. Save, then check the success status and Last saved date.
4. Change a harmless planner value, load the earlier snapshot, review the popup, and confirm Restore. Check that the previous value returns and survives a reload.
5. In another browser, connect the same Google account to the same application and load the snapshot. No browser-side file ID is needed.
6. Cancel authorization and cancel a restore preview; both should leave current progress unchanged.

The README covers common setup errors. For wider availability, remember that a successful GitHub Pages deployment does not change Google's Testing/production status.

## Developer validation

`npm test` covers backup round trips, validation and storage errors, manual request boundaries, authorization errors, expiry/revocation, account changes, multipart snapshots, discovery, pagination, malformed/oversized downloads, and network/quota failures. `npm run build` checks the production bundle.

For UI checks without a real Google connection, run the development server and open `http://localhost:4173/tests/fixtures/drive.html`. This fixture uses simulated Google responses with the actual UI and HTTP client. It is not included in `dist/` and cannot validate a real Google Cloud project's configuration.
