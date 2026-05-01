# Portfolio — Agent guide

Single-page React portfolio for Luke Melong (full-stack developer). Hosted at lukemelong.com on a **Dreamhost shared hosting** tier.

## Run
- `npm start` — dev server on :3000. Unknown routes are proxied to the Strava Cloudflare Worker (see `package.json` `proxy` field) so the frontend can call `/api/strava-token` without CORS in dev.
- `npm run build` — production bundle to `build/`.
- `npm test` — Jest via react-scripts.

## Stack
- Create React App (react-scripts 5)
- React 18, react-router-dom 6
- react-bootstrap + bootstrap-icons
- three.js for the home-page background scene
- SCSS (modules + a small global stylesheet)

## Architecture

Routes (see `src/App.jsx`):
- `/` — Home page wrapped in `Layout` (with nav)
- `/cycling-goal` — standalone Strava progress dashboard (no nav, dark theme)
- `/speedrun` — speedrun race tracker (no nav, dark theme; requires `?room=CODE` query param)

External services:
- **Strava OAuth refresh** — Cloudflare Worker (URL in `src/config/index.js`, override with `REACT_APP_STRAVA_WORKER_URL`). The frontend hits the worker for a fresh access token, then calls the Strava API directly.
- **Contact form** — POST to a PHP endpoint on lukemelong.com (override with `REACT_APP_EMAIL_ENDPOINT`).

## Hosting
- **Platform:** Dreamhost shared hosting tier
- PHP is available server-side (contact form already uses it)
- No persistent Node/Python processes — background workers not available
- SQLite is available via PHP's built-in `PDO_SQLite` / `SQLite3`

## Conventions

### File layout
- Components: `src/components/<Name>/<Name>.jsx` + co-located `.module.scss` when it has its own styles.
- Pages: `src/pages/<Name>/<Name>.jsx`. Long pages may have a `sections/` subfolder.
- Static data → `src/data/`. Never inline lists/copy in JSX.
- Env-dependent values → `src/config/`. Never hardcode URLs in components.
- Domain logic → next to the page that uses it (e.g. `src/pages/CyclingGoal/strava.js`) or `src/lib/` if cross-page. Keep components mostly presentational.
- Server-side PHP files → `server/`. These are deployed to the webroot alongside the React build. Credentials files (`*-config.php`) are gitignored — provide a `*.example.php` template instead.

### React
- File extension: `.jsx` for components, `.js` for pure logic/data.
- Functional components only. Props documented with JSDoc above the component.

### Styles
- **CSS modules** (`*.module.scss`) by default — scope is local, class names are accessed via `styles.foo`.
- **Regular SCSS** is OK when overriding Bootstrap selectors that need to be global (e.g. the Home page tweaks `.carousel-control-prev`). Scope these by wrapping inside a unique class.
- Shared design tokens: `src/styles/_tokens.scss` (colours, breakpoints).
- Shared mixins: `src/styles/_mixins.scss`.
- Single global stylesheet `src/styles/global.scss` is imported once from `src/index.js`. Add font imports here, not in component files.
- **Don't** write inline `<style>` blocks in JSX. Use the `style` prop only for dynamic values (e.g. `style={{ width: \`${pct}%\` }}`).

## Where things live (cheat sheet)

| Want to change... | Edit... |
| --- | --- |
| Carousel projects | `src/data/projects.js` |
| Photo ticker images | `src/data/photos.js` |
| Strava goal / dates / worker URL | `src/config/index.js` |
| Strava API calls | `src/pages/CyclingGoal/strava.js` |
| Pace math | `src/pages/CyclingGoal/usePaceCalc.js` |
| 3D scene (sky / trees / snow / lights) | `src/components/scenes/SunriseForestScene/` |
| Nav bar | `src/pages/Layout/Layout.jsx` |
| Contact form fetch | `src/lib/contactForm.js` |
| Speedrun API URL | `src/config/index.js` (`speedrun.apiUrl`) |
| Speedrun PHP backend | `server/speedrun-api.php` |
| Speedrun DB credentials | `server/speedrun-config.php` (gitignored, see example) |
| Add a new page | New folder under `src/pages/`, then add a `<Route>` in `src/App.jsx` |

## Deploy
Build: `npm run build`. Then FTP `build/` contents + `server/` contents to `/home/dh_vzqxdi/lukemelong.com/`.
`server/speedrun-config.php` must exist on the server but is not in the repo.
See `DEPLOYMENT.md` for full instructions and the future GitHub Actions setup.

## Don't
- Don't add inline `<style>` blocks in JSX.
- Don't put fetch URLs directly in components — use `src/config/`.
- Don't create empty `.scss` stub files.
- Don't add new top-level folders without updating this file.
