# Darshan Kedare — Portfolio

A responsive, no-build personal portfolio for showcasing AI/ML projects, skills,
and certificates. It is built with plain HTML, CSS, and JavaScript, and can be
hosted directly with GitHub Pages.

## Preview locally

No package installation or build step is required. From the project directory,
start a local server with Python:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

You can also open `index.html` directly in a browser, but a local server is
recommended for checking the site as it will be served online.

## Publish with GitHub Pages

1. Create a new, empty repository on GitHub. Do not initialize it with a README
   or license; this folder already contains the site files.
2. In a terminal opened in this folder, initialize Git and create the first
   commit:

   ```bash
   git init -b main
   git add .
   git status
   git commit -m "Add portfolio website"
   ```

3. Replace `YOUR-USERNAME/YOUR-REPOSITORY` below with the repository you
   created, then push:

   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
   git push -u origin main
   ```

4. In the repository on GitHub, open **Settings → Pages**. Under **Build and
   deployment**, choose **Deploy from a branch**, select `main` and `/(root)`,
   then save.
5. After GitHub Pages finishes deploying, open the URL shown in the Pages
   settings.

For a portfolio on a custom domain or a user site (`USERNAME.github.io`),
GitHub's Pages settings may offer a GitHub Actions deployment option. Follow
the setup suggested there if you choose that route.

## Project contents

- `index.html` — page content and metadata
- `styles.css` — responsive layout, palette, and animations
- `script.js` — Game of Life hero animation and live footer clock
- `Profile/` — the portrait used on the page
- `certificate/` — documents linked from the certificates section
- `prompt/` — local reference material, excluded from Git

The site links to the portrait and certificate PDFs using relative paths. Keep
those assets in the repository when publishing if you want those sections to
work on GitHub Pages. Review the PDFs and image first, and only publish
documents and personal information you are comfortable making public.

## Customization

- Update project descriptions and links in `index.html`.
- Edit the CSS custom properties at the top of `styles.css` to change the
  palette.
- Add or remove certificate entries in `index.html` and keep their PDF files
  under `certificate/`.
