# Deployment Guide

## Current deploy method (manual)

1. `npm run build` — produces the `build/` folder
2. FTP into `lukemelong.com` and copy the contents of `build/` to `/home/dh_vzqxdi/lukemelong.com/`
3. FTP any new/changed files from `server/` to `/home/dh_vzqxdi/lukemelong.com/` as well
4. `server/speedrun-config.php` must exist on the server but is **not** in the repo — see MySQL setup below

## Server-side PHP files (`server/` directory)

The `server/` folder in the repo holds PHP files that live alongside the React build at the webroot.
Deploy them by copying them to `/home/dh_vzqxdi/lukemelong.com/` the same way you deploy the build.

Files that must exist on the server but are **not in the repo** (credentials):
- `speedrun-config.php` — copy from `speedrun-config.example.php` and fill in values

## MySQL setup (speedrun tracker)

Find the database credentials in the Dreamhost panel under **Manage Databases**.
You will need: hostname, database name, username, and password.

Copy the example config to the server:
```
server/speedrun-config.example.php  →  /home/dh_vzqxdi/lukemelong.com/speedrun-config.php
```
Then fill in the four constants. The PHP API creates the two required tables automatically on first request — no manual SQL needed.

---

## Setting up automated deployment via GitHub Actions (future)

When ready to automate, follow these steps.

### Step 1 — Enable SSH on Dreamhost

In the Dreamhost panel: **Manage Users → your user (`dh_vzqxdi`) → Edit → Shell type → bash** (if not already set).

### Step 2 — Generate a deploy SSH key pair (run locally)

```bash
ssh-keygen -t ed25519 -C "github-deploy-lukemelong" -f ~/.ssh/dreamhost_deploy
# Press Enter twice for no passphrase
```

Two files are created:
- `~/.ssh/dreamhost_deploy` — private key (never share or commit)
- `~/.ssh/dreamhost_deploy.pub` — public key (safe to share)

### Step 3 — Add the public key to Dreamhost

In the panel: **Manage Users → dh_vzqxdi → Manage SSH Keys → Add Key**.
Paste the contents of `~/.ssh/dreamhost_deploy.pub`.

Or via SSH if access is already working:
```bash
ssh dh_vzqxdi@<ssh-hostname> "cat >> ~/.ssh/authorized_keys" < ~/.ssh/dreamhost_deploy.pub
```

### Step 4 — Test the connection

```bash
ssh -i ~/.ssh/dreamhost_deploy dh_vzqxdi@<ssh-hostname>
```

You should get a shell without a password prompt.

### Step 5 — Get the server host key for known_hosts

```bash
ssh-keyscan -H <ssh-hostname>
```

Copy the output — it goes into the GitHub Actions workflow as `DREAMHOST_KNOWN_HOSTS`.

### Step 6 — Add GitHub Secrets

In the GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**

| Secret name | Value |
|---|---|
| `DREAMHOST_SSH_KEY` | Full contents of `~/.ssh/dreamhost_deploy` (including `-----BEGIN...` lines) |
| `DREAMHOST_KNOWN_HOSTS` | Output of `ssh-keyscan` from step 5 |

### Step 7 — Create the workflow file

Create `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      - run: npm run build

      - name: Deploy via rsync
        env:
          SSH_KEY: ${{ secrets.DREAMHOST_SSH_KEY }}
          KNOWN_HOSTS: ${{ secrets.DREAMHOST_KNOWN_HOSTS }}
        run: |
          mkdir -p ~/.ssh
          echo "$SSH_KEY" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          echo "$KNOWN_HOSTS" >> ~/.ssh/known_hosts
          rsync -az --delete \
            -e "ssh -i ~/.ssh/deploy_key" \
            build/ \
            dh_vzqxdi@<ssh-hostname>:/home/dh_vzqxdi/lukemelong.com/
          rsync -az \
            -e "ssh -i ~/.ssh/deploy_key" \
            --exclude='speedrun-config.php' \
            server/ \
            dh_vzqxdi@<ssh-hostname>:/home/dh_vzqxdi/lukemelong.com/
```

> **Note:** The `--exclude='speedrun-config.php'` flag prevents rsync from overwriting the live credentials file. The `--delete` flag on the build sync removes old build files from the server.
