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

        // If this is the country select, render flags using flag-icons (https://flagicons.lipis.dev/)
        const isCountry = ($el.attr('id') || '') === 's2Country';

        const formatCountry = (state) => {
          if (!state.id) return state.text;
          const code = (state.id === 'uk' ? 'gb' : state.id).toLowerCase();
          const $node = $("<span><i class='fi fi-" + code + "' style='margin-right:8px' aria-hidden='true'></i>" + state.text + "</span>");
          return $node;
        };

        $el.select2({
          placeholder,
          allowClear,
          width: '100%',
          templateResult: isCountry ? formatCountry : undefined,
          templateSelection: isCountry ? formatCountry : undefined,
          escapeMarkup: function (m) { return m; }
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

  // Custom multiselect initialization disabled in `ui-script.js` to avoid
  // duplicate/conflicting initialization with the main `assets/js/script.js`.
  // The global initializer in `script.js` handles `.js-cs-multiselect` elements.

  /* Password visibility toggle for #fPassword - add eye icon to show/hide */
  (function initPasswordToggle() {
    const pwd = page.querySelector('#fPassword');
    if (!pwd) return;

    // don't add twice
    if (page.querySelector('.password-toggle')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'icon-button password-toggle';
    btn.setAttribute('aria-label', 'Toggle password visibility');
    btn.innerHTML = "<i class='fa-solid fa-eye' aria-hidden='true'></i>";

    pwd.insertAdjacentElement('afterend', btn);

    btn.addEventListener('click', () => {
      if (pwd.type === 'password') {
        pwd.type = 'text';
        btn.innerHTML = "<i class='fa-solid fa-eye-slash' aria-hidden='true'></i>";
      } else {
        pwd.type = 'password';
        btn.innerHTML = "<i class='fa-solid fa-eye' aria-hidden='true'></i>";
      }
      pwd.focus();
    });
  })();

})();