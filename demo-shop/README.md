# AITG Demo Shop (v3.0.0)

A free fake shop for practising test automation: Playwright, Selenium, Cypress, codeless tools and AI test agents.
Live copy: https://demo.aitestingguide.com/ · used for the hands-on tests on [AI Testing Guide](https://aitestingguide.com/).

Fake data only. Static HTML and JavaScript: nothing is sent to a server, and the cart, orders and login live in your browser.

## Run it locally
Any static server works, for example:
```bash
cd demo-shop
npx serve .        # or: python -m http.server 8080
```
Then open http://localhost:3000/ (or :8080).

## What you can test
- Login: `demo@aitg.test` / `Demo123!`, a wrong password, and a locked account `locked@aitg.test`.
- Products: search, category filter, sort, in-stock filter (12 products, one sold out).
- Cart: quantity, remove, coupons `SAVE10` and `HALF`, free shipping from $100, confirm dialog to clear.
- Checkout: validation on every field, order number, order history.
- Test lab (`shop/lab.html`): late element, in-page modal, iframe, shadow-DOM button, new-tab link, random id per load, sortable table, file picker.
- Most elements have a `data-testid`.

## Test switches
Add to the address, or use `shop/switches.html` (saved in localStorage):

| Switch | Effect |
|---|---|
| `?delay=1` | Slow loading (1.5 s) |
| `?flaky=1` | Random load time 0-3 s |
| `?rename=1` | "Add to cart" becomes "Add to basket", with a new id and test id |
| `?look=1` | Visual change: near-white price, square cards, green button |
| `?shift=1` | Late promo banner shifts the layout |

"Reset shop" in the footer clears cart, orders, login and switches.

## Rules for the live copy
Keep load light: no load tests, scanners or bots. For security practice use a local app such as OWASP Juice Shop.

## Changelog
- 3.0.0 (23 Nov 2026): first public version.

MIT licence, like the rest of this repository.
