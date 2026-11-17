# Uber Frontend

React, Vite, and Tailwind CSS client for rider and captain account flows.

## Requirements

- Node.js compatible with the Vite version in `package.json`
- The backend API running locally or at a configured API URL

## Setup

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Set `VITE_BASE_URL` in a local `.env` file to the backend origin when it is not
available at `http://localhost:3000`:

```env
VITE_BASE_URL=http://localhost:3000
```

Do not include endpoint paths such as `/users` in this value. The frontend
appends the relevant API paths.

## Routes

| Path | Page |
| --- | --- |
| `/` | Welcome page |
| `/login` | Rider sign in |
| `/signup` | Rider account registration |
| `/captain-login` | Captain sign in |
| `/captain-signup` | Captain registration |
| `/home` | Session-protected account landing page |

Authentication responses are held in React memory for the current page session.
Protected requests send the returned JWT as a Bearer token. Refreshing the page
clears the in-memory session and requires signing in again.

## Validation

```bash
npm run lint
npm run build
```

Tailwind class suggestions are provided by the VS Code Tailwind CSS IntelliSense
extension. Tailwind scans `index.html` and files under `src/` as configured in
`tailwind.config.js`.
