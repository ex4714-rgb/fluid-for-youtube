# Publish the website with GitHub Pages

Created by **xCC**.

1. Upload the project files to a GitHub repository and push them to its `main` branch.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**, choose `main` and the `/docs` folder, then save.
4. Wait for GitHub Pages to publish the site. Its address appears in the Pages settings.

The website is static and has no build step or package dependencies. The extension download and image links use paths relative to `docs/`, so keep the `assets/`, `downloads/` and `images/` folders alongside `index.html`.

Before publishing, replace each `https://github.com/YOUR-USERNAME/Fluid-for-YouTube` link in `index.html` with the URL of your GitHub repository.

To update the extension download, replace `downloads/Fluid-for-YouTube.zip` with the new signed package before publishing. A permanent Firefox installation requires a Mozilla-signed release.
