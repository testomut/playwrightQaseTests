# Playwright Framework Architecture Sample

Playwright, TypeScript, Qase TestOps, service layers, fixtures, parallel account provisioning, and external integration patterns.

This repository is based on a Playwright framework I designed for a real product. Application-specific selectors, URLs, credentials, and business data were replaced before publication. The project is intended to demonstrate framework architecture and integration patterns rather than provide a runnable test suite.

## 1. Project purpose

This started as the automation framework for a SaaS product's UI regression suite, with API helpers for setup, teardown, and test-data preparation, spanning customer communication, account and user management, billing, workflow automation, and analytics. It's published here to show how the framework itself is put together: page objects, a service layer, fixtures, parallel-safe test-account provisioning, and Qase TestOps reporting.

## 2. What the project demonstrates

- Playwright and TypeScript framework design
- Page Object and fixture composition
- A service layer (API + email) kept separate from UI page objects
- Qase TestOps integration (test IDs, run metadata, attachments)
- API-assisted setup and teardown, instead of driving the UI for every precondition
- Parallel account provisioning and concurrency control
- External integration patterns (email, PDF parsing, HAR-based caching)

## 3. Architecture overview

`BasePage` holds cross-page helpers (loaders, uploads, balance checks). `SettingsPage` and the other domain pages extend it. `ApiRequests` is a service class used for fast setup/teardown via the product's REST API instead of driving the UI for every precondition. `EmailService` verifies transactional email via IMAP. `fixtures.ts` wires page objects and services together per test scenario (`start`, `openAuthPage`, `annuallyUpdateAccountSignIn`, etc.).

Two Playwright configs exist because the suite has two phases:

- `playwright.no-setup.config.ts` runs `e2e/createAccounts.spec.ts` (tagged `@START`), which provisions one disposable test account per parallel worker and writes them to a shared JSON file, guarded by an `async-mutex` lock so concurrent workers don't corrupt the file.
- `playwright.config.ts` runs the tagged Qase test cases against those already-provisioned accounts, with a `globalSetup` that logs in once and records a HAR of static assets so every worker skips re-downloading them.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full breakdown.

## 4. Directory structure

```
e2e/            Test specs, one file per feature area
pageObjects/    Page Object classes (BasePage + domain pages)
services/       API and email service classes
fixtures/       Playwright fixture composition
constants/      Static test data (emails, receipts, user data)
types/          Shared TypeScript types
utils/          Custom Playwright command wrappers, API request helper
misc/           Global setup (HAR cache warmer)
variables/      Runtime state written by setup tests (gitignored)
```

## 5. Main execution flow

1. `npm run test:setup` provisions N test accounts in parallel (`@START` tests), one per worker, saved to `variables/defaultUsers.json`.
2. `npm test` runs the main suite: `globalSetup` warms a HAR cache, then each spec picks up its worker's pre-provisioned account via `testInfo.parallelIndex` and runs against it.
3. Each spec composes the fixtures it needs (a page object, a service, or both) rather than depending on a single global context.

## 6. Qase integration

Both configs register `playwright-qase-reporter`, and each test is wrapped with `qase(id, title)` to attach a Qase test-case ID. The reporter is configured with a project code, run title, and attachment upload, but **actually publishing results requires a real Qase TestOps workspace and API token** — none are included here, and `QASE_MODE` defaults to `off` in `.env.example` so the framework doesn't attempt to report anywhere by default.

## 7. External-service integration patterns

- **Email (IMAP)** — `EmailService` connects to a Gmail inbox to verify signup/invite/export emails, including following links inside the email body.
- **PDF parsing** — `BillingPage.downloadLastReceipt()` downloads a receipt and extracts its text with `pdf-parse` for assertions.
- **HAR-based caching** — `globalSetup` records a HAR of static assets once and replays it (`page.routeFromHAR`) across the suite to cut redundant network time.
- **Concurrency control** — `async-mutex` serializes writes to the shared account file during parallel account setup.

## 8. Environment variables

See [`.env.example`](./.env.example) for the full list with comments. Broadly: application URL/env, basic-auth credentials, a disposable "old account" used as a stable message recipient, Qase TestOps settings, and Gmail IMAP credentials for email verification.

## 9. Available commands

| Command                           | What it does                                        |
| --------------------------------- | --------------------------------------------------- |
| `npm run lint`                    | ESLint                                              |
| `npm run format` / `format:check` | Prettier                                            |
| `npm run typecheck`               | TypeScript, no emit                                 |
| `npm run test:setup`              | Provision test accounts (`@START`, no-setup config) |
| `npm test`                        | Full suite against provisioned accounts             |
| `npm run test:headed`             | Full suite, headed                                  |
| `npm run test:debug`              | Full suite, Playwright inspector                    |
| `npm run test:qase`               | Full suite with Qase reporting mode on              |

## 10. Why the suite is not runnable as published

The target application isn't public, selectors and URLs were replaced before publication, and there's no test account, Qase workspace, or mailbox behind this repo. Running `npx playwright test` here will fail at the first navigation. Use `npx playwright test --list` to see the test inventory without needing any of that.

## 11. Security and sanitization note

Selectors, endpoints, credentials, and business-specific text were replaced with neutral placeholders before this was published. `.env`, `variables/`, and `cache/` are gitignored and have never been tracked. No real secrets, tokens, credentials, or account data are present in the current published version of the repository.

## 12. Author

Stanislav Mokshyn — [github.com/testomut](https://github.com/testomut)

## License

[MIT](./LICENSE)
