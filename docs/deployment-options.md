# Field Journal — Deployment Options & Runbook

> **Status:** Decision document with a verified current-state addendum. This document records deployment facts; branch and DNS changes still require a direct owner decision.
> **Target repo:** `hearthandcode/hearthandcode-field-journal`
> **Target domain:** `blog.hearthandcode.dev` (subdomain under existing `hearthandcode.dev` zone)
> **Project:** Astro 7 static site, `npm run build` → `dist/`

---

## Current deployment state (verified 2026-07-21)

- The Git-integrated Cloudflare Pages project `hearthandcode-field-journal` already exists.
- The Pages project's production deployment is sourced from `preview/field-journal-initial`.
- `blog.hearthandcode.dev` is bound and returned `HTTP/2 200` from this environment during the release preflight.
- `main` remains a separate branch. Moving the production source to `main` is a distinct branch-policy decision, not a requirement for the current production release path.

The project-creation instruction below is retained as the original runbook reference. The next real Journal infrastructure decision is whether to change the production branch policy. Do not treat this addendum as a general release authorization.

---

## 1. Decision Summary

**Recommendation: Cloudflare Pages with Git integration.**

The existing `hearthandcode.dev` apex domain is already hosted on Cloudflare. Putting the Field Journal blog on Cloudflare Pages keeps DNS management, HTTPS termination, and the CDN edge under one pane of glass. Cloudflare Pages supports Astro builds, GitHub check runs, and configurable preview deployments without a deployment token in the repository.

**Git-integration boundary:** Cloudflare documents that a Pages project created with Git integration cannot later switch to Direct Upload. Select Git integration deliberately for this project, and use a separate project if a Direct Upload workflow is ever required.

GitHub Pages remains a viable fallback. It is well-documented, free, and integrated with the repository, but it adds an extra DNS provider hop (Cloudflare DNS → GitHub Pages) and requires a GitHub Actions workflow file that Cloudflare Pages does not need.

---

## 2. Comparison Matrix

| Criterion | GitHub Pages | Cloudflare Pages |
|---|---|---|
| **Build trigger** | Push to `main` (via Actions) | Push to the production branch and configured preview branches |
| **Build command** | `npm run build` (configured in Actions workflow) | `npm run build` (auto-detected for Astro) |
| **Output directory** | `dist` (configured in Actions) | `dist` (auto-detected for Astro) |
| **Node version** | Must pin in Actions (project requires ≥22) | Auto-detected or set via env var `NODE_VERSION` |
| **Preview URL** | None by default; `https://<org>.github.io/<repo>/` on main | Unique preview URL for configured non-production branches and pull requests |
| **Custom domain** | CNAME record → `<org>.github.io` | CNAME record → `<project>.pages.dev` |
| **DNS record type** | CNAME (subdomain) | CNAME (subdomain) |
| **DNS record value** | `hearthandcode.github.io` | `<project-name>.pages.dev` |
| **HTTPS** | Auto-provisioned by Let's Encrypt (GitHub-managed) | Auto-provisioned by Cloudflare (Universal SSL) |
| **Domain verification** | TXT record: `_github-pages-challenge-hearthandcode` | TXT record or nameserver ownership (automatic on Cloudflare-managed zones) |
| **Rollback** | `git revert` + push, or re-run prior Actions run | Instant in Cloudflare dashboard (one-click rollback to any prior deployment) |
| **Anti-takeover** | Domain verification TXT record prevents other repos from claiming the domain | Domain ownership check prevents other accounts from claiming the domain |
| **Build allowance** | Subject to current GitHub Actions plan limits | 500 builds/month on the current Cloudflare Free plan |
| **Existing infra** | None relevant | `hearthandcode.dev` already on Cloudflare DNS |

---

## 3. Cloudflare Pages — Recommended Runbook

### 3.1 Prerequisites (manual, repository owner must complete)

1. **GitHub access:** Admin or write access to `hearthandcode/hearthandcode-field-journal`.
2. **Cloudflare account:** Must have the `hearthandcode.dev` zone active. The landing site is already hosted here — do not disrupt it.
3. **Cloudflare Pages project:** Create a new Pages project in the Cloudflare dashboard, connecting it to the GitHub repository. Cloudflare will auto-detect Astro.

### 3.2 Build Configuration

These values are set in the Cloudflare Pages dashboard under **Settings → Build & Deploy**:

| Setting | Value |
|---|---|
| **Build command** | `npm ci --include=dev && npm run build` |
| **Build output directory** | `dist` |
| **Node.js version** | `22` (set via `NODE_VERSION` environment variable or `.node-version` file) |
| **Root directory** | `/` (default) |

The build command installs the locked development dependencies, then runs `astro check && astro build` through the `npm run build` script in `package.json`. Both steps must pass for deployment to succeed.

### 3.3 Preview URL

After preview-branch controls are configured, each matching non-production branch push generates a unique preview deployment at:

```
https://<branch-name>.<project-name>.pages.dev
```

The `main` branch is deployed to the production URL (the `*.pages.dev` URL first, then the custom domain once configured).

**Recommended low-cost control:** Configure `main` as the production branch and permit automatic previews only for a small, named branch family such as `preview/*`. Cloudflare Pages defaults to public preview URLs. Enable Cloudflare Access for previews if a preview contains material that is not ready for public viewing.

### 3.4 Custom Domain Binding — `blog.hearthandcode.dev`

**Order of operations (must follow this sequence):**

1. **Add the custom domain in Cloudflare Pages dashboard:**
   - Navigate to the Pages project → **Custom domains**.
   - Enter `blog.hearthandcode.dev`.
   - Cloudflare automatically verifies domain ownership (the zone is already on Cloudflare; no manual TXT needed).

2. **DNS record is auto-created:**
   - Cloudflare creates a CNAME record: `blog.hearthandcode.dev` → `<project-name>.pages.dev`.
   - No manual DNS entry required when the zone is on Cloudflare.

3. **HTTPS is auto-provisioned:**
   - Cloudflare issues a Universal SSL certificate covering `*.hearthandcode.dev`.
   - Provisioning typically completes within minutes. Force HTTPS redirect is enabled by default.

4. **Verify:**
   ```bash
   curl -I https://blog.hearthandcode.dev
   ```
   Expect `HTTP/2 200` with a Cloudflare SSL certificate.

**DNS record class (if manual entry were needed):**

| Field | Value |
|---|---|
| Type | CNAME |
| Name | `blog` |
| Target | `<project-name>.pages.dev` |
| TTL | Auto (or 1 hour) |
| Proxy status | Proxied (orange cloud) |

### 3.5 HTTPS Verification

- Cloudflare Universal SSL covers `*.hearthandcode.dev` (wildcard). No additional certificate provisioning is needed.
- The certificate is auto-renewed. No expiry management required.
- To verify: open `https://blog.hearthandcode.dev` in a browser; the lock icon should show a valid Cloudflare certificate.

### 3.6 Rollback

1. In the Cloudflare Pages dashboard, go to **Deployments**.
2. Find the last-known-good deployment.
3. Click the three-dot menu → **Rollback to this deployment**.
4. Rollback is instant (edge cache purge + new deployment pointer). No DNS changes needed.

Alternatively, `git revert` the offending commit and push to `main` — this triggers a new deployment that replaces the bad one.

### 3.7 Anti-Takeover Sequence

Cloudflare Pages prevents domain takeover through:

1. **Domain ownership verification:** When adding a custom domain, Cloudflare verifies the requester controls the zone. On a Cloudflare-managed zone (`hearthandcode.dev`), this is automatic — no other Cloudflare account can add `blog.hearthandcode.dev` to their Pages project.

2. **CNAME target verification:** Cloudflare validates that the custom domain's CNAME target (`<project>.pages.dev`) matches the Pages project. A malicious actor cannot point `blog.hearthandcode.dev` to their own Pages project.

3. **Ongoing protection:** The `blog` CNAME record is managed inside the Cloudflare zone. As long as the zone's nameservers are Cloudflare's (which they are, for the existing landing site), no external party can alter the record.

**If the domain were NOT on Cloudflare DNS (e.g., GitHub Pages scenario):**

The anti-takeover sequence would require:
- A TXT verification record at the DNS provider proving domain ownership.
- For GitHub Pages specifically: `_github-pages-challenge-hearthandcode` TXT record, per [GitHub's domain verification docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages).

---

## 4. GitHub Pages — Fallback Runbook

### 4.1 Prerequisites

1. **GitHub Actions enabled** on the repository.
2. **Source set to "GitHub Actions"** in repository Settings → Pages.
3. **Domain verification** completed (see 4.5).

### 4.2 Build Configuration

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci --include=dev
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
```

### 4.3 Preview URL

- Production: `https://hearthandcode.github.io/hearthandcode-field-journal/` (without custom domain)
- No branch-preview deployments by default. You can add a `pull_request` trigger, but the preview URL is not a stable subdomain — it's the Actions artifact URL.

### 4.4 Custom Domain Binding

**DNS record (at Cloudflare, the existing DNS provider):**

| Field | Value |
|---|---|
| Type | CNAME |
| Name | `blog` |
| Target | `hearthandcode.github.io` |
| TTL | Auto (or 1 hour) |
| Proxy status | **DNS only** (gray cloud — do NOT proxy GitHub Pages through Cloudflare CDN) |

**In GitHub repository settings:**

1. Settings → Pages → Custom domain → enter `blog.hearthandcode.dev`.
2. GitHub runs a DNS check to verify the CNAME points to `hearthandcode.github.io`.
3. HTTPS is auto-provisioned via Let's Encrypt (may take up to 24 hours on first setup).

### 4.5 Domain Verification (Anti-Takeover)

**Must be completed before any custom domain binding.**

Per [GitHub's domain verification docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages):

1. Go to your GitHub **profile** → Settings → **Pages** → **Add a domain**.
2. Enter `hearthandcode.dev` (the apex — verification covers immediate subdomains like `blog.hearthandcode.dev`).
3. GitHub provides a TXT record to add to DNS:
   - Name: `_github-pages-challenge-hearthandcode`
   - Value: (unique token provided by GitHub)
4. Add this TXT record in the Cloudflare DNS dashboard for `hearthandcode.dev`.
5. Wait for DNS propagation and click **Verify** in GitHub.

**Without this step, any other GitHub user could create a repository with a CNAME file claiming `blog.hearthandcode.dev`.** Verification prevents this permanently.

### 4.6 Rollback

- `git revert` the bad commit and push to `main`. The Actions workflow re-deploys the prior state.
- Alternatively, re-run a prior successful Actions workflow run from the Actions tab.

### 4.7 HTTPS Verification

- GitHub-managed Let's Encrypt certificate. Auto-renewed.
- Enforce HTTPS is enabled by default in repository Settings → Pages.
- Verify with: `curl -I https://blog.hearthandcode.dev` (once DNS propagates).

---

## 5. Why Cloudflare Pages Wins Here

| Factor | Advantage |
|---|---|
| **Same DNS provider** | `hearthandcode.dev` is already on Cloudflare. No cross-provider DNS coordination. |
| **No Actions workflow** | Cloudflare auto-detects Astro. No `.github/workflows/deploy.yml` to maintain. |
| **Preview deployments** | Every branch gets a unique `*.pages.dev` preview URL. Critical for content review. |
| **Instant rollback** | One-click in the dashboard. No git revert + CI wait cycle. |
| **Unlimited bandwidth** | No 100 GB/month soft cap. |
| **Edge network** | 330+ data centers vs. GitHub Pages' CDN. Lower latency for global readers. |
| **Wildcard SSL** | `*.hearthandcode.dev` already covered. No per-subdomain certificate provisioning. |

---

## 6. Manual Prerequisites Checklist

Before any deployment can work, the repository owner must:

- [ ] **Cloudflare Pages** (recommended path):
  - [ ] Create a Cloudflare Pages project connected to `hearthandcode/hearthandcode-field-journal`.
  - [ ] Select Git integration deliberately. A Git-integrated Pages project cannot later switch to Direct Upload.
  - [ ] Set build command: `npm run build`, output: `dist`.
  - [ ] Confirm the committed `.node-version` file pins Node 22, or set `NODE_VERSION=22` in Cloudflare Pages.
  - [ ] Verify the initial `*.pages.dev` deployment before adding a custom domain or changing DNS.
  - [ ] Configure preview branch controls and, if needed, Cloudflare Access before pushing any non-public preview material.
  - [ ] Add `blog.hearthandcode.dev` as a custom domain in the Pages dashboard.
  - [ ] Verify the DNS CNAME record was auto-created (should be `blog → <project>.pages.dev`).

- [ ] **GitHub Pages** (fallback path):
  - [ ] Verify `hearthandcode.dev` domain ownership in GitHub profile settings (TXT record at Cloudflare).
  - [ ] Add `.github/workflows/deploy.yml` to the repository.
  - [ ] Enable Pages source as "GitHub Actions" in repository settings.
  - [ ] Add custom domain `blog.hearthandcode.dev` in repository Pages settings.
  - [ ] Add CNAME record at Cloudflare: `blog → hearthandcode.github.io` (DNS-only, gray cloud).

---

## 7. Source References

- [Astro deployment overview](https://docs.astro.build/en/guides/deploy/)
- [Astro — Deploy to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)
- [Astro — Deploy to Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [Cloudflare Pages — Deploy an Astro site](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)
- [Cloudflare Pages — Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [GitHub Pages — Custom domain management](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [GitHub Pages — Domain verification](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
- [GitHub Pages — Custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub Pages — Publishing source configuration](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Astro configuration reference](https://docs.astro.build/en/reference/configuration-reference/)