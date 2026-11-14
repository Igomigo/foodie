# Deploying to Railway

Foodie's frontend stays on Vercel and its API stays on Railway's generated HTTPS URL. The browser sends API requests to the frontend's `/api/v1` path; Vercel forwards them to Railway. This works with either a Vercel URL or a custom frontend domain and keeps session cookies on the same origin as the page.

## 1. Use a hosted database

Set up a separate MongoDB Atlas database for hosted testing. The server requires a replica set because vendor registration uses transactions. A plain standalone MongoDB instance will be rejected at startup. Configure Atlas network access for the deployment and use a database user restricted to the intended database.

Your laptop's MongoDB URL cannot be used by Railway. This deployment does not copy, migrate or seed any database. A new cloud database starts empty; the local catalogue remains on your laptop. Prepare cloud test data separately after confirming the destination. The existing catalogue seed script intentionally refuses remote databases and production mode.

Redis is not needed for the current customer flows. Do not add a Redis service just to get signup, login, locations or discovery working.

## 2. Connect the repository

Create an API service from the GitHub repository and configure:

| Setting          | Value              |
| ---------------- | ------------------ |
| Root directory   | `/server`          |
| Builder          | Railpack (Node.js) |
| Build command    | `npm run build`    |
| Start command    | `npm start`        |
| Healthcheck path | `/health`          |
| Replicas         | `1` initially      |
| Watch paths      | `/server/**`       |

Railpack installs dependencies from `package-lock.json` and uses Node 24, declared in `package.json`. TypeScript compiles to `dist/`; `npm start` runs `node dist/index.js`. The API reads its static catalogue from `server/data`, which is included in this application's directory. Neither the client folder nor a root shared folder is required.

Leave pre-deploy commands empty. Remove any earlier `RAILWAY_DOCKERFILE_PATH` override: Railway uses the Node builder. The existing Dockerfile lives under `docker/` only for optional local Compose use.

The API listens on `0.0.0.0` and Railway's injected `PORT`; there is no need to set a fixed port. Set a deployment draining period, such as `RAILWAY_DEPLOYMENT_DRAINING_SECONDS=15`, so the existing SIGTERM handler has time to close requests and database connections.

The healthcheck returns `200` while MongoDB is connected and `503` otherwise. Startup already waits for the database and model indexes before listening. Railway uses healthchecks to gate deployments; they are not continuous uptime monitoring.

## 3. Add API service variables

| Variable           | Value                                                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`         | `production`                                                                                                               |
| `MONGODB_URI`      | Atlas connection string with the hosted-test database name                                                                 |
| `JWT_SECRET_KEY`   | A new random signing secret; generate with `openssl rand -hex 32`                                                          |
| `CLIENT_URL`       | Exact frontend origin, for example `https://your-foodie-app.vercel.app` or `https://app.yourdomain.com`; no trailing slash |
| `GEOAPIFY_API_KEY` | Your server-side Geoapify key, for address lookup and map tiles                                                            |
| `TRUST_PROXY_HOPS` | `1`, trusting Railway's immediate ingress proxy                                                                            |

If more frontend origins are needed, set `CLIENT_URLS` to a comma-separated list containing **all** allowed origins, including `CLIENT_URL`. The list takes precedence over the single value. Keep `CLIENT_URL` as the primary frontend origin because password-reset links use it. Do not use a wildcard for every Vercel deployment.

Optional variables:

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`: Nodemailer password recovery. Railway currently allows outbound SMTP only on Pro plans and above; Free, Trial and Hobby need an HTTPS email API. Keep the existing SMTP implementation unless deliberately changing providers. Without SMTP configuration, recovery returns a truthful `503`; signup and login still work.
- `GOOGLE_API_KEY`: only needed when testing the current AI endpoint. Chat requires authentication. AI behaviour and provider/model updates are separate work.

Keep one API replica initially: recovery and provider-quota limits are currently held in process memory. `TRUST_PROXY_HOPS=1` trusts only the immediate ingress. With the additional Vercel forwarding layer, verify the live forwarding chain before changing this value; recovery requests can conservatively share a proxy IP bucket. Do not blindly trust every forwarded address on a publicly reachable API.

## 4. Generate the API domain and connect Vercel

After deployment, use Railway's **Generate Domain** action. The API can remain at `https://your-api.up.railway.app`; it does not need a custom domain. Open `/health` on that URL and check for `{"status":"ok"}`.

In the Vercel frontend project, set:

```dotenv
NEXT_PUBLIC_API_URL=/api/v1
API_ORIGIN=https://your-api.up.railway.app
```

`API_ORIGIN` is the origin only: no `/api/v1` suffix. It is read by `next.config.ts` at build time. Redeploy the frontend after setting these variables. Keep the local `.env.local` pointing directly to `http://localhost:2000/api/v1` if that is how you develop locally.

The forwarding rule preserves the `/api/v1` path, query strings, request bodies, authorization and cookies. The server sets host-only HttpOnly refresh cookies with `Secure` in production and `SameSite=Lax`; Vercel returns them under the frontend's domain. Login, refresh and logout all use the same route. Private responses must not be cached; auth, account, location and discovery responses use `Cache-Control: no-store`.

Calling the Railway domain directly from a page on a Vercel/custom frontend domain would be cross-site. `SameSite=Lax` cookies are not sent on cross-site API fetches; changing to `None` also cannot guarantee support in browsers blocking third-party cookies. Use the forwarding rule rather than weakening cookie settings.

If you add your custom domain to Vercel, change `CLIENT_URL` and the allowlist to match it. `API_ORIGIN` stays the Railway URL.

## 5. Check the hosted flow

1. Visit Railway `/health` and confirm it returns `200`.
2. Open the Vercel/custom frontend domain on desktop and phone.
3. Sign up, choose an address and confirm map tiles and address lookups work.
4. Refresh the page, then leave the app open beyond five minutes and verify token refresh keeps you signed in.
5. Sign out, sign in again and confirm protected screens require authentication.
6. Check discovery with the intended hosted catalogue and delivery destination. Empty results are expected until that database contains eligible kitchens.

Local verification from the `server` folder:

```sh
npm ci
npm run build
npm test
```

Do not use `npm run dev`, run database migrations, or run seed scripts as deployment start/pre-deploy commands.

## References

- [Railway monorepo root directories](https://docs.railway.com/deployments/monorepo)
- [Railway healthchecks](https://docs.railway.com/deployments/healthchecks)
- [Railway outbound SMTP restrictions](https://docs.railway.com/networking/outbound-networking)
- [Vercel external rewrites](https://vercel.com/docs/routing/rewrites)
- [MDN cookie attributes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie)
- [Express proxy configuration](https://expressjs.com/en/guide/behind-proxies/)
