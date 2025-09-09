# Environment Variables in Vite React Project

## Recent Changes

The project was experiencing a `process is not defined` error because it was using the Create React App (CRA) environment variable format (`process.env.REACT_APP_*`) while running in a Vite environment.

### Changes Made

1. Updated API service files to use Vite's environment variable format:
   - Changed `process.env.REACT_APP_SPRING_API_URL` to `import.meta.env.VITE_SPRING_API_URL` in `springBootApi.js`
   - Changed `process.env.REACT_APP_FLASK_API_URL` to `import.meta.env.VITE_FLASK_API_URL` in `flaskApi.js`

2. Updated environment variable files to use Vite's naming convention:
   - Changed variable names in `.env` from `REACT_APP_*` to `VITE_*`
   - Changed variable names in `.env.example` from `REACT_APP_*` to `VITE_*`

## Environment Variables in Vite

Vite uses a different approach to environment variables compared to Create React App:

- Variables must be prefixed with `VITE_` to be exposed to client-side code
- Variables are accessed using `import.meta.env.VITE_*` instead of `process.env.REACT_APP_*`
- Only variables that start with `VITE_` are exposed to your Vite-processed code

### Available Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `VITE_FLASK_API_URL` | URL for the Flask backend API | `http://localhost:5000/api` |
| `VITE_SPRING_API_URL` | URL for the Spring Boot backend API | `http://localhost:8080/api` |

## Adding New Environment Variables

When adding new environment variables:

1. Always prefix with `VITE_` for client-side exposure
2. Add the variable to both `.env` and `.env.example` files
3. Access in code using `import.meta.env.VITE_YOUR_VARIABLE`

## References

- [Vite Environment Variables Documentation](https://vitejs.dev/guide/env-and-mode.html)