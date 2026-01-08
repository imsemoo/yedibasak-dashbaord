(function () {
  // Prefer targeting the system-components area, but fall back to `document`
  // so shared widgets (Select2, chips) initialize on other pages too.
  const page = document.querySelector('[data-page="system-components"]') || document;

  /* ===================== Copy notes ===================== */
  page.querySelector('[data-copy-notes]')?.addEventListener('click', async () => {
    const txt = `System Components Notes
- Init Select2 on: .js-select2
- Init Select2 tags on: .js-select2-tags (tags + tokenSeparators)
- Custom multiselect uses:
  [data-control] toggle, [data-dropdown] menu, [data-hidden] CSV output, [data-chips] chips container
- Unified pagination markup:
  .cs-pagination + .cs-page-btn with .is-active + disabled
`;
    try { await navigator.clipboard.writeText(txt); } catch (e) { }
  });

  /* ===================== Textarea counter ===================== */
  (function initCounters() {
    const ta = page.querySelector('#taStory');
    const counter = page.querySelector('#taCounter');
    if (!ta || !counter) return;

    const max = parseInt(ta.getAttribute('data-maxlength') || '0', 10);
    const sync = () => {
      const val = ta.value || '';
      const len = val.length;
      counter.textContent = `${len} / ${max}`;
      if (max && len > max) {
        ta.value = val.slice(0, max);
        counter.textContent = `${max} / ${max}`;
      }
    };
    ta.addEventListener('input', sync);
    sync();
  })();

  /* ===================== Table bulk select ===================== */
  (function initTableBulk() {
    const selectAll = page.querySelector('[data-select-all]');
    const rowChecks = [...page.querySelectorAll('[data-row-check]')];
    const bulkBtn = page.querySelector('[data-bulk-btn]');

    function syncBulk() {
      const any = rowChecks.some(c => c.checked);
      if (bulkBtn) bulkBtn.disabled = !any;
    }

    selectAll?.addEventListener('change', () => {
      rowChecks.forEach(c => c.checked = selectAll.checked);
      syncBulk();
    });

    rowChecks.forEach(c => c.addEventListener('change', () => {
      const all = rowChecks.length ? rowChecks.every(x => x.checked) : false;
      if (selectAll) selectAll.checked = all;
      syncBulk();
    }));

    syncBulk();
  })();

  /* ===================== Select2 init (after scripts load) ===================== */
  (function initSelect2WhenReady() {
    function run() {
      if (typeof window.jQuery === 'undefined' || typeof window.jQuery.fn.select2 === 'undefined') return false;

      const $ = window.jQuery;

      // Single/Multi standard
      $('.js-select2').each(function () {
        const $el = $(this);
        const placeholder = $el.data('placeholder') || '';
        const allowClear = String($el.data('allow-clear')) === 'true';

        $el.select2({
          placeholder,
          allowClear,
          width: '100'
        });
      });

      // Tags mode
      $('.js-select2-tags').each(function () {
        const $el = $(this);
        const placeholder = $el.data('placeholder') || 'Type...';
        $el.select2({
          tags: true,
          tokenSeparators: [',', ' '],
          placeholder,
          width: '100'
        });
      });

      // Keep dropdown in the same stacking context (optional)
      // If you ever use Select2 inside modal, you should pass dropdownParent: $('#modalId')

      return true;
    }

    // try a few ticks (defer chain safe)
    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      if (run() || tries > 20) clearInterval(timer);
    }, 120);
  })();

  /* ===================== Custom multiselect (chips) ===================== */
  (function initCustomMultiselect() {
    const root = page.querySelector('.js-cs-multiselect');
    if (!root) return;

    const btn = root.querySelector('[data-control]');
    const dd = root.querySelector('[data-dropdown]');
    const hidden = root.querySelector('[data-hidden]');
    const chips = root.querySelector('[data-chips]');
    const ph = root.querySelector('[data-placeholder]');

    if (!btn || !dd || !hidden || !chips || !ph) return;

    const options = [...dd.querySelectorAll('.cs-multiselect__option')];

    function getSelected() {
      const raw = (hidden.value || '').trim();
      if (!raw) return [];
      return raw.split(',').map(s => s.trim()).filter(Boolean);
    }

    function setSelected(list) {
      hidden.value = list.join(',');
      render();
    }

    function render() {
      const selected = getSelected();
      chips.innerHTML = '';

      options.forEach(o => {
        const v = o.getAttribute('data-value') || '';
        o.classList.toggle('is-selected', selected.includes(v));
      });

      if (!selected.length) {
        ph.style.display = '';
      } else {
        ph.style.display = 'none';
        selected.forEach(v => {
          const opt = options.find(o => (o.getAttribute('data-value') || '') === v);
          const label = opt?.getAttribute('data-label') || v;

          const chip = document.createElement('span');
          chip.className = 'cs-chip';
          chip.innerHTML = `<span>${label}</span>`;
          const x = document.createElement('button');
          x.type = 'button';
          x.setAttribute('aria-label', `Remove ${label}`);
          x.innerHTML = `<i class="fa-solid fa-xmark" aria-hidden="true"></i>`;
          x.addEventListener('click', (e) => {
            e.stopPropagation();
            setSelected(selected.filter(s => s !== v));
          });
          chip.appendChild(x);
          chips.appendChild(chip);
        });
      }
    }

    function open() {
      dd.classList.remove('is-hidden');
      btn.setAttribute('aria-expanded', 'true');
    }

    function close() {
      dd.classList.add('is-hidden');
      btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', () => {
      const openNow = dd.classList.contains('is-hidden');
      if (openNow) open(); else close();
    });

    options.forEach(o => {
      o.addEventListener('click', () => {
        const v = o.getAttribute('data-value') || '';
        const selected = getSelected();
        const next = selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v];
        setSelected(next);
      });
    });

    document.addEventListener('click', (e) => {
      if (!root.contains(e.target)) close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    render();
  })();

})();