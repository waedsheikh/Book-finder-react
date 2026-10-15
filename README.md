# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Deploying to GitHub Pages

The GitHub Actions workflow in `.github/workflows/deploy.yml` builds the app and deploys it to GitHub Pages whenever changes are pushed to the `main` or `master` branch. The Vite configuration uses relative asset paths so the app works at the repository's Pages URL.

After pushing the project to GitHub, open **Settings > Pages** for the repository and set the build and deployment source to **GitHub Actions**. You can also run the workflow manually from the repository's **Actions** tab.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
