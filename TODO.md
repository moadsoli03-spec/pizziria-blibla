# TODO

- [ ] Prepare plan for stabilizing ONLY delete flow in js/admin-new.js
- [ ] Add `let isDeletingProduct = false;` at top-level
- [x] Update `deleteProduct(id)` to include recursion protection and restrict calls to: `saveProducts(next); renderProducts(); renderStats();`
- [x] Ensure delegated click handler prevents default + stops propagation BEFORE delete/edit handling
- [x] Ensure delete buttons are `type="button"`


