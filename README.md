# Personal Website

Static personal website for GitHub Pages.

## Project Structure

- `index.html`: main page markup
- `assets/css/styles.css`: all site styling
- `assets/js/main.js`: navigation, section highlight, and touch interaction behavior
- `tests/site-navigation.spec.js`: Playwright integration tests
- `playwright.config.js`: desktop + mobile browser test matrix

## Local Development

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000`.

## Automated Verification

```bash
npm run test:e2e
```
