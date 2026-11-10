# AITestingGuide test kits

Small, runnable files behind the hands-on tests published on [AITestingGuide.com](https://aitestingguide.com). Everything here runs on one machine against a tiny local demo app, so you can reproduce a result instead of trusting it.

**What these numbers are, and are not.** The server and the load generator ran on the same Windows PC. The results show how each tool behaves on a trivial endpoint. They are not a capacity benchmark and say nothing about your system.

## What is in the repo

| Folder | Contents | Used in |
|---|---|---|
| `demo-app/` | Node.js server: a demo shop page (login, delayed "Add to cart", checkout) and a `GET /users` JSON endpoint on port 3000. No dependencies. | all tests below |
| `cypress-demo/` | Cypress spec `shop.cy.js`: login, wait for the delayed button, checkout, plus a wrong-password check | [Cypress vs Playwright](https://aitestingguide.com/cypress-vs-playwright/), [Cypress vs Selenium](https://aitestingguide.com/cypress-vs-selenium/) |
| `load-testing/k6-users.js` | k6 script: 100 virtual users, 30 s, `GET /users`, threshold `p(95)<200` | [JMeter vs k6](https://aitestingguide.com/jmeter-vs-k6/) |
| `load-testing/jmeter-users.jmx` | JMeter 5.6.3 plan with the same load: 100 threads, 30 s, 1 s think time | [JMeter vs k6](https://aitestingguide.com/jmeter-vs-k6/) |
| `load-testing/k6-invalid-threshold-demo.js` | The same k6 script with the threshold written as `p95<200`. This is **invalid** k6 syntax and exits with code 104. Kept to show the error. | [JMeter vs k6](https://aitestingguide.com/jmeter-vs-k6/) |

## Run it

Needs Node.js 18+. Start the demo app first:

```bash
cd demo-app
node server.js        # http://127.0.0.1:3000
```

**k6** (second terminal):

```bash
k6 run load-testing/k6-users.js
```

**JMeter** (non-GUI):

```bash
jmeter -n -t load-testing/jmeter-users.jmx -l result.jtl
```

**Cypress:**

```bash
cd cypress-demo
npm init -y && npm i -D cypress
npx cypress run
```

## Results we measured (10 Nov 2026, Windows PC, everything local)

| Test | Tool version | Result |
|---|---|---|
| Cypress shop spec | Cypress 16.2.1, headless Electron, Node 26.13 | 2 of 2 tests passed, spec 3 s |
| k6, 100 VUs, 30 s | k6 2.3.0 | 3000 requests, 0 failed, avg 0.99 ms, p95 2.64 ms, max 24.54 ms, about 99.8 req/s |
| JMeter, 100 threads, 30 s | JMeter 5.6.3 | 2874 samples, 0 errors, avg 2 ms, max 98 ms, about 95.6 req/s |

Your numbers will differ. Hardware, versions and background load all change them.

## Not tested

Distributed load, cloud runs, memory use, and the `grafana/k6-action` GitHub Action. We make no claims about them.

## Licence

MIT.
