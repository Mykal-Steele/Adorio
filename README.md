# Adorio

[![CI](https://github.com/Mykal-Steele/Adorio/actions/workflows/ci.yml/badge.svg)](https://github.com/Mykal-Steele/Adorio/actions/workflows/ci.yml)
[![License: AGPL v3](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0.en.html)

My personal site and a social app, plus a handful of side projects, all living in one repo and deployed together. Live at [adorio.space](https://adorio.space).

**Stack:** Next.js 16 (App Router) + Express + MongoDB, served through Nginx in Docker, hosted on Azure Container Apps.

## What's actually on this site

- **Portfolio** (`/`, `/about`, `/projects`, `/contact`) — my personal site, styled like a code editor
- **Social feed** (`/social`) — posts, likes, threaded comments, the usual, with real auth
- **Coding practice** (`/coding`) — Java and algorithms problems. JS runs in-browser; Java and Python compile and run server-side against a self-hosted [Piston](https://github.com/engineer-man/piston) sandbox
- **Runway** (`/finance`, login required) — personal budget/runway tracker
- **File Hosting** (`/hosting`, login required) — drop an HTML file, get it hosted
- **Rhythm Dots** (`/rygame`, login required) — canvas rhythm game
- **Send Env** (`/sendenv`, login required) — encrypted note-to-self vault, pulled with `curl`
- **Data Lookup** (`/data-lookup`, login required) — visitor analytics dashboard
- **Smart City APIs** (`/smartcity`) — docs/demo page for some bank API work
- **AI exam-prep sidecar** (`/cao/`) — separate Vite app, built and served independently

## Quick start

```bash
npm run setup
npm run dev:full       # frontend :3001 + backend :3000
```

`npm run setup` installs the root app, the Express backend, and the AI sidecar's deps. Root `npm install` alone won't get you a working `dev:full`.

Needs Node 24+.

## Setting this up from a fresh clone

**Before you start**, you'll need:

- [Node.js](https://nodejs.org) 24 or newer
- [Docker](https://docs.docker.com/get-docker/), only if you plan to run `docker compose` or the integration tests, not needed for plain `npm run dev:full`
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free tier is fine), there's no local Mongo container in this repo

1. **Clone and install**

   ```bash
   git clone https://github.com/Mykal-Steele/Adorio.git
   cd Adorio
   npm run setup
   ```

2. **Set up Mongo.** No account: sign up free at [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register). Then: create a free M0 cluster, add a db user + password, allow your IP under Network Access (or `0.0.0.0/0` for a dev DB). "Connect" → "Drivers" gives you the connection string.

3. **Copy the env file and fill it in.**

   ```bash
   cp .env.example .env.development
   ```

   Every var has a comment saying where to get it. Minimum to run: `MONGO_URI` (step 2), `JWT_SECRET` (`openssl rand -hex 32`), `CLIENT_URL` (`http://localhost:3001`).

4. **(Optional) Cloudinary**, for image uploads. Skip it and the backend just disables uploads in dev with a warning. Sign up at [cloudinary.com](https://cloudinary.com), grab `CLOUDINARY_NAME`/`CLOUDINARY_KEY`/`CLOUDINARY_SECRET` from the API Keys page.

5. **(Optional) Piston**, for Java/Python submissions on the Coding page. JS problems run in-browser regardless. See [Running your own Piston](#running-your-own-piston).

6. **(Optional) ai-slop env**, only if touching `/cao`:

   ```bash
   cp ai-slop/AI-Slop-For-CAO-exam/.env.example ai-slop/AI-Slop-For-CAO-exam/.env.development
   ```

   Fill in `VITE_GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/apikey).

7. **Run it.**

   ```bash
   npm run dev:full
   ```

   `node backend/test-env.js` tells you which required vars are missing if something's off.

## Daily workflow

```bash
npm run dev:full       # normal local work
npm run dev:backend    # backend only
npm run dev            # frontend only
npm run dev:ai-slop    # AI sidecar only, if working on /cao
```

## Repo map

- `src/`: main Next.js app. Most frontend work starts here.
- `backend/`: Express API. Most server work starts here.
- `ai-slop/AI-Slop-For-CAO-exam/`: separate Vite app served at `/cao/`.
- `backend-go/`: experimental backend, not deployed. Ignore for normal product work.
- `infra/`: Bicep templates for the Azure hosting setup. Applied by hand, not by CI.
- `cloudflare-worker/`: failover worker that sits in front of the site.
- `public/`: static assets.
- `scripts/`: repo utilities.
- `__tests__/`: integration tests.

If you only want normal product work, focus on `src/` and `backend/`.

After switching between Windows and Linux:

```bash
node scripts/sync-platform-deps.cjs
```

## Docker

```bash
docker compose up --build                             # dev, port 8080
docker compose -f docker-compose.prod.yml up --build   # prod, port 80
```

Both read `.env.development` for their env vars (see `docker-compose.yml`'s `env_file:`), plus the plain `.env` at root for `VITE_GEMINI_API_KEY` (that one's just for Compose's own `${VAR}` substitution, not app runtime config).

## Build

```bash
npm run build
```

## Code quality

```bash
npm run format         # prettier fix
npm run format:check   # prettier check (CI)
npm run lint
npm run typecheck
```

## Tests

Integration tests are Puppeteer-based and run against real Docker containers, no mocks, so you need Docker running.

```bash
npm run test:dev    # against dev containers
npm run test:prod   # against prod containers, same as CI runs
```

## Azure prerequisites

Both sections below need these. Skip if you already have them.

- **An Azure account and subscription.** No account: go to [azure.microsoft.com/free](https://azure.microsoft.com/free), sign up (needs a credit card, but the free tier + new-account credit covers this project easily). Already have an account but no subscription: [portal.azure.com](https://portal.azure.com) → search "Subscriptions" → "Add".
- **Azure CLI (`az`)**, installed and logged in:

  ```bash
  curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash   # Linux (Debian/Ubuntu)
  brew install azure-cli                                    # macOS
  # Windows: https://aka.ms/installazurecliwindows
  az login
  ```

  Bicep support (`az bicep build`, `az deployment group create`) comes bundled, `az` installs it on first use if it's missing.

- **An SSH key pair**, for Piston's admin access. Skip if you already have one:

  ```bash
  ssh-keygen -t ed25519 -f ~/.ssh/adorio-piston -C "your-email@example.com"
  ```

  Use `~/.ssh/adorio-piston.pub`'s contents as `PISTON_ADMIN_SSH_PUBLIC_KEY` below.

## Running your own Piston

Runs Java/Python submissions on the Coding page. No shared instance, you deploy your own.

1. Generate secrets:

   ```bash
   mkdir -p infra/.secrets && cd infra/.secrets
   openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
     -keyout piston-tls-key.pem -out piston-tls-cert.pem \
     -subj "/CN=your-piston-hostname"
   ```

   Create `infra/.secrets/piston-deploy.env` (format in `infra/.secrets/README.md`):

   ```bash
   PISTON_RESOURCE_GROUP=your-resource-group
   PISTON_AUTH_TOKEN=<openssl rand -hex 32>
   PISTON_ADMIN_SSH_PUBLIC_KEY=<contents of ~/.ssh/adorio-piston.pub from the prerequisites above>
   PISTON_SSH_SOURCE_ADDRESS_PREFIX=<your IP, CIDR form, e.g. 203.0.113.4/32>
   ```

   `infra/.secrets/` is gitignored, keep it that way.

2. Create the resource group and deploy:

   ```bash
   set -a; source infra/.secrets/piston-deploy.env; set +a
   az group create -n "$PISTON_RESOURCE_GROUP" -l southeastasia
   az deployment group create -g "$PISTON_RESOURCE_GROUP" \
     --template-file infra/piston.bicep \
     --parameters \
       adminSshPublicKey="$PISTON_ADMIN_SSH_PUBLIC_KEY" \
       sshSourceAddressPrefix="$PISTON_SSH_SOURCE_ADDRESS_PREFIX" \
       pistonAuthToken="$PISTON_AUTH_TOKEN" \
       pistonTlsCert="$(cat infra/.secrets/piston-tls-cert.pem)" \
       pistonTlsKey="$(cat infra/.secrets/piston-tls-key.pem)"
   ```

   Provisions a VM scale set behind a load balancer, installs Docker, boots Piston with Java and Python packages. Takes a few minutes. Use `az vmss run-command invoke` to check boot status if it's slow.

3. Set in `.env.development`, using the FQDN the deploy gives you:

   ```bash
   PISTON_URL=https://your-name.<region>.cloudapp.azure.com:2358
   PISTON_TOKEN=<your PISTON_AUTH_TOKEN>
   PISTON_CA_CERT=<contents of piston-tls-cert.pem>
   ```

   `PISTON_CA_CERT` is only enforced in production, optional locally.

4. Changing the boot script: cloud-init only runs on first boot. Redeploying the template alone won't apply it, you need to also reimage:

   ```bash
   az vmss reimage -g "$PISTON_RESOURCE_GROUP" -n adorio-piston-vmss --instance-ids 0
   ```

   Java/Python submissions go down briefly while that instance reprovisions.

## Deploying your own copy to Azure

One Docker image on Azure Container Apps, covers everything except Piston. `infra/main.bicep` creates the Container Apps environment, the registry, the container app, and the GitHub Actions deploy identity (OIDC, no stored password).

1. Fork the repo. Edit `infra/main.bicep`'s `githubRepo` param default to `your-username/your-fork`, the OIDC trust is scoped to one repo.

2. First deploy, registry has no image yet so use a placeholder:

   ```bash
   az login
   az group create -n your-resource-group -l southeastasia
   az deployment group create -g your-resource-group \
     --template-file infra/main.bicep \
     --parameters \
       containerImage=mcr.microsoft.com/k8se/quickstart:latest \
       mongoUri="<your MONGO_URI>" \
       jwtSecret="<openssl rand -hex 32>" \
       refreshTokenSecret="<openssl rand -hex 32>" \
       cloudinaryKey="<your Cloudinary key>" \
       cloudinarySecret="<your Cloudinary secret>" \
       cloudinaryUrl="<your Cloudinary URL>" \
       cloudinaryName="<your Cloudinary name>" \
       resendApiKey="<your Resend key>" \
       pistonUrl="<your Piston URL, or \"\" if skipping it>" \
       pistonToken="<your Piston token, or \"\">" \
       pistonCaCert="<your Piston cert, or \"\">" \
       clientUrl="https://your-domain-or-the-default-fqdn"
   ```

3. Add these GitHub secrets (repo settings → Secrets and variables → Actions):

   | Secret                          | Value                                                                                                  |
   | ------------------------------- | ------------------------------------------------------------------------------------------------------ |
   | `AZURE_CLIENT_ID`               | `deployIdentityClientId` output from step 2                                                            |
   | `AZURE_TENANT_ID`               | `az account show --query tenantId -o tsv`                                                              |
   | `AZURE_SUBSCRIPTION_ID`         | `az account show --query id -o tsv`                                                                    |
   | `MONGO_URI`, `JWT_SECRET`, etc. | same values from step 2, CI's integration tests need them too, full list in `.github/workflows/ci.yml` |

4. Push to `main`. CI builds the real image, pushes it, deploys it, replacing the placeholder. After this, `infra/main.bicep` only gets manually re-applied for infra changes, not code changes, CI handles those via `az containerapp update`. Always pass `containerImage=<currently running image>` on a manual re-apply, no default on purpose so a re-apply can't silently reset the live image.

5. Custom domain and budget alerts are optional. Custom domain: `az containerapp hostname add`. Budget alert: `infra/budget.bicep`.

## Environment variables

All of these are gitignored, local-only. Nothing in git ever has real secrets in it. Production reads its own values straight from Azure Container App config (`infra/main.bicep`), not from any of these files.

### Root `.env.development` / `.env.production`

Copy `.env.example` to get started (see the setup steps above). One shared file for both the frontend and the backend (`backend/config/environment.js` reads it directly, resolved from the repo root regardless of where you start it from). `.env.production` is only for local "does this behave right in prod mode" testing, real production secrets live in Azure, not here.

**Required** (the backend refuses to start cleanly without these):

| Variable     | Purpose                                                   | Where to get it                                                                         |
| ------------ | --------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `MONGO_URI`  | MongoDB connection string                                 | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) → free cluster → Connect → Drivers |
| `JWT_SECRET` | Signs access tokens, and doubles as the Send Env HMAC key | Make one up: `openssl rand -hex 32`                                                     |
| `CLIENT_URL` | Added to the CORS allow list                              | `http://localhost:3001` for local dev                                                   |

**Commonly set, but the app degrades gracefully without them:**

| Variable               | Default if unset                                | Purpose                                      | Where to get it                                                                     |
| ---------------------- | ----------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------- |
| `PORT`                 | `3000`                                          | Backend listen port                          | pick any free port                                                                  |
| `REFRESH_TOKEN_SECRET` | falls back to `JWT_SECRET`                      | Signs 7-day refresh tokens                   | `openssl rand -hex 32`, or leave it blank                                           |
| `BACKEND_INTERNAL_URL` | `http://localhost:3000`                         | Next.js SSR's URL for talking to the backend | leave the default for local dev                                                     |
| `CLOUDINARY_NAME`      | uploads disabled (dev only, hard error in prod) | Image uploads                                | [cloudinary.com](https://cloudinary.com) → free account → dashboard's API Keys page |
| `CLOUDINARY_KEY`       | same as above                                   | Image uploads                                | same dashboard page                                                                 |
| `CLOUDINARY_SECRET`    | same as above                                   | Image uploads                                | same dashboard page                                                                 |
| `RESEND_API_KEY`       | contact form send fails silently                | Sends the `/contact` page's email            | [resend.com](https://resend.com) → API Keys                                         |

**Feature-specific, safe to skip unless you're working on that feature:**

| Variable                   | Purpose                                                                           | Where to get it                                                                                |
| -------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `PISTON_URL`               | Where the Coding page sends Java/Python submissions                               | your own Piston deploy, see [Running your own Piston](#running-your-own-piston)                |
| `PISTON_TOKEN`             | Auth token for the above                                                          | whatever `PISTON_AUTH_TOKEN` you generated setting up Piston                                   |
| `PISTON_CA_CERT`           | Pins Piston's self-signed cert as trusted (prod only)                             | `infra/.secrets/piston-tls-cert.pem` from setting up Piston                                    |
| `LEADERBOARD_MAX_AGE_DAYS` | How far back the rhythm game leaderboard looks (default `30`)                     | just a number, pick one                                                                        |
| `TEST_USER_TTL_MINUTES`    | How old a test-pattern account has to be before cleanup deletes it (default `60`) | just a number, pick one                                                                        |
| `VITE_BACKEND_URL`         | Extra CORS origin, rarely needed locally                                          | leave blank                                                                                    |
| `AUDIT_PASSWORD`           | Encrypts/decrypts the `/performance` report (`scripts/encrypt-report.mjs`)        | make one up, only matters to you                                                               |
| `DO_API_TOKEN`             | Legacy admin stats widget, left over from before the Azure move. Safe to ignore.  | [DigitalOcean API tokens page](https://cloud.digitalocean.com/account/api/tokens), if relevant |
| `UPTIMEROBOT_API_KEY`      | Same admin stats widget, optional uptime data                                     | [UptimeRobot](https://uptimerobot.com) → account settings → API Settings                       |

### `ai-slop/AI-Slop-For-CAO-exam/.env.development`

Copy `ai-slop/AI-Slop-For-CAO-exam/.env.example`. Only used if you're building or running the `/cao` sidecar.

| Variable              | Purpose                             | Where to get it                                                         |
| --------------------- | ----------------------------------- | ----------------------------------------------------------------------- |
| `VITE_GEMINI_API_KEY` | Gemini API key for the exam-prep AI | [Google AI Studio](https://aistudio.google.com/apikey), free tier works |

### `backend-go/.env`

Only touches the experimental, undeployed Go backend. `JWT_SECRET` and `MONGO_URI`, kept in sync with the root ones by hand if you ever actually need this.

### `scripts/.env`

Just `AUDIT_PASSWORD`, used by `scripts/audit.mjs`, unrelated to the running app.

### Docker build args

| Arg                   | Values                                     |
| --------------------- | ------------------------------------------ |
| `ENV`                 | `development` or `production`              |
| `VITE_GEMINI_API_KEY` | Gemini key baked into the AI sidecar build |

## License

AGPL-3.0. [Details](https://www.gnu.org/licenses/agpl-3.0.en.html)
