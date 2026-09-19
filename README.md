# vue-changelog

## Build Setup

```bash
# install dependencies
$ pnpm install

# serve with hot reload at localhost:3000
$ pnpm run dev

# generate static project
$ pnpm run generate
```

The static site is generated in `.output/public`.

## GitHub Pages

Push to `main` to run the GitHub Pages deployment workflow. The workflow generates the static site and publishes it to the `gh-pages` branch. Before the first deployment, open the repository's **Settings > Pages**, select **Deploy from a branch**, choose `gh-pages`, and select the `/ (root)` folder.

The workflow builds the site with the `/vue-changelog/` base path required by this repository URL:

`https://jhug03.github.io/vue-changelog/`

To test the same build locally:

```bash
pnpm generate:pages
pnpm dlx serve .output/public
```

## Appwrite OAuth

Set these repository variables if Appwrite login is enabled:

- `VITE_APPWRITE_ENDPOINT`
- `VITE_APPWRITE_PROJECT_ID`

Add the deployed Pages URL to the allowed web platforms and OAuth redirect URLs in Appwrite.