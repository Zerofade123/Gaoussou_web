# Gaoussou Douga Keita — Portfolio

Personal portfolio and printable résumé for Gaoussou Douga Keita, focused on networking, cybersecurity, Linux, and IT support.

## Local preview

Serve the folder with a small local web server (content collections cannot load through a `file://` URL):

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Structure

- `index.html` — concise portfolio homepage
- `about.html` — background, direction, and education
- `projects.html` — detailed project and lab case studies
- `credentials.html` — completed training and certification progress
- `resume.html` — browser-friendly and printable résumé
- `Zerofade.css` — shared portfolio styles and responsive layout
- `refinements.css` and `multipage.css` — scale and page-layout refinements
- `Script.js` — navigation, theme, and reveal interactions

Never commit passwords, API keys, private credentials, or unredacted personal documents.

## Browser content editing

Projects and credentials are stored in `content/*.json` and rendered automatically. The `.pages.yml` configuration exposes those fields in [Pages CMS](https://app.pagescms.org). Sign in with the GitHub account that owns this repository, select the repository, and edit or publish content through the browser. CMS saves create normal Git commits and trigger the existing site deployment.
