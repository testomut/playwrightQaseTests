# Architecture

## Layers

```
e2e/*.spec.ts       Test scenarios, tagged for Qase and for grep-based filtering
pageObjects/*.ts    BasePage + one class per feature area
services/*.ts       API and email clients, kept out of page objects
fixtures/fixtures.ts  Composes page objects/services into named fixtures
utils/*.ts          Custom Playwright command wrappers, direct API calls
constants/*.ts      Static test data
types/*.ts          Shared TypeScript types
```

## Why two Playwright configs

The suite has a bootstrap phase and a main phase, and they need different settings:

- **`playwright.no-setup.config.ts`** runs `e2e/createAccounts.spec.ts`, tagged `@START`. It has no `globalSetup` (there's no session yet to warm a cache for), a longer per-test timeout (account creation through the full signup UI is slow), and a smaller reporter batch size.
- **`playwright.config.ts`** runs everything else. Its `globalSetup` (`misc/cacheWarmer.ts`) logs in once with a stable secondary account, records a HAR of static assets, and marks that account's inbox as read so later email-verification tests don't see stale unread messages.

`npm run test:setup` uses the first config, `npm test` the second. They're separate configs rather than one config with conditional logic because they genuinely have different `globalSetup`, `timeout`, and reporter settings, and Playwright configs aren't designed to branch on which tests you're about to run.

## How setup and main tests interact

`createAccounts.spec.ts` runs one `@START` test per worker (`test.describe.parallel`), each creating a disposable account via `ApiRequests.createUserApi()` and writing it into `variables/defaultUsers.json` at its worker index. Writes are serialized with `async-mutex` so N parallel workers appending to the same file don't race and corrupt it.

The main suite reads that same file in `fixtures.ts` (`userAccounts[testInfo.parallelIndex]`), so worker 0 in the main run gets the account worker 0 created in setup. This is what lets the main suite skip re-registering an account per test — registration happens once per worker, tests reuse it.

## Authentication

Two paths, depending on what a test needs:

- **Cookie/token injection** (`BasePage.oauthWithToken`) — `ApiRequests.login()` gets a token over the API, and the fixture injects it as a cookie before navigating. Fast, and what most tests use since they don't care about the login UI itself.
- **UI login** (`AuthenticationPage.authenticateUser`) — used by the authentication spec itself, which is testing the login form.

`misc/cacheWarmer.ts` additionally logs in once via the UI during `globalSetup` to capture a HAR of static asset requests, replayed per-test with `page.routeFromHAR` to avoid re-fetching the same JS/CSS/fonts in every worker.

## Qase integration

`playwright-qase-reporter` is registered in both configs. Each test is wrapped with `qase(id, '@QATEST-<id> Title')`, which attaches a Qase test-case ID and lets the tag double as a `--grep` filter. The reporter config sets a project code, run title, and `uploadAttachments: true`; `QASE_MODE` defaults to `off` in `.env.example`, so nothing is reported anywhere unless a real Qase TestOps token and project are configured — this repo doesn't include either. The project code and case IDs shown here are the pattern to copy, not a live workspace.

## Why services are separate from page objects

Page objects model UI interaction; `ApiRequests` and `EmailService` don't touch the page except where a test needs to correlate a UI state with an API/email side effect. Splitting them out means fixtures and tests can call the API directly for setup/teardown (creating a tag, deleting a custom field, checking a balance) without paying for a UI round trip, and page objects stay focused on selectors and page behavior.

## Fixtures

`fixtures.ts` extends Playwright's `test` with named fixtures that bundle whatever a scenario needs — `start` wires up every page object plus the active conversation state, `openAuthPage` is scoped to just auth-related pages, `tagForTest`/`customFieldForTest` create and tear down scoped test data via `ApiRequests`. Tests destructure only what they use instead of receiving one large shared context.

## Concurrency control

`async-mutex` (`Mutex.runExclusive`) guards the one place multiple workers write to shared state: appending to `variables/defaultUsers.json` during parallel account setup. Everything else is worker-isolated (separate accounts, separate browser contexts), so the mutex is scoped to that single file, not sprinkled throughout the framework.

## Integration patterns

- **Email (IMAP)** — `EmailService` connects to Gmail via `imap-simple`/`mailparser` to assert on transactional email content and to follow links embedded in an email body.
- **PDF parsing** — `BillingPage.downloadLastReceipt()` downloads a receipt and extracts text with `pdf-parse` so assertions can run against real document content instead of just checking a file exists.
- **HAR caching** — recorded once in `globalSetup`, replayed per test via `page.routeFromHAR` to reduce redundant static-asset requests across parallel workers.

## Known limitations

- The target application isn't public, so none of this is runnable end-to-end without a real deployment, test account, and Qase workspace behind it — see the README's "why the suite is not runnable" section.
- `express`, `body-parser`, `http-proxy-middleware`, and `googleapis` were present in the original `package.json` but have no corresponding code in this repo — removed rather than kept as unused illustration.
- `tsconfig.json` turns `noImplicitAny` off. The codebase predates this tooling pass and relies on inference in several places (untyped callback params, string-keyed lookup objects); turning strict checking on wholesale would mean touching most files just to satisfy the compiler, which is out of scope for a hygiene pass. `typecheck` still catches real type errors (e.g. null/undefined mismatches) under `strictNullChecks`.
