# Rotating secrets

`npm run secrets` rotates every credential the site uses and keeps Azure, GitHub and the local env files in step. It takes about half an hour, most of it in provider dashboards, plus about 2 minutes if the code runner token is included. It needs only a terminal. If `az` or `gh` is not logged in it offers to log you in.

## The short version

1. `npm run secrets:check` shows what is already wrong. Fix that first.
2. `npm run secrets` starts the wizard.
3. Set the same values in Northflank. The wizard can copy them.
4. Revoke the old credentials, then `npm run secrets -- --check-revoked`.
5. `npm run secrets -- --forget` deletes the saved old values.

## What the wizard does

1. **Checks your setup.** `az` and `gh` are installed and logged in, Azure can see the app, GitHub lets you set secrets, `.env.production` exists. It warns about env files other users can read, saved old secrets that are still around, and values where Azure and `.env.production` disagree.
2. **Asks what to rotate.** One line per provider, all checked except the slow code runner token, which shows its time estimate in red.
3. **Walks through each provider.** It shows the exact steps for that dashboard and why they are in that order, then asks for each value. For a database it asks for the user name and the password only and builds the connection string from them and the host in the current one. Enter keeps the current value of each part, so the user name can stay while the password changes. If you keep every part, the group is skipped. Typing shows `*`, backspace works, and enter on the first value skips the provider, which leaves every value as it is. Each prompt shows what is in use now: in full when it is not secret (a user name), the first three characters when it is. A wrong shape is caught at once: a Cloudinary secret pasted into the key field, an Atlas string that still says `<db_password>`, an R2 secret pasted where the key id goes.
4. **Tests every new value with its provider** before anything changes. A rejected value stops the run and you can type it again.
5. **Shows a review.** A short fingerprint of the old and new value (never the value), where each one is written, and what people will notice.
6. **Applies it in an order that can be undone.** Old values are saved first. The code runner VM token is changed in place if it is in the run. Then Azure is updated and restarted, and the app has to report healthy twice in a row. Only then are the local env files written, the rotation time recorded, and GitHub updated.
7. **Checks again** and ends with a "Your turn" list: the Northflank values, which old credentials to revoke, the report password if it changed.

The exact steps for each provider, and why, are in `scripts/secrets.manifest.mjs` (the `how` and `why` of each group), so they cannot drift from what the wizard shows.

## What the live checks do

| Provider      | Check                                                                                                                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MongoDB       | Logs in with the new string, reads `users` and `posts`, writes and deletes one document in a scratch collection (`__rotation_probe`), then drops it. This catches a user with the wrong privileges. |
| Cloudinary    | Pings the cloud with the key and secret.                                                                                                                                                            |
| Resend        | Sends an empty request to the emails endpoint. A bad key is refused, a good key answers with a validation error, nothing is sent.                                                                   |
| Cloudflare R2 | Asks for the bucket with the new token.                                                                                                                                                             |
| Turnstile     | Asks the verify endpoint with the new secret and a dummy response.                                                                                                                                  |
| Gemini        | Lists models with the new key.                                                                                                                                                                      |

If a provider cannot be reached the check is a warning and you decide whether to go on. If it rejects the value, the run does not continue unless you confirm twice.

## The code runner

The runner is a VM whose nginx checks a token. Azure does not allow changing a VM's boot data after it is created, so redeploying `infra/piston.bicep` cannot change the token (it fails with `PropertyChangeNotAllowed`). The wizard changes the token on the running VM instead. In the checklist this option is unselected by default and shows an estimate in red, because it slows the rest of the rotation.

The app keeps the old token until its Azure secret is updated and it restarts, so swapping the token on the VM in one step would answer 401 to the app for about a minute (and fire the "Code runner token rejected" alert). The change is done in two steps so that never happens:

1. It reads the token the VM has now from `infra/.secrets/piston-deploy.env` (not from `.env.production`, the two can drift and the VM is what a rollback has to match) and notes whether the VM is running.
2. It holds the VM on. The app deallocates the VM when `keepUntil` in the `coderunnerstates` collection is in the past, which would cancel the change halfway. The hold moves `keepUntil` forward the same way the admin hold does, and puts the old value back at the end.
3. **Open.** It starts the VM if it was stopped and runs a private script on it (`az vm run-command`) that rewrites the one token check in `/opt/piston/nginx.conf` so it accepts the old and the new token, and restarts the `piston_proxy` container. The script only runs if that line holds the old token (or the new one, when a run is repeated). It checks from inside the VM and from outside that both tokens get 200, then stops the VM again if it was stopped before and releases the hold.
4. Azure gets the new `piston-token`, the app restarts and is checked healthy, and the local files are written.
5. **Finish.** The same script runs once more and leaves only the new token in the check. It insists the line already holds the new token, checks the old one is now refused, and scrubs the old token from the boot-time copies under `/var/lib/cloud`.

If a step fails the app and the VM are put back on the old token. If it failed after the finish step started, the VM is first opened to both tokens again, so the app is not turned away while Azure goes back. The new token is also written to `infra/.secrets/piston-deploy.env` with the rest of the files. If a run is cut off between steps 3 and 5, the VM keeps accepting both tokens, which is safe, and running the wizard again finishes the job. If the VM is ever reimaged or recreated, it comes back with the token baked in at creation, so run the wizard again to change it.

## When each value was last rotated

- Every key the wizard changes in an env file gets a line above it: `# last rotated 2026-11-01 09:46 +07:00`. The next rotation replaces that line.
- GitHub records the update time of each secret on its own.
- Azure has no time for Container App secrets, so the wizard writes tags such as `rotated-jwt-secret` on the app. A tag holds a time and nothing else.

`npm run secrets:check` shows all three side by side and warns when a credential is older than 90 days.

## If something goes wrong

The run ends in one of these, in a box you cannot miss:

| Outcome                      | Meaning                                                                           | What to do                                                                                               |
| ---------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Done                         | Everything changed and the app is healthy.                                        | Do the "Your turn" list.                                                                                 |
| Done, with GitHub pending    | Azure and the files are fine, GitHub refused a secret after three tries.          | `npm run secrets -- --resume`                                                                            |
| Rolled back, nothing changed | A step failed or the app never got healthy. Everything is back on the old values. | Read the reason, fix it, run again.                                                                      |
| ATTENTION                    | The rollback failed too and the app may be down.                                  | `az containerapp logs show -g adorio-prod-rg -n adorio --tail 50`, then `npm run secrets -- --rollback`. |

Other commands:

- `npm run secrets -- --rollback` puts the local files, Azure, the code runner and GitHub back to the values from before the last run.
- `npm run secrets -- --sync-github` pushes GitHub secrets that exist locally but not on GitHub.
- Ctrl-C while applying lets the run finish first, so nothing is left half changed. Press it twice to force quit, then run `--rollback`.

If `https://adorio.space/api/health` answers 502 with the header `x-served-by: northflank-backup` while the Azure address is healthy, the Cloudflare worker has failed over and has not switched back. It probes every 5 minutes and needs two good probes in a row, so allow about 10 minutes. If it stays on the backup, check the Northflank env vars.

## Security notes

- **Old values.** They are saved in `~/.local/state/adorio/secret-rotation`, owner-only, outside the repository. The tool reads the mode back and refuses a folder that cannot be private. This matters here: the repo drive reports mode 777 for everything and ignores `chmod`. Delete the backups once the old credentials are revoked. `--check-revoked` proves they are dead by trying them, `--forget` overwrites and deletes the files. On btrfs an overwrite is best effort, so revoking is the real fix.
- **Values on screen.** Typed values show as `*`. Review screens and errors show only a length and a fingerprint. Output from `az` and `gh` has any secret value removed before it is shown.
- **Command lines.** `gh` receives values on stdin and the VM deployment gets its secrets from a private file. `az containerapp secret set` has no stdin form, so its command line holds the values for a moment and another user on the same machine could see them in `ps`. No program is started through a shell.
- **Env files.** They hold every secret, and on this drive any user on the machine can read them (mode 777). `secrets:check` warns about it. Moving the repo to a Linux filesystem fixes it.
- **Providers.** Each new value goes only to its own provider, over HTTPS. The MongoDB check writes one small document to a scratch collection and removes it.
- **Clipboard.** The Northflank values are copied with `wl-copy --sensitive` where it exists, so a clipboard manager that respects the hint skips them. Other tools cannot hide them from a clipboard history.
- **Dependencies.** None were added.
- **One run at a time.** A lock file stops two rotations from running together.

## Options

| Option                                    | What it does                                                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| (none)                                    | The wizard.                                                                                                        |
| `--dry-run`                               | Everything except the final write. The live checks still run.                                                      |
| `--gen KEY`                               | Generate a value for `KEY`, for the keys that can be generated.                                                    |
| `--set KEY`                               | Ask for the value of `KEY`, hidden. A value on the command line is refused, it would end up in your shell history. |
| `--yes`                                   | Skip the final confirmation.                                                                                       |
| `--rollback`, `--resume`, `--sync-github` | See above.                                                                                                         |
| `--check-revoked`                         | Try the old credentials and report which still work.                                                               |
| `--forget`                                | Delete the saved old values.                                                                                       |

## How the code is laid out

Two files describe this repository, everything else is generic:

- `scripts/secrets.config.mjs`: names, Azure resource group and app, health URL, the second copy of the app (Northflank), the code runner VM, follow-up commands, age limits.
- `scripts/secrets.manifest.mjs`: every env var (format, files, GitHub, Azure target), the provider groups with their steps, and values that are built from others.

`scripts/lib/` holds the logic, each file one job: `apply.mjs` (the ordered apply and rollback), `plan.mjs`, `validate.mjs`, `verify.mjs` (live checks), `checks.mjs` (status), `cloud.mjs` (`az` and `gh`), `files.mjs` and `envfile.mjs` (env files), `journal.mjs` and `safety.mjs` (private backups, redaction, locks), `externals/` (the code runner), and the screens (`preflight.mjs`, `wizard.mjs`, `run.mjs`, `modes.mjs`, `tui.mjs`). The unit tests are `__tests__/unit/rotate*.test.js`, run with `npm run test:unit`.
