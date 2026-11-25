
  # Mobile Banking - CEE

  ## Running the code

  Use the Node version recorded in `.nvmrc`, then run `npm ci` to install the locked dependencies.

  Run `npm run dev` to start the development server.

  ## Stakeholder access gate

  Copy `.env.example` to `.env.local` and set `VITE_LOCAL_ACCESS_PASSWORD` before starting Vite. Local share-link testing is disabled unless `VITE_LOCAL_SHARE_ACCESS_TOKEN` is also set explicitly. Empty values fail closed and the app shows configuration guidance; there are no source-code credential fallbacks.

  Deployments must provide two independent server-side environment variables:

  - `ACCESS_PASSWORD`: the stakeholder password.
  - `ACCESS_COOKIE_SECRET`: a random secret of at least 32 characters used only to sign access cookies and share tokens.

  Rotate either value through the deployment environment, never by committing it. Changing `ACCESS_COOKIE_SECRET` invalidates existing access cookies and share tokens.

  This is a presentation gate
  
