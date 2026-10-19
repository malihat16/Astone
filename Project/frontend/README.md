# Astoné frontend (React + Vite)

## Scripts

```bash
npm install
npm run dev       # local dev server on http://localhost:5173
npm test          # Vitest + Testing Library
npm run lint      # ESLint, fails on any warning
npm run build     # production build in dist/
```

Set `VITE_API_URL` in `.env.local` (local) or in Vercel's environment variables (production). See `.env.example`.

## Layout

```
src/
  main.jsx, App.jsx, routes.jsx   entry point, providers, every route (lazy-loaded)
  theme.js, styles.css            design tokens (colour, type, radius) and global CSS
  lib/                            the API client, session storage, data normalisation, pure helpers
  services/                       one function per API call, all through lib/api.js
  components/
    layout/                       ShopLayout (header, footer, bag, help) and SellerLayout
    providers/                    login, bag and toast state
    states/                       loading, empty and error screens
  pages/                          shopper pages; pages/seller/ for the Seller Centre; pages/info/ for text pages
  test/                           test setup and helpers
```

## Conventions

- **One API client.** Every request goes through `lib/api.js`, which attaches the login token, refreshes it when it expires and logs out cleanly if the refresh fails. `errorMessage()` turns any failure into a sentence for the UI.
- **Normalised products.** The API has stored colours, sizes and categories in several shapes over time. `normalizeProduct()` in `lib/product.js` turns them into one shape so pages don't care.
- **Every data page handles three states:** skeletons while loading, an empty state that says what to do next, and an error state with a retry button.
- **Design tokens live in `theme.js`.** Plum is the brand colour; orchid is only for sale prices. Headings use Syne, body text uses Manrope.
