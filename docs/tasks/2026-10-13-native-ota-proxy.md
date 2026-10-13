# Prepared stable-origin native OTA proxy

Owner: `/root/review_native_profile`. Base commit: `538360ead4a6da9ae889f142f8d00e333f99412b`.
Checkout: `C:\Users\mihai\Desktop\Mobile Banking - CEE`.
Owned paths: new `api/native-update-proxy.js`, new `scripts/native-spike/ota/native-proxy.mjs`, new `tests/security/native-update-proxy.test.ts`, this document, and only the new native-update rewrite in `vercel.json`.
Initial pending changes for all five owned paths: none. The existing shared checkout has extensive unrelated pending changes recorded by the integration owner in `.agent-task.json`; those changes, asset rewrites/headers, and `api/access.js` remain under their owners. No Git index operation, deployment, provisioning, or external request is part of this task.

The integration owner owns final combined verification and activation.

## Wiring

The existing web project's stable `/api/native-updates/:path*` path rewrites to one standard Node API function, `api/native-update-proxy.js`, using Vercel's Request/Response `fetch` interface. Its only runtime configuration is **`NATIVE_OTA_BACKEND_ORIGIN`**, the explicitly reviewed HTTPS origin of the separate `native-update-server` Vercel project, for example `https://your-native-update-service.vercel.app`. Supply an origin with no credentials, path, query or fragment. Local hosts and IP literals are rejected. There is no inferred provider, local proof endpoint, or credential fallback.

Leave the environment variable absent until backend provisioning, migration and deployment are approved. Absent or invalid configuration returns a generic uncached 503 without making an upstream request. The native app can continue using its built-in/offline bundle; changing this runtime server environment does not itself publish an OTA release.

The rewrite uses the reserved `__native_ota_route` transport parameter and a `missing` condition so client-supplied values do not participate in rewriting. Duplicate parameters or disagreement between a preserved original path and a transported path fail closed. Other SDK query parameters, including repeated values, survive forwarding. The single function also accepts the rewritten handler URL shape; invoking that internal URL cannot bypass either management gate.

Set the server's `NATIVE_OTA_SERVER_URL` and GitHub release's `NATIVE_OTA_SERVER_URL` to the stable web origin plus `/api/native-updates`, matching the compiled production base APK. Set the web project's `NATIVE_OTA_BACKEND_ORIGIN` to the separate backend origin. Do not point it at the stable web origin: same-origin loops are rejected. This transport function holds **no admin token, private signing key, storage identity, or database URL**. The release CLI sends its existing bearer through it, and the isolated server checks that bearer against its own secret. Keep `NATIVE_OTA_RELEASE_ENABLED` absent/false and retain the protected environment/APK-confirmation gates until activation is approved.

## Boundaries and limits

Public requests are GET/HEAD only and limited to the SDK's version, release-catalog and artifact-descriptor routes. Management paths require a supplied bearer and permit the SDK's HTTP methods; bearer correctness remains the backend's responsibility. Management bodies are capped at 1 MiB. Reading a stalled body and contacting the backend share one 15-second deadline. The proxy follows no redirects and exposes generic failures. Headers are allowlisted: portal cookies, portal authentication headers, and upstream Set-Cookie are excluded. Management/artifact/error responses are `private, no-store`; catalog responses retain the backend's short cache policy.

The proxy transports small JSON descriptors and management data. Bundle archives/assets still download directly from signed object-storage URLs; they do not pass through the web function. This proxy adds one function hop and cannot guarantee provider availability, cross-project protection configuration or device download recovery.

References for activation review: [Vercel rewrites](https://vercel.com/docs/rewrites), [project rewrite configuration](https://vercel.com/docs/project-configuration#rewrites), and [Node Functions](https://vercel.com/docs/functions/runtimes/node-js). The file follows the documented modern Node fetch entrypoint supplied by the integration owner. No separate catch-all function filename or broad SPA rewrite is introduced.

## Verification and activation acceptance

The tests first failed before the proxy existed. Additional deadline tests failed on stalled bodies/upstreams before implementation, then passed. Network-free tests verify configuration shape, original/rewritten request shapes, route-key collisions, traversal/encoded aliases, public method restrictions, exact query preservation, bearer forwarding, body size/deadline cancellation, redirect/failure handling and response-header isolation. The actual isolated backend dispatcher is also exercised through the injected fetch transport, including rejection of a wrong bearer and acceptance of the exact test bearer.

The existing asset rewrite/header configuration is preserved; the only `vercel.json` delta is the new native-update rule. `api/access.js` is untouched. Final command results are recorded at handoff. These local checks **do not** prove Vercel's deployed rewrite/Fetch entrypoint wiring. No Vercel CLI routing validator is installed locally, and no provider call, deployment, migration or release was performed.

Scoped verification on 2026-10-13: proxy security suite plus existing access/mobile-demo-access suites passed; root `npm run typecheck` exited 0; scoped ESLint with `--max-warnings 0` exited 0; owned code/test/document formatting completed. `git diff --check -- vercel.json` is clean, and the tracked configuration delta is exactly five added lines for the single narrow rewrite. The integration owner runs `npm run verify` against the combined final state after editors finish.

The independent read-only re-review confirmed the entrypoint against official Node Function documentation and validated the current `headers` and `rewrites` properties against their official schema definitions. The 31 proxy tests and 12 frozen publisher-provider tests passed. This confirms the documented configuration shape and local behavior; it remains separate from deployed routing proof.

Platform wiring acceptance risk: `routeOf` compares a preserved original suffix and the transported query value literally. A locally constructed request containing an encoded admin scope segment (`%3A`) in the original path and its decoded counterpart (`:`) in `__native_ota_route` returns 400. Whether Vercel produces that mixed representation has not been established. Include SDK admin scope/catalog paths with URI-encoded segments in the approved preview acceptance checks, alongside the simple version/release routes. This is an unverified platform representation risk, not a confirmed deployed defect; no code was changed based on it.

Before activation, validate the web build/function recognition and rewrite on an approved preview deployment: public version/catalog GET and HEAD; original path and SDK query forwarding; missing backend yields 503; reserved route-key requests do not override paths; public POST fails; management with no/wrong bearer fails; authenticated management reaches the isolated server; artifact descriptors remain uncached; portal access behavior remains unchanged. Confirm backend Deployment Protection permits device reads, then perform the existing physical-device and production-base APK checks. Publication remains the integration owner's separate approval step.
