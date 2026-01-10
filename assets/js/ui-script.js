/**
 * UI Script - System Components Page Behaviors
 * سكريبت واجهة المستخدم - سلوكيات صفحة مكونات النظام
 * 
 * =====================================================================================
 * دليل الوظائف - FUNCTIONS INDEX
 * =====================================================================================
 * 
 * ★ لإيقاف أي وظيفة: ابحث عن اسمها أدناه وعلق على استدعائها
 * ★ To disable any function: Find it below and comment out its invocation (IIFE call)
 * 
 * =====================================================================================
 * | الوظيفة                     | الوصف بالعربية              | Description              |
 * =====================================================================================
 * | Copy Notes Handler          | نسخ الملاحظات للحافظة        | Copy notes to clipboard  |
 * | initCounters()              | عداد أحرف مربع النص          | Textarea char counter    |
 * | initTableBulk()             | تحديد صفوف الجدول بالجملة    | Table bulk select all    |
 * | initSelect2WhenReady()      | تهيئة Select2 المنسدلة       | Init Select2 dropdowns   |
 * | initCustomMultiselect()     | القائمة المخصصة متعددة الخيار | Custom chips multiselect |
 * =====================================================================================
 * 
 * ★★★ مثال لإيقاف وظيفة - EXAMPLE TO DISABLE A FUNCTION ★★★
 * 
 * قبل (تعمل):
 *   (function initCounters() { ... })();
 * 
 * بعد (معطلة):
 *   // (function initCounters() { ... })();
 *   // أو ببساطة احذف () في نهاية الوظيفة:
 *   (function initCounters() { ... }); // بدون () = لن تعمل
 * 
 * =====================================================================================
 */

(function () {
  // Prefer targeting the system-components area, but fall back to `document`
  // so shared widgets (Select2, chips) initialize on other pages too.
  const page = document.querySelector('[data-page="system-components"]') || document;

  /* ═══════════════════════════════════════════════════════════════════════════════
   * COPY NOTES - نسخ الملاحظات
   * وظيفة: نسخ ملاحظات مكونات النظام إلى الحافظة عند الضغط على الزر
   * Purpose: Copy system components notes to clipboard on button click
   * لإيقافها: علق على السطر page.querySelector('[data-copy-notes]')?.addEventListener...
   * ═══════════════════════════════════════════════════════════════════════════════ */
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

  /* ═══════════════════════════════════════════════════════════════════════════════
   * TEXTAREA COUNTER - عداد أحرف مربع النص
   * وظيفة: عرض عدد الأحرف المكتوبة مقابل الحد الأقصى المسموح
   * Purpose: Show character count vs max allowed in textarea
   * لإيقافها: علق على استدعاء الوظيفة })(); في نهايتها
   * ═══════════════════════════════════════════════════════════════════════════════ */
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

  /* ═══════════════════════════════════════════════════════════════════════════════
   * TABLE BULK SELECT - تحديد صفوف الجدول بالجملة
   * وظيفة: تحديد/إلغاء تحديد جميع صفوف الجدول دفعة واحدة + تفعيل زر الإجراء الجماعي
   * Purpose: Select/deselect all table rows + enable bulk action button
   * لإيقافها: علق على استدعاء الوظيفة })(); في نهايتها
   * ═══════════════════════════════════════════════════════════════════════════════ */
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

  /* ═══════════════════════════════════════════════════════════════════════════════
   * SELECT2 INITIALIZATION - تهيئة Select2
   * وظيفة: تفعيل مكتبة Select2 على القوائم المنسدلة (.js-select2) والوسوم (.js-select2-tags)
   * Purpose: Init Select2 on dropdowns (.js-select2) and tag inputs (.js-select2-tags)
   * لإيقافها: علق على استدعاء الوظيفة })(); في نهايتها
   * ═══════════════════════════════════════════════════════════════════════════════ */
  (function initSelect2WhenReady() {
    function run() {
      if (typeof window.jQuery === 'undefined' || typeof window.jQuery.fn.select2 === 'undefined') return false;

      const $ = window.jQuery;

      // Single/Multi standard - القوائم المنسدلة العادية
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

      // Tags mode - وضع الوسوم
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

  /* ═══════════════════════════════════════════════════════════════════════════════
   * CUSTOM MULTISELECT (CHIPS) - القائمة المخصصة متعددة الاختيار
   * وظيفة: قائمة منسدلة مخصصة تعرض الخيارات كشرائح (chips) قابلة للحذف
   * Purpose: Custom dropdown showing selections as removable chips
   * العناصر المطلوبة:
   *   - [data-control]: زر فتح/إغلاق القائمة
   *   - [data-dropdown]: القائمة المنسدلة
   *   - [data-hidden]: حقل مخفي لتخزين القيم (CSV)
   *   - [data-chips]: حاوية الشرائح
   *   - [data-placeholder]: نص العنصر النائب
   * لإيقافها: علق على استدعاء الوظيفة })(); في نهايتها
   * ═══════════════════════════════════════════════════════════════════════════════ */
  (function initCustomMultiselect() {
    const root = page.querySelector('.js-cs-multiselect');
    if (!root) return;

    const btn = root.querySelector('[data-control]');      // زر التحكم
    const dd = root.querySelector('[data-dropdown]');       // القائمة المنسدلة
    const hidden = root.querySelector('[data-hidden]');     // الحقل المخفي
    const chips = root.querySelector('[data-chips]');       // حاوية الشرائح
    const ph = root.querySelector('[data-placeholder]');    // النص النائب

    if (!btn || !dd || !hidden || !chips || !ph) return;

    const options = [...dd.querySelectorAll('.cs-multiselect__option')];

    // الحصول على القيم المحددة - Get selected values
    function getSelected() {
      const raw = (hidden.value || '').trim();
      if (!raw) return [];
      return raw.split(',').map(s => s.trim()).filter(Boolean);
    }

    // تعيين القيم المحددة - Set selected values
    function setSelected(list) {
      hidden.value = list.join(',');
      render();
    }

    // رسم الشرائح - Render chips
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

    // فتح القائمة - Open dropdown
    function open() {
      dd.classList.remove('is-hidden');
      btn.setAttribute('aria-expanded', 'true');
    }

    // إغلاق القائمة - Close dropdown
    function close() {
      dd.classList.add('is-hidden');
      btn.setAttribute('aria-expanded', 'false');
    }

    // معالج زر التحكم - Toggle button handler
    btn.addEventListener('click', () => {
      const openNow = dd.classList.contains('is-hidden');
      if (openNow) open(); else close();
    });

    // معالج اختيار الخيارات - Option click handler
    options.forEach(o => {
      o.addEventListener('click', () => {
        const v = o.getAttribute('data-value') || '';
        const selected = getSelected();
        const next = selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v];
        setSelected(next);
      });
    });

    // إغلاق عند النقر خارج القائمة - Close on outside click
    document.addEventListener('click', (e) => {
      if (!root.contains(e.target)) close();
    });

    // إغلاق عند الضغط على Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    render();
  })();

})();