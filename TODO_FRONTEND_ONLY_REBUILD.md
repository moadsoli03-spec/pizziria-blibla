# TODO_FRONTEND_ONLY_REBUILD

## Completed
- Performed initial scan/read of key frontend files (storage/auth/cart/orders/menu/admin/app/api/ui/data/pdfInvoice).
- Verified JavaScript syntax for all main modules with `node --check`.

## Remaining stabilization tasks
- Remove all remaining console.log / console.warn / console.error calls in shipped code (HTML inline scripts too).
- Remove duplicate init/render flows and duplicated listeners if detected across all pages.
- Ensure admin2.js is not referenced anywhere and is not loaded.
- Ensure no backend/API/fetch/JWT/Bearer code remains (remove if any references persist).
- Validate all JS files again with `node --check` and ensure zero errors.
- Validate HTML pages for broken script includes and runtime dependencies.

