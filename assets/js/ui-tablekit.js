/* ui-tablekit.js
 * Shared UI behaviors for all "table pages" (Country / City / Payment Method...)
 * Works only when the required DOM hooks exist.
 */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const norm = (s) => (s || "").toString().trim().toLowerCase();

  /* -------------------------------------------
   * 1) Flags helper (Flag Icons)
   * Hook options:
   * - [data-flag-iso2] element containing ISO2 (GB, EG...)
   * - [data-flag-target] element to render the flag into
   */
  function initFlags(root = document) {
    const blocks = $$("[data-flag-block]", root);
    if (!blocks.length) return;

    const setFlag = (el, iso2) => {
      if (!el) return;
      el.className = el.className.replace(/\bfi-[a-z]{2}\b/g, "").trim();
      el.classList.add("fi", "fi-" + (iso2 || "gb"));
    };

    blocks.forEach((block) => {
      const isoEl = $("[data-flag-iso2]", block);
      const target = $("[data-flag-target]", block);
      if (!isoEl || !target) return;

      const update = () => {
        const iso = (isoEl.value || isoEl.textContent || "").trim().toLowerCase();
        setFlag(target, iso);
      };

      isoEl.addEventListener("input", update);
      isoEl.addEventListener("change", update);
      update();
    });
  }

  /* -------------------------------------------
   * 2) Unified pagination + search + sort for tables
   * Hooks:
   * - table rows: [data-row] and optional [data-search]
   * - tbody: [data-tbody]
   * - pagination wrapper: [data-pagination]
   * - page controls: [data-page-prev] [data-page-next] [data-page-select] [data-page-size]
   * - meta: [data-from] [data-to] [data-total] [data-page-total]
   * Optional:
   * - search input: [data-table-search]
   * - sort select:  [data-table-sort]
   * - no results section: [data-no-results]
   * - empty section: [data-empty]
   * - reset search: [data-reset-search]
   */
  function initTables(root = document) {
    const pages = $$("[data-table-page]", root);
    if (!pages.length) return;

    pages.forEach((page) => {
      const tbody = $("[data-tbody]", page);
      const allRows = $$("[data-row]", page);
      const pager = $("[data-pagination]", page);

      if (!tbody || !pager) return; // not a table page or missing hooks

      const searchInput = $("[data-table-search]", page);
      const sortSelect = $("[data-table-sort]", page);

      const emptyState = $("[data-empty]", page);
      const noResults = $("[data-no-results]", page);
      const resetBtn = $("[data-reset-search]", page);

      const metaFrom = $("[data-from]", pager);
      const metaTo = $("[data-to]", pager);
      const metaTotal = $("[data-total]", pager);
      const prevBtn = $("[data-page-prev]", pager);
      const nextBtn = $("[data-page-next]", pager);
      const pageSelect = $("[data-page-select]", pager);
      const pageTotal = $("[data-page-total]", pager);
      const pageSizeSelect = $("[data-page-size]", pager);

      const state = {
        q: "",
        sort: sortSelect?.value || "newest",
        page: 1,
        size: parseInt(pageSizeSelect?.value || "10", 10) || 10
      };

      function applySearch(rows) {
        const q = norm(state.q);
        if (!q) return rows;
        return rows.filter((r) => norm(r.getAttribute("data-search") || r.textContent).includes(q));
      }

      function applySort(rows) {
        const mode = state.sort;
        const clone = rows.slice();

        if (mode === "az" || mode === "za") {
          clone.sort((a, b) => {
            const an = norm(a.querySelector(".campaign-name")?.textContent || a.textContent);
            const bn = norm(b.querySelector(".campaign-name")?.textContent || b.textContent);
            return an.localeCompare(bn);
          });
          if (mode === "za") clone.reverse();
        }

        return clone; // newest keeps DOM order
      }

      function paginate(rows) {
        const total = rows.length;
        const pagesCount = Math.max(1, Math.ceil(total / state.size));
        state.page = Math.min(state.page, pagesCount);

        const start = (state.page - 1) * state.size;
        const end = start + state.size;

        return {
          total,
          pagesCount,
          slice: rows.slice(start, end),
          from: total ? start + 1 : 0,
          to: Math.min(end, total)
        };
      }

      function renderPager(meta) {
        metaFrom.textContent = String(meta.from);
        metaTo.textContent = String(meta.to);
        metaTotal.textContent = String(meta.total);
        pageTotal.textContent = String(meta.pagesCount);

        pageSelect.innerHTML = "";
        for (let i = 1; i <= meta.pagesCount; i++) {
          const opt = document.createElement("option");
          opt.value = String(i);
          opt.textContent = String(i);
          if (i === state.page) opt.selected = true;
          pageSelect.appendChild(opt);
        }

        prevBtn.disabled = state.page <= 1;
        nextBtn.disabled = state.page >= meta.pagesCount;

        pager.classList.toggle("is-hidden", meta.total <= state.size);
      }

      function renderTable(rows) {
        tbody.innerHTML = "";
        rows.forEach((r) => tbody.appendChild(r));

        const hasAny = allRows.length > 0;
        const hasShown = rows.length > 0;

        if (emptyState) emptyState.classList.toggle("is-hidden", hasAny);
        if (noResults) noResults.classList.toggle("is-hidden", !hasAny || hasShown);

        if (!hasAny) pager.classList.add("is-hidden");
      }

      function update() {
        let rows = applySearch(allRows);
        rows = applySort(rows);

        const meta = paginate(rows);
        renderTable(meta.slice);
        renderPager(meta);
      }

      // events
      searchInput?.addEventListener("input", (e) => {
        state.q = e.target.value || "";
        state.page = 1;
        update();
      });

      sortSelect?.addEventListener("change", (e) => {
        state.sort = e.target.value || "newest";
        state.page = 1;
        update();
      });

      pageSizeSelect?.addEventListener("change", (e) => {
        state.size = parseInt(e.target.value, 10) || 10;
        state.page = 1;
        update();
      });

      pageSelect?.addEventListener("change", (e) => {
        state.page = parseInt(e.target.value, 10) || 1;
        update();
      });

      prevBtn?.addEventListener("click", () => {
        state.page = Math.max(1, state.page - 1);
        update();
      });

      nextBtn?.addEventListener("click", () => {
        state.page = state.page + 1;
        update();
      });

      resetBtn?.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        state.q = "";
        state.page = 1;
        update();
      });

      // init
      update();
    });
  }

  function boot() {
    initTables(document);
    initFlags(document);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
