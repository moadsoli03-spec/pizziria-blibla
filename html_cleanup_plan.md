# HTML Cleanup Plan (Premium UI preserved)

## Target files
- index.html: remove BOTH duplicated inline iframe/highlight scripts + all console.* within them.
- menu.html: remove any inline suggestion scripts if duplicated; keep only required clearFilters() if used.
- admin.html: remove all inline admin UI script only if it duplicates js/admin.js (keep if not).
- auth.html/cart.html/orders.html/about.html/contact.html: ensure no injected iframe/highlight scripts exist.

## Approach
- FULL rewrite each affected HTML file with:
  - same markup/CSS links
  - same required IDs (menuSearch, menuGrid, ordersTbody, etc.)
  - remove ALL inline iframe/highlight scripts
  - remove console.debug/log/warn/error
  - remove duplicated scripts and any stray/invalid inline code

## Validation
- After rewrite: ensure `node --check` still passes for all JS.
- Manual runtime sanity: cart updates, checkout saves localStorage.orders, orders page filters.

