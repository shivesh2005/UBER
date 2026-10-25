# UBER Frontend

This is the frontend for the UBER ride-booking app built with React, Vite, and Tailwind CSS.

## Overview

The app includes user and captain authentication flows, route-based navigation, and a shared user context for storing user data across the app.

## Tech Stack

- React 19
- Vite
- React Router DOM
- Tailwind CSS
- PostCSS
- Oxlint

## Project Structure

```bash
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── context/
│   │   └── UserContext.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── UserLogin.jsx
│   │   ├── UserSignup.jsx
│   │   ├── CaptainLogin.jsx
│   │   └── CaptainSignup.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
├── README.md
└── .oxlintrc.json
```

## Application Routes

The app uses `BrowserRouter` and defines these routes in `src/App.jsx`:

- `/` → Home page
- `/login` → User login
- `/signup` → User signup
- `/Captain-Login` → Captain login
- `/Captain-Signup` → Captain signup

## Authentication Flow

- A shared `UserContext` stores user state using React context.
- The frontend is structured for separate user and captain authentication screens.
- User-related data is managed through the context provider at `src/context/UserContext.jsx`.

## Getting Started

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal, usually:

```bash
http://localhost:5173
```

## Build for Production

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## Notes

- This frontend is designed to connect with the backend API for login/signup and rider/captain flows.
- Tailwind is configured and ready for styling the app.
- The project is currently a React frontend shell and can be extended with additional dashboard, booking, and driver-management pages.
