# Demo Shop visual tests (UI Verify)

Small local demo store (fake data, 127.0.0.1) with four Playwright visual snapshots, used for the UI Verify hands-on test on AITestingGuide.com.

    cd visual-testing
    npm install
    npx playwright install chromium
    npx playwright test
    npx -y uiverify@1.10.0 upload --static-dir ./uiverify-archive --exit-zero-on-changes

Needs Node 20+ and Git. Everything runs locally; nothing here is a capacity or accuracy benchmark.

Baseline note: builds on main are uploaded with --auto-accept-changes.
