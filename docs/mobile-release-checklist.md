# Mobile release checklist

Run the automated gate at both 390 px and 768 px before publishing:

```bash
npx wrangler d1 migrations apply DB --local --config wrangler.mobile.jsonc --persist-to .wrangler/state
npm run test:mobile
```

For a production audit of the homepage plus representative detail routes:

```bash
MOBILE_AUDIT_BASE_URL=https://market-for-impact.rhyslindmark.chatgpt.site \
MOBILE_AUDIT_ROUTES=/,/san-francisco,/grants/coefficient/grants-18659-0,/grants/coefficient/grants-15086-0,/organizations/georgetown-university-initiative-on-innovation-development-and-evaluation \
npm run test:mobile
```

The default automated gate checks page-level overflow, error pages, console errors, the phone navigation path, hard long-title and multi-recipient details, AI-safety and data-quality panel availability, representative filters and tabs, button heights, and local scrolling for the wide Charity Navigator table. It does not replace this short manual review:

- Open and close the phone navigation with touch and keyboard; follow Portfolio, San Francisco, Opportunities, and Data quality.
- Change one filter or tab in the portfolio, SF IRS universe, evaluator comparison, funding-room, grant-flow, and data-quality sections.
- Confirm dense tables scroll inside their own bordered region without moving the page sideways.
- Open one grant and one organization detail route; confirm long names, source links, facts, and the back-to-market action remain readable.
- Check visible focus, 44 px primary controls, no clipped caveats or citations, and zero browser warnings or errors.
