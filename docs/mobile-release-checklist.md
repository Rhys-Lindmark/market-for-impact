# Mobile release checklist

Run the automated gate at both 390 px and 768 px before publishing:

```bash
npm run test:mobile
```

For a production audit of the homepage plus representative detail routes:

```bash
MOBILE_AUDIT_BASE_URL=https://market-for-impact.rhyslindmark.chatgpt.site \
MOBILE_AUDIT_ROUTES=/,/grants/coefficient/grants-15086-0,/organizations/malaria-consortium \
npm run test:mobile
```

The automated gate checks page-level overflow, console errors, the phone navigation path, button heights, and local scrolling for the wide Charity Navigator table. It does not replace this short manual review:

- Open and close the phone navigation with touch and keyboard; follow Portfolio, San Francisco, Opportunities, and Data quality.
- Change one filter or tab in the portfolio, SF IRS universe, evaluator comparison, funding-room, grant-flow, and data-quality sections.
- Confirm dense tables scroll inside their own bordered region without moving the page sideways.
- Open one grant and one organization detail route; confirm long names, source links, facts, and the back-to-market action remain readable.
- Check visible focus, 44 px primary controls, no clipped caveats or citations, and zero browser warnings or errors.
