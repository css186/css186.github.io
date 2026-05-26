---
title: 'Setting Up TinaCMS on a Static Site: From Local to Production'
date: 2026-05-26T06:10:37.518Z
description: A brief guide to setting up TinaCMS on a any static page site
---

# Setting Up TinaCMS on a Static Site: From Local Editing to Production Admin

This guide explains how to add TinaCMS to a static website. My setup uses Hugo hosted on GitHub Pages, but the same ideas also apply to other static site generators and hosting platforms, such as Cloudflare Pages, Netlify, and Vercel, etc.

At a high level, TinaCMS works like this:

* Content lives in a Git repository.
* Editors update content through an `/admin` interface.
* TinaCloud connects to the GitHub repository and commits content changes back to a target branch.
* The hosting platform rebuilds the static site after new content commits are pushed.

## 1. Install TinaCMS

Run this from the root of your existing website project:

```bash
npx @tinacms/cli@latest init
```

This creates the basic TinaCMS files, usually including:

```text
tina/
  config.ts
```

If your site already has content folders, for example:

```text
content/posts
content/projects
```

the next step is to define those folders as TinaCMS collections in `tina/config.ts`.

## 2. Configure tina/config.ts

A minimal TinaCMS config looks roughly like this:

```ts
import { defineConfig } from "tinacms";

const branch = process.env.TINA_PUBLIC_BRANCH || "main";

export default defineConfig({
  branch,
  clientId: process.env.TINA_PUBLIC_CLIENT_ID,
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: "admin",
    publicFolder: "static",
  },

  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "static",
    },
  },

  schema: {
    collections: [
      {
        name: "post",
        label: "Posts",
        path: "content/posts",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "datetime",
            name: "date",
            label: "Date",
            required: true,
            dateFormat: "yyyy-MM-dd",
          },
          {
            type: "string",
            name: "description",
            label: "Description",
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
    ],
  },
});
```

There are a few important concepts here.

`branch` is the Git branch TinaCloud reads from and writes to. You can adjust according to your repo branch (for example: mine is `main`).

`clientId` is the identifier for your TinaCloud project.

`token` is the TinaCloud Content token. Production builds use it to verify TinaCloud project and branch access (Be sure to store it as a secret and should never be committed to GitHub).

`build.outputFolder` controls where TinaCMS outputs the static admin app. If it is set to `admin`, the production admin URL is usually:

```text
https://your-site.com/admin
```

`build.publicFolder` should match the folder your static site framework uses for public assets. For Hugo, this is commonly `static`.

## 3. Define Collections

Collections are the core of TinaCMS. A collection tells Tina which content folder should be editable in the admin UI.

For example, a blog post collection can look like this:

```ts
{
  name: "post",
  label: "Posts",
  path: "content/posts",
  format: "md",
  fields: [
    {
      type: "string",
      name: "title",
      label: "Title",
      isTitle: true,
      required: true,
    },
    {
      type: "datetime",
      name: "date",
      label: "Date",
      required: true,
      dateFormat: "yyyy-MM-dd",
    },
    {
      type: "rich-text",
      name: "body",
      label: "Body",
      isBody: true,
    },
  ],
}
```

If your static site generator uses special files such as `_index.md`, `index.md`, or other section landing pages, you can exclude them so TinaCMS does not treat them as regular articles:

```ts
match: {
  exclude: "_index.md",
}
```

Common field types include:

```text
string
datetime
boolean
number
image
rich-text
object
reference
```

In practice, keep the schema simple at first. Only expose fields editors actually need to change. Too many fields can make the admin UI harder to use and make content structure harder to maintain.

## 4. Local Development

TinaCMS local development starts both the Tina admin and your site dev server.

For Hugo:

```bash
npx tinacms dev -c "hugo server -D -p 1313"
```

For other frameworks, replace the command after `-c` with your own dev command. For example:

```bash
npx tinacms dev -c "npm run dev"
```

During local testing, open:

```text
http://localhost:1313/admin
```

The actual port depends on your dev server.

## 5. Create a TinaCloud Project

Production admin requires TinaCloud. The general flow is:

1. Create a project in TinaCloud.
2. Authorize TinaCloud to access your GitHub repository.
3. Select the repository.
4. Set the branch (usually `main`).
5. Configure `Path to Tina Folder`.
6. Generate the Client ID and Content token.

`Path to Tina Folder` is easy to misconfigure. It is not the `tina` folder itself. It is the project root that contains the `tina/` folder.

If your repository looks like this:

```text
my-site/
  tina/
    config.ts
```

then leave `Path to Tina Folder` empty.

If your repository is a monorepo:

```text
my-monorepo/
  apps/
    website/
      tina/
        config.ts
```

then set `Path to Tina Folder` to:

```text
apps/website
```

After setup, confirm that TinaCloud has indexed your production branch.

## 6. Which Token Should You Use?

Simple distinction:

* Content token: Used by the TinaCMS production admin and tinacms build.
* Search token: Used by TinaCloud search features.

## 7. Environment Variables on Your Hosting Platform

Whether you use GitHub Pages, Cloudflare Pages, or another platform, production builds need these environment variables:

```text
TINA_PUBLIC_CLIENT_ID
TINA_TOKEN
```

Recommended placement:

* TINA\_PUBLIC\_CLIENT\_ID: Store as a variable or public environment variable.
* TINA\_TOKEN: Store as a secret.

If you use GitHub Actions, make sure the environment variable scope matches the job that runs the build.

For example:

```yaml
env:
  TINA_PUBLIC_CLIENT_ID: ${{ vars.TINA_PUBLIC_CLIENT_ID }}
  TINA_TOKEN: ${{ secrets.TINA_TOKEN }}
  TINA_PUBLIC_BRANCH: main
```

If you store secrets in a GitHub Environment, such as `github-pages`, the job that runs `tinacms build` must use that same environment:

```yaml
jobs:
  build:
    environment:
      name: github-pages
```

Otherwise, the build job will not be able to read environment secrets.

## 8. Build Order

The production build should build the Tina admin before building the static site.

Conceptually:

```text
install dependencies
tinacms build
static site build
deploy output folder
```

With npm scripts:

```json
{
  "scripts": {
    "tinacms:build": "tinacms build",
    "build": "hugo --minify"
  }
}
```

In GitHub Actions or another CI system:

```bash
npm ci
npm run tinacms:build
npm run build
```

Why build Tina first? Because `tinacms build` generates the static `/admin` app, and then your static site generator can copy those files into the final deployment output.

## 9. Common Errors

### Missing clientId, token

Error:

```text
Client not configured properly. Missing clientId, token.
```

This means the production build did not receive the required environment variables.

Check:

* Whether `TINA_PUBLIC_CLIENT_ID` exists.
* Whether `TINA_TOKEN` exists.
* Whether the CI job can actually read the secret.
* If using a GitHub Environment, whether the build job is attached to that environment.

### 403 not authorized to access branch

Error:

```text
403 Forbidden
not authorized to access branch
```

This means TinaCMS successfully read `clientId`, `token`, and `branch`, but TinaCloud rejected the token for that branch.

Check:

* Whether the TinaCloud project is connected to the correct repository.
* Whether the token comes from the same TinaCloud project.
* Whether the token branch scope includes the current branch.
* Whether the branch has been indexed by TinaCloud.
* Whether Path to Tina Folder is correct.

### Admin opens, but content does not sync

Check:

* Whether the TinaCloud GitHub App has repository access.
* Whether editing content creates a Git commit.
* Whether the production branch is correct.
* Whether the hosting platform redeploys when that branch receives a push.

## 12. Recommended Git Tracking Rules

Recommended to commit:

```text
tina/config.ts
tina/tina-lock.json
package.json
package-lock.json
content/
```

Recommended to ignore:

```gitignore
node_modules/
.env
tina/__generated__/
static/admin/
```

`static/admin/` is build output and does not always need to be committed. As long as CI runs `tinacms build`, it will be regenerated during production deployment.

## References

* TinaCMS Hugo setup: [https://tina.io/docs/frameworks/hugo](https://tina.io/docs/frameworks/hugo)
* TinaCMS GitHub Pages deployment: [https://tina.io/docs/tinacloud/deployment-options/github-pages](https://tina.io/docs/tinacloud/deployment-options/github-pages)
* TinaCMS config reference: [https://tina.io/docs/reference/config](https://tina.io/docs/reference/config)
* TinaCloud projects: [https://tina.io/docs/tinacloud/dashboard/projects](https://tina.io/docs/tinacloud/dashboard/projects)
