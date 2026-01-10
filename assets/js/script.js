/**
 * Dashboard front-end behaviors for campaigns, donors, donations, messaging,
 * team management, exports, and settings screens.
 * Runs in the browser and simply wires UI interactions to the existing backend-
 * rendered pages without adding new API calls yet.
 * 
 * =====================================================================================
 * دليل الوظائف - FUNCTIONS INDEX
 * =====================================================================================
 * 
 * ★ لإيقاف أي وظيفة: ابحث عن اسمها في DOMContentLoaded (نهاية الملف) وعلق عليها
 * ★ To disable any function: Find its call in DOMContentLoaded (end of file) and comment it out
 * 
 * =====================================================================================
 * | الوظائف الأساسية - CORE FUNCTIONS                                                |
 * =====================================================================================
 * | initThemeToggle()           | تبديل الثيم فاتح/داكن      | Theme toggle           |
 * | initSidebar()               | القائمة الجانبية           | Sidebar navigation     |
 * | initSidebarSubmenus()       | القوائم الفرعية            | Sidebar submenus       |
 * | Dropdowns.init()            | القوائم المنسدلة           | All dropdown menus     |
 * | initAccessibilityHelpers()  | مساعدات الوصول            | Keyboard nav           |
 * =====================================================================================
 * 
 * =====================================================================================
 * | صفحة النظرة العامة - OVERVIEW PAGE                                                |
 * =====================================================================================
 * | initOverviewPage()          | الصفحة الرئيسية            | Main dashboard         |
 * | initDonorsOverviewPage()    | نظرة عامة المتبرعين        | Donors overview        |
 * =====================================================================================
 * 
 * =====================================================================================
 * | صفحة الحملات - CAMPAIGNS PAGE                                                     |
 * =====================================================================================
 * | initCampaignViewToggle()    | تبديل عرض بطاقات/جدول     | Cards/table view       |
 * | initCampaignFilters()       | فلاتر الحملات              | Campaign filters       |
 * | initCampaignActions()       | إجراءات الحملات            | Campaign actions       |
 * | refreshCampaignUI()         | تحديث الواجهة              | Refresh UI             |
 * | initCampaignStatusTabs()    | تبويبات الحالة             | Status tabs            |
 * | initCampaignCloseModal()    | نافذة إغلاق الحملة         | Close modal            |
 * | initCampaignPreview()       | معاينة الحملة              | Preview panel          |
 * | initCampaignImageUpload()   | رفع الصور                  | Image upload           |
 * | initCampaignFormFormatting()| تنسيق النموذج              | Form formatting        |
 * | initCampaignFormPreview()   | معاينة النموذج             | Live preview           |
 * | initCampaignFormValidation()| التحقق من النموذج          | Form validation        |
 * | initCampaignCreationExtras()| إضافات الإنشاء             | Creation extras        |
 * =====================================================================================
 * 
 * =====================================================================================
 * | صفحة التبرعات - DONATIONS PAGE                                                    |
 * =====================================================================================
 * | initDonationsViewToggle()   | تبديل عرض بطاقات/جدول     | Cards/table view       |
 * | initDonationTypeSelector()  | محدد نوع التبرع            | Type column toggle     |
 * | initDonationsFilters()      | فلاتر التبرعات             | Donations filters      |
 * | initDonationsActions()      | إجراءات التبرعات           | Donation actions       |
 * | initDonationsPreview()      | معاينة التبرع              | Preview panel          |
 * | initDonationDetailsPage()   | تفاصيل التبرع              | Single donation        |
 * | initDonationsCheckout()     | سلة التبرعات               | Cart & checkout        |
 * =====================================================================================
 * 
 * =====================================================================================
 * | صفحة المتبرعين - DONORS PAGE                                                      |
 * =====================================================================================
 * | initDonorsViewToggle()      | تبديل عرض بطاقات/جدول     | Cards/table view       |
 * | initDonorsFilters()         | فلاتر المتبرعين            | Donors filters         |
 * | initDonorsActions()         | إجراءات المتبرعين          | Donor actions          |
 * | initDonorsPreview()         | معاينة المتبرع             | Preview panel          |
 * | initDonorsPage()            | صفحة المتبرعين             | Donors list            |
 * | initDonorDetailsPage()      | تفاصيل المتبرع             | Single donor           |
 * | initDonorNewPage()          | إضافة متبرع جديد           | New donor form         |
 * | initDonorDonationsPage()    | تبرعات المتبرع             | Donor donations        |
 * =====================================================================================
 * 
 * =====================================================================================
 * | صفحات أخرى - OTHER PAGES                                                          |
 * =====================================================================================
 * | initMessagesPage()          | صفحة الرسائل               | Messages               |
 * | initSettingsPage()          | صفحة الإعدادات             | Settings               |
 * | initTeamPage()              | صفحة الفريق                | Team management        |
 * | initIntegrationsPage()      | صفحة التكاملات             | Integrations           |
 * | initExportsPage()           | صفحة التصدير               | Data exports           |
 * | initAccessAuditPage()       | سجل الوصول                 | Access audit           |
 * =====================================================================================
 * 
 * =====================================================================================
 * | وظائف مساعدة - HELPER FUNCTIONS                                                   |
 * =====================================================================================
 * | initMultiSelectTags()       | الوسوم متعددة الاختيار     | Tag picker             |
 * | markNotificationsAsRead()   | تعليم الإشعارات كمقروءة    | Mark notifications     |
 * =====================================================================================
 * 
 * ★★★ مثال لإيقاف وظيفة - EXAMPLE TO DISABLE A FUNCTION ★★★
 * 
 * في سطر ~7372 ستجد:
 *   initMessagesPage();
 * 
 * لإيقافها، علق عليها هكذا:
 *   // initMessagesPage();  // DISABLED - معطلة
 * 
 * =====================================================================================
 */
(() => {
  "use strict";
  const getCssVar = (variable) => getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

  function qs(root, sel) { return root.querySelector(sel); }
  function qsa(root, sel) { return Array.from(root.querySelectorAll(sel)); }

  function closeAll(exceptEl = null) {
    document.querySelectorAll('.js-cs-multiselect.is-open').forEach(ms => {
      if (exceptEl && ms === exceptEl) return;
      ms.classList.remove('is-open');
      const dd = qs(ms, '[data-dropdown]');
      const btn = qs(ms, '[data-control]');
      dd?.classList.add('is-hidden');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  function buildChip(label, value) {
    const chip = document.createElement('span');
    chip.className = 'cs-chip';
    chip.dataset.value = value;
    chip.innerHTML = `
      <span class="cs-chip__label"></span>
      <button type="button" class="cs-chip__x" aria-label="Remove"><i class="fa-solid fa-chevron-down"></i></button>
    `;
    chip.querySelector('.cs-chip__label').textContent = label;
    return chip;
  }

  function syncHidden(ms) {
    const hidden = qs(ms, '[data-hidden]');
    if (!hidden) return;
    const values = qsa(ms, '.cs-multiselect__option.is-selected').map(o => o.dataset.value);
    hidden.value = values.join(',');
  }

  function syncPlaceholder(ms) {
    const placeholder = qs(ms, '[data-placeholder]');
    const chipsWrap = qs(ms, '[data-chips]');
    if (!placeholder || !chipsWrap) return;

    const hasChips = chipsWrap.children.length > 0;
    placeholder.style.display = hasChips ? 'none' : '';
  }

  function renderChips(ms) {
    const chipsWrap = qs(ms, '[data-chips]');
    if (!chipsWrap) return;

    chipsWrap.innerHTML = '';
    const selected = qsa(ms, '.cs-multiselect__option.is-selected');

    selected.forEach(opt => {
      const value = opt.dataset.value;
      const label = opt.dataset.label || opt.textContent.trim();
      const chip = buildChip(label, value);

      chip.querySelector('.cs-chip__x').addEventListener('click', (e) => {
        e.preventDefault();
        opt.classList.remove('is-selected');
        opt.setAttribute('aria-selected', 'false');
        renderChips(ms);
        syncHidden(ms);
        syncPlaceholder(ms);
      });

      chipsWrap.appendChild(chip);
    });
  }

  function toggle(ms, forceOpen = null) {
    const dd = qs(ms, '[data-dropdown]');
    const btn = qs(ms, '[data-control]');
    if (!dd || !btn) return;

    const isOpen = ms.classList.contains('is-open');
    const next = (forceOpen === null) ? !isOpen : !!forceOpen;

    closeAll(ms);

    if (next) {
      ms.classList.add('is-open');
      dd.classList.remove('is-hidden');
      btn.setAttribute('aria-expanded', 'true');
    } else {
      ms.classList.remove('is-open');
      dd.classList.add('is-hidden');
      btn.setAttribute('aria-expanded', 'false');
    }
  }

  function initMultiSelect(ms) {
    const control = qs(ms, '[data-control]');
    const dropdown = qs(ms, '[data-dropdown]');
    const options = qsa(ms, '.cs-multiselect__option');
    const hidden = qs(ms, '[data-hidden]');

    // bind hidden input name from data-name if provided
    const name = ms.getAttribute('data-name');
    if (hidden && name) hidden.name = name;

    // open/close
    control?.addEventListener('click', () => toggle(ms));

    // select option (toggle)
    options.forEach(opt => {
      opt.setAttribute('role', 'option');
      opt.setAttribute('aria-selected', opt.classList.contains('is-selected') ? 'true' : 'false');

      opt.addEventListener('click', (e) => {
        e.preventDefault();
        const selected = opt.classList.toggle('is-selected');
        opt.setAttribute('aria-selected', selected ? 'true' : 'false');

        renderChips(ms);
        syncHidden(ms);
        syncPlaceholder(ms);
      });
    });

    // initial state from hidden input value (if present)
    if (hidden && hidden.value.trim()) {
      const set = new Set(hidden.value.split(',').map(s => s.trim()).filter(Boolean));
      options.forEach(opt => {
        if (set.has(opt.dataset.value)) opt.classList.add('is-selected');
      });
      renderChips(ms);
      syncPlaceholder(ms);
    } else {
      syncPlaceholder(ms);
    }

    // keyboard: Esc closes, Enter opens
    control?.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { toggle(ms, false); control.blur(); }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(ms, true); }
    });

    // click outside closes
    document.addEventListener('click', (e) => {
      if (!ms.contains(e.target)) toggle(ms, false);
    });

    // Esc anywhere closes
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAll();
    });
  }

  // init all
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.js-cs-multiselect').forEach(initMultiSelect);
  });


  const hexToRgb = (value = "") => {
    let sanitized = value.replace("#", "").trim();
    if (!sanitized) return null;
    if (sanitized.length === 3) {
      sanitized = sanitized
        .split("")
        .map((char) => `${char}${char}`)
        .join("");
    }
    if (sanitized.length !== 6) return null;
    const intValue = parseInt(sanitized, 16);
    if (Number.isNaN(intValue)) return null;
    return [(intValue >> 16) & 255, (intValue >> 8) & 255, intValue & 255];
  };

  const withAlpha = (value, alpha) => {
    const trimmed = (value || "").trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("rgba")) {
      return trimmed.replace(/rgba?\(([^)]+)\)/, `rgba($1, ${alpha})`);
    }
    if (trimmed.startsWith("rgb(")) {
      const inner = trimmed.replace("rgb(", "").replace(")", "");
      return `rgba(${inner}, ${alpha})`;
    }
    const rgb = hexToRgb(trimmed);
    return rgb ? `rgba(${rgb.join(", ")}, ${alpha})` : trimmed;
  };

  const isReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const overviewMapState = {
    map: null,
    markers: new Map(),
    rows: new Map(),
    setActiveRegion: null,
    setHoverRegion: null,
    currentActive: "",
  };

  const Dropdowns = (() => {
    let toggles = [];
    let panels = [];
    const targetAttr = "data-dropdown-target";

    const findPanel = (id) => panels.find((panel) => panel.dataset.dropdownPanel === id);
    const findToggle = (id) => toggles.find((toggle) => toggle.getAttribute(targetAttr) === id);

    const closeAll = () => {
      panels.forEach((panel) => {
        panel.classList.remove("is-open");
        panel.setAttribute("aria-hidden", "true");
      });
      toggles.forEach((toggle) => toggle.setAttribute("aria-expanded", "false"));
    };

    const open = (id) => {
      const panel = findPanel(id);
      const toggle = findToggle(id);
      if (!panel || !toggle) return;
      closeAll();
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
    };

    const toggleDropdown = (id) => {
      if (!id) return;
      const panel = findPanel(id);
      if (!panel) return;
      const isOpen = panel.classList.contains("is-open");
      if (isOpen) {
        closeAll();
      } else {
        open(id);
      }
    };

    const handleToggleClick = (event) => {
      event.stopPropagation();
      const id = event.currentTarget.getAttribute(targetAttr);
      toggleDropdown(id);
    };

    const handleToggleKeydown = (event) => {
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        const id = event.currentTarget.getAttribute(targetAttr);
        toggleDropdown(id);
      }
    };

    const handleDocumentClick = (event) => {
      if (!event.target.closest(".dropdown") && !event.target.closest(".js-dropdown-toggle")) {
        closeAll();
      }
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        closeAll();
      }
    };

    const init = () => {
      toggles = Array.from(document.querySelectorAll(".js-dropdown-toggle"));
      panels = Array.from(document.querySelectorAll("[data-dropdown-panel]"));

      toggles.forEach((toggle) => {
        toggle.setAttribute("aria-expanded", "false");
        toggle.addEventListener("click", handleToggleClick);
        toggle.addEventListener("keydown", handleToggleKeydown);
      });

      panels.forEach((panel) => panel.setAttribute("aria-hidden", "true"));

      document.addEventListener("click", handleDocumentClick);
      document.addEventListener("keydown", handleEsc);
    };

    return { init, closeAll, open, toggle: toggleDropdown };
  })();

  const STORAGE_KEY = "donations-dashboard-theme";
  const CAMPAIGN_VIEW_STORAGE_KEY = "dd_campaigns_view_mode";
  const DONATIONS_VIEW_STORAGE_KEY = "dd_donations_view_mode";
  const DONATION_TYPE_STORAGE_KEY = "dd_donation_type";
  const DONORS_VIEW_STORAGE_KEY = "dd_donors_view_mode";
  const mobileQuery = window.matchMedia("(max-width: 1023px)");

  // These arrays are only mock labels while we wait for the backend to render the real chart data in HTML.
  const barCategories = ["Education", "Healthcare", "Emergency Relief", "Operations", "Community"];
  const donutLabels = ["One-time", "Recurring", "Corporate", "In-kind"];

  // Sample region metadata used for theming/placeholders until backend-driven map markers arrive in the DOM.
  const REGIONS_SAMPLE = [
    {
      id: "nairobi",
      name: "Nairobi",
      country: "Kenya",
      lat: -1.286389,
      lng: 36.817223,
      totalDonations: 58100,
      donors: 214,
      campaigns: 6,
      level: "high",
    },
    {
      id: "istanbul",
      name: "Istanbul",
      country: "Turkiye",
      lat: 41.0082,
      lng: 28.9784,
      totalDonations: 31400,
      donors: 165,
      campaigns: 5,
      level: "medium",
    },
    {
      id: "gaza",
      name: "Gaza City",
      country: "Palestine",
      lat: 31.5067,
      lng: 34.456,
      totalDonations: 74400,
      donors: 420,
      campaigns: 9,
      level: "high",
    },
    {
      id: "amman",
      name: "Amman",
      country: "Jordan",
      lat: 31.9539,
      lng: 35.9106,
      totalDonations: 17800,
      donors: 102,
      campaigns: 3,
      level: "low",
    },
    {
      id: "kampala",
      name: "Kampala",
      country: "Uganda",
      lat: 0.3476,
      lng: 32.5825,
      totalDonations: 28500,
      donors: 150,
      campaigns: 4,
      level: "medium",
    },
  ];

  let barChart;
  let donutChart;
  let funnelChart;
  let retentionChart;
  let donorGivingChart;
  let donorsRetentionChart;
  let donorsLifecycleChart;
  let donorsSegmentsChart;
  let donorsAcquisitionChart;
  let refreshRegionsMapTheme = () => { };
  let donationsMapInitialized = false;
  let overviewRegionsLinked = false;
  const overviewCharts = [];

  const getTheme = () => (document.body.dataset.theme === "dark" ? "dark" : "light");

  // Swap theme toggle icon based on current mode
  const syncThemeIcon = (theme) => {
    const themeToggle = document.querySelector(".js-theme-toggle i");
    if (!themeToggle) return;
    themeToggle.className = theme === "dark" ? "fas fa-moon" : "fas fa-sun";
  };

  const chartPalette = () => ({
    primary: getCssVar("--color-primary") || "#15C5CE",
    primaryStrong: getCssVar("--color-primary-strong") || "#0F9AA2",
    primarySoft: getCssVar("--color-primary-soft") || "#E5FBFC",
    border: getCssVar("--color-border") || "#E2E8F3",
    text: getCssVar("--color-text") || "#111827",
    muted: getCssVar("--color-muted") || "#6B7280",
    surface: getCssVar("--color-surface") || "#FFFFFF",
    background: getCssVar("--color-bg") || "#F6F8FB",
    accent: getCssVar("--color-accent") || "#22C55E",
  });

  const registerOverviewChart = (chart) => {
    if (!chart) return null;
    overviewCharts.push(chart);
    return chart;
  };

  const unregisterOverviewChart = (chart) => {
    if (!chart) return;
    const index = overviewCharts.indexOf(chart);
    if (index > -1) {
      overviewCharts.splice(index, 1);
    }
  };

  const getApexThemeOptions = (theme) => {
    const isDark = theme === "dark";
    const textSoft = getCssVar("--color-text-soft") || getCssVar("--color-text") || "#111827";
    const textMuted = getCssVar("--color-text-muted") || getCssVar("--color-muted") || textSoft;
    const borderSubtle = getCssVar("--color-border-subtle") || getCssVar("--color-border") || "#E2E8F3";
    return {
      theme: { mode: isDark ? "dark" : "light" },
      chart: {
        foreColor: textSoft,
        background: "transparent",
      },
      tooltip: { theme: isDark ? "dark" : "light" },
      borderColor: borderSubtle,
      labelColor: textMuted,
      legendColor: textMuted,
    };
  };

  const updateChartsForTheme = (theme) => {
    if (!overviewCharts.length) return;
    const themeOptions = getApexThemeOptions(theme);
    overviewCharts.forEach((chart) => {
      chart.updateOptions(
        {
          theme: themeOptions.theme,
          chart: {
            ...themeOptions.chart,
          },
          grid: {
            borderColor: themeOptions.borderColor,
          },
          xaxis: {
            axisBorder: { color: themeOptions.borderColor },
            axisTicks: { color: themeOptions.borderColor },
            labels: { style: { colors: themeOptions.labelColor } },
          },
          yaxis: {
            labels: { style: { colors: themeOptions.labelColor } },
          },
          legend: {
            labels: { colors: themeOptions.legendColor },
          },
          tooltip: themeOptions.tooltip,
        },
        false,
        true
      );
    });
  };

  const updateMapForTheme = (theme) => {
    const map = window.donationsMap;
    const layers = window.donationsMapLayers;
    if (!map || !layers) return;
    const targetLayer = theme === "dark" ? layers.dark : layers.light;
    const fallbackLayer = theme === "dark" ? layers.light : layers.dark;
    if (fallbackLayer && map.hasLayer(fallbackLayer)) {
      map.removeLayer(fallbackLayer);
    }
    if (targetLayer && !map.hasLayer(targetLayer)) {
      targetLayer.addTo(map);
    }
    if (typeof refreshRegionsMapTheme === "function") {
      refreshRegionsMapTheme();
    }
  };

  // Form helpers
  const getFieldValue = (field) => (field && typeof field.value === "string" ? field.value.trim() : "");

  const formatCurrencyValue = (value) => {
    const cleaned = (value || "").toString().replace(/[^\d.,]/g, "").replace(/,/g, "");
    if (!cleaned) return "";
    const [whole, decimal] = cleaned.split(".");
    const number = Number(whole || 0);
    const formattedWhole = Number.isNaN(number) ? "0" : number.toLocaleString();
    const sanitizedDecimal = decimal ? decimal.slice(0, 2) : "";
    return sanitizedDecimal ? `$${formattedWhole}.${sanitizedDecimal}` : `$${formattedWhole}`;
  };

  const parseCurrencyNumber = (value) => {
    const cleaned = (value || "").toString().replace(/[^0-9.]/g, "");
    const parsed = parseFloat(cleaned);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const formatCurrencyDisplay = (value) => {
    const number = Number(value) || 0;
    return `$${number.toLocaleString()}`;
  };

  const formatPreviewDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  };

  const animatePreviewCard = () => {
    const card = document.querySelector(".campaign-preview");
    if (!card) return;
    card.classList.remove("is-updating");
    void card.offsetWidth;
    card.classList.add("is-updating");
  };

  const clearFieldError = (field) => {
    const error = field?.closest(".form-field")?.querySelector(".form-error");
    field?.classList?.remove("is-invalid");
    field?.closest(".form-field")?.classList?.remove("is-invalid");
    if (error) {
      error.classList.add("is-hidden");
    }
  };

  const setFieldError = (field, message) => {
    const error = field?.closest(".form-field")?.querySelector(".form-error");
    field?.classList?.add("is-invalid");
    field?.closest(".form-field")?.classList?.add("is-invalid");
    if (error) {
      error.textContent = message || error.textContent || "";
      error.classList.remove("is-hidden");
    }
  };

  // Apply the current palette, persist it, and refresh charts plus map layers.
  const applyTheme = (theme) => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    syncThemeIcon(theme);
    updateChartsForTheme(theme);
    updateMapForTheme(theme);
    refreshRegionsMapTheme();
  };

  /**
   * Initialize the persistent theme toggle and icon so the overview charts and map
   * share the selected light or dark palette.
   * Expects a `.js-theme-toggle` trigger and uses localStorage STORAGE_KEY plus document body
   * data-theme to sync the CSS palette and notify charts/maps.
   */
  const initThemeToggle = () => {
    const themeToggle = document.querySelector(".js-theme-toggle");
    const stored = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored || (prefersDark ? "dark" : "light");

    document.body.setAttribute("data-theme", initial);
    syncThemeIcon(initial);

    if (themeToggle) {
      // Clicking the toggle flips between dark and light palettes.
      themeToggle.addEventListener("click", () => {
        const nextTheme = getTheme() === "dark" ? "light" : "dark";
        applyTheme(nextTheme);
      });
    }
  };

  /**
   * Initialize the responsive sidebar toggles that collapse on desktop and slide over on mobile.
   * Expects `.app`, `.sidebar`, `.js-sidebar-toggle`, and `.js-sidebar-overlay` elements to keep
   * aria states, scroll locking, and breakpoint transitions in sync as users toggle the drawer.
   */
  const initSidebar = () => {
    // Layout nodes used to open/close the sidebar panel and overlay on every breakpoint.
    const app = document.querySelector(".app");
    const sidebar = document.querySelector(".sidebar");
    const sidebarToggles = document.querySelectorAll(".js-sidebar-toggle");
    const overlay = document.querySelector(".js-sidebar-overlay");

    const lockScroll = () => document.body.classList.add("is-locked");
    const unlockScroll = () => document.body.classList.remove("is-locked");

    const closeMobileSidebar = () => {
      if (!app) return;
      app.classList.remove("sidebar-open");
      sidebar?.setAttribute("aria-hidden", "true");
      sidebarToggles.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
      unlockScroll();
    };

    const openMobileSidebar = () => {
      if (!app) return;
      app.classList.add("sidebar-open");
      sidebar?.setAttribute("aria-hidden", "false");
      sidebarToggles.forEach((btn) => btn.setAttribute("aria-expanded", "true"));
      lockScroll();
    };

    const toggleSidebar = () => {
      if (!app) return;
      if (mobileQuery.matches) {
        if (app.classList.contains("sidebar-open")) {
          closeMobileSidebar();
        } else {
          openMobileSidebar();
        }
      } else {
        const collapsed = app.classList.toggle("sidebar-collapsed");
        sidebar?.setAttribute("aria-hidden", "false");
        sidebarToggles.forEach((btn) => btn.setAttribute("aria-expanded", collapsed ? "false" : "true"));
      }
    };

    // Each toggle button opens the sidebar or collapses it depending on the screen size.
    sidebarToggles.forEach((btn) => {
      btn.setAttribute("aria-expanded", "false");
      btn.addEventListener("click", toggleSidebar);
    });

    // Clicking the overlay or pressing Escape should close the mobile sidebar.
    overlay?.addEventListener("click", closeMobileSidebar);

    // Escape key closes the mobile sidebar overlay when it is open.
    // Allow Escape key to dismiss the drawer for accessibility.
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMobileSidebar();
      }
    });

    // Track breakpoint changes to keep sidebar state consistent per device.
    mobileQuery.addEventListener("change", (event) => {
      if (event.matches) {
        if (app) {
          app.classList.remove("sidebar-collapsed");
        }
        sidebar?.setAttribute("aria-hidden", "true");
        sidebarToggles.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
        unlockScroll();
      } else {
        closeMobileSidebar();
        sidebar?.setAttribute("aria-hidden", "false");
      }
    });

    if (mobileQuery.matches) {
      sidebar?.setAttribute("aria-hidden", "true");
    }
  };

  // Build ApexCharts instances with responsive options
  // Build ApexCharts instances with placeholder series so the UI is ready for backend data once HTML is populated.
  // Construct overview ApexCharts instances with placeholder data and responsive options.
  const buildCharts = () => {
    if (typeof ApexCharts === "undefined") return;

    const palette = chartPalette();
    const successColor = getCssVar("--color-success") || "#10B981";
    const warningColor = getCssVar("--color-warning") || "#F59E0B";
    const themeMode = getTheme();
    const themeOptions = getApexThemeOptions(themeMode);

    overviewCharts.length = 0;

    const barOptions = {
      theme: themeOptions.theme,
      chart: {
        ...themeOptions.chart,
        type: "bar",
        height: 320,
        toolbar: { show: false },
      },
      series: [
        {
          name: "Donations",
          data: [62000, 54000, 38000, 24000, 18000],
        },
      ],
      plotOptions: {
        bar: {
          borderRadius: 8,
          columnWidth: "52%",
        },
      },
      colors: [palette.primary],
      grid: {
        borderColor: themeOptions.borderColor,
        strokeDashArray: 3,
      },
      xaxis: {
        categories: barCategories,
        axisBorder: { color: themeOptions.borderColor },
        axisTicks: { color: themeOptions.borderColor },
        labels: {
          style: {
            colors: barCategories.map(() => themeOptions.labelColor),
            fontWeight: 500,
          },
        },
      },
      yaxis: {
        labels: {
          style: { colors: [themeOptions.labelColor], fontWeight: 500 },
        },
      },
      legend: {
        labels: { colors: themeOptions.legendColor },
      },
      tooltip: {
        ...themeOptions.tooltip,
        y: { formatter: (val) => `$${val.toLocaleString()}` },
      },
      dataLabels: { enabled: false },
      states: {
        active: { filter: { type: "none" } },
        hover: { filter: { type: "none" } },
      },
      stroke: {
        colors: [palette.primary],
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: { height: 260 },
            plotOptions: { bar: { columnWidth: "62%" } },
          },
        },
      ],
    };

    const donutOptions = {
      theme: themeOptions.theme,
      chart: {
        ...themeOptions.chart,
        type: "donut",
        height: 320,
      },
      labels: donutLabels,
      series: [44, 26, 18, 12],
      colors: [palette.primary, palette.primaryStrong, successColor, warningColor],
      stroke: {
        colors: [palette.background],
      },
      legend: {
        position: "bottom",
        labels: { colors: themeOptions.legendColor },
        fontWeight: 600,
      },
      dataLabels: { enabled: false },
      tooltip: themeOptions.tooltip,
      plotOptions: {
        pie: {
          donut: {
            size: "64%",
            labels: { show: false },
          },
        },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: { height: 260 },
          },
        },
      ],
    };

    const barEl = document.querySelector("#donations-bar-chart");
    const donutEl = document.querySelector("#donations-donut-chart");

    if (barEl) {
      barChart = registerOverviewChart(new ApexCharts(barEl, barOptions));
      barChart.render();
    }

    if (donutEl) {
      donutChart = registerOverviewChart(new ApexCharts(donutEl, donutOptions));
      donutChart.render();
    }
  };

  /**
   * Prepare overview charts with placeholder series and refresh them when the palette changes.
   * Requires containers `#donations-bar-chart` and `#donations-donut-chart` plus ApexCharts.
   */
  const initCharts = () => {
    buildCharts();
    updateChartsForTheme(getTheme());
  };

  /**
   * Render funnel and retention mini charts on the overview page using ApexCharts.
   * Data is static and will later be replaced by backend-driven figures.
   * Expects `#donation-funnel-chart` and `#donor-retention-chart`.
   */
  const initOverviewMiniCharts = () => {
    if (typeof ApexCharts === "undefined") return;
    const funnelEl = document.querySelector("#donation-funnel-chart");
    const retentionEl = document.querySelector("#donor-retention-chart");
    if (!funnelEl && !retentionEl) return;

    const palette = chartPalette();
    const themeOptions = getApexThemeOptions(getTheme());
    const accentColor = palette.accent;
    const successColor = getCssVar("--color-success") || "#10B981";
    const warningColor = getCssVar("--color-warning") || "#F59E0B";

    if (funnelEl) {
      if (funnelChart) {
        unregisterOverviewChart(funnelChart);
        funnelChart.destroy();
      }
      const funnelOptions = {
        theme: themeOptions.theme,
        chart: {
          ...themeOptions.chart,
          type: "bar",
          height: 230,
          toolbar: { show: false },
        },
        plotOptions: {
          bar: {
            borderRadius: 8,
            horizontal: true,
            barHeight: "56%",
          },
        },
        series: [
          {
            name: "Visitors",
            data: [4200, 2300, 920],
          },
        ],
        colors: [accentColor],
        grid: {
          borderColor: themeOptions.borderColor,
          strokeDashArray: 4,
          yaxis: { lines: { show: false } },
          xaxis: { lines: { show: false } },
        },
        xaxis: {
          categories: ["Visitors", "Started checkout", "Completed"],
          axisBorder: { color: themeOptions.borderColor },
          axisTicks: { color: themeOptions.borderColor },
          labels: { style: { colors: themeOptions.labelColor }, show: true },
        },
        yaxis: {
          labels: {
            style: { colors: [themeOptions.labelColor] },
          },
        },
        dataLabels: { enabled: false },
        stroke: { colors: [accentColor], width: 3 },
        tooltip: {
          ...themeOptions.tooltip,
          y: { formatter: (val) => val.toLocaleString() },
        },
      };
      funnelChart = registerOverviewChart(new ApexCharts(funnelEl, funnelOptions));
      funnelChart.render();
    }

    if (retentionEl) {
      if (retentionChart) {
        unregisterOverviewChart(retentionChart);
        retentionChart.destroy();
      }
      const retentionOptions = {
        theme: themeOptions.theme,
        chart: {
          ...themeOptions.chart,
          type: "area",
          height: 230,
          toolbar: { show: false },
        },
        series: [
          { name: "New donors", data: [120, 145, 170, 190, 205, 220] },
          { name: "Returning donors", data: [90, 110, 130, 150, 178, 185] },
        ],
        stroke: {
          curve: "smooth",
          width: 3,
          lineCap: "round",
        },
        colors: [palette.primaryStrong, successColor],
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 0.25,
            opacityFrom: 0.55,
            opacityTo: 0.12,
            stops: [0, 90, 100],
          },
        },
        grid: {
          borderColor: themeOptions.borderColor,
          strokeDashArray: 4,
          padding: { left: 0, right: 6, bottom: 0 },
        },
        legend: {
          position: "top",
          horizontalAlign: "right",
          markers: { width: 8, height: 8, radius: 99 },
          labels: { colors: themeOptions.legendColor },
        },
        markers: {
          size: 4,
          strokeColors: "#ffffff",
          strokeWidth: 2,
          hover: { sizeOffset: 2 },
        },
        xaxis: {
          categories: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          axisBorder: { color: themeOptions.borderColor },
          axisTicks: { color: themeOptions.borderColor },
          labels: { style: { colors: themeOptions.labelColor } },
        },
        yaxis: {
          labels: {
            style: { colors: [themeOptions.labelColor] },
          },
        },
        tooltip: themeOptions.tooltip,
        dataLabels: { enabled: false },
      };
      retentionChart = registerOverviewChart(new ApexCharts(retentionEl, retentionOptions));
      retentionChart.render();
    }

    updateChartsForTheme(getTheme());
  };

  /**
   * Trigger entrance animation on the overview activity card, respecting reduced-motion settings.
   */
  const initOverviewAnimations = (root) => {
    if (!root) return;
    const activityCard = root.querySelector(".activity-card");
    if (!activityCard) return;
    if (isReducedMotion()) {
      activityCard.classList.add("is-animated");
      return;
    }
    requestAnimationFrame(() => {
      setTimeout(() => {
        activityCard.classList.add("is-animated");
      }, 160);
    });
  };

  /**
   * Link the overview region rows to the Leaflet map hover/focus so the list highlights the hovered region.
   */
  const initOverviewRegionsLinking = () => {
    if (overviewRegionsLinked) return;
    if (!overviewMapState.rows.size || typeof overviewMapState.setHoverRegion !== "function") return;
    overviewRegionsLinked = true;
    overviewMapState.rows.forEach((row, id) => {
      row.addEventListener("focus", () => {
        overviewMapState.setHoverRegion(id);
        row.classList.add("is-highlighted");
      });
      row.addEventListener("blur", () => {
        row.classList.remove("is-highlighted");
        overviewMapState.setHoverRegion(overviewMapState.currentActive);
      });
    });
  };

  /**
   * Wire overview hero, quick actions, and the regional map/chart sections for the dashboard landing page.
   * Expects `.overview-page` root along with chart targets, map container `#donations-map`, and region rows.
   */
  const initOverviewPage = () => {
    const root = document.querySelector(".overview-page");
    if (!root) return;
    initCharts();
    initDonationsMap();
    initOverviewMiniCharts();
    initOverviewAnimations(root);
  };

  /**
   * Render the donors overview charts and ensure the map hooks into the same region list.
   * Relies on `.donors-overview-page` and the chart targets defined inside the new page.
   */
  const initDonorsOverviewPage = () => {
    const root = document.querySelector(".donors-overview-page");
    if (!root) return;
    if (typeof ApexCharts === "undefined") {
      window.addEventListener("load", initDonorsOverviewPage, { once: true });
      return;
    }

    const retentionEl = root.querySelector("#donors-retention-chart");
    const lifecycleEl = root.querySelector("#donors-lifecycle-chart");
    const segmentsEl = root.querySelector("#donors-segments-chart");
    const acquisitionEl = root.querySelector("#donors-acquisition-chart");
    const palette = chartPalette();
    const themeOptions = getApexThemeOptions(getTheme());
    const successColor = getCssVar("--color-success") || "#10B981";
    const warningColor = getCssVar("--color-warning") || "#F59E0B";
    const accentColor = getCssVar("--color-accent") || "#22C55E";

    if (donorsRetentionChart) {
      unregisterOverviewChart(donorsRetentionChart);
      donorsRetentionChart.destroy();
      donorsRetentionChart = null;
    }
    if (donorsLifecycleChart) {
      unregisterOverviewChart(donorsLifecycleChart);
      donorsLifecycleChart.destroy();
      donorsLifecycleChart = null;
    }
    if (donorsSegmentsChart) {
      unregisterOverviewChart(donorsSegmentsChart);
      donorsSegmentsChart.destroy();
      donorsSegmentsChart = null;
    }
    if (donorsAcquisitionChart) {
      unregisterOverviewChart(donorsAcquisitionChart);
      donorsAcquisitionChart.destroy();
      donorsAcquisitionChart = null;
    }

    if (retentionEl) {
      const retentionCategories = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const newDonorSeries = [310, 325, 360, 385, 420, 450, 470, 495, 520, 550, 580, 610];
      const returningSeries = [280, 300, 335, 360, 390, 420, 440, 460, 490, 520, 545, 575];

      const retentionOptions = {
        theme: themeOptions.theme,
        chart: {
          ...themeOptions.chart,
          type: "area",
          height: 320,
          toolbar: { show: false },
        },
        series: [
          { name: "New donors retained", data: newDonorSeries },
          { name: "Returning donors", data: returningSeries },
        ],
        stroke: {
          curve: "smooth",
          width: 3,
          lineCap: "round",
        },
        colors: [palette.primaryStrong, successColor],
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 0.25,
            opacityFrom: 0.55,
            opacityTo: 0.08,
            stops: [0, 85, 100],
          },
        },
        grid: {
          borderColor: themeOptions.borderColor,
          strokeDashArray: 3,
        },
        legend: {
          position: "top",
          horizontalAlign: "right",
          labels: { colors: themeOptions.legendColor },
        },
        xaxis: {
          categories: retentionCategories,
          axisBorder: { color: themeOptions.borderColor },
          axisTicks: { color: themeOptions.borderColor },
          labels: { style: { colors: retentionCategories.map(() => themeOptions.labelColor) } },
        },
        yaxis: {
          labels: {
            style: { colors: [themeOptions.labelColor] },
          },
        },
        tooltip: themeOptions.tooltip,
        dataLabels: { enabled: false },
      };

      donorsRetentionChart = registerOverviewChart(new ApexCharts(retentionEl, retentionOptions));
      donorsRetentionChart.render();
    }

    if (lifecycleEl) {
      const lifecycleStages = [
        "Visitors",
        "Leads",
        "First-time donors",
        "Repeat donors",
        "Recurring donors",
      ];
      const lifecycleSeries = [12000, 4500, 2400, 1200, 800];

      const lifecycleOptions = {
        theme: themeOptions.theme,
        chart: {
          ...themeOptions.chart,
          type: "bar",
          height: 300,
          toolbar: { show: false },
        },
        plotOptions: {
          bar: {
            horizontal: true,
            borderRadius: 12,
            barHeight: "56%",
          },
        },
        series: [
          {
            name: "Donors",
            data: lifecycleSeries,
          },
        ],
        colors: [accentColor],
        grid: {
          borderColor: themeOptions.borderColor,
          strokeDashArray: 4,
          xaxis: { lines: { show: false } },
          yaxis: { lines: { show: false } },
        },
        xaxis: {
          categories: lifecycleStages,
          axisBorder: { color: themeOptions.borderColor },
          axisTicks: { color: themeOptions.borderColor },
          labels: { style: { colors: lifecycleStages.map(() => themeOptions.labelColor) } },
        },
        yaxis: {
          labels: {
            style: { colors: [themeOptions.labelColor] },
          },
        },
        tooltip: {
          ...themeOptions.tooltip,
          y: { formatter: (val) => val.toLocaleString() },
        },
        dataLabels: { enabled: false },
      };

      donorsLifecycleChart = registerOverviewChart(new ApexCharts(lifecycleEl, lifecycleOptions));
      donorsLifecycleChart.render();
    }

    if (segmentsEl) {
      const segmentLabels = ["Individual", "Organization", "Corporate", "Major donor"];
      const segmentSeries = [48, 22, 18, 12];

      const segmentsOptions = {
        theme: themeOptions.theme,
        chart: {
          ...themeOptions.chart,
          type: "donut",
          height: 300,
          toolbar: { show: false },
        },
        labels: segmentLabels,
        series: segmentSeries,
        stroke: {
          colors: [palette.background],
        },
        legend: {
          position: "bottom",
          labels: { colors: themeOptions.legendColor },
        },
        colors: [palette.primary, palette.primaryStrong, accentColor, successColor],
        plotOptions: {
          pie: {
            donut: {
              size: "60%",
            },
          },
        },
        tooltip: themeOptions.tooltip,
        dataLabels: { enabled: false },
      };

      donorsSegmentsChart = registerOverviewChart(new ApexCharts(segmentsEl, segmentsOptions));
      donorsSegmentsChart.render();
    }

    if (acquisitionEl) {
      const acquisitionChannels = ["Website", "Events", "Social media", "Corporate partners"];
      const acquisitionData = [7800, 3400, 2600, 1500];

      const acquisitionOptions = {
        theme: themeOptions.theme,
        chart: {
          ...themeOptions.chart,
          type: "bar",
          height: 300,
          toolbar: { show: false },
        },
        plotOptions: {
          bar: {
            borderRadius: 10,
            columnWidth: "56%",
          },
        },
        series: [
          {
            name: "Donors",
            data: acquisitionData,
          },
        ],
        colors: [palette.primary, palette.primaryStrong, accentColor, warningColor],
        grid: {
          borderColor: themeOptions.borderColor,
          strokeDashArray: 4,
        },
        xaxis: {
          categories: acquisitionChannels,
          axisBorder: { color: themeOptions.borderColor },
          axisTicks: { color: themeOptions.borderColor },
          labels: { style: { colors: acquisitionChannels.map(() => themeOptions.labelColor) } },
        },
        yaxis: {
          labels: {
            style: { colors: [themeOptions.labelColor] },
          },
        },
        legend: { show: false },
        tooltip: themeOptions.tooltip,
        dataLabels: { enabled: false },
      };

      donorsAcquisitionChart = registerOverviewChart(new ApexCharts(acquisitionEl, acquisitionOptions));
      donorsAcquisitionChart.render();
    }

    updateChartsForTheme(getTheme());
    initDonationsMap();
  };

  /**
   * Initialize the Leaflet donations map with static region data, draw markers, and wire list focus/hover.
   * Requires `#donations-map`, `.regions-list` rows with `data-region-id`, and the sample REGIONS_SAMPLE data
   * until the backend can hydrate real regions.
   */
  const initDonationsMap = () => {
    const mapContainer = document.querySelector("#donations-map");
    const regionsList = document.querySelector(".regions-list");
    const insightText = document.querySelector(".insight-bar__text");
    if (!mapContainer || !regionsList || donationsMapInitialized) return;
    if (typeof L === "undefined") {
      window.addEventListener("load", initDonationsMap, { once: true });
      return;
    }

    const sortedRegions = [...REGIONS_SAMPLE].sort((a, b) => b.totalDonations - a.totalDonations);
    const levelRadius = { high: 14, medium: 11, low: 9 };
    const bounds = [];
    const markers = new Map();
    const rows = new Map();
    let activeRegionId = "";
    let hoverRegionId = "";

    const getLevelStyles = () => {
      const primary = getCssVar("--color-primary") || "#15c5ce";
      const primaryStrong = getCssVar("--color-primary-strong") || "#0f9aa2";
      const muted = getCssVar("--color-muted") || "#6b7280";
      return {
        high: {
          fill: withAlpha(primary, 0.3),
          stroke: withAlpha(primaryStrong, 0.92),
        },
        medium: {
          fill: withAlpha(primaryStrong, 0.25),
          stroke: withAlpha(primaryStrong, 0.65),
        },
        low: {
          fill: withAlpha(muted, 0.18),
          stroke: withAlpha(muted, 0.55),
        },
      };
    };

    const baseFillOpacity = (level) => {
      if (level === "high") return 0.78;
      if (level === "medium") return 0.64;
      return 0.52;
    };

    const map = L.map(mapContainer, { worldCopyJump: true, zoomControl: false, attributionControl: false });
    map.setView([12, 10], 2.5);

    const lightTiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    });
    const darkTiles = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; CartoDB & OpenStreetMap contributors",
    });

    window.donationsMapLayers = { light: lightTiles, dark: darkTiles };
    window.donationsMap = map;
    const initialTheme = getTheme();
    if (initialTheme === "dark") {
      darkTiles.addTo(map);
    } else {
      lightTiles.addTo(map);
    }

    L.control.zoom({ position: "bottomright" }).addTo(map);

    const updateMarkerStyles = (activeId, hoverId = "") => {
      const palette = getLevelStyles();
      markers.forEach(({ marker, baseRadius, region }) => {
        const colors = palette[region.level] || palette.low;
        const isActive = region.id === activeId;
        const isHover = hoverId && region.id === hoverId && !isActive;
        const radius = baseRadius + (isActive ? 3 : isHover ? 1.5 : 0);
        const baseOpacity = baseFillOpacity(region.level);
        const highlightBoost = isActive ? 0.17 : isHover ? 0.1 : 0;
        const fillOpacity = Math.min(1, baseOpacity + highlightBoost);
        marker.setStyle({
          color: colors.stroke,
          fillColor: colors.fill,
          radius,
          weight: isActive ? 3 : isHover ? 2.5 : 2,
          fillOpacity,
        });
        if (isActive) {
          marker.bringToFront();
        }
      });
    };

    const setActiveRow = (regionId) => {
      rows.forEach((row, id) => {
        row.classList.toggle("is-active", id === regionId);
      });
    };

    const setHoverRegion = (regionId) => {
      hoverRegionId = regionId || "";
      updateMarkerStyles(activeRegionId, hoverRegionId);
    };

    const setActiveRegion = (regionId, options = {}) => {
      if (!regionId || !markers.has(regionId)) return;
      activeRegionId = regionId;
      overviewMapState.currentActive = regionId;
      hoverRegionId = "";
      setActiveRow(regionId);
      updateMarkerStyles(regionId);
      const markerEntry = markers.get(regionId);
      if (options.pan && markerEntry) {
        const targetZoom = Math.max(map.getZoom(), 3);
        map.flyTo(markerEntry.marker.getLatLng(), targetZoom, { duration: 0.6 });
      }
      if (options.openPopup && markerEntry) {
        markerEntry.marker.openPopup();
      }
      if (options.focusRow) {
        const row = rows.get(regionId);
        row?.focus();
      }
    };

    const createMarker = (region) => {
      const palette = getLevelStyles();
      const colors = palette[region.level] || palette.low;
      const radius = levelRadius[region.level] || 10;
      const marker = L.circleMarker([region.lat, region.lng], {
        radius,
        color: colors.stroke,
        weight: 2,
        fillColor: colors.fill,
        fillOpacity: baseFillOpacity(region.level),
      });

      marker.bindPopup(
        `<strong>${region.name}</strong> (${region.country})<br>${formatCurrencyDisplay(
          region.totalDonations
        )} total &bull; ${region.donors.toLocaleString()} donors &bull; ${region.campaigns} campaigns`
      );

      marker.on("click", () => setActiveRegion(region.id, { pan: true, openPopup: true, focusRow: true }));
      marker.on("mouseover", () => setHoverRegion(region.id));
      marker.on("mouseout", () => setHoverRegion(activeRegionId));
      marker.addTo(map);

      markers.set(region.id, { marker, baseRadius: radius, region });
      bounds.push([region.lat, region.lng]);
    };

    const wireRegionsList = () => {
      const regionRows = Array.from(regionsList.querySelectorAll(".region-row"));
      regionRows.forEach((row) => {
        const id = row.dataset.regionId;
        if (!id) return;
        rows.set(id, row);
        row.addEventListener("click", () => setActiveRegion(id, { pan: true, openPopup: true }));
        row.addEventListener("mouseenter", () => {
          setHoverRegion(id);
          row.classList.add("is-highlighted");
        });
        row.addEventListener("mouseleave", () => {
          setHoverRegion(activeRegionId);
          row.classList.remove("is-highlighted");
        });
        row.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
            event.preventDefault();
            setActiveRegion(id, { pan: true, openPopup: true });
          }
        });
      });
    };

    const updateInsightBar = () => {
      if (!insightText || sortedRegions.length < 2) return;
      const totalDonationsEl = document.querySelector('.stat-card[aria-label="Total Donations"] .stat-card__value');
      const topTwo = sortedRegions.slice(0, 2);
      const totalFromStats = parseCurrencyNumber(totalDonationsEl?.textContent || "");
      const fallbackTotal = REGIONS_SAMPLE.reduce((sum, region) => sum + region.totalDonations, 0);
      const denominator = totalFromStats || fallbackTotal;
      const contribution = topTwo.reduce((sum, region) => sum + region.totalDonations, 0);
      const percent = denominator ? Math.round((contribution / denominator) * 100) : 0;
      insightText.innerHTML = `Top regions this month: <strong>${topTwo[0].name}</strong> and <strong>${topTwo[1].name}</strong> &mdash; contributing ${Math.min(
        100,
        percent
      )}% of tracked donations.`;
    };

    sortedRegions.forEach(createMarker);
    wireRegionsList();

    overviewMapState.map = map;
    overviewMapState.markers = markers;
    overviewMapState.rows = rows;
    overviewMapState.setActiveRegion = setActiveRegion;
    overviewMapState.setHoverRegion = setHoverRegion;
    refreshRegionsMapTheme = () => updateMarkerStyles(activeRegionId, hoverRegionId);
    donationsMapInitialized = true;

    if (bounds.length) {
      map.fitBounds(bounds, { padding: [40, 30] });
      setTimeout(() => map.invalidateSize(), 120);
      requestAnimationFrame(() => map.invalidateSize());
    }

    const defaultRegion = sortedRegions.find((region) => rows.has(region.id)) || sortedRegions[0];
    if (defaultRegion) {
      setActiveRegion(defaultRegion.id, { pan: false });
    }

    updateInsightBar();
    initOverviewRegionsLinking();
    updateMapForTheme(getTheme());
  };

  // Remove unread state and badge for notifications
  const markNotificationsAsRead = () => {
    const notificationPanel = document.querySelector('[data-dropdown-panel="notifications"]');
    const notificationsToggle = document.querySelector(".js-notifications-toggle");
    if (!notificationPanel) return;
    const unreadItems = notificationPanel.querySelectorAll(".dropdown-notification.is-unread");
    unreadItems.forEach((item) => item.classList.remove("is-unread"));
    const badge = notificationsToggle?.querySelector(".badge-dot");
    if (badge) {
      badge.classList.add("is-hidden");
    }
  };

  /**
   * Improve keyboard navigation helpers, like focusing `#main-content` after skip links.
   * Only manipulates the DOM, no backend calls.
   */
  const initAccessibilityHelpers = () => {
    const mainContent = document.querySelector("#main-content");
    const skipLink = document.querySelector(".skip-link");
    if (mainContent && !mainContent.hasAttribute("tabindex")) {
      mainContent.setAttribute("tabindex", "-1");
    }

    skipLink?.addEventListener("click", () => {
      mainContent?.focus();
    });
  };

  /**
   * Wire the off-canvas campaigns filter drawer and badge counts to reflect active controls.
   * Expects `.offcanvas-filters`, `.js-open-filters`, and `.js-filter-count`.
   */
  const initCampaignFilters = () => {
    // Cache the drawer, trigger, and control buttons for the campaign filters panel.
    const offcanvas = document.querySelector(".offcanvas-filters");
    const trigger = document.querySelector(".js-open-filters");
    if (!offcanvas || !trigger) return;

    const backdrop = offcanvas.querySelector(".offcanvas-backdrop");
    const closeButtons = offcanvas.querySelectorAll(".js-offcanvas-close");
    const resetButton = offcanvas.querySelector(".js-offcanvas-reset");
    const applyButton = offcanvas.querySelector(".js-offcanvas-apply");
    const badge = trigger.querySelector(".js-filter-count");
    const fields = Array.from(offcanvas.querySelectorAll("input, select"));

    const lockScroll = () => document.body.classList.add("is-locked");
    const unlockScroll = () => {
      const app = document.querySelector(".app");
      if (!app || !app.classList.contains("sidebar-open")) {
        document.body.classList.remove("is-locked");
      }
    };

    const countActiveFilters = () =>
      fields.reduce((count, field) => {
        if ((field.type === "checkbox" || field.type === "radio") && field.checked) return count + 1;
        if (field.value && field.value.trim() !== "") return count + 1;
        return count;
      }, 0);

    const updateBadge = () => {
      const total = countActiveFilters();
      if (badge) {
        badge.textContent = total;
        badge.classList.toggle("is-hidden", total === 0);
      }
      trigger.setAttribute("data-has-filters", total > 0 ? "true" : "false");
    };

    const close = () => {
      offcanvas.classList.remove("is-open");
      offcanvas.setAttribute("aria-hidden", "true");
      trigger.setAttribute("aria-expanded", "false");
      unlockScroll();
    };

    const open = () => {
      offcanvas.classList.add("is-open");
      offcanvas.setAttribute("aria-hidden", "false");
      trigger.setAttribute("aria-expanded", "true");
      lockScroll();
    };

    const toggle = () => {
      if (offcanvas.classList.contains("is-open")) {
        close();
      } else {
        open();
      }
    };

    // Attach interactions so the drawer responds to clicks, overlay taps, and escape keys.
    // Hook up the triggers and close controls for the donations filters drawer.
    trigger.addEventListener("click", toggle);
    backdrop?.addEventListener("click", close);
    closeButtons.forEach((btn) => btn.addEventListener("click", close));

    // Allow Escape key to close the filters drawer for accessibility.
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && offcanvas.classList.contains("is-open")) {
        close();
      }
    });

    // Update the filter badge whenever any input changes.
    // Update the filter badge whenever a field changes.
    fields.forEach((field) => field.addEventListener("change", updateBadge));

    // Reset all filter controls when the reset button is triggered.
    resetButton?.addEventListener("click", () => {
      fields.forEach((field) => {
        if (field.type === "checkbox" || field.type === "radio") {
          field.checked = false;
        } else {
          field.value = "";
        }
      });
      updateBadge();
    });

    // Apply the selected filters and close the drawer when hitting Apply.
    applyButton?.addEventListener("click", () => {
      updateBadge();
      close();
    });

    updateBadge();
  };

  /**
   * Synchronize the campaigns view toggle between cards and table layouts, persisting the chosen mode in localStorage.
   * Expects `.view-toggle`, buttons with `data-view-mode`, and `.campaigns-view` containers.
   */
  const initCampaignViewToggle = () => {
    const viewToggle = document.querySelector(".view-toggle");
    const viewButtons = viewToggle ? Array.from(viewToggle.querySelectorAll(".view-toggle__btn")) : [];
    const views = Array.from(document.querySelectorAll(".campaigns-view"));
    if (!viewToggle || viewButtons.length === 0 || views.length === 0) return;

    const validModes = viewButtons.map((btn) => btn.dataset.viewMode).filter(Boolean);
    const stored = localStorage.getItem(CAMPAIGN_VIEW_STORAGE_KEY);
    const fallbackMode = validModes.includes("cards") ? "cards" : validModes[0];
    const initialMode = stored && validModes.includes(stored) ? stored : fallbackMode;

    const setActiveView = (mode) => {
      viewButtons.forEach((btn) => {
        const isActive = btn.dataset.viewMode === mode;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      views.forEach((view) => {
        const isActive = view.dataset.view === mode;
        view.classList.toggle("is-active", isActive);
        view.setAttribute("aria-hidden", isActive ? "false" : "true");
      });

      localStorage.setItem(CAMPAIGN_VIEW_STORAGE_KEY, mode);
    };

    setActiveView(initialMode);

    viewButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.viewMode;
        if (mode) {
          setActiveView(mode);
        }
      });
    });
  };

  /**
   * Donation type selector (donations page) — toggles which table columns are visible
   * Expects `[data-role="donationTypeSelector"]` with `.donation-type-selector__option` buttons
   * and a `.donations-table` with headers matching: Donor, Campaign, Amount, Method, Status, Date
   */
  const initDonationTypeSelector = () => {
    const container = document.querySelector('[data-role="donationTypeSelector"]');
    if (!container) return;
    const options = Array.from(container.querySelectorAll('.donation-type-selector__option'));
    const table = document.querySelector('.donations-table');
    const thead = table?.querySelector('thead');
    const tbody = table?.querySelector('tbody');
    if (!table || !thead || !tbody || !options.length) return;

    const headers = Array.from(thead.querySelectorAll('th')).map((h) => h.textContent.trim().toLowerCase());

    const headerKey = (text) => {
      if (text.includes('donor')) return 'donor';
      if (text.includes('campaign')) return 'campaign';
      if (text.includes('amount')) return 'amount';
      if (text.includes('method')) return 'method';
      if (text.includes('status')) return 'status';
      if (text.includes('date')) return 'date';
      if (text.includes('action')) return 'actions';
      return text.replace(/\s+/g, '_');
    };

    const typeColumnMap = {
      general: ['donor', 'campaign', 'amount', 'method', 'status', 'date'],
      zakat: ['donor', 'amount', 'status', 'date'],
      qurbani: ['donor', 'campaign', 'amount', 'date'],
      gift: ['donor', 'campaign', 'amount', 'method', 'date'],
      campaigns: ['campaign', 'amount', 'status', 'date'],
    };

    // How cards should adapt per type (show/hide campaign and meta block)
    const cardFieldMap = {
      general: { campaign: true, meta: true, amount: true },
      zakat: { campaign: false, meta: false, amount: true },
      qurbani: { campaign: true, meta: false, amount: true },
      gift: { campaign: true, meta: true, amount: true },
      campaigns: { campaign: true, meta: true, amount: true },
    };

    const applyColumns = (type) => {
      const allowed = typeColumnMap[type] || typeColumnMap['general'];

      // Toggle headers
      Array.from(thead.querySelectorAll('th')).forEach((th, idx) => {
        const key = headerKey(headers[idx]);
        const show = allowed.includes(key);
        th.style.display = show ? '' : 'none';
        th.setAttribute('aria-hidden', show ? 'false' : 'true');
      });

      // Toggle each row cell by index
      Array.from(tbody.querySelectorAll('tr')).forEach((row) => {
        Array.from(row.children).forEach((cell, idx) => {
          const key = headerKey(headers[idx]);
          const show = allowed.includes(key);
          cell.style.display = show ? '' : 'none';
          cell.setAttribute('aria-hidden', show ? 'false' : 'true');
        });
      });

      // Also adapt card view elements for this type
      Array.from(document.querySelectorAll('.donation-card')).forEach((card) => {
        const campaignEl = card.querySelector('.donation-card__campaign');
        const metaEl = card.querySelector('.donation-card__meta');
        const amountEl = card.querySelector('.donation-card__amount');
        const cfg = cardFieldMap[type] || cardFieldMap['general'];
        if (campaignEl) campaignEl.style.display = cfg.campaign ? '' : 'none';
        if (metaEl) metaEl.style.display = cfg.meta ? '' : 'none';
        if (amountEl) amountEl.style.display = cfg.amount ? '' : 'none';
      });
    };

    options.forEach((opt) => {
      opt.addEventListener('click', () => {
        options.forEach((o) => {
          o.setAttribute('aria-checked', 'false');
          o.setAttribute('tabindex', '-1');
          o.classList.remove('is-active');
        });
        opt.setAttribute('aria-checked', 'true');
        opt.setAttribute('tabindex', '0');
        opt.classList.add('is-active');
        const type = (opt.dataset.donationType || 'general').toLowerCase();
        try {
          localStorage.setItem(DONATION_TYPE_STORAGE_KEY, type);
        } catch (e) { }
        applyColumns(type);
      });
    });

    // keyboard navigation inside the radiogroup
    container.addEventListener('keydown', (e) => {
      const focused = document.activeElement;
      if (!focused || !focused.classList.contains('donation-type-selector__option')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = focused.nextElementSibling || options[0];
        next.focus();
        next.click();
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = focused.previousElementSibling || options[options.length - 1];
        prev.focus();
        prev.click();
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        focused.click();
      }
    });

    // initialize from stored selection, existing checked option, or first option
    const storedType = (localStorage.getItem(DONATION_TYPE_STORAGE_KEY) || '').toLowerCase();
    let active = null;
    if (storedType) active = options.find((o) => (o.dataset.donationType || '').toLowerCase() === storedType);
    if (!active) active = options.find((o) => o.getAttribute('aria-checked') === 'true') || options[0];
    if (active) {
      options.forEach((o) => o.classList.remove('is-active'));
      active.classList.add('is-active');
      active.setAttribute('aria-checked', 'true');
      active.setAttribute('tabindex', '0');
      const type = (active.dataset.donationType || 'general').toLowerCase();
      applyColumns(type);
    }
  };

  /**
   * Attach local dropdown menus for campaign cards/rows so publish/archive/clone actions feel interactive.
   * Relies on `.js-actions-toggle`, `.dropdown-menu--actions`, and `.dropdown-actions` wrappers.
   */
  const initCampaignActions = () => {
    const actionToggles = Array.from(document.querySelectorAll(".js-actions-toggle"));
    const actionMenus = Array.from(document.querySelectorAll(".dropdown-menu--actions"));
    if (!actionToggles.length || !actionMenus.length) return;

    const closeMenus = () => {
      actionMenus.forEach((menu) => menu.classList.remove("is-open"));
      actionToggles.forEach((toggle) => toggle.setAttribute("aria-expanded", "false"));
    };

    const getMenu = (toggle) => toggle.closest(".dropdown")?.querySelector(".dropdown-menu--actions");

    const toggleMenu = (toggle) => {
      const menu = getMenu(toggle);
      if (!menu) return;
      const isOpen = menu.classList.contains("is-open");
      closeMenus();
      if (!isOpen) {
        menu.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
      }
    };

    actionToggles.forEach((toggle) => {
      toggle.setAttribute("aria-expanded", "false");
      // Toggle the campaign action menu when clicking the kebab button.
      toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleMenu(toggle);
      });
      // Support keyboard activation (Enter/Space) for each campaign action toggle.
      toggle.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
          event.preventDefault();
          toggleMenu(toggle);
        }
      });
    });

    actionMenus.forEach((menu) => {
      menu.addEventListener("click", (event) => event.stopPropagation());
      menu.querySelectorAll(".dropdown-item").forEach((item) => {
        item.addEventListener("click", closeMenus);
      });
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".dropdown-actions")) {
        closeMenus();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenus();
      }
    });
  };

  /**
   * Populate and animate the campaign preview side sheet when users open it via `.js-campaign-preview` triggers.
   * Expects `.preview-sheet[data-preview="campaign"]` with status/title/description placeholders that reflect dataset attributes.
   */
  const initCampaignPreview = () => {
    const previewSheet = document.querySelector('.preview-sheet[data-preview="campaign"]');
    if (!previewSheet) return;

    const closeButtons = previewSheet.querySelectorAll(".js-preview-close");
    const backdrop = previewSheet.querySelector(".preview-sheet__backdrop");
    const titleEl = previewSheet.querySelector(".js-preview-title");
    const subtitleEl = previewSheet.querySelector(".js-preview-subtitle");
    const statusEl = previewSheet.querySelector(".js-preview-status");
    const typeEl = previewSheet.querySelector(".js-preview-type");
    const descEl = previewSheet.querySelector(".js-preview-description");
    const targetEl = previewSheet.querySelector(".js-preview-target");
    const raisedEl = previewSheet.querySelector(".js-preview-raised");
    const countryEl = previewSheet.querySelector(".js-preview-country");
    const datesEl = previewSheet.querySelector(".js-preview-dates");
    const previewButtons = Array.from(document.querySelectorAll(".js-campaign-preview"));
    const body = document.body;

    if (!previewButtons.length) return;

    const statusClass = (status) => {
      const normalized = (status || "").toLowerCase();
      if (normalized.includes("active")) return "status-pill--active";
      if (normalized.includes("draft")) return "status-pill--draft";
      if (normalized.includes("complete")) return "status-pill--completed";
      if (normalized.includes("archiv")) return "status-pill--archived";
      return "";
    };

    const lockScroll = () => body.classList.add("is-locked");
    const unlockScroll = () => {
      const app = document.querySelector(".app");
      if (!app || !app.classList.contains("sidebar-open")) {
        body.classList.remove("is-locked");
      }
    };

    const setStatusPill = (statusText) => {
      if (!statusEl) return;
      statusEl.textContent = statusText || "Status";
      statusEl.className = `status-pill ${statusClass(statusText)}`.trim();
    };

    const openSheet = () => {
      previewSheet.classList.add("is-open");
      previewSheet.setAttribute("aria-hidden", "false");
      const closeTarget = previewSheet.querySelector(".js-preview-close");
      closeTarget?.focus();
      lockScroll();
    };

    const closeSheet = () => {
      previewSheet.classList.remove("is-open");
      previewSheet.setAttribute("aria-hidden", "true");
      unlockScroll();
    };

    const fillPreview = (dataset) => {
      const {
        campaignTitle,
        campaignStatus,
        campaignType,
        campaignDescription,
        campaignTarget,
        campaignRaised,
        campaignCountry,
        campaignDates,
      } = dataset;

      if (titleEl) titleEl.textContent = campaignTitle || "Campaign";
      if (subtitleEl) {
        subtitleEl.textContent = campaignStatus && campaignType
          ? `${campaignStatus} | ${campaignType}`
          : campaignStatus || campaignType || "";
      }
      setStatusPill(campaignStatus);
      if (typeEl) typeEl.textContent = campaignType || "";
      if (descEl) descEl.textContent = campaignDescription || "";
      if (targetEl) targetEl.textContent = campaignTarget || "";
      if (raisedEl) raisedEl.textContent = campaignRaised || "";
      if (countryEl) countryEl.textContent = campaignCountry || "";
      if (datesEl) datesEl.textContent = campaignDates || "";
    };

    previewButtons.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        const campaignEl = event.currentTarget.closest(".campaign-card, .campaign-row");
        if (!campaignEl) return;
        fillPreview(campaignEl.dataset);
        openSheet();
      });
    });

    closeButtons.forEach((btn) => btn.addEventListener("click", closeSheet));
    backdrop?.addEventListener("click", closeSheet);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && previewSheet.classList.contains("is-open")) {
        closeSheet();
      }
    });
  };
  const toastContainer = document.querySelector(".cs-toast-container");
  const showCampaignToast = (message, variant = "success") => {
    if (!toastContainer || !message) return;
    const toast = document.createElement("div");
    toast.className = `cs-toast cs-toast--${variant}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("is-visible"));
    const hideToast = () => {
      toast.classList.remove("is-visible");
      toast.addEventListener(
        "transitionend",
        () => {
          toast.remove();
        },
        { once: true }
      );
    };
    setTimeout(hideToast, 3200);
  };

  const cardStatusClassMap = {
    active: "status-active",
    draft: "status-draft",
    completed: "status-completed",
    archived: "status-archived",
  };

  const rowStatusClassMap = {
    active: "status-pill--active",
    draft: "status-pill--draft",
    completed: "status-pill--completed",
    archived: "status-pill--archived",
  };

  const updateStatusPillForCard = (card, statusText) => {
    const statusEl = card.querySelector(".campaign-card__status");
    if (!statusEl) return;
    const normalized = (statusText || "").toLowerCase();
    const className = cardStatusClassMap[normalized] || "status-active";
    statusEl.textContent = statusText || "Status";
    statusEl.className = `campaign-card__status ${className}`.trim();
  };

  const updateStatusPillForRow = (row, statusText) => {
    const statusEl = row.querySelector(".status-pill");
    if (!statusEl) return;
    const normalized = (statusText || "").toLowerCase();
    const className = rowStatusClassMap[normalized] || "status-pill--active";
    statusEl.textContent = statusText || "Status";
    statusEl.className = `status-pill ${className}`.trim();
  };

  const applyExpiryBadge = (badge, dataset) => {
    if (!badge) return;
    const status = (dataset?.campaignStatus || "").toLowerCase();
    if (status !== "active") {
      badge.classList.add("is-hidden");
      badge.classList.remove("badge--warning", "badge--danger");
      return;
    }
    const endsIn = Number(dataset?.endsInDays) || 0;
    let label = "";
    let severity = "";
    if (endsIn <= 0) {
      label = "Ends today";
      severity = "danger";
    } else if (endsIn <= 2) {
      label = "Urgent";
      severity = "danger";
    } else if (endsIn <= 7) {
      label = "Ending soon";
      severity = "warning";
    }
    if (!label) {
      badge.classList.add("is-hidden");
      badge.classList.remove("badge--warning", "badge--danger");
      return;
    }
    badge.textContent = label;
    badge.classList.remove("is-hidden");
    badge.classList.toggle("badge--warning", severity === "warning");
    badge.classList.toggle("badge--danger", severity === "danger");
  };

  const syncCampaignCard = (card) => {
    if (!card) return;
    const dataset = card.dataset;
    const hasGoal = dataset.hasGoal !== "false";
    const progressBar = card.querySelector(".campaign-progress__bar");
    if (progressBar) {
      const width = Math.min(Number(dataset.progress) || 0, 100);
      progressBar.style.width = `${width}%`;
    }
    const progressLine = card.querySelector(".campaign-card__progress-line");
    const progressMeta = card.querySelector(".campaign-card__progress-meta");
    const progressEmpty = card.querySelector(".campaign-card__progress-empty");
    progressLine?.classList.toggle("is-hidden", !hasGoal);
    progressMeta?.classList.toggle("is-hidden", !hasGoal);
    progressEmpty?.classList.toggle("is-hidden", hasGoal);
    const ecardBadge = card.querySelector(".js-campaign-ecard");
    if (ecardBadge) {
      ecardBadge.classList.toggle("is-hidden", dataset.ecard !== "true");
    }
    applyExpiryBadge(card.querySelector(".js-campaign-expiry"), dataset);
    updateStatusPillForCard(card, dataset.campaignStatus);
    const statusNormalized = (dataset.campaignStatus || "").toLowerCase();
    const closeButton = card.querySelector(".js-close-campaign");
    if (closeButton) {
      closeButton.classList.toggle("is-hidden", statusNormalized !== "active");
    }
  };

  const syncCampaignRow = (row) => {
    if (!row) return;
    const dataset = row.dataset;
    const hasGoal = dataset.hasGoal !== "false";
    const progressBar = row.querySelector(".progress-bar");
    if (progressBar) {
      const width = Math.min(Number(dataset.progress) || 0, 100);
      progressBar.style.width = `${width}%`;
    }
    const progressGroup = row.querySelector(".progress");
    const progressLabel = row.querySelector(".js-table-progress-label");
    progressGroup?.classList.toggle("is-hidden", !hasGoal);
    progressLabel?.classList.toggle("is-hidden", hasGoal);
    const targetCell = row.querySelector('[data-amount-field="target"]');
    if (targetCell) {
      targetCell.textContent = hasGoal ? dataset.campaignTarget : "—";
    }
    const ecardBadge = row.querySelector(".js-table-ecard");
    if (ecardBadge) {
      ecardBadge.classList.toggle("is-hidden", dataset.ecard !== "true");
    }
    applyExpiryBadge(row.querySelector(".js-table-expiry"), dataset);
    updateStatusPillForRow(row, dataset.campaignStatus);
    const statusNormalized = (dataset.campaignStatus || "").toLowerCase();
    const closeButton = row.querySelector(".js-close-campaign");
    if (closeButton) {
      closeButton.classList.toggle("is-hidden", statusNormalized !== "active");
    }
  };

  const refreshCampaignUI = () => {
    document.querySelectorAll(".campaign-card").forEach(syncCampaignCard);
    document.querySelectorAll(".campaign-row").forEach(syncCampaignRow);
  };

  let campaignFilterStatus = "all";
  const campaignSearchInput = document.querySelector("#campaign-search");
  const campaignsEmptyState = document.querySelector(".campaigns-empty");

  const applyCampaignFilters = () => {
    const searchTerm = (campaignSearchInput?.value || "").trim().toLowerCase();
    const matchesFilters = (dataset) => {
      const status = (dataset.campaignStatus || "").toLowerCase();
      const matchesStatus = campaignFilterStatus === "all" || status === campaignFilterStatus;
      const haystack = `${dataset.campaignTitle || ""} ${dataset.campaignDescription || ""}`.toLowerCase();
      const matchesSearch = !searchTerm || haystack.includes(searchTerm);
      return matchesStatus && matchesSearch;
    };
    const cards = Array.from(document.querySelectorAll(".campaign-card"));
    const rows = Array.from(document.querySelectorAll(".campaign-row"));
    let visibleCount = 0;
    cards.forEach((card) => {
      const show = matchesFilters(card.dataset);
      card.classList.toggle("is-hidden", !show);
      if (show) visibleCount += 1;
    });
    rows.forEach((row) => {
      const show = matchesFilters(row.dataset);
      row.classList.toggle("is-hidden", !show);
    });
    if (campaignsEmptyState) {
      campaignsEmptyState.classList.toggle("is-hidden", visibleCount > 0);
    }
  };

  const initCampaignStatusTabs = () => {
    const tabs = Array.from(document.querySelectorAll(".tabs__item"));
    if (!tabs.length) return;
    const setActiveTab = (tab) => {
      const status = (tab.dataset.status || "all").toLowerCase();
      campaignFilterStatus = status;
      tabs.forEach((candidate) => {
        const isActive = candidate === tab;
        candidate.classList.toggle("tabs__item--active", isActive);
        candidate.setAttribute("aria-selected", isActive ? "true" : "false");
      });
      applyCampaignFilters();
    };
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => setActiveTab(tab));
    });
    const initialTab = tabs.find((tab) => tab.classList.contains("tabs__item--active")) || tabs[0];
    if (initialTab) {
      setActiveTab(initialTab);
    }
    campaignSearchInput?.addEventListener("input", () => applyCampaignFilters());
  };

  const closeCampaignModal = document.querySelector('[data-modal="close-campaign"]');
  let pendingCloseCampaignId = null;

  const closeCampaignsById = (campaignId) => {
    if (!campaignId) return;
    const elements = Array.from(document.querySelectorAll(`[data-campaign-id="${campaignId}"]`));
    if (!elements.length) return;
    elements.forEach((el) => {
      el.dataset.campaignStatus = "Completed";
    });
    refreshCampaignUI();
    applyCampaignFilters();
  };

  const openCloseCampaignModal = (campaignId) => {
    if (!closeCampaignModal || !campaignId) return;
    pendingCloseCampaignId = campaignId;
    closeCampaignModal.classList.add("is-open");
    closeCampaignModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("has-active-modal");
  };

  const closeCloseCampaignModal = () => {
    if (!closeCampaignModal) return;
    closeCampaignModal.classList.remove("is-open");
    closeCampaignModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("has-active-modal");
    pendingCloseCampaignId = null;
  };

  const initCampaignCloseModal = () => {
    if (!closeCampaignModal) return;
    closeCampaignModal.querySelectorAll("[data-modal-close]").forEach((btn) => {
      btn.addEventListener("click", closeCloseCampaignModal);
    });
    const confirmButton = closeCampaignModal.querySelector("[data-modal-confirm]");
    confirmButton?.addEventListener("click", () => {
      if (pendingCloseCampaignId) {
        closeCampaignsById(pendingCloseCampaignId);
        showCampaignToast("Campaign closed (demo)");
      }
      closeCloseCampaignModal();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && closeCampaignModal.classList.contains("is-open")) {
        event.preventDefault();
        closeCloseCampaignModal();
      }
    });
    document.querySelectorAll(".js-close-campaign").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const campaignElement = event.currentTarget.closest(".campaign-card, .campaign-row");
        if (campaignElement) {
          openCloseCampaignModal(campaignElement.dataset.campaignId);
        }
      });
    });
  };

  /**
   * Keep the donations view toggle in sync between cards and table layouts, scoped by [data-view-context='donations'].
   * Persists the selection via DONATIONS_VIEW_STORAGE_KEY.
   */
  const initDonationsViewToggle = () => {
    const viewToggle = document.querySelector(".view-toggle[data-view-context='donations']");
    const viewButtons = viewToggle ? Array.from(viewToggle.querySelectorAll(".view-toggle__btn")) : [];
    const views = Array.from(document.querySelectorAll(".donations-view"));
    if (!viewToggle || !viewButtons.length || !views.length) return;

    const validModes = viewButtons.map((btn) => btn.dataset.viewMode).filter(Boolean);
    const stored = localStorage.getItem(DONATIONS_VIEW_STORAGE_KEY);
    const fallback = validModes.includes("table") ? "table" : validModes[0];
    const initialMode = stored && validModes.includes(stored) ? stored : fallback;

    const setActiveView = (mode) => {
      viewButtons.forEach((btn) => {
        const isActive = btn.dataset.viewMode === mode;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      views.forEach((view) => {
        const isActive = view.dataset.view === mode;
        view.classList.toggle("is-active", isActive);
        view.setAttribute("aria-hidden", isActive ? "false" : "true");
      });

      localStorage.setItem(DONATIONS_VIEW_STORAGE_KEY, mode);
    };

    setActiveView(initialMode);

    viewButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.viewMode;
        if (mode) {
          setActiveView(mode);
        }
      });
    });
  };

  /**
   * Populate the donation preview slide-over when a `.js-donation-preview` trigger is clicked.
   * Mirrors data-* attributes from `.donation-card` or `.donation-row` without calling backend.
   */
  const initDonationsPreview = () => {
    const previewSheet = document.querySelector('.preview-sheet[data-preview="donation"]');
    if (!previewSheet) return;

    const closeButtons = previewSheet.querySelectorAll(".js-preview-close");
    const backdrop = previewSheet.querySelector(".preview-sheet__backdrop");
    const donorNameEls = Array.from(previewSheet.querySelectorAll(".js-preview-donor"));
    const campaignEls = Array.from(previewSheet.querySelectorAll(".js-preview-campaign"));
    const statusEl = previewSheet.querySelector(".js-preview-status");
    const amountEl = previewSheet.querySelector(".js-preview-amount");
    const methodEl = previewSheet.querySelector(".js-preview-method");
    const dateEl = previewSheet.querySelector(".js-preview-date");
    const avatarEl = previewSheet.querySelector(".preview-donation__avatar");
    const emailEl = previewSheet.querySelector(".js-preview-email");
    const locationEl = previewSheet.querySelector(".js-preview-location");
    const notesSection = previewSheet.querySelector("[data-preview-notes]");
    const notesEl = previewSheet.querySelector(".js-preview-notes");
    const previewButtons = Array.from(document.querySelectorAll(".js-donation-preview"));
    const body = document.body;

    if (!previewButtons.length) return;

    const statusClass = (status) => {
      const normalized = (status || "").toLowerCase();
      if (normalized.includes("completed")) return "status-pill--success";
      if (normalized.includes("pending")) return "status-pill--pending";
      if (normalized.includes("refunded")) return "status-pill--refunded";
      if (normalized.includes("failed")) return "status-pill--failed";
      return "";
    };

    const getInitials = (value = "") =>
      (value
        .split(" ")
        .map((segment) => segment.charAt(0))
        .filter(Boolean)
        .slice(0, 2)
        .join("") || "")
        .toUpperCase();

    const lockScroll = () => body.classList.add("is-locked");
    const unlockScroll = () => {
      const app = document.querySelector(".app");
      if (!app || !app.classList.contains("sidebar-open")) {
        body.classList.remove("is-locked");
      }
    };

    const openSheet = () => {
      previewSheet.classList.add("is-open");
      previewSheet.setAttribute("aria-hidden", "false");
      lockScroll();
    };

    const closeSheet = () => {
      previewSheet.classList.remove("is-open");
      previewSheet.setAttribute("aria-hidden", "true");
      unlockScroll();
    };

    const fillPreview = (dataset) => {
      const donorName = dataset?.donorName || "Donor";
      const donorInitials = dataset?.donorInitials || getInitials(donorName);
      donorNameEls.forEach((el) => {
        el.textContent = donorName;
      });
      campaignEls.forEach((el) => {
        el.textContent = dataset?.donationCampaign || "Campaign";
      });
      if (amountEl) amountEl.textContent = dataset?.donationAmount || "$0";

      if (methodEl) {
        methodEl.textContent = dataset?.donationMethod || "";
      }
      if (dateEl) {
        dateEl.textContent = dataset?.donationDate || "";
      }

      if (statusEl) {
        const statusText = dataset?.donationStatus || "";
        statusEl.textContent = statusText || "Status";
        statusEl.className = `status-pill ${statusClass(statusText)}`.trim();
      }

      if (avatarEl) {
        avatarEl.textContent = donorInitials || "DR";
      }

      if (emailEl) {
        emailEl.textContent = dataset?.donorEmail || "";
      }

      if (locationEl) {
        locationEl.textContent = dataset?.donorLocation || "";
      }

      const notes = dataset?.donationNotes;
      if (notesSection && notesEl) {
        notesSection.classList.toggle("is-hidden", !notes);
        notesEl.textContent = notes || "";
      }
    };

    previewButtons.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        const wrapper = event.currentTarget.closest(".donation-card, .donation-row");
        if (!wrapper) return;
        fillPreview(wrapper.dataset);
        openSheet();
      });
    });

    closeButtons.forEach((btn) => btn.addEventListener("click", closeSheet));
    backdrop?.addEventListener("click", closeSheet);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && previewSheet.classList.contains("is-open")) {
        closeSheet();
      }
    });
  };

  /**
   * Configure the donations filters drawer, badge, and reset/apply controls.
   * Works with `#donationsFilters`, `.js-open-donations-filters`, and `.js-filter-count`.
   */
  const initDonationsFilters = () => {
    // Cache the donations filter panel, trigger, and control buttons for the drawer.
    const offcanvas = document.getElementById("donationsFilters");
    const trigger = document.querySelector(".js-open-donations-filters");
    if (!offcanvas || !trigger) return;

    const backdrop = offcanvas.querySelector(".offcanvas-backdrop");
    const closeButtons = offcanvas.querySelectorAll(".js-offcanvas-close");
    const resetButton = offcanvas.querySelector(".js-offcanvas-reset");
    const applyButton = offcanvas.querySelector(".js-offcanvas-apply");
    const badge = trigger.querySelector(".js-filter-count");
    const fields = Array.from(offcanvas.querySelectorAll("input, select"));

    const lockScroll = () => document.body.classList.add("is-locked");
    const unlockScroll = () => {
      const app = document.querySelector(".app");
      if (!app || !app.classList.contains("sidebar-open")) {
        document.body.classList.remove("is-locked");
      }
    };

    const countActiveFilters = () =>
      fields.reduce((count, field) => {
        if ((field.type === "checkbox" || field.type === "radio") && field.checked) return count + 1;
        if (field.value && field.value.trim() !== "") return count + 1;
        return count;
      }, 0);

    const updateBadge = () => {
      const total = countActiveFilters();
      if (badge) {
        badge.textContent = total;
        badge.classList.toggle("is-hidden", total === 0);
      }
      trigger.setAttribute("data-has-filters", total > 0 ? "true" : "false");
    };

    const close = () => {
      offcanvas.classList.remove("is-open");
      offcanvas.setAttribute("aria-hidden", "true");
      trigger.setAttribute("aria-expanded", "false");
      unlockScroll();
    };

    const open = () => {
      offcanvas.classList.add("is-open");
      offcanvas.setAttribute("aria-hidden", "false");
      trigger.setAttribute("aria-expanded", "true");
      lockScroll();
    };

    const toggle = () => {
      if (offcanvas.classList.contains("is-open")) {
        close();
      } else {
        open();
      }
    };

    trigger.addEventListener("click", toggle);
    backdrop?.addEventListener("click", close);
    closeButtons.forEach((btn) => btn.addEventListener("click", close));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && offcanvas.classList.contains("is-open")) {
        close();
      }
    });

    fields.forEach((field) => field.addEventListener("change", updateBadge));

    resetButton?.addEventListener("click", () => {
      fields.forEach((field) => {
        if (field.type === "checkbox" || field.type === "radio") {
          field.checked = false;
        } else {
          field.value = "";
        }
      });
      updateBadge();
    });

    applyButton?.addEventListener("click", () => {
      updateBadge();
      close();
    });

    updateBadge();
  };

  /**
   * Wire dropdown actions for each donation row so users can interact with retry/refund links locally.
   * Relies on `.js-donation-actions-toggle` and `.dropdown-donations .dropdown-menu--actions`.
   */
  const initDonationsActions = () => {
    const actionToggles = Array.from(document.querySelectorAll(".js-donation-actions-toggle"));
    const actionMenus = Array.from(document.querySelectorAll(".dropdown-donations .dropdown-menu--actions"));
    if (!actionToggles.length || !actionMenus.length) return;

    const closeMenus = () => {
      actionMenus.forEach((menu) => menu.classList.remove("is-open"));
      actionToggles.forEach((toggle) => toggle.setAttribute("aria-expanded", "false"));
    };

    const getMenu = (toggle) => toggle.closest(".dropdown-donations")?.querySelector(".dropdown-menu--actions");

    const toggleMenu = (toggle) => {
      const menu = getMenu(toggle);
      if (!menu) return;
      const isOpen = menu.classList.contains("is-open");
      closeMenus();
      if (!isOpen) {
        menu.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
      }
    };

    actionToggles.forEach((toggle) => {
      toggle.setAttribute("aria-expanded", "false");
      // Toggle the donor action menu when clicking the kebab button.
      toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleMenu(toggle);
      });
      // Support keyboard activation (Enter/Space) for each action toggle.
      toggle.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
          event.preventDefault();
          toggleMenu(toggle);
        }
      });
    });

    actionMenus.forEach((menu) => {
      menu.addEventListener("click", (event) => event.stopPropagation());
      menu.querySelectorAll(".dropdown-item").forEach((item) => {
        item.addEventListener("click", closeMenus);
      });
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".dropdown-donations")) {
        closeMenus();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenus();
      }
    });
  };

  /**
   * Synchronize the donors view toggle between cards and tables, storing the preference under DONORS_VIEW_STORAGE_KEY.
   * Requires `.view-toggle[data-view-context='donors']` plus `.donors-view` containers.
   */
  const initDonorsViewToggle = () => {
    const viewToggle = document.querySelector(".view-toggle[data-view-context='donors']");
    const viewButtons = viewToggle ? Array.from(viewToggle.querySelectorAll(".view-toggle__btn")) : [];
    const views = Array.from(document.querySelectorAll(".donors-view"));
    if (!viewToggle || !viewButtons.length || !views.length) return;

    const validModes = viewButtons.map((btn) => btn.dataset.viewMode).filter(Boolean);
    const stored = localStorage.getItem(DONORS_VIEW_STORAGE_KEY);
    const fallback = validModes.includes("cards") ? "cards" : validModes[0];
    const initialMode = stored && validModes.includes(stored) ? stored : fallback;

    const setActiveView = (mode) => {
      viewButtons.forEach((btn) => {
        const isActive = btn.dataset.viewMode === mode;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      views.forEach((view) => {
        const isActive = view.dataset.view === mode;
        view.classList.toggle("is-active", isActive);
        view.setAttribute("aria-hidden", isActive ? "false" : "true");
      });

      localStorage.setItem(DONORS_VIEW_STORAGE_KEY, mode);
    };

    setActiveView(initialMode);

    viewButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.viewMode;
        if (mode) {
          setActiveView(mode);
        }
      });
    });
  };

  /**
   * Hook the donors filters drawer, slider toggles, and quick presets so filter chips and badge states update live.
   * Works with `#donorsFilters`, `.js-open-donors-filters`, and `.js-filter-count`.
   */
  const initDonorsFilters = () => {
    // Capture donor filters drawer elements and form controls for the offcanvas panel.
    const offcanvas = document.getElementById("donorsFilters");
    const trigger = document.querySelector(".js-open-donors-filters");
    if (!offcanvas || !trigger) return;

    const backdrop = offcanvas.querySelector(".offcanvas-backdrop");
    const closeButtons = offcanvas.querySelectorAll(".js-offcanvas-close");
    const resetButton = offcanvas.querySelector(".js-offcanvas-reset");
    const applyButton = offcanvas.querySelector(".js-offcanvas-apply");
    const badge = trigger.querySelector(".js-filter-count");
    const fields = Array.from(offcanvas.querySelectorAll("input, select"));

    const lockScroll = () => document.body.classList.add("is-locked");
    const unlockScroll = () => {
      const app = document.querySelector(".app");
      if (!app || !app.classList.contains("sidebar-open")) {
        document.body.classList.remove("is-locked");
      }
    };

    const countActiveFilters = () =>
      fields.reduce((count, field) => {
        if ((field.type === "checkbox" || field.type === "radio") && field.checked) return count + 1;
        if (field.value && field.value.trim() !== "") return count + 1;
        return count;
      }, 0);

    const updateBadge = () => {
      const total = countActiveFilters();
      if (badge) {
        badge.textContent = total;
        badge.classList.toggle("is-hidden", total === 0);
      }
      trigger.setAttribute("data-has-filters", total > 0 ? "true" : "false");
    };

    const close = () => {
      offcanvas.classList.remove("is-open");
      offcanvas.setAttribute("aria-hidden", "true");
      trigger.setAttribute("aria-expanded", "false");
      unlockScroll();
    };

    const open = () => {
      offcanvas.classList.add("is-open");
      offcanvas.setAttribute("aria-hidden", "false");
      trigger.setAttribute("aria-expanded", "true");
      lockScroll();
    };

    const toggle = () => {
      if (offcanvas.classList.contains("is-open")) {
        close();
      } else {
        open();
      }
    };

    // Attach the triggers that open or close the donor filters drawer.
    trigger.addEventListener("click", toggle);
    closeButtons.forEach((btn) => btn.addEventListener("click", close));
    backdrop?.addEventListener("click", close);

    // Reset filters when the clear button is clicked.
    resetButton?.addEventListener("click", () => {
      fields.forEach((field) => {
        if (field.type === "checkbox" || field.type === "radio") {
          field.checked = false;
        } else {
          field.value = "";
        }
      });
      updateBadge();
    });

    // Apply filters and close the panel when the apply button is used.
    applyButton?.addEventListener("click", () => {
      updateBadge();
      close();
    });

    // Update the badge whenever filter inputs change.
    fields.forEach((field) => field.addEventListener("change", updateBadge));

    // Allow Escape key to close the filters panel for accessibility.
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && offcanvas.classList.contains("is-open")) {
        close();
      }
    });

    updateBadge();
  };

  /**
   * Manage donor action dropdowns for quick commands without submitting forms; purely local UX wiring.
   * Expects `.js-donor-actions-toggle`, `.dropdown-donors`, and `[data-member-action]` patterns.
   */
  const initDonorsActions = () => {
    const actionToggles = Array.from(document.querySelectorAll(".js-donor-actions-toggle"));
    const actionMenus = Array.from(document.querySelectorAll(".dropdown-donors .dropdown-menu--actions"));
    if (!actionToggles.length || !actionMenus.length) return;

    const closeMenus = () => {
      actionMenus.forEach((menu) => menu.classList.remove("is-open"));
      actionToggles.forEach((toggle) => toggle.setAttribute("aria-expanded", "false"));
    };

    const getMenu = (toggle) => toggle.closest(".dropdown-donors")?.querySelector(".dropdown-menu--actions");

    const toggleMenu = (toggle) => {
      const menu = getMenu(toggle);
      if (!menu) return;
      const isOpen = menu.classList.contains("is-open");
      closeMenus();
      if (!isOpen) {
        menu.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
      }
    };

    actionToggles.forEach((toggle) => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleMenu(toggle);
      });
      toggle.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
          event.preventDefault();
          toggleMenu(toggle);
        }
      });
    });

    actionMenus.forEach((menu) => {
      menu.addEventListener("click", (event) => event.stopPropagation());
      menu.querySelectorAll(".dropdown-item").forEach((item) => {
        item.addEventListener("click", closeMenus);
      });
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".dropdown-donors")) {
        closeMenus();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenus();
      }
    });
  };

  /**
   * Fill the donor preview panel when a card or row is clicked, using data attributes for recipient info and history.
   * Expects `.donor-preview-panel`, `.donor-card`, `.donor-row`, and dataset tags like `data-donor-activity`.
   */
  const initDonorsPreview = () => {
    const panel = document.querySelector(".donor-preview-panel");
    if (!panel) return;

    const backdrop = panel.querySelector(".donor-preview__backdrop");
    const sheet = panel.querySelector(".donor-preview__sheet");
    const closeButtons = panel.querySelectorAll(".js-donor-preview-close");
    const nameEl = sheet?.querySelector(".js-preview-name");
    const emailEl = sheet?.querySelector(".js-preview-email");
    const locationEl = sheet?.querySelector(".js-preview-location");
    const locationMeta = sheet?.querySelector(".js-preview-location-meta");
    const typeBadge = sheet?.querySelector(".js-preview-type");
    const typeMeta = sheet?.querySelector(".js-preview-type-meta");
    const statusEl = sheet?.querySelector(".js-preview-status");
    const avatarEl = sheet?.querySelector(".js-preview-avatar");
    const lifetimeEl = sheet?.querySelector(".js-preview-lifetime");
    const giftsEl = sheet?.querySelector(".js-preview-gifts");
    const averageEl = sheet?.querySelector(".js-preview-average");
    const lastEl = sheet?.querySelector(".js-preview-last");
    const campaignsEl = sheet?.querySelector(".js-preview-campaigns");
    const tagsContainer = sheet?.querySelector(".js-preview-tags");
    const noteEl = sheet?.querySelector(".js-preview-note");
    const historyList = sheet?.querySelector(".js-preview-history");
    const previewButtons = Array.from(document.querySelectorAll(".js-donor-preview"));
    const rows = Array.from(document.querySelectorAll(".donor-row"));
    const cards = Array.from(document.querySelectorAll(".donor-card"));
    const body = document.body;

    if (!previewButtons.length) return;

    const donorStatusClass = (status) => {
      const normalized = (status || "").toLowerCase();
      if (normalized.includes("active")) return "status-pill--success";
      if (normalized.includes("high value")) return "status-pill--info";
      if (normalized.includes("new")) return "status-pill--pending";
      if (normalized.includes("lapsed") || normalized.includes("at risk")) return "status-pill--warning";
      if (normalized.includes("recurring")) return "status-pill--processing";
      return "status-pill--active";
    };

    const parseActivity = (value) => {
      if (!value) return [];
      return value
        .split(";")
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => {
          const [campaign, amount, date, status] = entry.split("|").map((segment) => segment.trim());
          return { campaign, amount, date, status };
        });
    };

    const lockScroll = () => body.classList.add("is-locked");
    const unlockScroll = () => {
      const app = document.querySelector(".app");
      if (!app || !app.classList.contains("sidebar-open")) {
        body.classList.remove("is-locked");
      }
    };

    const openPanel = () => {
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
      lockScroll();
    };

    const closePanel = () => {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      unlockScroll();
    };

    const renderTags = (dataset) => {
      if (!tagsContainer) return;
      tagsContainer.innerHTML = "";
      const list = (dataset?.donorTags || "").split(";").map((item) => item.trim()).filter(Boolean);
      if (!list.length) {
        tagsContainer.innerHTML = `<span class="text-muted">No tags</span>`;
        return;
      }
      list.forEach((label) => {
        const chip = document.createElement("span");
        chip.className = "tag-chip";
        chip.textContent = label;
        tagsContainer.appendChild(chip);
      });
    };

    const renderHistory = (dataset) => {
      if (!historyList) return;
      historyList.innerHTML = "";
      const entries = parseActivity(dataset?.donorActivity);
      entries.slice(0, 5).forEach((entry) => {
        const item = document.createElement("li");
        item.className = "donor-preview__history-item";
        const statusClass = entry.status ? donorStatusClass(entry.status) : "";
        item.innerHTML = `
        <div class="donor-preview__history-row">
          <strong>${entry.campaign || "Campaign"}</strong>
          ${entry.status ? `<span class="status-pill ${statusClass}">${entry.status}</span>` : ""}
        </div>
        <p class="donor-preview__history-amount">${entry.amount || ""}</p>
        <time>${entry.date || ""}</time>`;
        historyList.appendChild(item);
      });
      if (!entries.length) {
        const empty = document.createElement("li");
        empty.className = "donor-preview__history-item";
        empty.textContent = "No recent donations logged.";
        historyList.appendChild(empty);
      }
    };

    const fillPanel = (dataset) => {
      const donorName = dataset?.donorName || "Donor";
      const donorInitials = dataset?.donorInitials || "";
      const donorType = dataset?.donorType || "Individual";
      const donorStatus = dataset?.donorStatus || "Active";

      if (nameEl) {
        nameEl.textContent = donorName;
      }
      if (emailEl) {
        const emailValue = dataset?.donorEmail || "";
        emailEl.textContent = emailValue;
        emailEl.setAttribute("href", emailValue ? `mailto:${emailValue}` : "#");
      }
      if (locationEl) {
        locationEl.textContent = dataset?.donorLocation || "";
      }
      if (locationMeta) {
        locationMeta.textContent = dataset?.donorLocation || "Unknown location";
      }
      if (typeBadge) {
        typeBadge.textContent = donorType;
      }
      if (typeMeta) {
        typeMeta.textContent = donorType;
      }
      if (statusEl) {
        statusEl.textContent = donorStatus;
        statusEl.className = `status-pill ${donorStatusClass(donorStatus)}`.trim();
      }
      if (avatarEl) {
        avatarEl.textContent = donorInitials || donorName
          .split(" ")
          .map((word) => word.charAt(0))
          .filter(Boolean)
          .slice(0, 2)
          .join("")
          .toUpperCase();
      }
      if (lifetimeEl) {
        lifetimeEl.textContent = dataset?.donorLifetime || "$0";
      }
      if (giftsEl) {
        giftsEl.textContent = dataset?.donorGifts || "0";
      }
      if (averageEl) {
        averageEl.textContent = dataset?.donorAverage || "-";
      }
      if (lastEl) {
        lastEl.textContent = dataset?.donorLastGift || "�";
      }
      if (campaignsEl) {
        const campaignsCount = Number(dataset?.donorCampaigns) || 0;
        campaignsEl.textContent = `${campaignsCount} active`;
        if (noteEl) {
          noteEl.textContent = campaignsCount
            ? `Supports ${campaignsCount} active campaign${campaignsCount === 1 ? "" : "s"}.`
            : "No active campaigns tracked yet.";
        }
      }
      renderTags(dataset);
      renderHistory(dataset);
    };

    const attachPreview = (element) => {
      if (!element || !element.dataset) return;
      fillPanel(element.dataset);
      openPanel();
    };

    previewButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const wrapper = event.currentTarget.closest(".donor-card, .donor-row");
        if (wrapper) {
          attachPreview(wrapper);
        }
      });
    });

    const handleRowClick = (event) => {
      if (event.target.closest(".table-actions") || event.target.closest(".dropdown-donors")) return;
      attachPreview(event.currentTarget);
    };

    const handleCardClick = (event) => {
      if (event.target.closest(".donor-card__actions") || event.target.closest(".dropdown-donors")) return;
      attachPreview(event.currentTarget);
    };

    rows.forEach((row) => row.addEventListener("click", handleRowClick));
    cards.forEach((card) => card.addEventListener("click", handleCardClick));

    closeButtons.forEach((btn) =>
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        closePanel();
      })
    );
    backdrop?.addEventListener("click", closePanel);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && panel.classList.contains("is-open")) {
        closePanel();
      }
    });
  };

  /**
   * Handle the donors page table, tabs, search, filters, summary stats, and sorting controls.
   * Relies on `.donors-page`, `.donor-row`, `.donors-tabs__item`, `.donors-search input`, and `.table-sortable` elements,
   * using data attributes for segments/status and dataset-based metrics.
   */
  const initDonorsPage = () => {
    // Cache donors page table, cards, and filter widgets for updating visibility.
    const root = document.querySelector(".donors-page");
    if (!root) return;

    const tbody = root.querySelector(".donor-table tbody");
    if (!tbody) return;

    const summaryTargets = {
      total: root.querySelector(".js-donors-summary-total"),
      active: root.querySelector(".js-donors-summary-active"),
      recurring: root.querySelector(".js-donors-summary-recurring"),
      high: root.querySelector(".js-donors-summary-high"),
    };
    const tabs = Array.from(root.querySelectorAll(".donors-tabs__item"));
    const cards = Array.from(root.querySelectorAll(".donor-card"));
    const searchInput = root.querySelector(".donors-search input");
    const sortableButtons = Array.from(root.querySelectorAll(".table-sortable[data-sort-key]"));
    const baseRowOrder = Array.from(tbody.querySelectorAll(".donor-row"));

    let activeSegment = "all";
    let searchTerm = "";
    let currentSort = { key: null, direction: null };

    const getRows = () => Array.from(tbody.querySelectorAll(".donor-row"));

    const parseCurrencyValue = (value) => {
      if (!value) return 0;
      const cleaned = value.toString().replace(/[^\d.-]/g, "");
      const parsed = Number(cleaned);
      return Number.isNaN(parsed) ? 0 : parsed;
    };

    const matchesSegment = (dataset) => {
      if (activeSegment === "all") return true;
      const segments = (dataset?.donorSegment || "").toLowerCase().split(" ").filter(Boolean);
      return segments.includes(activeSegment);
    };

    const matchesSearch = (dataset) => {
      if (!searchTerm) return true;
      const haystack = `${dataset?.donorName || ""} ${dataset?.donorEmail || ""} ${dataset?.donorLocation || ""} ${(dataset?.donorTags || "")
        .replace(/;/g, " ")}`.toLowerCase();
      return haystack.includes(searchTerm);
    };

    const updateSummaryStats = () => {
      const visibleRows = getRows().filter((row) => !row.classList.contains("is-hidden"));
      const activeCount = visibleRows.filter((row) => {
        const status = (row.dataset.donorStatus || "").toLowerCase();
        const segments = (row.dataset.donorSegment || "").toLowerCase();
        return status.includes("active") || status.includes("high value") || segments.includes("active");
      }).length;
      const recurringCount = visibleRows.filter((row) => (row.dataset.donorSegment || "").toLowerCase().includes("recurring")).length;
      const highValueCount = visibleRows.filter((row) => {
        const status = (row.dataset.donorStatus || "").toLowerCase();
        return status.includes("high value") || (row.dataset.donorSegment || "").toLowerCase().includes("high-value");
      }).length;

      if (summaryTargets.total) {
        summaryTargets.total.textContent = visibleRows.length.toString();
      }
      if (summaryTargets.active) {
        summaryTargets.active.textContent = activeCount.toString();
      }
      if (summaryTargets.recurring) {
        summaryTargets.recurring.textContent = recurringCount.toString();
      }
      if (summaryTargets.high) {
        summaryTargets.high.textContent = highValueCount.toString();
      }
    };

    const applyFilters = () => {
      const rows = getRows();
      rows.forEach((row) => {
        const dataset = row.dataset;
        const visible = matchesSegment(dataset) && matchesSearch(dataset);
        row.classList.toggle("is-hidden", !visible);
      });
      cards.forEach((card) => {
        const dataset = card.dataset;
        const visible = matchesSegment(dataset) && matchesSearch(dataset);
        card.classList.toggle("is-hidden", !visible);
      });
      updateSummaryStats();
    };

    const parseSortValue = (row, key) => {
      const dataset = row?.dataset;
      if (!dataset) return "";
      if (key === "donor") {
        return (dataset.donorName || "").toLowerCase();
      }
      if (key === "lifetime") {
        return Number(dataset.donorLifetimeValue) || parseCurrencyValue(dataset.donorLifetime);
      }
      if (key === "gifts") {
        return Number(dataset.donorGifts) || 0;
      }
      if (key === "lastDonation") {
        const timestamp = new Date(dataset.donorLastDate || dataset.donorLastGift).getTime();
        return Number.isNaN(timestamp) ? 0 : timestamp;
      }
      return "";
    };

    const compareRows = (a, b, key, direction) => {
      const valueA = parseSortValue(a, key);
      const valueB = parseSortValue(b, key);
      if (valueA === valueB) return 0;
      if (typeof valueA === "string" && typeof valueB === "string") {
        return direction === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      }
      return direction === "asc" ? valueA - valueB : valueB - valueA;
    };

    const applySortOrder = () => {
      if (!currentSort.direction || !currentSort.key) {
        baseRowOrder.forEach((row) => tbody.appendChild(row));
        return;
      }
      const rows = getRows();
      const sorted = [...rows].sort((a, b) => compareRows(a, b, currentSort.key, currentSort.direction));
      sorted.forEach((row) => tbody.appendChild(row));
    };

    const updateSortIndicators = () => {
      sortableButtons.forEach((button) => {
        const isCurrent = button.dataset.sortKey === currentSort.key && currentSort.direction;
        button.classList.toggle("is-active", Boolean(isCurrent));
        if (isCurrent) {
          button.setAttribute("data-sort-direction", currentSort.direction);
        } else {
          button.removeAttribute("data-sort-direction");
        }
      });
    };

    const handleSortClick = (event) => {
      event.preventDefault();
      const button = event.currentTarget;
      const key = button.dataset.sortKey;
      if (!key) return;
      let nextDirection = "asc";
      if (currentSort.key === key) {
        if (currentSort.direction === "asc") {
          nextDirection = "desc";
        } else if (currentSort.direction === "desc") {
          nextDirection = null;
        }
      }
      currentSort.key = nextDirection ? key : null;
      currentSort.direction = nextDirection;
      updateSortIndicators();
      applySortOrder();
    };

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((btn) => {
          btn.classList.remove("donors-tabs__item--active");
          btn.setAttribute("aria-selected", "false");
        });
        tab.classList.add("donors-tabs__item--active");
        tab.setAttribute("aria-selected", "true");
        activeSegment = tab.dataset.segment || "all";
        applyFilters();
      });
    });

    searchInput?.addEventListener("input", (event) => {
      searchTerm = (event.target.value || "").toLowerCase().trim();
      applyFilters();
    });

    sortableButtons.forEach((button) => button.addEventListener("click", handleSortClick));

    updateSortIndicators();
    applyFilters();
  };

  /**
   * Update the campaign preview card live as the form inputs change.
   * Watches `.js-campaign-form`, name/description/target fields, image input, and `[data-preview-*]` nodes.
   */
  const initCampaignFormPreview = () => {
    const form = document.querySelector(".js-campaign-form");
    if (!form) return;

    const fields = {
      name: form.querySelector("#campaignName"),
      description: form.querySelector("#campaignDescription"),
      target: form.querySelector("#targetAmount"),
      start: form.querySelector("#startDateField"),
      end: form.querySelector("#endDateField"),
      type: form.querySelector("#campaignTypeField"),
      location: form.querySelector("#campaignLocation"),
      tags: form.querySelector("#campaignTags"),
      image: form.querySelector("#campaignImage"),
    };

    const preview = {
      title: document.querySelector(".js-preview-title"),
      description: document.querySelector(".js-preview-description"),
      amount: document.querySelector(".js-preview-amount"),
      dates: document.querySelector(".js-preview-dates"),
      type: document.querySelector(".js-preview-type"),
      location: document.querySelector(".js-preview-location"),
      tags: document.querySelector(".js-preview-tags"),
      image: document.querySelector(".js-preview-image"),
      imageWrapper: document.querySelector("[data-preview-image-wrapper]"),
      status: document.querySelector(".js-preview-status"),
    };

    const defaultImage = preview.image?.dataset.placeholder || preview.image?.src;
    const fallbackTags = ["Impact", "Community"];

    const clampDescription = (value) => {
      const copy = value || "Add a short, compelling story to inspire donors.";
      return copy.length > 240 ? `${copy.slice(0, 237)}...` : copy;
    };

    const setPreviewImage = (src, isPlaceholder = false) => {
      if (!preview.image || !preview.imageWrapper) return;
      const nextSrc = src || defaultImage;
      preview.image.src = nextSrc;
      preview.imageWrapper.classList.toggle("is-empty", isPlaceholder || !src);
    };

    const setPreviewTags = (tags) => {
      if (!preview.tags) return;
      const tagsList = tags && tags.length ? tags : fallbackTags;
      preview.tags.innerHTML = tagsList.map((tag) => `<span class="badge badge--tag">${tag}</span>`).join("");
    };

    const syncPreview = () => {
      if (preview.title) {
        const title = getFieldValue(fields.name) || "Campaign title";
        preview.title.textContent = title;
      }

      if (preview.description) {
        preview.description.textContent = clampDescription(getFieldValue(fields.description));
      }

      if (preview.amount) {
        const amount = formatCurrencyValue(getFieldValue(fields.target));
        preview.amount.textContent = amount || "$0";
      }

      if (preview.dates) {
        const start = formatPreviewDate(getFieldValue(fields.start));
        const end = formatPreviewDate(getFieldValue(fields.end));
        preview.dates.textContent = start || end ? `${start || "Start date"} - ${end || "End date"}` : "Start date - End date";
      }

      if (preview.type) {
        preview.type.textContent = fields.type?.value
          ? fields.type.options[fields.type.selectedIndex].text
          : "Type";
      }

      if (preview.location) {
        preview.location.textContent = fields.location?.value
          ? fields.location.options[fields.location.selectedIndex].text
          : "Location";
      }

      const tagsValue = getFieldValue(fields.tags);
      const parsedTags = tagsValue
        ? tagsValue.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 6)
        : [];
      setPreviewTags(parsedTags);

      animatePreviewCard();
    };

    const handleImageChange = (src, isPlaceholder = false) => {
      setPreviewImage(src, isPlaceholder);
      animatePreviewCard();
    };

    Object.values(fields).forEach((field) => {
      if (!field || field.type === "file") return;
      field.addEventListener("input", syncPreview);
      field.addEventListener("change", syncPreview);
    });

    if (fields.image) {
      fields.image.addEventListener("change", (event) => {
        const file = event.target.files?.[0];
        if (file) {
          const url = URL.createObjectURL(file);
          handleImageChange(url, false);
        } else {
          handleImageChange(defaultImage, true);
        }
      });
    }

    // Custom events triggered by the image upload widget keep other preview views in sync.
    document.addEventListener("campaign:imageChange", (event) => {
      const detail = event.detail || {};
      handleImageChange(detail.src, detail.isPlaceholder);
    });

    // The multi-select tags component fires campaign:tagsChange so previews always show the current tags.
    document.addEventListener("campaign:tagsChange", (event) => {
      setPreviewTags(event.detail?.tags || []);
      animatePreviewCard();
    });

    syncPreview();
    setPreviewImage(defaultImage, true);
  };

  /**
   * Keep multi-select tag controls and chips synchronized inside campaign forms.
   * Requires `[data-multi-select]`, `.multi-select__option` elements, `[data-chips]`, `[data-multi-hidden]`, and `[data-multi-search]`.
   */
  const initMultiSelectTags = () => {
    const multiSelect = document.querySelector("[data-multi-select]");
    if (!multiSelect) return;

    const control = multiSelect.querySelector(".multi-select__control");
    const dropdown = multiSelect.querySelector(".multi-select__dropdown");
    const chips = multiSelect.querySelector("[data-chips]");
    const options = Array.from(multiSelect.querySelectorAll(".multi-select__option"));
    const searchInput = multiSelect.querySelector("[data-multi-search]");
    const hiddenInput = multiSelect.querySelector("[data-multi-hidden]");
    const placeholder = multiSelect.querySelector("[data-multi-placeholder]");
    const maxTags = Number(multiSelect.dataset.maxTags) || 6;

    if (!control || !dropdown || !chips || !options.length || !searchInput || !hiddenInput) return;

    let highlightedIndex = -1;
    const selected = new Map();

    const emptyState = document.createElement("div");
    emptyState.className = "multi-select__empty is-hidden";
    emptyState.textContent = "No tags match your search";
    dropdown.append(emptyState);

    dropdown.setAttribute("aria-hidden", "true");
    control.setAttribute("aria-expanded", "false");

    const visibleOptions = () => options.filter((option) => !option.classList.contains("is-hidden"));

    const updateEmptyState = () => {
      emptyState.classList.toggle("is-hidden", visibleOptions().length > 0);
    };

    const refreshHiddenInput = () => {
      const tags = Array.from(selected.values());
      hiddenInput.value = tags.join(", ");
      hiddenInput.dispatchEvent(new Event("input", { bubbles: true }));
      // Notify other widgets (preview, validation) that the selected tags changed.
      document.dispatchEvent(new CustomEvent("campaign:tagsChange", { detail: { tags } }));
    };

    const renderChips = () => {
      chips.innerHTML = "";
      if (!selected.size && placeholder) {
        placeholder.classList.remove("is-hidden");
      } else {
        placeholder?.classList.add("is-hidden");
      }
      selected.forEach((label, value) => {
        const chip = document.createElement("span");
        chip.className = "multi-select__chip";
        chip.textContent = label;
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.setAttribute("aria-label", `Remove ${label}`);
        removeBtn.innerHTML = "&times;";
        removeBtn.addEventListener("click", (event) => {
          event.stopPropagation();
          deselectValue(value);
        });
        chip.appendChild(removeBtn);
        chips.appendChild(chip);
      });
    };

    const selectOption = (option) => {
      const value = option.dataset.value;
      const label = option.dataset.label || value;
      if (!value || selected.has(value) || selected.size >= maxTags) return;
      selected.set(value, label);
      option.setAttribute("aria-selected", "true");
      const checkbox = option.querySelector("input");
      if (checkbox) checkbox.checked = true;
    };

    const deselectValue = (value) => {
      selected.delete(value);
      const option = options.find((opt) => opt.dataset.value === value);
      if (option) {
        option.setAttribute("aria-selected", "false");
        const checkbox = option.querySelector("input");
        if (checkbox) checkbox.checked = false;
      }
      renderChips();
      refreshHiddenInput();
    };

    const toggleOption = (option) => {
      const value = option?.dataset.value;
      if (!value) return;
      if (selected.has(value)) {
        deselectValue(value);
      } else {
        selectOption(option);
        renderChips();
        refreshHiddenInput();
      }
    };

    const highlightOption = (index) => {
      const visible = visibleOptions();
      if (!visible.length) return;
      const nextIndex = ((index % visible.length) + visible.length) % visible.length;
      options.forEach((opt) => opt.classList.remove("is-highlighted"));
      const target = visible[nextIndex];
      target.classList.add("is-highlighted");
      target.focus({ preventScroll: true });
      highlightedIndex = nextIndex;
    };

    const openDropdown = () => {
      multiSelect.classList.add("is-open");
      control.setAttribute("aria-expanded", "true");
      dropdown.setAttribute("aria-hidden", "false");
      updateEmptyState();
      searchInput.focus();
    };

    const closeDropdown = () => {
      multiSelect.classList.remove("is-open");
      control.setAttribute("aria-expanded", "false");
      dropdown.setAttribute("aria-hidden", "true");
      highlightedIndex = -1;
      options.forEach((opt) => opt.classList.remove("is-highlighted"));
    };

    const filterOptions = (term) => {
      const query = term.toLowerCase();
      options.forEach((option) => {
        const label = (option.dataset.label || option.textContent || "").toLowerCase();
        const isMatch = label.includes(query);
        option.classList.toggle("is-hidden", !isMatch);
        option.setAttribute("aria-hidden", isMatch ? "false" : "true");
      });
      highlightedIndex = -1;
      updateEmptyState();
    };

    const removeLastChip = () => {
      const last = Array.from(selected.keys()).pop();
      if (last) {
        deselectValue(last);
      }
    };

    control.addEventListener("click", (event) => {
      event.preventDefault();
      if (multiSelect.classList.contains("is-open")) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    control.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (!multiSelect.classList.contains("is-open")) {
          openDropdown();
        }
        highlightOption(highlightedIndex + 1 || 0);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        if (!multiSelect.classList.contains("is-open")) {
          openDropdown();
        }
        highlightOption((highlightedIndex === -1 ? 0 : highlightedIndex) - 1);
      } else if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        if (!multiSelect.classList.contains("is-open")) {
          openDropdown();
          highlightOption(0);
        } else {
          const visible = visibleOptions();
          if (visible[highlightedIndex]) {
            toggleOption(visible[highlightedIndex]);
          }
        }
      } else if (event.key === "Escape") {
        closeDropdown();
      } else if (event.key === "Backspace" && !multiSelect.classList.contains("is-open")) {
        removeLastChip();
      }
    });

    searchInput.addEventListener("input", (event) => {
      filterOptions(event.target.value);
    });

    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        highlightOption(highlightedIndex + 1 || 0);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        highlightOption((highlightedIndex === -1 ? 0 : highlightedIndex) - 1);
      } else if (event.key === "Enter") {
        event.preventDefault();
        const visible = visibleOptions();
        if (visible[highlightedIndex]) {
          toggleOption(visible[highlightedIndex]);
        }
      } else if (event.key === "Escape") {
        closeDropdown();
        control.focus();
      } else if (event.key === "Backspace" && !event.target.value && selected.size) {
        removeLastChip();
      }
    });

    options.forEach((option) => {
      option.addEventListener("click", (event) => {
        event.preventDefault();
        toggleOption(option);
      });
      option.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
          event.preventDefault();
          toggleOption(option);
        }
      });
      const checkbox = option.querySelector("input");
      if (checkbox) {
        checkbox.addEventListener("change", (event) => {
          event.stopPropagation();
          toggleOption(option);
        });
      }
    });

    document.addEventListener("click", (event) => {
      if (!multiSelect.contains(event.target)) {
        closeDropdown();
      }
    });

    multiSelect.addEventListener("focusout", (event) => {
      if (!multiSelect.contains(event.relatedTarget)) {
        closeDropdown();
      }
    });

    const primeSelected = () => {
      const initial = getFieldValue(hiddenInput);
      if (!initial) return;
      initial
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .forEach((tag) => {
          if (selected.size >= maxTags) return;
          const option = options.find(
            (opt) => opt.dataset.value === tag || (opt.dataset.label || "").toLowerCase() === tag.toLowerCase()
          );
          if (option) {
            selected.set(option.dataset.value, option.dataset.label || option.dataset.value);
            option.setAttribute("aria-selected", "true");
            const checkbox = option.querySelector("input");
            if (checkbox) checkbox.checked = true;
          } else {
            selected.set(tag, tag);
          }
        });
      renderChips();
      refreshHiddenInput();
    };

    renderChips();
    primeSelected();
  };

  /**
  * Control the campaign media upload drag/drop zone, validate file types/sizes, and update the preview.
  * Expects `[data-upload]`, `[data-upload-dropzone]`, error placeholders, `.image-upload__preview-img`, and `.image-upload__preview-video`.
   */
  const initCampaignImageUpload = () => {
    const upload = document.querySelector("[data-upload]");
    if (!upload) return;

    const dropzone = upload.querySelector("[data-upload-dropzone]");
    const input = upload.querySelector('input[type="file"]');
    const previewImg = upload.querySelector(".image-upload__preview-img");
    const previewVideo = upload.querySelector(".image-upload__preview-video");
    const placeholder = upload.querySelector(".image-upload__placeholder");
    const errorEl = upload.querySelector("[data-upload-error]");
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/jpg",
      "video/mp4",
      "video/webm",
      "video/quicktime"
    ];
    const maxSize = 25 * 1024 * 1024;
    let objectUrl = "";

    const preventDefaults = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const showError = (message) => {
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove("is-hidden");
      }
      dropzone?.classList.add("is-invalid");
    };

    const clearError = () => {
      if (errorEl) {
        errorEl.classList.add("is-hidden");
      }
      dropzone?.classList.remove("is-invalid");
    };

    const resetPreview = () => {
      placeholder?.classList.remove("is-hidden");
      if (previewImg) {
        previewImg.classList.add("is-hidden");
        previewImg.removeAttribute("src");
      }
      if (previewVideo) {
        previewVideo.classList.add("is-hidden");
        previewVideo.pause();
        previewVideo.removeAttribute("src");
      }
      document.dispatchEvent(
        new CustomEvent("campaign:imageChange", { detail: { src: null, isPlaceholder: true, mediaType: null } })
      );
    };

    const applyPreview = (url, isVideo = false) => {
      placeholder?.classList.add("is-hidden");
      if (isVideo && previewVideo) {
        previewVideo.src = url;
        previewVideo.classList.remove("is-hidden");
        previewVideo.load();
        previewVideo.play().catch(() => { });
        if (previewImg) {
          previewImg.classList.add("is-hidden");
        }
      } else if (previewImg) {
        previewImg.src = url;
        previewImg.classList.remove("is-hidden");
        if (previewVideo) {
          previewVideo.classList.add("is-hidden");
          previewVideo.pause();
          previewVideo.removeAttribute("src");
        }
      }
      document.dispatchEvent(
        new CustomEvent("campaign:imageChange", {
          detail: { src: url, isPlaceholder: false, mediaType: isVideo ? "video" : "image" }
        })
      );
    };

    const handleFile = (file) => {
      if (!file) {
        resetPreview();
        return;
      }
      const normalizedType = (file.type || "").toLowerCase();
      const matchesExtension = /\.(jpe?g|jpg|png|webp|gif|mp4|webm|mov)$/i.test(file.name || "");
      const isValidType = allowedTypes.includes(normalizedType) || matchesExtension;
      const isValidSize = file.size <= maxSize;
      if (!isValidType) {
        showError("Only JPG, PNG, GIF, MP4, or WebM files are supported.");
        if (input) input.value = "";
        resetPreview();
        return;
      }
      if (!isValidSize) {
        showError("File must be under 25 MB.");
        if (input) input.value = "";
        resetPreview();
        return;
      }
      clearError();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      const object = URL.createObjectURL(file);
      const isVideo = normalizedType.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(file.name || "");
      objectUrl = object;
      applyPreview(objectUrl, isVideo);
    };

    if (dropzone) {
      ["dragenter", "dragover"].forEach((eventName) => {
        dropzone.addEventListener(eventName, (event) => {
          preventDefaults(event);
          dropzone.classList.add("is-dragover");
        });
      });

      ["dragleave", "dragend"].forEach((eventName) => {
        dropzone.addEventListener(eventName, (event) => {
          preventDefaults(event);
          dropzone.classList.remove("is-dragover");
        });
      });

      dropzone.addEventListener("drop", (event) => {
        preventDefaults(event);
        dropzone.classList.remove("is-dragover");
        const file = event.dataTransfer?.files?.[0];
        handleFile(file);
      });
    }

    input?.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      handleFile(file);
    });

    resetPreview();
  };

  /**
   * Normalize numeric and currency inputs inside campaign forms, add counters, and keep capitalization tidy.
   * Works with `.js-campaign-form`, `#campaignName`, `#targetAmount`, and `#description-counter`.
   */
  const initCampaignFormFormatting = () => {
    const form = document.querySelector(".js-campaign-form");
    if (!form) return;

    const nameField = form.querySelector("#campaignName");
    const targetField = form.querySelector("#targetAmount");
    const descriptionField = form.querySelector("#campaignDescription");
    const counter = document.querySelector("#description-counter");
    const counterLimit = Number(descriptionField?.dataset.maxlength) || Number(descriptionField?.getAttribute("maxlength")) || 300;

    if (descriptionField && counter) {
      descriptionField.setAttribute("maxlength", String(counterLimit));
      const updateCounter = () => {
        const count = descriptionField.value.length;
        counter.textContent = `${count} / ${counterLimit}`;
        counter.classList.toggle("is-warning", count >= counterLimit * 0.9);
      };
      descriptionField.addEventListener("input", updateCounter);
      updateCounter();
    }

    if (nameField) {
      nameField.addEventListener("input", () => {
        const value = nameField.value;
        if (!value) return;
        const next = value.charAt(0).toUpperCase() + value.slice(1);
        if (next !== value) {
          const cursor = nameField.selectionStart || next.length;
          nameField.value = next;
          nameField.setSelectionRange(cursor, cursor);
        }
      });
    }

    if (targetField) {
      targetField.addEventListener("input", () => {
        const cursorAtEnd = targetField.selectionStart === targetField.value.length;
        targetField.value = formatCurrencyValue(targetField.value);
        if (cursorAtEnd) {
          const nextPosition = targetField.value.length;
          targetField.setSelectionRange(nextPosition, nextPosition);
        }
      });
      targetField.addEventListener("blur", () => {
        targetField.value = formatCurrencyValue(targetField.value);
      });
    }
  };

  /**
   * Enable expandable submenu sections inside the sidebar More section.
   * Expects sidebar items with `.sidebar-item--expandable`, `.sidebar-link--toggle`, and a submenu id.
   */
  const initSidebarSubmenus = () => {
    const expandableItems = Array.from(document.querySelectorAll(".sidebar-item--expandable"));
    if (!expandableItems.length) return;

    const closeAll = (skipItem) => {
      expandableItems.forEach((item) => {
        if (item === skipItem) return;
        const toggle = item.querySelector(".sidebar-link--toggle");
        const submenu = toggle ? document.getElementById(toggle.dataset.submenu) : null;
        if (!toggle || !submenu) return;
        submenu.classList.remove("is-open");
        submenu.setAttribute("aria-hidden", "true");
        toggle.setAttribute("aria-expanded", "false");
        item.classList.remove("is-open");
      });
    };

    const setMenuState = (item, toggle, submenu, isOpen) => {
      if (!toggle || !submenu) return;
      submenu.classList.toggle("is-open", isOpen);
      submenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      item.classList.toggle("is-open", isOpen);
    };

    expandableItems.forEach((item) => {
      const toggle = item.querySelector(".sidebar-link--toggle");
      const submenuId = toggle?.dataset.submenu;
      const submenu = submenuId ? document.getElementById(submenuId) : null;
      if (!toggle || !submenu) return;
      submenu.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");

      const handleToggle = (event) => {
        event.preventDefault();
        const isOpen = submenu.classList.contains("is-open");
        closeAll(item);
        setMenuState(item, toggle, submenu, !isOpen);
      };

      toggle.addEventListener("click", handleToggle);
      toggle.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
          event.preventDefault();
          handleToggle(event);
        }
      });
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".sidebar-item--expandable")) {
        closeAll();
      }
    });
  };

  /**
   * Validate campaign form fields on submit and display inline errors.
   * Expected DOM: `.js-campaign-form` with `#campaignName`, `#targetAmount`, `[data-multi-hidden]`, and `.multi-select__control`.
   * These are soft client-side checks; the backend must still validate every field.
   */
  const initCampaignFormValidation = () => {
    const form = document.querySelector(".js-campaign-form");
    if (!form) return;

    const nameField = form.querySelector("#campaignName");
    const targetField = form.querySelector("#targetAmount");
    const tagsHidden = form.querySelector("[data-multi-hidden]");
    const tagsControl = form.querySelector(".multi-select__control");

    // Soft client-side checks; the backend should still enforce these rules when data is submitted.
    const validators = [
      {
        field: nameField,
        message: "Please enter a campaign name.",
        check: () => !!getFieldValue(nameField),
      },
      {
        field: targetField,
        message: "Please set a target amount.",
        check: () => parseCurrencyNumber(getFieldValue(targetField)) > 0,
      },
    ];

    if (tagsHidden && tagsControl) {
      validators.push({
        field: tagsControl,
        message: "Add at least one tag to classify the campaign.",
        check: () => getFieldValue(tagsHidden).length > 0,
      });
    }

    form.addEventListener("submit", (event) => {
      let isValid = true;
      validators.forEach((validator) => {
        if (!validator.field || typeof validator.check !== "function") return;
        const passes = validator.check();
        if (!passes) {
          isValid = false;
          setFieldError(validator.field, validator.message);
        }
      });

      if (!isValid) {
        event.preventDefault();
      }
    });

    form.addEventListener("input", (event) => {
      const target = event.target;
      if (!target) return;
      clearFieldError(target);
      if (target.closest(".multi-select") && tagsControl) {
        clearFieldError(tagsControl);
      }
    });

    document.addEventListener("campaign:tagsChange", () => {
      if (tagsControl) {
        clearFieldError(tagsControl);
      }
    });
  };

  // Show a temporary toast notification in the shared container for feedback (front-end only; backend would send real requests).
  const showToast = (message, variant = "success") => {
    const container = document.querySelector(".toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast toast--${variant}`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 4200);
  };


  const initCampaignCreationExtras = () => {
    const form = document.querySelector(".js-campaign-form");
    if (!form) return;
    const donationFrequencyRadios = Array.from(form.querySelectorAll('input[name="donationFrequency"]'));
    const donationTypeLabel = document.querySelector('[data-preview="donationType"]');
    const recurringMetaLabel = document.querySelector('[data-preview="recurringMeta"]');
    const recurringDetails = form.querySelector('[data-recurring-details]');
    const recurringInterval = form.querySelector('[data-recurring-interval]');
    const recurringDay = form.querySelector('[data-recurring-day]');
    const progressWrapper = document.querySelector('[data-preview-progress]');
    const progressText = document.querySelector('[data-preview-progress-text]');
    const progressHelper = form.querySelector('[data-progress-helper]');
    const targetField = form.querySelector("#targetAmount");
    const noTargetToggle = form.querySelector("#toggleNoTarget");
    const ecardToggle = form.querySelector('[data-role="toggleECard"]');
    const ecardPanel = form.querySelector('[data-role="ecardPanel"]');
    const ecardStatus = form.querySelector('[data-role="ecardStatusText"]');
    const ecardInput = form.querySelector("#ecardDesign");
    const ecardPreviewBtn = form.querySelector('[data-role="ecardPreviewBtn"]');
    const ecardReplaceBtn = form.querySelector('[data-role="ecardReplaceBtn"]');
    const ecardBadge = document.querySelector('[data-preview="ecardBadge"]');
    const targetingRadios = Array.from(form.querySelectorAll('input[name="targetingMode"]'));
    const targetingHelper = form.querySelector('[data-targeting-helper]');
    const locationBlock = form.querySelector('[data-country-block]');
    const intervalLabels = {
      monthly: "Monthly",
      q3: "Every 3 months",
      q6: "Every 6 months",
    };
    const getFrequencyValue = () =>
      form.querySelector('input[name="donationFrequency"]:checked')?.value || "one-time";
    const updateDonationTypePreview = () => {
      if (!donationTypeLabel) return;
      const label = getFrequencyValue() === "recurring" ? "Recurring" : "One-time";
      donationTypeLabel.textContent = 'Donation type: ' + label;
    };
    const updateRecurringPreview = () => {
      if (!recurringMetaLabel) return;
      const isRecurring = getFrequencyValue() === "recurring";
      if (!isRecurring) {
        recurringMetaLabel.classList.add("is-hidden");
        return;
      }
      const intervalValue = recurringInterval?.value || "monthly";
      const dayValue = recurringDay?.value || "15";
      const intervalLabel = intervalLabels[intervalValue] || intervalValue;
      recurringMetaLabel.textContent = 'Recurring: ' + intervalLabel + ' · Day ' + dayValue;
      recurringMetaLabel.classList.remove("is-hidden");
    };
    const toggleRecurringDetails = () => {
      const shouldShow = getFrequencyValue() === "recurring";
      if (recurringDetails) {
        recurringDetails.classList.toggle("is-hidden", !shouldShow);
        recurringDetails.setAttribute("aria-hidden", (!shouldShow).toString());
      }
    };
    const handleFrequencyChange = () => {
      toggleRecurringDetails();
      updateDonationTypePreview();
      updateRecurringPreview();
    };
    donationFrequencyRadios.forEach((radio) => radio.addEventListener("change", handleFrequencyChange));
    recurringInterval?.addEventListener("change", () => {
      if (getFrequencyValue() === "recurring") updateRecurringPreview();
    });
    recurringDay?.addEventListener("change", () => {
      if (getFrequencyValue() === "recurring") updateRecurringPreview();
    });
    const updateProgressState = () => {
      const hasTarget = parseCurrencyNumber(getFieldValue(targetField)) > 0;
      const showProgress = hasTarget && !noTargetToggle?.checked;
      progressWrapper?.classList.toggle("is-hidden", !showProgress);
      if (progressText) {
        const currencyLabel = formatCurrencyValue(getFieldValue(targetField));
        progressText.textContent = showProgress ? '0% of ' + (currencyLabel || 'goal') : '0% of goal';
      }
      progressHelper?.classList.toggle("is-hidden", !noTargetToggle?.checked);
    };
    targetField?.addEventListener("input", updateProgressState);
    noTargetToggle?.addEventListener("change", updateProgressState);
    const updateTargetingMode = (value) => {
      const isCountry = value === "country";
      locationBlock?.classList.toggle("is-highlighted", isCountry);
      targetingHelper?.classList.toggle("is-hidden", !isCountry);
    };
    targetingRadios.forEach((radio) => {
      radio.addEventListener("change", () => updateTargetingMode(radio.value));
    });
    const updateEcardBadge = (show) => {
      if (!ecardBadge) return;
      ecardBadge.classList.toggle("is-hidden", !show);
    };
    const handleEcardFileChange = () => {
      const hasDesign = !!ecardInput?.files?.length;
      if (ecardStatus) {
        ecardStatus.classList.toggle("is-hidden", !hasDesign);
      }
      if (ecardPreviewBtn) ecardPreviewBtn.disabled = !hasDesign;
      if (ecardReplaceBtn) ecardReplaceBtn.disabled = !hasDesign;
      updateEcardBadge(hasDesign && !!ecardToggle?.checked);
    };
    const toggleEcardPanel = () => {
      const isActive = !!ecardToggle?.checked;
      if (ecardPanel) {
        ecardPanel.classList.toggle("is-hidden", !isActive);
        ecardPanel.setAttribute("aria-hidden", (!isActive).toString());
      }
      ecardToggle?.setAttribute("aria-expanded", isActive ? "true" : "false");
      if (isActive) {
        handleEcardFileChange();
      } else {
        updateEcardBadge(false);
        if (ecardStatus) ecardStatus.classList.add("is-hidden");
        if (ecardPreviewBtn) ecardPreviewBtn.disabled = true;
        if (ecardReplaceBtn) ecardReplaceBtn.disabled = true;
      }
    };
    ecardToggle?.addEventListener("change", toggleEcardPanel);
    ecardInput?.addEventListener("change", handleEcardFileChange);
    ecardPreviewBtn?.addEventListener("click", () => showToast("E-Card preview (demo)"));
    ecardReplaceBtn?.addEventListener("click", () => {
      if (ecardInput) ecardInput.click();
    });
    form.addEventListener("submit", (event) => {
      if (event.defaultPrevented) return;
      event.preventDefault();
      showToast("Campaign saved (demo)");
    });
    handleFrequencyChange();
    updateProgressState();
    updateTargetingMode(form.querySelector("input[name='targetingMode']:checked")?.value || "intention");
    toggleEcardPanel();
  };
  const setupDonationDetailsActions = (page) => {
    const modal = document.getElementById("refundModal");
    const form = modal?.querySelector("#refundForm");
    const closeControls = modal?.querySelectorAll("[data-modal-close]");
    const refundTriggers = page.querySelectorAll(".js-trigger-refund");

    const openModal = () => {
      modal?.classList.add("is-open");
      document.body.classList.add("is-locked");
    };

    const closeModal = () => {
      modal?.classList.remove("is-open");
      document.body.classList.remove("is-locked");
    };

    refundTriggers.forEach((trigger) => {
      trigger.addEventListener("click", openModal);
    });

    closeControls?.forEach((control) => {
      control.addEventListener("click", closeModal);
    });

    modal?.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      closeModal();
      showToast("Refund request captured.", "success");
    });

    const resendTrigger = page.querySelector(".js-resend-receipt");
    resendTrigger?.addEventListener("click", () => {
      showToast("Receipt resent to jordan@donations.org", "success");
    });
  };

  const setupDonationDetailsStickyBar = (page) => {
    const stickyBar = page.querySelector(".details-sticky-actions");
    if (!stickyBar) return;

    const refreshOffset = () => {
      const height = stickyBar.offsetHeight;
      document.documentElement.style.setProperty("--donation-sticky-offset", `${height}px`);
    };

    refreshOffset();
    setTimeout(refreshOffset, 200);
    window.addEventListener("resize", refreshOffset);
  };

  const setupDonationTimelineReveal = (page) => {
    const timeline = page.querySelector(".details-card--timeline .timeline");
    if (!timeline) return;

    const items = Array.from(timeline.querySelectorAll(".timeline-item"));
    if (!items.length) return;

    items.forEach((item, index) => {
      item.style.setProperty("--timeline-delay", `${index * 0.08}s`);
    });

    const reveal = () => {
      timeline.classList.add("is-visible");
    };

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      reveal();
      return;
    }

    requestAnimationFrame(() => {
      setTimeout(reveal, 60);
    });
  };

  /**
   * Power manual donation form behaviors, amount formatting, donor search, and summary syncing.
   * Works with `.manual-donation-page`, existing/new panels, `.donor-results__list`, `#manualAmount`, `#manualCampaign`, and `.tag-chip` selectors.
   */
  const initManualDonationPage = () => {
    // Cache the manual donation form, controls, and toast container for live feedback.
    const page = document.querySelector(".manual-donation-page");
    if (!page) return;

    const manualForm = page.querySelector(".manual-donation-form");
    if (!manualForm) return;

    const searchInput = page.querySelector("#existingDonorSearch");
    const donorResultsList = page.querySelector(".donor-results__list");
    const createNewTrigger = page.querySelector(".js-create-new-donor");
    const existingPanel = page.querySelector(".manual-donor-existing");
    const newPanel = page.querySelector(".manual-donor-new");
    const donorToggleOptions = Array.from(page.querySelectorAll(".donor-toggle__option"));
    const donorModeInputs = Array.from(page.querySelectorAll('input[name="manualDonorMode"]'));
    const newDonorFields = {
      name: page.querySelector("#newDonorName"),
      email: page.querySelector("#newDonorEmail"),
      country: page.querySelector("#newDonorCountry"),
      city: page.querySelector("#newDonorCity"),
    };
    const amountField = page.querySelector("#manualAmount");
    const currencyField = page.querySelector("#manualCurrency");
    const frequencyRadios = Array.from(page.querySelectorAll('input[name="manualFrequency"]'));
    const dateField = page.querySelector("#manualDate");
    const campaignField = page.querySelector("#manualCampaign");
    const allocationField = page.querySelector("#allocationNotes");
    const paymentMethodField = page.querySelector("#paymentMethodField");
    const referenceField = page.querySelector("#paymentReference");
    const tagChips = Array.from(page.querySelectorAll(".tag-chip"));
    const summaryAvatar = page.querySelector(".js-summary-avatar");
    const summaryDonor = page.querySelector(".js-summary-donor");
    const summaryEmail = page.querySelector(".js-summary-email");
    const summaryLocation = page.querySelector(".js-summary-location");
    const summaryAmount = page.querySelector(".js-summary-amount");
    const summaryCurrency = page.querySelector(".js-summary-currency");
    const summaryFrequency = page.querySelector(".js-summary-frequency");
    const summaryCampaign = page.querySelector(".js-summary-campaign");
    const summaryAllocation = page.querySelector(".js-summary-allocation");
    const summaryMethod = page.querySelector(".js-summary-method");
    const summaryDate = page.querySelector(".js-summary-date");
    const summaryReference = page.querySelector(".js-summary-reference");
    const summaryTags = page.querySelector(".js-summary-tags");
    const summaryStatus = page.querySelector(".js-summary-status");
    const currencySymbols = { USD: "$", EUR: "�", TRY: "?" };

    // Sample donor results used for UI stub until the backend returns real search results.
    const donors = [
      {
        id: "donor-amina",
        name: "Amina Rahman",
        email: "amina@worldhealth.org",
        city: "Nairobi, Kenya",
      },
      {
        id: "donor-mateo",
        name: "Mateo Singh",
        email: "mateo@brightfuture.org",
        city: "Seattle, USA",
      },
      {
        id: "donor-lena",
        name: "Lena Ortiz",
        email: "lena@impactallies.org",
        city: "Mexico City, Mexico",
      },
      {
        id: "donor-kai",
        name: "Kai Nakagawa",
        email: "kai@impact.bbn",
        city: "Tokyo, Japan",
      },
    ];

    let donorMode = "existing";
    let selectedDonor = null;
    let selectedDonorId = null;
    let isRecorded = false;
    const selectedTags = new Map();

    if (amountField) {
      amountField.dataset.rawValue = "";
    }

    const getInitials = (value) => {
      if (!value) return "";
      return value
        .split(" ")
        .map((part) => part.charAt(0).toUpperCase())
        .filter(Boolean)
        .slice(0, 2)
        .join("");
    };

    const sanitizeAmountValue = (value) => (value || "").toString().replace(/[^0-9.]/g, "");
    const formatAmountDisplay = (value) =>
      Number.isFinite(value) ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00";

    const getSelectedFrequencyLabel = () => {
      const radio = frequencyRadios.find((input) => input.checked);
      return radio ? radio.dataset.label || radio.value : "One-time";
    };

    const updateToggleState = () => {
      donorToggleOptions.forEach((label) => {
        const input = label.querySelector('input[name="manualDonorMode"]');
        if (!input) return;
        label.classList.toggle("is-active", input.value === donorMode);
      });
    };

    // Toggle between new and existing donor panels; purely a UI state switch for now.
    const setDonorMode = (mode) => {
      donorMode = mode;
      donorModeInputs.forEach((input) => {
        input.checked = input.value === mode;
      });
      existingPanel?.classList.toggle("is-hidden", mode !== "existing");
      newPanel?.classList.toggle("is-hidden", mode !== "new");
      updateToggleState();
      if (mode === "existing") {
        searchInput?.focus();
      } else {
        newDonorFields.name?.focus();
      }
      updateSummary();
    };

    const renderTagsSummary = () => {
      if (!summaryTags) return;
      summaryTags.innerHTML = "";
      if (!selectedTags.size) {
        const noTags = document.createElement("span");
        noTags.className = "text-muted";
        noTags.textContent = "No tags selected yet";
        summaryTags.appendChild(noTags);
        return;
      }
      selectedTags.forEach((label) => {
        const badge = document.createElement("span");
        badge.className = "badge badge--tag summary-card__tag";
        badge.textContent = label;
        summaryTags.appendChild(badge);
      });
    };

    const renderDonorResults = (filter = "") => {
      if (!donorResultsList) return;
      const term = (filter || "").toLowerCase().trim();
      const matches = donors.filter((donor) => {
        const haystack = `${donor.name} ${donor.email} ${donor.city}`.toLowerCase();
        return haystack.includes(term);
      });
      if (!matches.length) {
        donorResultsList.innerHTML = `<p class="text-muted">No matching donors</p>`;
        return;
      }
      donorResultsList.innerHTML = matches
        .map(
          (donor) => `<button type="button" class="donor-result${selectedDonorId === donor.id ? " is-selected" : ""}" data-donor-id="${donor.id}">
            <div>
              <p class="donor-result__name">${donor.name}</p>
              <p class="donor-result__meta">${donor.email} � ${donor.city}</p>
            </div>
            <span class="donor-result__badge">Existing</span>
          </button>`
        )
        .join("");
      donorResultsList.querySelectorAll(".donor-result").forEach((button) => {
        button.addEventListener("click", () => {
          const donor = donors.find((item) => item.id === button.dataset.donorId);
          if (!donor) return;
          selectedDonor = donor;
          selectedDonorId = donor.id;
          searchInput.value = donor.name;
          setDonorMode("existing");
          renderDonorResults(searchInput.value);
          updateSummary();
        });
      });
    };

    const updateSummary = () => {
      const donorName =
        (donorMode === "existing" && selectedDonor?.name) || getFieldValue(newDonorFields.name) || "New donor";
      const donorEmail = (donorMode === "existing" && selectedDonor?.email) || getFieldValue(newDonorFields.email);
      const customLocationParts = [];
      if (donorMode === "existing" && selectedDonor?.city) {
        customLocationParts.push(selectedDonor.city);
      } else {
        const city = getFieldValue(newDonorFields.city);
        const country = getFieldValue(newDonorFields.country);
        if (city) customLocationParts.push(city);
        if (country) customLocationParts.push(country);
      }
      const amountValue = Number(amountField?.dataset.rawValue || "0");
      if (summaryAvatar) {
        summaryAvatar.textContent = getInitials(donorName) || "--";
      }
      if (summaryDonor) {
        summaryDonor.textContent = donorName;
      }
      if (summaryEmail) {
        summaryEmail.textContent = donorEmail || "�";
      }
      if (summaryLocation) {
        summaryLocation.textContent = customLocationParts.length ? customLocationParts.join(", ") : "�";
      }
      if (summaryAmount) {
        summaryAmount.textContent = amountValue > 0 ? `${currencySymbols[currencyField.value] || ""}${formatAmountDisplay(amountValue)}` : "�";
      }
      if (summaryCurrency) {
        summaryCurrency.textContent = (currencyField.value || "USD").toUpperCase();
      }
      if (summaryFrequency) {
        summaryFrequency.textContent = getSelectedFrequencyLabel();
      }
      if (summaryCampaign) {
        summaryCampaign.textContent = campaignField.value
          ? campaignField.selectedOptions?.[0]?.textContent?.trim()
          : "�";
      }
      if (summaryAllocation) {
        summaryAllocation.textContent = allocationField.value.trim() || "�";
      }
      if (summaryMethod) {
        summaryMethod.textContent = paymentMethodField.value
          ? paymentMethodField.selectedOptions?.[0]?.textContent?.trim()
          : "�";
      }
      if (summaryDate) {
        summaryDate.textContent = formatPreviewDate(dateField.value) || "�";
      }
      if (summaryReference) {
        summaryReference.textContent = referenceField.value.trim() || "�";
      }
      renderTagsSummary();

      if (summaryStatus) {
        summaryStatus.textContent = isRecorded ? "Recorded" : "Draft";
        summaryStatus.classList.toggle("status-pill--success", isRecorded);
        summaryStatus.classList.toggle("status-pill--draft", !isRecorded);
      }
    };

    const clearErrorsOnInput = (event) => {
      if (!event.target) return;
      clearFieldError(event.target);
    };

    // Validate manual donation form fields client-side (backend should also verify these values).
    const validateManualForm = () => {
      let isValid = true;
      const amountValue = Number(amountField.dataset.rawValue || "0");
      if (amountValue <= 0) {
        setFieldError(amountField, "Enter an amount greater than zero.");
        isValid = false;
      }
      if (!currencyField.value) {
        setFieldError(currencyField, "Select a currency.");
        isValid = false;
      }
      if (!campaignField.value) {
        setFieldError(campaignField, "Choose a campaign.");
        isValid = false;
      }
      if (donorMode === "existing") {
        if (!selectedDonor) {
          setFieldError(searchInput, "Select an existing donor or switch to a new profile.");
          isValid = false;
        }
      } else {
        if (!getFieldValue(newDonorFields.name)) {
          setFieldError(newDonorFields.name, "Please provide a donor name.");
          isValid = false;
        }
        if (!getFieldValue(newDonorFields.email)) {
          setFieldError(newDonorFields.email, "Please provide an email.");
          isValid = false;
        }
        if (!getFieldValue(newDonorFields.city)) {
          setFieldError(newDonorFields.city, "Enter a city.");
          isValid = false;
        }
      }
      return isValid;
    };

    const handleSaveDonation = () => {
      if (!validateManualForm()) {
        const firstInvalid = manualForm.querySelector(".form-field.is-invalid");
        firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      isRecorded = true;
      showToast("Manual donation recorded successfully.", "success");
      if (summaryStatus) {
        summaryStatus.classList.remove("status-pill--draft");
        summaryStatus.classList.add("status-pill--success");
      }
      updateSummary();
    };

    const handleSaveDraft = () => {
      showToast("Draft saved. You can complete it later.", "success");
    };

    const handleTagToggle = (chip) => {
      const value = chip.dataset.tagValue;
      if (!value) return;
      const label = chip.dataset.tagLabel || chip.textContent.trim();
      const isSelected = selectedTags.has(value);
      if (isSelected) {
        selectedTags.delete(value);
        chip.classList.remove("is-selected");
        chip.setAttribute("aria-pressed", "false");
      } else {
        selectedTags.set(value, label);
        chip.classList.add("is-selected");
        chip.setAttribute("aria-pressed", "true");
      }
      updateSummary();
    };

    const handleSearchInput = (event) => {
      selectedDonor = null;
      selectedDonorId = null;
      renderDonorResults(event.target.value);
      updateSummary();
    };

    manualForm.addEventListener("submit", (event) => {
      event.preventDefault();
    });
    manualForm.addEventListener("input", clearErrorsOnInput);

    amountField?.addEventListener("input", (event) => {
      const sanitized = sanitizeAmountValue(event.target.value);
      event.target.dataset.rawValue = sanitized;
      event.target.value = sanitized;
      updateSummary();
    });
    amountField?.addEventListener("focus", () => {
      amountField.value = amountField.dataset.rawValue || "";
    });
    amountField?.addEventListener("blur", () => {
      const raw = Number(amountField.dataset.rawValue || "0");
      amountField.value = raw > 0 ? formatAmountDisplay(raw) : "";
    });

    currencyField?.addEventListener("change", updateSummary);
    frequencyRadios.forEach((radio) => {
      radio.addEventListener("change", updateSummary);
    });
    dateField?.addEventListener("change", updateSummary);
    campaignField?.addEventListener("change", updateSummary);
    allocationField?.addEventListener("input", updateSummary);
    paymentMethodField?.addEventListener("change", updateSummary);
    referenceField?.addEventListener("input", updateSummary);

    tagChips.forEach((chip) => {
      chip.addEventListener("click", () => handleTagToggle(chip));
    });

    donorModeInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (input.checked) {
          setDonorMode(input.value);
        }
      });
    });

    createNewTrigger?.addEventListener("click", () => setDonorMode("new"));

    searchInput?.addEventListener("input", handleSearchInput);

    const saveButtons = page.querySelectorAll(".js-save-donation");
    saveButtons.forEach((button) => button.addEventListener("click", handleSaveDonation));
    const draftButtons = page.querySelectorAll(".js-save-draft");
    draftButtons.forEach((button) => button.addEventListener("click", handleSaveDraft));

    if (dateField) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      dateField.value = `${year}-${month}-${day}`;
    }


    setDonorMode("existing");
    renderDonorResults();
    updateSummary();
  };

  /**
   * Build the donor giving area chart (monthly donations) with placeholder data from `categories`/`seriesData`.
   * Uses ApexCharts and will later consume backend-provided investment data.
   */
  const buildDonorGivingChart = () => {
    const chartEl = document.querySelector("#donor-giving-chart");
    if (!chartEl || typeof ApexCharts === "undefined") return;

    if (donorGivingChart) {
      unregisterOverviewChart(donorGivingChart);
      donorGivingChart.destroy();
    }

    const palette = chartPalette();
    const themeOptions = getApexThemeOptions(getTheme());
    const categories = [
      "Sep 2024",
      "Oct 2024",
      "Nov 2024",
      "Dec 2024",
      "Jan 2025",
      "Feb 2025",
      "Mar 2025",
      "Apr 2025",
      "May 2025",
      "Jun 2025",
      "Jul 2025",
      "Aug 2025",
    ];
    const seriesData = [420, 560, 480, 620, 710, 520, 830, 910, 870, 960, 1100, 1280];

    const options = {
      theme: themeOptions.theme,
      chart: {
        ...themeOptions.chart,
        type: "area",
        height: 280,
        toolbar: { show: false },
      },
      colors: [palette.primary],
      series: [
        {
          name: "Donations",
          data: seriesData,
        },
      ],
      stroke: {
        curve: "smooth",
        width: 3,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          inverseColors: false,
          opacityFrom: 0.7,
          opacityTo: 0.05,
          stops: [0, 80, 100],
        },
      },
      grid: {
        borderColor: themeOptions.borderColor,
        strokeDashArray: 3,
      },
      xaxis: {
        categories,
        axisBorder: { color: themeOptions.borderColor },
        axisTicks: { color: themeOptions.borderColor },
        labels: {
          style: { colors: themeOptions.labelColor },
        },
      },
      yaxis: {
        labels: {
          style: { colors: themeOptions.labelColor },
        },
      },
      tooltip: {
        ...themeOptions.tooltip,
        y: {
          formatter: (value) => `$${value.toLocaleString()}`,
        },
      },
      dataLabels: { enabled: false },
    };

    donorGivingChart = registerOverviewChart(new ApexCharts(chartEl, options));
    donorGivingChart.render();
  };

  /**
   * Filter donor history rows by status or recurring flag on the donor details page.
   * Targets `.donor-history-filter` buttons and `.donation-history-table` rows with `data-history-*`.
   */
  const initDonorHistoryFilters = (page) => {
    const filterButtons = Array.from(page.querySelectorAll(".donor-history-filter"));
    const rows = Array.from(page.querySelectorAll(".donation-history-table tbody tr"));
    if (!filterButtons.length || !rows.length) return;

    const applyFilter = (filter) => {
      rows.forEach((row) => {
        const status = (row.dataset.historyStatus || "").toLowerCase();
        const recurring = row.dataset.historyRecurring === "true";
        let show = true;
        if (filter && filter !== "all") {
          if (filter === "recurring") {
            show = recurring;
          } else {
            show = status === filter.toLowerCase();
          }
        }
        row.classList.toggle("is-hidden", !show);
      });
    };

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((btn) => btn.classList.remove("is-active"));
        button.classList.add("is-active");
        const filter = button.dataset.filter || "all";
        applyFilter(filter);
      });
    });

    applyFilter("all");
  };

  /**
   * Toggle donor segment chips, allow custom tags/levels, and keep UI toggles on the donor details page.
   * Expects `.donor-segments-card__chips` with `.tag-chip` children and optional `#customTagInput`.
   */
  const initDonorSegments = (page) => {
    const chipsContainer = page.querySelector(".donor-segments-card__chips");
    const tagInput = page.querySelector("#customTagInput");
    const addTagButton = page.querySelector(".js-add-custom-tag");
    if (!chipsContainer) return;

    const toggleChip = (chip) => {
      chip.classList.toggle("is-selected");
    };

    chipsContainer.addEventListener("click", (event) => {
      const chip = event.target.closest(".tag-chip");
      if (!chip) return;
      toggleChip(chip);
    });

    const createChip = (label) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "tag-chip is-selected";
      chip.textContent = label;
      return chip;
    };

    const addCustomTag = () => {
      const value = (tagInput?.value || "").trim();
      if (!value) return;
      const existing = Array.from(chipsContainer.querySelectorAll(".tag-chip")).some(
        (chip) => chip.textContent.trim().toLowerCase() === value.toLowerCase()
      );
      if (existing) {
        tagInput.value = "";
        return;
      }
      const chip = createChip(value);
      chipsContainer.appendChild(chip);
      tagInput.value = "";
    };

    addTagButton?.addEventListener("click", addCustomTag);
    tagInput?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addCustomTag();
      }
    });
  };

  /**
   * Initialize donor profile tabs, giving chart, history filters, segments, and timeline reveal for the donor details page.
   * Requires `.donor-details-page`, `#donor-giving-chart`, and table/list data attributes for history.
   */
  const initDonorDetailsPage = () => {
    // Bind donor profile tabs, actions, and timeline components.
    const page = document.querySelector(".donor-details-page");
    if (!page) return;
    buildDonorGivingChart();
    initDonorHistoryFilters(page);
    initDonorSegments(page);
    setupDonationTimelineReveal(page);
  };

  /**
   * Drive the new donor intake form, including type toggles, chips, preference summary, and client-side validation/preview cards.
   * Expects `.donor-new-page` with `.donor-new-form`, tag/interest/giving chips, and the `.donor-preview-card` markup.
   */
  const initDonorNewPage = () => {
    // Manage the new donor intake form, preview, and validation helpers.
    const page = document.querySelector(".donor-new-page");
    if (!page) return;
    const form = page.querySelector(".donor-new-form");
    if (!form) return;

    const donorTypeOptions = Array.from(form.querySelectorAll(".donor-type-toggle__option"));
    const donorTypeInputs = Array.from(form.querySelectorAll('input[name="donorType"]'));
    const individualFields = form.querySelector(".donor-type-fields--individual");
    const organizationFields = form.querySelector(".donor-type-fields--organization");
    const firstNameField = form.querySelector("#donorFirstName");
    const lastNameField = form.querySelector("#donorLastName");
    const orgNameField = form.querySelector("#donorOrgName");
    const emailField = form.querySelector("#donorEmail");
    const phoneField = form.querySelector("#donorPhone");
    const countryField = form.querySelector("#donorCountry");
    const cityField = form.querySelector("#donorCity");
    const timezoneField = form.querySelector("#donorTimezone");
    const languageField = form.querySelector("#donorLanguage");
    const tagChips = Array.from(form.querySelectorAll(".js-donor-tag"));
    const interestChips = Array.from(form.querySelectorAll(".js-donor-interest"));
    const givingChips = Array.from(form.querySelectorAll(".js-donor-giving"));
    const preferenceInputs = Array.from(form.querySelectorAll('input[name="communicationPreferences"]'));
    const dncInput = form.querySelector('input[data-pref="doNotContact"]');
    const preferencesGrid = form.querySelector(".preferences-grid");
    const previewCard = page.querySelector(".donor-preview-card");
    const previewAvatar = previewCard?.querySelector("[data-preview-avatar]");
    const previewName = previewCard?.querySelector("[data-preview-name]");
    const previewType = previewCard?.querySelector("[data-preview-type]");
    const previewStatus = previewCard?.querySelector("[data-preview-status]");
    const previewEmail = previewCard?.querySelector("[data-preview-email]");
    const previewPhone = previewCard?.querySelector("[data-preview-phone]");
    const previewLocation = previewCard?.querySelector("[data-preview-location]");
    const previewTimezone = previewCard?.querySelector("[data-preview-timezone]");
    const previewLanguage = previewCard?.querySelector("[data-preview-language]");
    const previewInterests = previewCard?.querySelector("[data-preview-interests]");
    const previewTags = previewCard?.querySelector("[data-preview-tags]");
    const previewGiving = previewCard?.querySelector("[data-preview-giving-level]");
    const previewDncPill = previewCard?.querySelector("[data-preview-dnc]");
    const selectedTags = new Map();
    const selectedInterests = new Map();
    let selectedGivingLevel = "";

    const getSelectedDonorType = () => donorTypeInputs.find((input) => input.checked)?.value || "individual";

    const deriveInitials = (value) => {
      if (!value) return "ND";
      const parts = value
        .split(" ")
        .map((part) => part.charAt(0).toUpperCase())
        .filter(Boolean);
      const initials = parts.slice(0, 2).join("");
      return initials || "ND";
    };

    const formatSelectText = (select) =>
      select?.selectedOptions?.[0]?.textContent?.trim() || "";

    const updateDonorTypeDisplay = (type) => {
      donorTypeOptions.forEach((option) => {
        const input = option.querySelector('input[name="donorType"]');
        const isActive = input?.value === type;
        option.classList.toggle("is-active", isActive);
        if (isActive && input) {
          input.checked = true;
        }
      });
      const isIndividual = type !== "organization";
      individualFields?.classList.toggle("is-hidden", !isIndividual);
      organizationFields?.classList.toggle("is-hidden", isIndividual);
    };

    const getDisplayName = () => {
      const type = getSelectedDonorType();
      if (type === "organization") {
        return getFieldValue(orgNameField) || "New donor";
      }
      const first = getFieldValue(firstNameField);
      const last = getFieldValue(lastNameField);
      if (first || last) {
        return `${first} ${last}`.trim();
      }
      return "New donor";
    };

    const updateHeaderPreview = () => {
      const type = getSelectedDonorType();
      const name = getDisplayName();
      if (previewName) {
        previewName.textContent = name;
      }
      if (previewType) {
        previewType.textContent = type === "organization" ? "Organization" : "Individual";
      }
      if (previewAvatar) {
        previewAvatar.textContent = deriveInitials(name);
      }
    };

    const updateContactPreview = () => {
      const email = getFieldValue(emailField);
      if (previewEmail) {
        previewEmail.textContent = email || "Not set yet";
      }
      const phone = getFieldValue(phoneField);
      if (previewPhone) {
        previewPhone.textContent = phone || "Not set yet";
      }
    };

    const updateLocationPreview = () => {
      const city = getFieldValue(cityField);
      const country = getFieldValue(countryField);
      const locationText = [city, country].filter(Boolean).join(", ") || "Not set yet";
      if (previewLocation) {
        previewLocation.textContent = locationText;
      }
      const timezoneText = formatSelectText(timezoneField) || "Select time zone";
      if (previewTimezone) {
        previewTimezone.textContent = timezoneText;
      }
      const languageText = formatSelectText(languageField) || "Select language";
      if (previewLanguage) {
        previewLanguage.textContent = languageText;
      }
    };

    const updatePreferenceSummary = () => {
      const isDoNotContact = Boolean(dncInput?.checked);
      preferencesGrid?.classList.toggle("is-muted", isDoNotContact);
      previewCard?.classList.toggle("donor-preview-card--no-contact", isDoNotContact);
      previewDncPill?.classList.toggle("is-hidden", !isDoNotContact);
    };

    const updateTagPreview = () => {
      if (!previewTags) return;
      previewTags.innerHTML = "";
      if (!selectedTags.size) {
        previewTags.innerHTML = `<span class="preview-empty">No tags selected.</span>`;
        return;
      }
      selectedTags.forEach((label) => {
        const badge = document.createElement("span");
        badge.className = "badge badge--tag";
        badge.textContent = label;
        previewTags.appendChild(badge);
      });
    };

    const updateInterestPreview = () => {
      if (!previewInterests) return;
      previewInterests.innerHTML = "";
      if (!selectedInterests.size) {
        previewInterests.innerHTML = `<span class="preview-empty">No interests added yet.</span>`;
        return;
      }
      selectedInterests.forEach((label) => {
        const chip = document.createElement("span");
        chip.className = "preview-pill preview-pill--active";
        chip.textContent = label;
        previewInterests.appendChild(chip);
      });
    };

    const updateGivingPreview = () => {
      if (!previewGiving) return;
      previewGiving.textContent = selectedGivingLevel || "Not set";
      previewGiving.classList.toggle("preview-pill--active", Boolean(selectedGivingLevel));
      previewGiving.classList.toggle("preview-pill--muted", !selectedGivingLevel);
    };

    const refreshPreview = () => {
      updateHeaderPreview();
      updateContactPreview();
      updateLocationPreview();
      updatePreferenceSummary();
      updateGivingPreview();
      updateInterestPreview();
      updateTagPreview();
    };

    const toggleTag = (chip) => {
      const value = chip.dataset.tagValue;
      if (!value) return;
      const label = chip.dataset.tagLabel || chip.textContent.trim();
      const wasSelected = selectedTags.has(value);
      if (wasSelected) {
        selectedTags.delete(value);
        chip.classList.remove("is-selected");
        chip.setAttribute("aria-pressed", "false");
      } else {
        selectedTags.set(value, label);
        chip.classList.add("is-selected");
        chip.setAttribute("aria-pressed", "true");
      }
      refreshPreview();
    };

    const toggleInterest = (chip) => {
      const value = chip.dataset.interestValue;
      if (!value) return;
      const label = chip.textContent.trim() || value;
      const wasSelected = selectedInterests.has(value);
      if (wasSelected) {
        selectedInterests.delete(value);
        chip.classList.remove("is-selected");
        chip.setAttribute("aria-pressed", "false");
      } else {
        selectedInterests.set(value, label);
        chip.classList.add("is-selected");
        chip.setAttribute("aria-pressed", "true");
      }
      refreshPreview();
    };

    const selectGivingLevel = (chip) => {
      const level = chip.dataset.givingLevel;
      if (!level) return;
      selectedGivingLevel = level;
      givingChips.forEach((button) => {
        const isActive = button === chip;
        button.classList.toggle("is-selected", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
      refreshPreview();
    };

    const validateDonorForm = () => {
      let isValid = true;
      const type = getSelectedDonorType();
      if (type === "organization") {
        if (!getFieldValue(orgNameField)) {
          setFieldError(orgNameField, "Please add an organization name.");
          isValid = false;
        }
      } else {
        if (!getFieldValue(firstNameField)) {
          setFieldError(firstNameField, "Please add a first name.");
          isValid = false;
        }
        if (!getFieldValue(lastNameField)) {
          setFieldError(lastNameField, "Please add a last name.");
          isValid = false;
        }
      }
      if (!getFieldValue(emailField)) {
        setFieldError(emailField, "Please add an email.");
        isValid = false;
      }
      return isValid;
    };

    const handleSaveDonor = (event) => {
      if (event) {
        event.preventDefault();
      }
      if (!validateDonorForm()) {
        const firstInvalid = form.querySelector(".form-field.is-invalid");
        firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      showToast("Donor profile created.", "success");
      if (previewStatus) {
        previewStatus.textContent = "Active";
        previewStatus.classList.remove("status-pill--draft");
        previewStatus.classList.add("status-pill--active");
      }
      // TODO: send data to API; e.g. window.location.href = "donors.html";
    };

    const handleSaveDraft = (event) => {
      event?.preventDefault();
      showToast("Draft saved. You can complete it later.", "success");
    };

    donorTypeInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (input.checked) {
          updateDonorTypeDisplay(input.value);
          refreshPreview();
        }
      });
    });

    tagChips.forEach((chip) => {
      chip.addEventListener("click", () => toggleTag(chip));
    });

    interestChips.forEach((chip) => {
      chip.addEventListener("click", () => toggleInterest(chip));
    });

    givingChips.forEach((chip) => {
      chip.addEventListener("click", () => selectGivingLevel(chip));
    });

    preferenceInputs.forEach((input) => {
      input.addEventListener("change", refreshPreview);
    });

    form.addEventListener("input", (event) => {
      if (!(event.target instanceof HTMLElement)) return;
      clearFieldError(event.target);
      refreshPreview();
    });

    form.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      clearFieldError(target);
      refreshPreview();
    });


    form.addEventListener("submit", handleSaveDonor);

    const externalSaveButtons = Array.from(page.querySelectorAll(".js-save-donor")).filter(
      (button) => !form.contains(button)
    );
    externalSaveButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        form.requestSubmit();
      });
    });

    const draftButtons = Array.from(page.querySelectorAll(".js-save-draft"));
    draftButtons.forEach((button) => {
      button.addEventListener("click", handleSaveDraft);
    });

    updateDonorTypeDisplay(getSelectedDonorType());
    refreshPreview();
  };

  /**
   * Manage the inbox, conversation switching, mobile layout, template replies, and compose drawer on the messages page.
   * Works with `.messages-page`, `[data-conversation-id]` / `[data-thread-id]` attributes,
   * the `.messages-layout` container that shows threads vs. list, and template text selectors (#compose-template).
   */
  const initMessagesPage = () => {
    // Collect messaging pane nodes, inbox list, and thread controls for updates.
    const page = document.querySelector(".messages-page");
    if (!page) return;
    const layout = page.querySelector(".messages-layout");
    if (!layout) return;

    const folderButtons = Array.from(page.querySelectorAll(".messages-folder"));
    const filterButtons = Array.from(page.querySelectorAll(".messages-filter"));
    const conversationItems = Array.from(page.querySelectorAll(".conversation-item"));
    const conversationButtons = Array.from(page.querySelectorAll(".conversation-item__button"));
    const threads = Array.from(page.querySelectorAll(".thread"));
    const backButtons = Array.from(page.querySelectorAll("[data-thread-back]"));
    const foldersPanel = page.querySelector("[data-folders-panel]");
    const foldersToggle = page.querySelector("[data-folders-toggle]");

    const isMobile = () => window.innerWidth <= 1024;

    const toggleGroup = (buttons, activeButton) => {
      buttons.forEach((button) => {
        const isActive = button === activeButton;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    };

    const activateLayoutForMobile = () => {
      if (isMobile()) {
        layout.classList.add("show-thread");
      }
    };

    const setActiveConversation = (item, { markAsRead = true } = {}) => {
      if (!item) return;
      const conversationId = item.dataset.conversationId;
      if (!conversationId) return;
      conversationItems.forEach((conversation) => conversation.classList.remove("is-active"));
      item.classList.add("is-active");
      if (markAsRead) {
        item.classList.remove("is-unread");
      }
      threads.forEach((thread) => {
        thread.classList.toggle("thread--active", thread.dataset.threadId === conversationId);
      });
      activateLayoutForMobile();
    };

    conversationButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const parent = button.closest(".conversation-item");
        if (!parent) return;
        setActiveConversation(parent);
      });
    });

    const initialConversation =
      conversationItems.find((item) => item.classList.contains("is-active")) || conversationItems[0];
    if (initialConversation) {
      setActiveConversation(initialConversation, { markAsRead: false });
    }

    const searchInput = page.querySelector("#messages-search");
    searchInput?.addEventListener("input", (event) => {
      const query = (event.target.value || "").trim().toLowerCase();
      conversationItems.forEach((item) => {
        const haystack = item.textContent?.toLowerCase() || "";
        const matches = !query || haystack.includes(query);
        item.classList.toggle("is-hidden", !matches);
      });
    });

    folderButtons.forEach((button) => {
      button.addEventListener("click", () => toggleGroup(folderButtons, button));
    });

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => toggleGroup(filterButtons, button));
    });

    backButtons.forEach((button) => {
      button.addEventListener("click", () => {
        layout.classList.remove("show-thread");
      });
    });

    foldersToggle?.addEventListener("click", () => {
      if (!foldersPanel) return;
      const isOpen = foldersPanel.classList.toggle("is-open");
      foldersToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    const handleResize = () => {
      if (!isMobile()) {
        layout.classList.remove("show-thread");
      }
    };

    window.addEventListener("resize", handleResize);

    // Template replies are hard-coded strings until backend message templating is integrated.
    const templateText = "Thank you for your generous support. I will follow up shortly with the details.";
    const replyForms = Array.from(page.querySelectorAll("[data-thread-reply]"));
    replyForms.forEach((form) => {
      const textarea = form.querySelector(".thread-reply__textarea");
      const templateButton = form.querySelector("[data-insert-template]");

      templateButton?.addEventListener("click", () => {
        if (!textarea) return;
        textarea.value = templateText;
        textarea.focus();
      });

      form?.addEventListener("submit", (event) => {
        event.preventDefault();
        if (textarea) {
          textarea.value = "";
        }
      });
    });

    const composePanel = page.querySelector(".compose-panel");
    const composeBody = page.querySelector("#compose-body");
    const composeTemplate = page.querySelector("#compose-template");
    const composeForm = page.querySelector(".compose-form");

    if (composePanel) {
      const openButtons = page.querySelectorAll("[data-open-compose]");
      const closeButtons = composePanel.querySelectorAll("[data-compose-close]");

      const openCompose = () => {
        composePanel.classList.add("is-open");
        composePanel.setAttribute("aria-hidden", "false");
        if (composeBody) composeBody.focus();
      };

      const closeCompose = () => {
        composePanel.classList.remove("is-open");
        composePanel.setAttribute("aria-hidden", "true");
      };

      openButtons.forEach((button) => button.addEventListener("click", openCompose));
      closeButtons.forEach((button) => button.addEventListener("click", closeCompose));

      const handleEscape = (event) => {
        if (event.key === "Escape" && composePanel.classList.contains("is-open")) {
          closeCompose();
        }
      };

      document.addEventListener("keydown", handleEscape);
    }

    if (composeTemplate && composeBody) {
      composeTemplate.addEventListener("change", function () {
        let text = "";
        switch (this.value) {
          case "thankyou":
            text = "Thank you for your generous donation. We truly appreciate your support.";
            break;
          case "failed":
            text =
              "We noticed an issue processing your recent donation. Could you please confirm your payment details or preferred method?";
            break;
          case "recurring":
            text =
              "We can help you adjust your recurring gift. Let us know if you would like to increase, decrease, or pause it.";
            break;
          case "update":
            text =
              "Here is a quick update on the impact your support is making on our latest campaign...";
            break;
          default:
            text = "";
        }

        if (text) {
          composeBody.value = text;
          composeBody.focus();
        }
      });
    }

    if (composeForm) {
      composeForm.addEventListener("submit", function (event) {
        event.preventDefault();
        // Placeholder submit handler; backend will handle actual sending later.
      });
    }
  };

  /**
   * Wire settings navigation tabs, theme preview text, and preference radio toggles without saving to backend.
   * Targets `.settings-page`, `.settings-nav__item`, `.settings-panel`, and theme radio inputs.
   */
  const initSettingsPage = () => {
    if (window.SettingsManager && typeof window.SettingsManager.init === "function") {
      window.SettingsManager.init();
    }
  };

  // Map backend role identifiers to the default permission checkboxes currently shown in the UI.
  // These defaults live purely on the client and mirror the policies the real API will enforce after integration.
  const ROLE_DEFAULT_PERMS = {
    admin: [
      "campaigns.view",
      "campaigns.edit",
      "donations.view",
      "donations.refund",
      "donors.view",
      "donors.edit",
      "messages.send",
      "messages.bulk",
      "finance.view",
      "finance.reconcile",
      "finance.payouts",
      "settings.general",
      "settings.integrations",
      "team.manage",
      "security.view-audit",
    ],
    manager: [
      "campaigns.view",
      "campaigns.edit",
      "donations.view",
      "donors.view",
      "messages.send",
    ],
    finance: ["donations.view", "finance.view", "finance.reconcile", "finance.payouts"],
    support: ["donors.view", "messages.send"],
    viewer: ["campaigns.view", "donations.view", "donors.view"],
  };

  /**
   * Coordinate the team page panels, invite drawer, filters, action dropdowns, and role permissions toggles.
   * Requires `.team-page`, `.team-member-row`, `.team-member-panel`, role lists (`data-role-panel`), invite panel controls, and filter selects.
   * Role defaults and permission checkboxes mirror ROLE_DEFAULT_PERMS for the UI; backend enforcement is planned later.
   */
  const initTeamPage = () => {
    // Coordinate team member panels, action menus, and invite drawer behaviors.
    const root = document.querySelector(".team-page");
    if (!root) return;

    const tabs = root.querySelectorAll(".team-tab");
    const panels = root.querySelectorAll(".team-panel");
    const memberRows = Array.from(root.querySelectorAll(".team-member-row"));
    const memberCards = Array.from(root.querySelectorAll("[data-member-panel]"));
    const panel = root.querySelector(".team-member-panel");
    const panelBackdrop = panel?.querySelector("[data-panel-backdrop]");
    const panelClose = panel?.querySelector("[data-panel-close]");
    const panelTitle = panel?.querySelector("[data-panel-title]");
    const panelEmail = panel?.querySelector("[data-panel-email]");

    const filterSelects = Array.from(root.querySelectorAll(".team-filter select"));
    const filterSelectsByName = new Map();
    const chipContainer = root.querySelector(".team-filter-chips");
    const chipList = root.querySelector(".team-filter-chip-list");
    const chipLabel = root.querySelector(".team-filter-chips__label");
    const clearFiltersBtn = root.querySelector("[data-clear-filters]");
    const activeFilters = new Map();

    const actionDropdowns = Array.from(root.querySelectorAll(".more-actions-dropdown"));
    let openActionDropdown = null;
    const roleItems = Array.from(root.querySelectorAll(".roles-list__item"));
    const rolePanels = Array.from(root.querySelectorAll("[data-role-panel]"));
    const permToggleButtons = Array.from(root.querySelectorAll("[data-perm-toggle-group]"));
    const memberActionToggles = Array.from(root.querySelectorAll("[data-member-action-toggle]"));
    const memberActionMenus = Array.from(root.querySelectorAll("[data-member-action-menu]"));
    let openMemberActionMenu = null;

    const invitePanel = document.querySelector(".invite-panel");
    const inviteModeButtons = invitePanel ? Array.from(invitePanel.querySelectorAll("[data-invite-mode]")) : [];
    const inviteForm = invitePanel?.querySelector(".invite-form");
    const inviteRole = invitePanel?.querySelector("#invite-role");
    const inviteEmail = invitePanel?.querySelector("#invite-email");
    const invitePreviewRole = invitePanel?.querySelector("[data-preview-role]");
    const invitePreviewEmail = invitePanel?.querySelector("[data-preview-email]");
    const invitePreviewScopes = invitePanel?.querySelector("[data-preview-scopes]");
    const inviteScopeInputs = invitePanel ? Array.from(invitePanel.querySelectorAll("input[name=\"inviteScope\"]")) : [];

    const isTabletOrSmaller = () => window.innerWidth <= 1024;

    const activateTab = (id) => {
      tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.teamTab === id));
      panels.forEach((panelElement) =>
        panelElement.classList.toggle("team-panel--active", panelElement.dataset.teamPanel === id)
      );
    };

    const updatePanelHeader = (row) => {
      if (!row) return;
      if (panelTitle) panelTitle.textContent = row.dataset.memberName || "";
      if (panelEmail) panelEmail.textContent = row.dataset.memberEmail || "";
    };

    const openMemberPanel = () => {
      if (!panel) return;
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
    };

    const closeMemberPanel = () => {
      if (!panel) return;
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
    };

    const setActiveMember = (id, rowRef) => {
      if (!id) return;
      const targetRow = rowRef || memberRows.find((row) => row.dataset.memberId === id);
      memberRows.forEach((row) => row.classList.toggle("is-active", row.dataset.memberId === id));
      memberCards.forEach((card) => card.classList.toggle("is-active", card.dataset.memberPanel === id));
      updatePanelHeader(targetRow);
      openMemberPanel();
    };

    const renderFilterChips = () => {
      if (!chipList || !chipContainer) return;
      chipList.innerHTML = "";
      const hasFilters = activeFilters.size > 0;
      chipContainer.classList.toggle("is-empty", !hasFilters);
      if (chipLabel) chipLabel.setAttribute("aria-hidden", hasFilters ? "false" : "true");
      if (clearFiltersBtn) clearFiltersBtn.disabled = !hasFilters;

      activeFilters.forEach((meta, key) => {
        const chip = document.createElement("span");
        chip.className = "team-filter-chip";
        chip.dataset.filterChip = key;
        chip.textContent = `${meta.label}: ${meta.displayValue}`;
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "team-filter-chip-remove";
        removeBtn.setAttribute("aria-label", `Remove ${meta.label} filter`);
        removeBtn.textContent = "?";
        removeBtn.addEventListener("click", () => {
          const select = filterSelectsByName.get(key);
          if (select) {
            select.value = select.dataset.defaultValue || "all";
            handleFilterChange(select);
          }
        });
        chip.appendChild(removeBtn);
        chipList.appendChild(chip);
      });
    };

    const handleFilterChange = (select) => {
      const name = select.dataset.filterName;
      if (!name) return;
      const label = select.dataset.filterLabel || select.name || name;
      const defaultValue = select.dataset.defaultValue || "all";
      if (select.value === defaultValue) {
        activeFilters.delete(name);
      } else {
        const displayValue = select.options[select.selectedIndex]?.textContent.trim() || select.value;
        activeFilters.set(name, { label, displayValue, value: select.value });
      }
      renderFilterChips();
    };

    const resetFilters = () => {
      filterSelects.forEach((select) => {
        const defaultValue = select.dataset.defaultValue || "all";
        select.value = defaultValue;
      });
      activeFilters.clear();
      renderFilterChips();
    };

    const closeActionDropdowns = () => {
      actionDropdowns.forEach((dropdown) => {
        dropdown.classList.remove("is-open");
        const toggle = dropdown.querySelector("[data-action-toggle]");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      });
      openActionDropdown = null;
    };

    const toggleActionDropdown = (dropdown) => {
      const toggle = dropdown.querySelector("[data-action-toggle]");
      if (!toggle) return;
      const shouldOpen = !dropdown.classList.contains("is-open");
      closeActionDropdowns();
      if (shouldOpen) {
        dropdown.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
        openActionDropdown = dropdown;
      }
    };

    const updateInvitePreview = () => {
      if (invitePreviewRole && inviteRole) {
        const label = inviteRole.selectedOptions[0]?.textContent.trim() || "Manager";
        invitePreviewRole.textContent = `Role: ${label}`;
      }
      if (invitePreviewEmail) {
        const emailValue = inviteEmail?.value.trim() || "name@organization.org";
        invitePreviewEmail.textContent = `Email: ${emailValue}`;
      }
      if (invitePreviewScopes) {
        invitePreviewScopes.innerHTML = "";
        const selections = inviteScopeInputs
          .filter((input) => input.checked)
          .map((input) => input.closest("label")?.textContent.trim() || input.value);
        if (!selections.length) {
          const placeholder = document.createElement("li");
          placeholder.textContent = "Default workspace access";
          invitePreviewScopes.appendChild(placeholder);
        } else {
          selections.forEach((text) => {
            const item = document.createElement("li");
            item.textContent = text;
            invitePreviewScopes.appendChild(item);
          });
        }
      }
    };

    const setInviteMode = (mode) => {
      if (!inviteForm) return;
      const isAdvanced = mode === "advanced";
      inviteForm.classList.toggle("is-advanced", isAdvanced);
      inviteModeButtons.forEach((button) => {
        const isActive = button.dataset.inviteMode === mode;
        button.classList.toggle("is-active", isActive);
      });
      updateInvitePreview();
    };

    const openInvitePanel = () => {
      if (!invitePanel) return;
      invitePanel.classList.add("is-open");
      invitePanel.setAttribute("aria-hidden", "false");
      inviteEmail?.focus();
    };

    const closeInvitePanel = () => {
      if (!invitePanel) return;
      invitePanel.classList.remove("is-open");
      invitePanel.setAttribute("aria-hidden", "true");
    };

    const handleDocumentClick = (event) => {
      if (panel && panel.classList.contains("is-open") && isTabletOrSmaller()) {
        const target = event.target;
        if (!target.closest(".team-member-panel") && !target.closest(".team-member-row__button")) {
          closeMemberPanel();
        }
      }
      if (openActionDropdown && !event.target.closest(".more-actions-dropdown")) {
        closeActionDropdowns();
      }
      if (openMemberActionMenu && !event.target.closest("[data-member-actions]")) {
        closeMemberActionMenus();
      }
    };

    const applyRolePermissions = (roleId) => {
      if (!roleId) return;
      const panel = rolePanels.find((rolePanel) => rolePanel.dataset.rolePanel === roleId);
      if (!panel) return;
      const allowed = new Set(ROLE_DEFAULT_PERMS[roleId] || []);
      panel.querySelectorAll("input[data-perm-key]").forEach((input) => {
        const key = input.dataset.permKey;
        input.checked = !!allowed.has(key);
      });
    };

    const setActiveRole = (roleId) => {
      if (!roleId) return;
      roleItems.forEach((item) => {
        item.classList.toggle("is-active", item.dataset.roleId === roleId);
      });
      rolePanels.forEach((panelElement) => {
        panelElement.classList.toggle("is-active", panelElement.dataset.rolePanel === roleId);
      });
      applyRolePermissions(roleId);
    };

    const handlePermToggle = (button) => {
      const section = button.closest(".perm-section");
      if (!section) return;
      const inputs = Array.from(section.querySelectorAll("input[data-perm-key]"));
      if (!inputs.length) return;
      const shouldCheck = inputs.some((input) => !input.checked);
      inputs.forEach((input) => {
        input.checked = shouldCheck;
      });
    };

    const closeMemberActionMenus = () => {
      memberActionMenus.forEach((menu) => menu.classList.remove("is-open"));
      memberActionToggles.forEach((toggle) => toggle.setAttribute("aria-expanded", "false"));
      openMemberActionMenu = null;
    };

    const toggleMemberActionMenu = (toggle) => {
      if (!toggle) return;
      const menuId = toggle.getAttribute("aria-controls");
      const menu =
        (menuId ? root.querySelector(`#${menuId}`) : null) ||
        toggle.nextElementSibling;
      if (!menu) return;
      const isOpen = menu.classList.contains("is-open");
      closeMemberActionMenus();
      if (!isOpen) {
        menu.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
        openMemberActionMenu = menu;
      }
    };

    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      closeMemberPanel();
      closeInvitePanel();
      closeActionDropdowns();
    };

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const id = tab.dataset.teamTab;
        if (id) activateTab(id);
      });
    });

    memberRows.forEach((row) => {
      const button = row.querySelector(".team-member-row__button");
      button?.addEventListener("click", (event) => {
        event.stopPropagation();
        const id = row.dataset.memberId;
        setActiveMember(id, row);
      });
    });

    filterSelects.forEach((select) => {
      const name = select.dataset.filterName;
      if (name) {
        filterSelectsByName.set(name, select);
      }
      select.addEventListener("change", () => handleFilterChange(select));
    });

    clearFiltersBtn?.addEventListener("click", (event) => {
      event.preventDefault();
      resetFilters();
    });

    actionDropdowns.forEach((dropdown) => {
      const toggle = dropdown.querySelector("[data-action-toggle]");
      if (!toggle) return;
      toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleActionDropdown(dropdown);
      });
    });

    roleItems.forEach((item) => {
      const button = item.querySelector(".roles-list__button");
      button?.addEventListener("click", () => {
        const id = item.dataset.roleId;
        if (id) setActiveRole(id);
      });
    });

    permToggleButtons.forEach((button) => {
      button.addEventListener("click", () => {
        handlePermToggle(button);
      });
    });

    memberActionToggles.forEach((toggle) => {
      toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleMemberActionMenu(toggle);
      });
    });

    memberActionMenus.forEach((menu) => {
      menu.addEventListener("click", (event) => {
        const actionTarget = event.target.closest("[data-member-action]");
        if (actionTarget) {
          closeMemberActionMenus();
        }
      });
    });

    panelBackdrop?.addEventListener("click", (event) => {
      event.stopPropagation();
      if (isTabletOrSmaller()) {
        closeMemberPanel();
      }
    });
    panelClose?.addEventListener("click", (event) => {
      event.stopPropagation();
      closeMemberPanel();
    });

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    if (invitePanel) {
      const openButtons = document.querySelectorAll("[data-open-invite]");
      const closeButtons = invitePanel.querySelectorAll("[data-invite-close]");
      openButtons.forEach((btn) => btn.addEventListener("click", openInvitePanel));
      closeButtons.forEach((btn) => btn.addEventListener("click", closeInvitePanel));

      inviteModeButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const mode = button.dataset.inviteMode;
          if (mode) {
            setInviteMode(mode);
          }
        });
      });

      inviteRole?.addEventListener("change", updateInvitePreview);
      inviteEmail?.addEventListener("input", updateInvitePreview);
      inviteScopeInputs.forEach((input) => input.addEventListener("change", updateInvitePreview));

      inviteForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        closeInvitePanel();
      });

      setInviteMode("quick");
    }

    const firstMember = root.querySelector(".team-member-row[data-member-id]");
    if (firstMember) {
      setActiveMember(firstMember.dataset.memberId, firstMember);
    }

    setActiveRole("admin");

    resetFilters();
    activateTab("members");
  };

  /**
   * Show the exports slide-over, format toggles, and toast feedback on the exports page.
   * This is currently UI-only; the backend export API is still pending.
   * Requires .exports-page, .export-panel, [data-export-toast], and [data-export-action] controls.
   */
  const initExportsPage = () => {
    const root = document.querySelector(".exports-page");
    if (!root) return;

    const panel = document.querySelector(".export-panel");
    const openBtn = root.querySelector("[data-open-export-panel]");
    const closeEls = panel ? Array.from(panel.querySelectorAll("[data-export-close]")) : [];
    const toast = root.querySelector("[data-export-toast]");
    let toastTimer;
    const toastDefault = toast?.textContent?.trim() || "";

    // Toast helper operates purely in the UI while backend export wiring is still pending.
    const showExportToast = (message) => {
      if (!toast) return;
      const text = message || toastDefault;
      toast.textContent = text;
      toast.classList.add("is-visible");
      if (toastTimer) {
        clearTimeout(toastTimer);
      }
      toastTimer = setTimeout(() => {
        toast.classList.remove("is-visible");
        toast.textContent = toastDefault;
      }, 3200);
    };

    const openPanel = () => {
      if (!panel) return;
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
      const focusTarget = panel.querySelector("#export-type");
      if (focusTarget) {
        focusTarget.focus();
      }
    };

    const closePanel = () => {
      if (!panel) return;
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
    };

    if (openBtn && panel) {
      openBtn.addEventListener("click", openPanel);
    }

    closeEls.forEach((el) => el.addEventListener("click", closePanel));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closePanel();
      }
    });

    const formatGroup = panel && panel.querySelector("[data-export-format-group]");
    if (formatGroup) {
      const pills = Array.from(formatGroup.querySelectorAll(".pill-toggle"));
      pills.forEach((pill) => {
        pill.addEventListener("click", () => {
          pills.forEach((current) => current.classList.remove("is-active"));
          pill.classList.add("is-active");
        });
      });
    }

    const form = panel && panel.querySelector(".export-form");
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        closePanel();
        showExportToast("Export created - it will appear in history shortly.");
        // TODO: Wire this submit handler to the real export API endpoint.
      });
    }

    // Action buttons currently only trigger toast feedback; real export actions live on the backend later.
    const actionButtons = document.querySelectorAll("[data-export-action]");
    actionButtons.forEach((control) => {
      control.addEventListener("click", (event) => {
        const action = control.dataset.exportAction;
        const target = control.dataset.exportTarget || "this export";
        if (control.tagName === "A") {
          event.preventDefault();
        }
        let message = "";
        if (action === "download") {
          message = `Download prepared for ${target} (mock).`;
        } else if (action === "actions") {
          message = `More actions menu for ${target} will arrive soon.`;
        } else if (action === "edit-schedule") {
          message = `Schedule editor for ${target} is coming soon.`;
        }
        if (message) {
          showExportToast(message);
        }
      });
    });
  };
  const initIntegrationsPage = () => {
    const root = document.querySelector(".integrations-page");
    if (!root) return;

    const pills = Array.from(root.querySelectorAll(".filter-pill"));
    const cards = Array.from(root.querySelectorAll(".integration-card"));
    const searchInput = root.querySelector("[data-integration-search]");
    let currentCategory = "all";

    const filterCards = () => {
      const query = (searchInput?.value || "").trim().toLowerCase();
      cards.forEach((card) => {
        const cardCategory = card.getAttribute("data-category") || "all";
        const cardName =
          (card.dataset.integrationName || card.querySelector("h3")?.textContent || "").toLowerCase();
        const matchesCategory = currentCategory === "all" || cardCategory === currentCategory;
        const matchesSearch = !query || cardName.includes(query);
        card.style.display = matchesCategory && matchesSearch ? "" : "none";
      });
    };

    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const category = pill.getAttribute("data-category");
        if (!category) return;
        currentCategory = category;
        pills.forEach((candidate) => candidate.classList.toggle("is-active", candidate === pill));
        filterCards();
      });
    });

    searchInput?.addEventListener("input", filterCards);
    filterCards();

    const panel = document.querySelector(".integration-panel");
    if (!panel) return;

    const panelTitle = panel.querySelector(".integration-panel__name");
    const panelMeta = panel.querySelector("[data-panel-subtitle]");
    const panelIntro = panel.querySelector("[data-panel-intro]");
    const panelStatus = panel.querySelector("[data-panel-status]");
    const panelStatusText = panel.querySelector("[data-panel-status-text]");
    const panelLogo = panel.querySelector(".integration-panel__logo");

    const populatePanel = (card) => {
      if (!card) return;
      const name = (card.dataset.integrationName || card.querySelector("h3")?.textContent || "").trim();
      const subtitle = card.dataset.panelSubtitle || "";
      const intro = card.dataset.panelIntro || "";
      const statusText = card.dataset.panelStatusText || "";
      const statusVariant = card.dataset.status || "connected";
      const statusLabel =
        card.dataset.statusLabel ||
        statusVariant.charAt(0).toUpperCase() + statusVariant.slice(1).replace(/-/g, " ");
      const logoText = (card.dataset.panelLogo || name.charAt(0) || "").toUpperCase();

      if (panelTitle) panelTitle.textContent = name;
      if (panelMeta) panelMeta.textContent = subtitle;
      if (panelIntro) panelIntro.textContent = intro;
      if (panelStatusText) panelStatusText.textContent = statusText;
      if (panelLogo) panelLogo.textContent = logoText;
      if (panelStatus) {
        panelStatus.textContent = statusLabel;
        panelStatus.className = "integration-status";
        panelStatus.classList.add(`integration-status--${statusVariant}`);
      }
    };

    const openPanel = () => {
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
    };

    const closePanel = () => {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
    };

    const openButtons = root.querySelectorAll("[data-open-integration-panel]");
    const closeEls = panel.querySelectorAll("[data-integration-close]");

    openButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const integrationId = btn.dataset.openIntegrationPanel;
        const card =
          (integrationId && root.querySelector(`[data-integration-id="${integrationId}"]`)) ||
          btn.closest(".integration-card");
        if (card) {
          populatePanel(card);
        }
        openPanel();
      });
    });

    closeEls.forEach((el) => el.addEventListener("click", closePanel));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closePanel();
      }
    });
  };

  /**
   * Open the access audit detail drawer while keeping the table scroll state static.
   * Targets `.access-audit-page`, `.audit-panel`, and panel close triggers.
   * Currently this just toggles the drawer UI; backend audit data is expected to already be present in the markup.
   */
  const initAccessAuditPage = () => {
    // Open and close the audit detail drawer without reloading the table.
    const root = document.querySelector(".access-audit-page");
    if (!root) return;

    const panel = document.querySelector(".audit-panel");
    if (!panel) return;

    const openButtons = root.querySelectorAll("[data-open-audit-panel]");
    const closeEls = panel.querySelectorAll("[data-audit-close]");

    const openPanel = () => {
      panel.classList.add("is-open");
    };

    const closePanel = () => {
      panel.classList.remove("is-open");
    };

    openButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        openPanel();
      });
    });

    closeEls.forEach((el) => el.addEventListener("click", closePanel));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closePanel();
      }
    });
  };

  /**
   * Initializes the donor donations page controls so the table/timeline toggle and filter chips behave visually.
   */
  const initDonorDonationsPage = () => {
    const page = document.querySelector(".donations-page");
    if (!page) return;

    const tableView = page.querySelector(".donor-donations-table-view");
    const timelineView = page.querySelector(".donor-donations-timeline-view");
    const toggleButtons = Array.from(page.querySelectorAll("[data-view-toggle]"));
    const filterChips = Array.from(page.querySelectorAll(".donation-filter-chip"));
    const searchInput = page.querySelector("#donation-search");
    const selects = Array.from(page.querySelectorAll(".donor-donations-select"));
    const resetButton = page.querySelector("[data-reset-filters]");

    const hasViewButtons = toggleButtons.length > 0;

    const setActiveView = (target = "table") => {
      if (!hasViewButtons) return;
      const normalized = target === "timeline" ? "timeline" : "table";
      const showTable = normalized === "table";

      if (tableView) {
        tableView.classList.toggle("is-hidden", !showTable);
      }
      if (timelineView) {
        timelineView.classList.toggle("is-hidden", showTable);
      }

      toggleButtons.forEach((candidate) => {
        const candidateTarget = candidate.getAttribute("data-view-toggle");
        const isActive = candidateTarget === normalized;
        candidate.classList.toggle("is-active", isActive);
        candidate.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    };

    if (hasViewButtons) {
      toggleButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          setActiveView(btn.getAttribute("data-view-toggle"));
        });
      });

      const initialView = toggleButtons.find((btn) => btn.classList.contains("is-active"))?.getAttribute("data-view-toggle");
      setActiveView(initialView);
    }

    const activateChip = (targetChip) => {
      if (!targetChip) return;
      filterChips.forEach((candidate) => {
        const isActive = candidate === targetChip;
        candidate.classList.toggle("is-active", isActive);
        candidate.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    };

    filterChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        activateChip(chip);
      });
      chip.setAttribute("aria-pressed", chip.classList.contains("is-active") ? "true" : "false");
    });

    const resetFilters = () => {
      if (searchInput) {
        searchInput.value = "";
      }
      selects.forEach((select) => {
        select.selectedIndex = 0;
      });
      if (filterChips.length) {
        activateChip(filterChips[0]);
      }
      setActiveView("table");
    };

    resetButton?.addEventListener("click", resetFilters);
  };

  /**
   * Set up donation details overlays, refund modal, sticky bar, and timeline reveal for the donation details page.
   * Expects `.donation-details-page`, `.details-sticky-actions`, `#refundModal`, and the timeline markup.
   */
  const initDonationDetailsPage = () => {
    // Initialize donation details overlays, modals, and toast helpers.
    const page = document.querySelector(".donation-details-page");
    if (!page) return;

    setupDonationDetailsActions(page);
    setupDonationDetailsStickyBar(page);
    setupDonationTimelineReveal(page);
  };

  const SettingsManager = (() => {
    const focusableSelector = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const toastContainer = document.querySelector(".toast-container");
    const modalRegistry = new Map();
    let activeModal = null;
    let previousFocus = null;
    let confirmCallback = null;
    let confirmTitleEl = null;
    let confirmMessageEl = null;
    let confirmButtonEl = null;

    const showToast = (message) => {
      if (!toastContainer || !message) return;
      const toast = document.createElement("div");
      toast.className = "toast";
      toast.textContent = message;
      toastContainer.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add("is-visible"));
      const hideToast = () => {
        toast.classList.remove("is-visible");
        toast.addEventListener(
          "transitionend",
          () => {
            toast.remove();
          },
          { once: true }
        );
      };
      setTimeout(hideToast, 3400);
    };

    const openModal = (key) => {
      const modal = modalRegistry.get(key);
      if (!modal) return;
      previousFocus = document.activeElement;
      activeModal = modal;
      modal.hidden = false;
      modal.setAttribute("aria-hidden", "false");
      modal.classList.add("is-open");
      document.body.classList.add("has-active-modal");
      const focusable = Array.from(modal.querySelectorAll(focusableSelector)).filter(
        (el) => !el.hasAttribute("disabled")
      );
      (focusable[0] || modal).focus();
    };

    const closeModal = () => {
      if (!activeModal) return;
      activeModal.hidden = true;
      activeModal.setAttribute("aria-hidden", "true");
      activeModal.classList.remove("is-open");
      activeModal = null;
      confirmCallback = null;
      document.body.classList.remove("has-active-modal");
      if (previousFocus) {
        previousFocus.focus();
        previousFocus = null;
      }
    };

    const trapFocus = (event) => {
      if (!activeModal) return;
      if (event.key !== "Tab") return;
      const focusable = Array.from(activeModal.querySelectorAll(focusableSelector)).filter(
        (el) => !el.hasAttribute("disabled")
      );
      if (!focusable.length) {
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const handleDocumentKeydown = (event) => {
      if (!activeModal) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }
      trapFocus(event);
    };

    const initModals = () => {
      document.querySelectorAll("[data-modal]").forEach((modal) => {
        modalRegistry.set(modal.dataset.modal, modal);
        modal.setAttribute("aria-hidden", "true");
      });
      confirmTitleEl = document.getElementById("modal-confirm-title");
      confirmMessageEl = document.querySelector("[data-confirm-message]");
      confirmButtonEl = document.querySelector("[data-confirm-action]");
      document.querySelectorAll("[data-modal-open]").forEach((trigger) => {
        trigger.addEventListener("click", () => {
          const target = trigger.dataset.modalOpen;
          if (target) {
            openModal(target);
          }
        });
      });
      document.querySelectorAll("[data-modal-close]").forEach((trigger) => {
        trigger.addEventListener("click", (event) => {
          event.preventDefault();
          closeModal();
        });
      });
      if (confirmButtonEl) {
        confirmButtonEl.addEventListener("click", () => {
          if (typeof confirmCallback === "function") {
            confirmCallback();
          }
          confirmCallback = null;
          closeModal();
        });
      }
      document.addEventListener("keydown", handleDocumentKeydown);
    };

    const showConfirm = ({ title, message, confirmLabel = "Confirm", onConfirm }) => {
      if (!confirmTitleEl || !confirmMessageEl || !confirmButtonEl) return;
      confirmTitleEl.textContent = title || "Confirm action";
      confirmMessageEl.textContent = message || "Are you sure you want to continue?";
      confirmButtonEl.textContent = confirmLabel;
      confirmCallback = onConfirm;
      openModal("confirm");
    };

    const initTabs = (page) => {
      const navItems = Array.from(page.querySelectorAll(".settings-nav__item"));
      const panels = Array.from(page.querySelectorAll(".settings-panel"));
      const activateTab = (tabId) => {
        if (!tabId) return;
        navItems.forEach((item) => {
          const isActive = item.dataset.settingsTab === tabId;
          item.classList.toggle("is-active", isActive);
          const button = item.querySelector("button");
          if (!button) {
            return;
          }
          button.setAttribute("aria-selected", isActive ? "true" : "false");
          button.setAttribute("tabindex", isActive ? "0" : "-1");
        });
        panels.forEach((panel) => {
          const isTarget = panel.dataset.settingsPanel === tabId;
          panel.classList.toggle("settings-panel--active", isTarget);
          panel.hidden = !isTarget;
          panel.setAttribute("aria-hidden", isTarget ? "false" : "true");
        });
      };
      navItems.forEach((item) => {
        const button = item.querySelector("button");
        if (!button) return;
        button.addEventListener("click", () => {
          activateTab(item.dataset.settingsTab);
        });
      });
      const initialTab = navItems.find((item) => item.classList.contains("is-active"))?.dataset.settingsTab;
      if (initialTab) {
        activateTab(initialTab);
      } else if (navItems.length) {
        activateTab(navItems[0].dataset.settingsTab);
      }
    };

    const createPanelTracker = (page) => {
      const states = new Map();
      const panels = Array.from(page.querySelectorAll(".settings-panel"));
      panels.forEach((panel) => {
        const panelId = panel.dataset.settingsPanel;
        const saveButton = panel.querySelector("[data-save-button]");
        if (!panelId || !saveButton) return;
        const state = {
          dirty: false,
        };
        const setClean = () => {
          state.dirty = false;
          saveButton.disabled = true;
        };
        const setDirty = () => {
          if (!state.dirty) {
            state.dirty = true;
            saveButton.disabled = false;
          }
        };
        saveButton.disabled = true;
        saveButton.addEventListener("click", () => {
          showToast("Settings saved (demo)");
          setClean();
        });
        panel.addEventListener("input", setDirty);
        panel.addEventListener("change", setDirty);
        states.set(panelId, { setDirty, setClean });
      });
      const markDirty = (panelId) => {
        const entry = states.get(panelId);
        entry?.setDirty();
      };
      const markClean = (panelId) => {
        const entry = states.get(panelId);
        entry?.setClean();
      };
      return { markDirty, markClean };
    };

    const initBilling = (page, markDirty) => {
      const panel = page.querySelector('[data-settings-panel="billing"]');
      if (!panel) return;
      const cardsContainer = panel.querySelector("[data-billing-cards]");
      const template = document.getElementById("billing-card-template");
      let pendingRemoval = null;
      const brandIcons = {
        Visa: "fa-solid fa-cc-visa",
        Mastercard: "fa-solid fa-cc-mastercard",
        Amex: "fa-solid fa-cc-amex",
        Card: "fa-solid fa-credit-card",
      };
      const guessBrand = (number) => {
        const digits = (number || "").toString().replace(/\D/g, "");
        if (digits.startsWith("4")) {
          return "Visa";
        }
        if (/^5[1-5]/.test(digits)) {
          return "Mastercard";
        }
        if (/^3[47]/.test(digits)) {
          return "Amex";
        }
        return "Card";
      };
      const applyCardState = (card, isDefault) => {
        card.dataset.cardDefault = isDefault ? "true" : "false";
        const pill = card.querySelector(".billing-card__pill");
        const actionButton = card.querySelector('[data-card-action="set-default"]');
        if (pill) {
          pill.hidden = !isDefault;
          pill.classList.toggle("billing-card__pill--ghost", !isDefault);
          pill.classList.toggle("billing-card__pill--primary", isDefault);
        }
        if (actionButton) {
          actionButton.disabled = isDefault;
        }
      };
      const setDefaultCard = (card) => {
        if (!card) return;
        cardsContainer.querySelectorAll(".billing-card").forEach((candidate) => {
          applyCardState(candidate, candidate === card);
        });
      };
      const createCardElement = ({ id, brand, last4, exp, country, isDefault = false }) => {
        if (!template) return null;
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector(".billing-card");
        if (!card) return null;
        card.dataset.cardId = id;
        const brandLabel = card.querySelector("[data-card-brand]");
        const brandIcon = card.querySelector(".billing-card__brand i");
        if (brandLabel) {
          brandLabel.textContent = brand;
        }
        if (brandIcon) {
          brandIcon.className = brandIcons[brand] || brandIcons.Card;
        }
        const numberEl = card.querySelector("[data-card-number]");
        if (numberEl) {
          numberEl.textContent = `**** **** **** ${last4}`;
        }
        const expEl = card.querySelector("[data-card-exp]");
        if (expEl) {
          expEl.textContent = exp || "Exp --/--";
        }
        const countryEl = card.querySelector("[data-card-country]");
        if (countryEl) {
          countryEl.textContent = country || "Country";
        }
        applyCardState(card, isDefault);
        return card;
      };
      cardsContainer.addEventListener("click", (event) => {
        const actionButton = event.target.closest("[data-card-action]");
        if (!actionButton) return;
        const card = actionButton.closest("[data-card-id]");
        if (!card) return;
        const action = actionButton.dataset.cardAction;
        if (action === "set-default") {
          setDefaultCard(card);
          markDirty("billing");
          showToast("Default card updated (demo)");
          return;
        }
        if (action === "remove") {
          pendingRemoval = card;
          const brand = card.querySelector("[data-card-brand]")?.textContent?.trim() || "Card";
          const last4 = card.querySelector("[data-card-number]")?.textContent?.slice(-4) || "0000";
          showConfirm({
            title: "Remove payment method",
            message: `Remove ${brand} ending ${last4}?`,
            confirmLabel: "Remove card",
            onConfirm: () => {
              if (!pendingRemoval) return;
              const wasDefault = pendingRemoval.dataset.cardDefault === "true";
              pendingRemoval.remove();
              pendingRemoval = null;
              if (wasDefault) {
                const fallback = cardsContainer.querySelector(".billing-card");
                if (fallback) {
                  setDefaultCard(fallback);
                }
              }
              markDirty("billing");
              showToast("Card removed (demo)");
            },
          });
        }
      });
      const form = document.getElementById("billing-card-form");
      form?.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const cardNumber = (data.get("cardNumber") || "").toString();
        const last4 = cardNumber.replace(/\D/g, "").slice(-4) || "0000";
        const brand = guessBrand(cardNumber);
        const newCard = createCardElement({
          id: `card-${Date.now()}`,
          brand,
          last4,
          exp: data.get("expiry") ? `Exp ${data.get("expiry")}` : "Exp --/--",
          country: data.get("country") || "Country",
        });
        if (newCard) {
          cardsContainer.prepend(newCard);
          markDirty("billing");
          showToast("Card added (demo)");
        }
        form.reset();
        closeModal();
      });
      const existingDefault = cardsContainer.querySelector('[data-card-default="true"]');
      if (existingDefault) {
        setDefaultCard(existingDefault);
      }
    };


    const initZakat = (page, markDirty) => {
      const panel = page.querySelector('[data-settings-panel="zakat"]');
      if (!panel) return;
      const toggle = panel.querySelector(".js-zakat-toggle");
      const percentage = panel.querySelector(".js-zakat-percentage");
      const exampleValue = panel.querySelector("[data-zakat-example-value]");
      const exampleWrapper = panel.querySelector("[data-zakat-example]");
      const baseAmount = 10000;
      const updateExample = () => {
        const value = Number(percentage?.value) || 0;
        const zakat = ((baseAmount * value) / 100).toFixed(2);
        if (exampleValue) {
          exampleValue.textContent = `On 10,000 TRY -> Zakat = ${zakat} TRY (at ${value.toFixed(1)}%)`;
        }
      };
      const updateDisabled = () => {
        const disabled = toggle && !toggle.checked;
        if (percentage) {
          percentage.disabled = disabled;
        }
        exampleWrapper?.classList.toggle("settings-zakat__example--disabled", disabled);
      };
      toggle?.addEventListener("change", () => {
        updateDisabled();
        markDirty("zakat");
      });
      percentage?.addEventListener("input", () => {
        updateExample();
        markDirty("zakat");
      });
      updateExample();
      updateDisabled();
    };

    const initDonationTypes = (page, markDirty) => {
      const panel = page.querySelector('[data-settings-panel="donation-types"]');
      if (!panel) return;
      const list = panel.querySelector("[data-donation-types-list]");
      const typeForm = document.getElementById("donation-type-form");
      const modalTitle = document.getElementById("modal-donation-title");
      let donationTypes = [
        {
          id: "zakat",
          name: "Zakat",
          description: "Purity-focused donations allocated for Zakat requirements.",
          status: "active",
        },
        {
          id: "qurbani",
          name: "Qurbani",
          description: "Campaigns that honor the Qurbani rituals.",
          status: "active",
        },
        {
          id: "general",
          name: "General",
          description: "Flexible giving for operations and community work.",
          status: "active",
        },
        {
          id: "gift",
          name: "Gift",
          description: "Bespoke gifts assigned to unique acknowledgements.",
          status: "disabled",
        },
      ];

      const swapItems = (array, fromIndex, toIndex) => {
        if (fromIndex < 0 || toIndex < 0 || fromIndex >= array.length || toIndex >= array.length) return;
        const [item] = array.splice(fromIndex, 1);
        array.splice(toIndex, 0, item);
      };

      const render = () => {
        if (!list) return;
        list.innerHTML = donationTypes
          .map((type, index) => {
            const disabledUp = index === 0 ? "disabled" : "";
            const disabledDown = index === donationTypes.length - 1 ? "disabled" : "";
            return `
              <li class="settings-categories__item" data-type-id="${type.id}">
                <div>
                  <strong>${type.name}</strong>
                  <p class="text-muted">${type.description || "�"}</p>
                </div>
                <div class="settings-categories__item-actions">
                  <button type="button" class="icon-button" data-donation-action="move-up" data-type-id="${type.id}" ${disabledUp} aria-label="Move ${type.name} up">
                    <i class="fa-solid fa-arrow-up"></i>
                  </button>
                  <button type="button" class="icon-button" data-donation-action="move-down" data-type-id="${type.id}" ${disabledDown} aria-label="Move ${type.name} down">
                    <i class="fa-solid fa-arrow-down"></i>
                  </button>
                  <button type="button" class="icon-button" data-donation-action="edit" data-type-id="${type.id}" aria-label="Edit ${type.name}">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button type="button" class="icon-button" data-donation-action="toggle" data-type-id="${type.id}" aria-label="Toggle ${type.name}">
                    <i class="fa-solid ${type.status === 'active' ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
                  </button>
                  <button type="button" class="icon-button" data-donation-action="delete" data-type-id="${type.id}" aria-label="Delete ${type.name}">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </li>
            `;
          })
          .join("");
      };

      const openTypeForm = (mode, typeId) => {
        if (!typeForm) return;
        typeForm.reset();
        const idField = typeForm.elements["donationTypeId"];
        const nameField = typeForm.elements["name"];
        const descriptionField = typeForm.elements["description"];
        const statusField = typeForm.elements["status"];
        if (mode === "edit" && typeId) {
          const target = donationTypes.find((item) => item.id === typeId);
          if (target) {
            idField.value = target.id;
            nameField.value = target.name;
            descriptionField.value = target.description || "";
            statusField.checked = target.status === "active";
          }
          modalTitle.textContent = "Edit donation type";
        } else {
          idField.value = "";
          statusField.checked = true;
          modalTitle.textContent = "Add donation type";
        }
        openModal("donation-type-form");
      };

      list?.addEventListener("click", (event) => {
        const actionButton = event.target.closest("[data-donation-action]");
        if (!actionButton) return;
        const typeId = actionButton.dataset.typeId;
        if (!typeId) return;
        const action = actionButton.dataset.donationAction;
        const idx = donationTypes.findIndex((item) => item.id === typeId);
        if (idx === -1) return;

        if (action === "move-up") {
          swapItems(donationTypes, idx, idx - 1);
          render();
          markDirty("donation-types");
          showToast("Moved up (demo)");
          return;
        }
        if (action === "move-down") {
          swapItems(donationTypes, idx, idx + 1);
          render();
          markDirty("donation-types");
          showToast("Moved down (demo)");
          return;
        }
        if (action === "edit") {
          openTypeForm("edit", typeId);
          return;
        }
        if (action === "toggle") {
          const target = donationTypes[idx];
          target.status = target.status === "active" ? "disabled" : "active";
          render();
          markDirty("donation-types");
          showToast("Donation type updated (demo)");
          return;
        }
        if (action === "delete") {
          const target = donationTypes[idx];
          showConfirm({
            title: "Delete donation type",
            message: `Delete ${target.name}?`,
            confirmLabel: "Delete",
            onConfirm: () => {
              donationTypes = donationTypes.filter((item) => item.id !== typeId);
              render();
              markDirty("donation-types");
              showToast("Donation type deleted (demo)");
            },
          });
        }
      });

      typeForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(typeForm);
        const id = formData.get("donationTypeId");
        const name = (formData.get("name") || "").toString().trim();
        if (!name) return;
        const description = (formData.get("description") || "").toString().trim();
        const status = typeForm.elements["status"].checked ? "active" : "disabled";
        if (id) {
          const target = donationTypes.find((item) => item.id === id);
          if (target) {
            target.name = name;
            target.description = description;
            target.status = status;
            showToast("Donation type updated (demo)");
          }
        } else {
          donationTypes.unshift({
            id: `type-${Date.now()}`,
            name,
            description,
            status,
          });
          showToast("Donation type added (demo)");
        }
        render();
        markDirty("donation-types");
        closeModal();
      });

      render();
    };

    const initCategories = (page, markDirty) => {
      const panel = page.querySelector('[data-settings-panel="categories"]');
      if (!panel) return;
      const categoryList = panel.querySelector("[data-category-list]");
      const subcategoryList = panel.querySelector("[data-subcategory-list]");
      const categoryForm = document.getElementById("category-form");
      const subcategoryForm = document.getElementById("subcategory-form");
      const categoryTitle = document.getElementById("modal-category-title");
      const subcategoryTitle = document.getElementById("modal-subcategory-title");
      let categories = [
        {
          id: "qurbani",
          name: "Qurbani",
          description: "Sacrificial giving and gratitude celebration",
          subcategories: [
            { id: "q-sacrifice", name: "Sacrifice" },
            { id: "q-gift", name: "Gift" },
            { id: "q-others", name: "Others" },
          ],
        },
        {
          id: "general-relief",
          name: "General Relief",
          description: "Emergency and relief work around the globe",
          subcategories: [
            { id: "gr-food", name: "Food" },
            { id: "gr-medicine", name: "Medicine" },
          ],
        },
        {
          id: "education",
          name: "Education",
          description: "Scholarships, schools, and learning support",
          subcategories: [
            { id: "ed-scholarships", name: "Scholarships" },
            { id: "ed-schools", name: "School support" },
          ],
        },
        {
          id: "emergency",
          name: "Emergency",
          description: "Rapid response and disaster relief",
          subcategories: [
            { id: "eg-medical", name: "Medical" },
            { id: "eg-shelter", name: "Shelter" },
          ],
        },
      ];
      let selectedCategoryId = categories[0]?.id;
      const swapItems = (array, fromIndex, toIndex) => {
        if (fromIndex < 0 || toIndex < 0 || fromIndex >= array.length || toIndex >= array.length) return;
        const [item] = array.splice(fromIndex, 1);
        array.splice(toIndex, 0, item);
      };
      const renderSubcategories = () => {
        const active = categories.find((category) => category.id === selectedCategoryId);
        if (!subcategoryList) return;
        if (!active) {
          subcategoryList.innerHTML =
            '<li class="settings-categories__item text-muted">Select a category to view sub-categories.</li>';
          return;
        }
        if (!active.subcategories.length) {
          subcategoryList.innerHTML =
            '<li class="settings-categories__item text-muted">No sub-categories yet.</li>';
          return;
        }
        subcategoryList.innerHTML = active.subcategories
          .map((sub, index) => {
            const disabledUp = index === 0 ? "disabled" : "";
            const disabledDown = index === active.subcategories.length - 1 ? "disabled" : "";
            return `
              <li class="settings-categories__item" data-subcategory-id="${sub.id}">
                <span>${sub.name}</span>
                <div class="settings-categories__item-actions">
                  <button type="button" class="icon-button" data-subcategory-action="move-up" data-subcategory-id="${sub.id}" ${disabledUp} aria-label="Move ${sub.name} up">
                    <i class="fa-solid fa-arrow-up"></i>
                  </button>
                  <button type="button" class="icon-button" data-subcategory-action="move-down" data-subcategory-id="${sub.id}" ${disabledDown} aria-label="Move ${sub.name} down">
                    <i class="fa-solid fa-arrow-down"></i>
                  </button>
                  <button type="button" class="icon-button" data-subcategory-action="edit" data-subcategory-id="${sub.id}" aria-label="Edit ${sub.name}">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button type="button" class="icon-button" data-subcategory-action="delete" data-subcategory-id="${sub.id}" aria-label="Delete ${sub.name}">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </li>
            `;
          })
          .join("");
      };
      const renderCategories = () => {
        if (!categoryList) return;
        categoryList.innerHTML = categories
          .map((category, index) => {
            const activeClass = category.id === selectedCategoryId ? "is-active" : "";
            const disabledUp = index === 0 ? "disabled" : "";
            const disabledDown = index === categories.length - 1 ? "disabled" : "";
            return `
              <li class="settings-categories__item ${activeClass}" data-category-id="${category.id}">
                <button type="button" class="settings-categories__item-label" data-category-select>
                  <div>
                    <strong>${category.name}</strong>
                    <p class="text-muted">${category.description || "�"}</p>
                  </div>
                </button>
                <div class="settings-categories__item-actions">
                  <button type="button" class="icon-button" data-category-action="move-up" data-category-id="${category.id}" ${disabledUp} aria-label="Move ${category.name} up">
                    <i class="fa-solid fa-arrow-up"></i>
                  </button>
                  <button type="button" class="icon-button" data-category-action="move-down" data-category-id="${category.id}" ${disabledDown} aria-label="Move ${category.name} down">
                    <i class="fa-solid fa-arrow-down"></i>
                  </button>
                  <button type="button" class="icon-button" data-category-action="edit" data-category-id="${category.id}" aria-label="Edit ${category.name}">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button type="button" class="icon-button" data-category-action="delete" data-category-id="${category.id}" aria-label="Delete ${category.name}">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </li>
            `;
          })
          .join("");
        renderSubcategories();
      };
      const openCategoryForm = (mode, category = null) => {
        if (!categoryForm) return;
        categoryForm.reset();
        const idField = categoryForm.elements["categoryId"];
        const nameField = categoryForm.elements["name"];
        const descriptionField = categoryForm.elements["description"];
        if (mode === "edit" && category) {
          idField.value = category.id;
          nameField.value = category.name;
          descriptionField.value = category.description || "";
          categoryTitle.textContent = "Edit category";
        } else {
          idField.value = "";
          categoryTitle.textContent = "Add category";
        }
        openModal("category-form");
      };
      const openSubcategoryForm = (mode, categoryId, subcategory = null) => {
        if (!subcategoryForm) return;
        subcategoryForm.reset();
        const idField = subcategoryForm.elements["subcategoryId"];
        const categoryField = subcategoryForm.elements["categoryId"];
        const nameField = subcategoryForm.elements["name"];
        categoryField.value = categoryId || selectedCategoryId || "";
        if (mode === "edit" && subcategory) {
          idField.value = subcategory.id;
          nameField.value = subcategory.name;
          subcategoryTitle.textContent = "Edit sub-category";
        } else {
          idField.value = "";
          subcategoryTitle.textContent = "Add sub-category";
        }
        openModal("subcategory-form");
      };
      categoryList?.addEventListener("click", (event) => {
        const actionButton = event.target.closest("[data-category-action]");
        if (actionButton) {
          const categoryId = actionButton.dataset.categoryId;
          if (!categoryId) return;
          const index = categories.findIndex((cat) => cat.id === categoryId);
          if (index === -1) return;
          const action = actionButton.dataset.categoryAction;
          if (action === "move-up") {
            swapItems(categories, index, index - 1);
            markDirty("categories");
            renderCategories();
            return;
          }
          if (action === "move-down") {
            swapItems(categories, index, index + 1);
            markDirty("categories");
            renderCategories();
            return;
          }
          if (action === "edit") {
            openCategoryForm("edit", categories[index]);
            return;
          }
          if (action === "delete") {
            showConfirm({
              title: "Delete category",
              message: `Delete ${categories[index].name}?`,
              confirmLabel: "Delete",
              onConfirm: () => {
                const removed = categories.splice(index, 1);
                if (removed.length && selectedCategoryId === removed[0].id) {
                  selectedCategoryId = categories[0]?.id;
                }
                markDirty("categories");
                renderCategories();
                showToast("Category deleted (demo)");
              },
            });
            return;
          }
          return;
        }
        const selectButton = event.target.closest("[data-category-select]");
        if (selectButton) {
          const listItem = selectButton.closest("[data-category-id]");
          if (!listItem) return;
          selectedCategoryId = listItem.dataset.categoryId;
          renderCategories();
        }
      });
      subcategoryList?.addEventListener("click", (event) => {
        const actionButton = event.target.closest("[data-subcategory-action]");
        if (!actionButton) return;
        const subcategoryId = actionButton.dataset.subcategoryId;
        if (!subcategoryId) return;
        const action = actionButton.dataset.subcategoryAction;
        const active = categories.find((category) => category.id === selectedCategoryId);
        if (!active) return;
        const index = active.subcategories.findIndex((sub) => sub.id === subcategoryId);
        if (index === -1) return;
        if (action === "move-up") {
          swapItems(active.subcategories, index, index - 1);
          markDirty("categories");
          renderSubcategories();
          return;
        }
        if (action === "move-down") {
          swapItems(active.subcategories, index, index + 1);
          markDirty("categories");
          renderSubcategories();
          return;
        }
        if (action === "edit") {
          openSubcategoryForm("edit", active.id, active.subcategories[index]);
          return;
        }
        if (action === "delete") {
          showConfirm({
            title: "Delete sub-category",
            message: `Delete ${active.subcategories[index].name}?`,
            confirmLabel: "Delete",
            onConfirm: () => {
              active.subcategories.splice(index, 1);
              markDirty("categories");
              renderSubcategories();
              showToast("Sub-category deleted (demo)");
            },
          });
        }
      });
      categoryForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(categoryForm);
        const id = data.get("categoryId");
        const name = (data.get("name") || "").toString().trim();
        if (!name) return;
        const description = (data.get("description") || "").toString().trim();
        if (id) {
          const target = categories.find((category) => category.id === id);
          if (target) {
            target.name = name;
            target.description = description;
            showToast("Category updated (demo)");
          }
        } else {
          const newCategory = {
            id: `cat-${Date.now()}`,
            name,
            description,
            subcategories: [],
          };
          categories.push(newCategory);
          selectedCategoryId = newCategory.id;
          showToast("Category added (demo)");
        }
        markDirty("categories");
        renderCategories();
        closeModal();
      });
      subcategoryForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(subcategoryForm);
        const id = data.get("subcategoryId");
        const categoryId = data.get("categoryId") || selectedCategoryId;
        const name = (data.get("name") || "").toString().trim();
        if (!name || !categoryId) return;
        const category = categories.find((cat) => cat.id === categoryId);
        if (!category) return;
        if (id) {
          const target = category.subcategories.find((sub) => sub.id === id);
          if (target) {
            target.name = name;
            showToast("Sub-category updated (demo)");
          }
        } else {
          category.subcategories.push({
            id: `sub-${Date.now()}`,
            name,
          });
          showToast("Sub-category added (demo)");
        }
        markDirty("categories");
        renderSubcategories();
        closeModal();
      });
      renderCategories();
    };

    const initCampaignDefaults = (page, markDirty) => {
      const panel = page.querySelector('[data-settings-panel="campaign-defaults"]');
      if (!panel) return;
      panel.querySelectorAll(".settings-toggle-row input[type='checkbox']").forEach((toggle) => {
        toggle.addEventListener("change", () => markDirty("campaign-defaults"));
      });
      const group = panel.querySelector("[data-visibility-control]");
      if (!group) return;
      const buttons = Array.from(group.querySelectorAll("[data-visibility]"));
      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          buttons.forEach((candidate) => candidate.classList.toggle("is-active", candidate === button));
          markDirty("campaign-defaults");
        });
      });
    };

    const init = () => {
      const page = document.querySelector(".settings-page");
      // Ensure modal system is initialized globally so pages that reuse the
      // settings modals (like `categories.html`) work even without the
      // `.settings-page` wrapper.
      initModals();
      if (!page) return;
      initTabs(page);
      const tracker = createPanelTracker(page);
      initBilling(page, tracker.markDirty);
      initZakat(page, tracker.markDirty);
      initDonationTypes(page, tracker.markDirty);
      initCategories(page, tracker.markDirty);
      initCampaignDefaults(page, tracker.markDirty);
    };

    return { init };
  })();
  window.SettingsManager = SettingsManager;

  const initDonationsCheckout = () => {
    const panel = document.querySelector('[data-donations-checkout]');
    if (!panel) return;

    const CART_CAPACITY = 8;
    const MIN_AMOUNT = 10;
    const AMOUNT_STEP = 10;
    const FEE_RATE = 0.015;

    const formatCurrency = (value = 0) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

    const slugify = (value = '') =>
      value
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    const stepperButtons = panel.querySelectorAll('.checkout-stepper__item');
    const stepPanels = panel.querySelectorAll('[data-step-panel]');
    const cartList = panel.querySelector('[data-cart-items]');
    const cartEmptyState = panel.querySelector('[data-cart-empty]');
    const cartFullHint = panel.querySelector('[data-cart-full-hint]');
    const continueToDonor = panel.querySelector('[data-step-control="next"][data-step-target="2"]');
    const subtotalEl = panel.querySelector('[data-cart-subtotal]');
    const feesEl = panel.querySelector('[data-cart-fees]');
    const totalEl = panel.querySelector('[data-cart-total]');
    const reviewSubtotal = panel.querySelector('[data-review-subtotal]');
    const reviewFees = panel.querySelector('[data-review-fees]');
    const reviewTotal = panel.querySelector('[data-review-total]');
    const reviewRecurring = panel.querySelector('[data-review-recurring]');
    const recurringToggle = panel.querySelector('[data-recurring-toggle]');
    const recurringPanel = panel.querySelector('[data-recurring-panel]');
    const recurringRadios = Array.from(panel.querySelectorAll('input[name="recurringFrequency"]'));
    const recurringDay = panel.querySelector('[data-recurring-day]');
    const donorForm = panel.querySelector('[data-donor-form]');
    const validationStatus = panel.querySelector('[data-validation-status]');
    const donorReviewName = panel.querySelector('[data-review-donor-name]');
    const donorReviewMeta = panel.querySelector('[data-review-donor-meta]');
    const badgeCount = document.querySelector('[data-cart-count]');
    const badgeHint = document.querySelector('[data-cart-badge-hint]');
    const cartBadgeButton = document.querySelector('.donations-toolbar__cart');
    const checkoutBody = panel.querySelector('[data-checkout-body]');
    const mobileToggle = panel.querySelector('[data-mobile-toggle]');
    const browseButton = panel.querySelector('[data-browse-campaigns]');
    const stepControls = panel.querySelectorAll('[data-step-control]');
    const requiredFields = donorForm ? Array.from(donorForm.querySelectorAll('[data-required="true"]')) : [];

    const frequencyLabels = {
      monthly: 'Monthly',
      q3: 'Every 3 months',
      yearly: 'Yearly',
    };

    const cartState = {
      items: [],
    };

    const injectAddButtons = () => {
      const targets = Array.from(document.querySelectorAll('.donation-card__actions, .table-actions'));
      targets.forEach((container) => {
        if (container.querySelector('.js-donation-add')) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-ghost  btn-primary  js-donation-add';
        button.setAttribute('aria-label', 'Add donation to cart');
        button.innerHTML = '<i class="fa-solid fa-cart-plus" aria-hidden="true"></i><span>Add</span>';
        container.appendChild(button);
      });
    };

    const getAddButtons = () => Array.from(document.querySelectorAll('.js-donation-add'));

    const getDonationData = (element) => {
      if (!element) return null;
      const campaign = element.dataset.donationCampaign || element.dataset.campaign || 'Donation';
      const donor = element.dataset.donorName || element.dataset.donor || 'Anonymous';
      const amount = Math.max(MIN_AMOUNT, Number(element.dataset.amount) || MIN_AMOUNT);
      return {
        id: slugify(`${donor}-${campaign}`),
        campaign,
        donor,
        amount,
      };
    };

    const updateBadge = () => {
      const count = cartState.items.length;
      if (badgeCount) {
        badgeCount.textContent = `${count}`;
        badgeCount.dataset.cartCount = `${count}`;
      }
      if (cartBadgeButton) {
        cartBadgeButton.setAttribute('title', `Cart has ${count} item${count === 1 ? '' : 's'}`);
        cartBadgeButton.classList.toggle('cart-full', count >= CART_CAPACITY);
      }
      if (badgeHint) {
        badgeHint.classList.toggle('is-hidden', count < CART_CAPACITY);
      }
    };

    const updateAddButtonsState = (isFull) => {
      getAddButtons().forEach((btn) => {
        btn.disabled = isFull;
        btn.setAttribute('aria-disabled', isFull ? 'true' : 'false');
        if (isFull) {
          btn.setAttribute('title', 'Cart is full');
        } else {
          btn.removeAttribute('title');
        }
      });
    };

    const calculateTotals = () => {
      const subtotal = cartState.items.reduce((sum, item) => sum + item.amount, 0);
      const fees = Number((subtotal * FEE_RATE).toFixed(2));
      return { subtotal, fees, total: subtotal + fees };
    };

    const updateTotals = () => {
      const { subtotal, fees, total } = calculateTotals();
      if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
      if (feesEl) feesEl.textContent = formatCurrency(fees);
      if (totalEl) totalEl.textContent = formatCurrency(total);
      if (reviewSubtotal) reviewSubtotal.textContent = formatCurrency(subtotal);
      if (reviewFees) reviewFees.textContent = formatCurrency(fees);
      if (reviewTotal) reviewTotal.textContent = formatCurrency(total);
    };

    const renderCartItems = () => {
      const hasItems = cartState.items.length > 0;
      if (cartList) {
        cartList.classList.toggle('is-hidden', !hasItems);
        cartList.innerHTML = '';
        if (hasItems) {
          const fragment = document.createDocumentFragment();
          cartState.items.forEach((item) => {
            const li = document.createElement('li');
            li.className = 'cart-item';
            li.innerHTML = `
              <div class="cart-item__meta">
                <p class="h4">${item.campaign}</p>
                <p class="text-muted">${item.donor}</p>
              </div>
              <div class="cart-item__controls">
                <button type="button" class="cart-item__adjust" data-action="decrement" aria-label="Decrease amount">
                  <i class="fa-solid fa-minus" aria-hidden="true"></i>
                </button>
                <input type="number" min="${MIN_AMOUNT}" step="${AMOUNT_STEP}" value="${item.amount}" />
                <button type="button" class="cart-item__adjust" data-action="increment" aria-label="Increase amount">
                  <i class="fa-solid fa-plus" aria-hidden="true"></i>
                </button>
                <button type="button" class="icon-button cart-item__remove" aria-label="Remove donation">
                  <i class="fa-solid fa-trash" aria-hidden="true"></i>
                </button>
              </div>
            `;
            const decrement = li.querySelector('[data-action="decrement"]');
            const increment = li.querySelector('[data-action="increment"]');
            const input = li.querySelector('input');
            const remove = li.querySelector('.cart-item__remove');

            decrement?.addEventListener('click', () => {
              item.amount = Math.max(MIN_AMOUNT, item.amount - AMOUNT_STEP);
              if (input) input.value = item.amount;
              updateTotals();
            });
            increment?.addEventListener('click', () => {
              item.amount = item.amount + AMOUNT_STEP;
              if (input) input.value = item.amount;
              updateTotals();
            });
            input?.addEventListener('input', () => {
              const value = Number(input.value);
              if (!Number.isFinite(value)) return;
              item.amount = Math.max(MIN_AMOUNT, Math.round(value));
              input.value = item.amount;
              updateTotals();
            });
            remove?.addEventListener('click', () => {
              cartState.items = cartState.items.filter((entry) => entry.id !== item.id);
              renderCartItems();
            });

            fragment.appendChild(li);
          });
          cartList.appendChild(fragment);
        }
      }
      if (cartEmptyState) {
        cartEmptyState.classList.toggle('is-hidden', hasItems);
      }
      const isFull = cartState.items.length >= CART_CAPACITY;
      if (cartFullHint) {
        cartFullHint.classList.toggle('is-hidden', !isFull);
      }
      updateAddButtonsState(isFull);
      updateTotals();
      updateBadge();
      if (continueToDonor) {
        continueToDonor.disabled = !hasItems;
      }
    };

    const addCartItem = (source) => {
      const data = getDonationData(source);
      if (!data) return false;
      const existing = cartState.items.find((item) => item.id === data.id);
      if (!existing && cartState.items.length >= CART_CAPACITY) {
        return false;
      }
      if (existing) {
        existing.amount = Math.max(MIN_AMOUNT, existing.amount + data.amount);
        return true;
      }
      cartState.items.push({ ...data, amount: data.amount });
      return true;
    };

    const handleAddClick = (event) => {
      event.preventDefault();
      const source = event.currentTarget.closest('.donation-card, .donation-row');
      const added = addCartItem(source);
      renderCartItems();
      if (added) {
        showToast('Added to cart');
      } else {
        showToast('Cart is full', 'warning');
      }
    };

    const clearError = (input) => {
      input.classList.remove('is-invalid');
      const errorEl = document.getElementById(`${input.id}Error`);
      if (errorEl) {
        errorEl.textContent = '';
      }
    };

    const showError = (input, message) => {
      input.classList.add('is-invalid');
      const errorEl = document.getElementById(`${input.id}Error`);
      if (errorEl) {
        errorEl.textContent = message;
      }
    };

    const validateDonorForm = () => {
      if (!donorForm) return true;
      let isValid = true;
      requiredFields.forEach((field) => {
        const value = field.value?.trim?.() || '';
        clearError(field);
        if (!value) {
          showError(field, 'This field is required.');
          isValid = false;
        } else if (field.type === 'email' && !/^\S+@\S+\.\S+$/.test(value)) {
          showError(field, 'Enter a valid email address.');
          isValid = false;
        }
      });
      if (!isValid) {
        if (validationStatus) {
          validationStatus.textContent = 'Please fix the highlighted fields before continuing.';
        }
        const firstInvalid = requiredFields.find((field) => field.classList.contains('is-invalid'));
        firstInvalid?.focus();
      } else if (validationStatus) {
        validationStatus.textContent = '';
      }
      return isValid;
    };

    const updateReviewDonor = () => {
      if (!donorForm) return;
      const data = new FormData(donorForm);
      const name = data.get('donorFullName')?.trim();
      const email = data.get('donorEmail')?.trim();
      const phone = data.get('donorPhone')?.trim();
      const city = data.get('donorCity')?.trim();
      if (donorReviewName) {
        donorReviewName.textContent = name || 'Donor information pending';
      }
      if (donorReviewMeta) {
        const parts = [email, phone, city].filter(Boolean);
        donorReviewMeta.textContent = parts.join(' • ');
      }
    };

    const updateRecurringSummary = () => {
      if (!recurringToggle || !reviewRecurring) return;
      if (!recurringToggle.checked) {
        reviewRecurring.classList.add('is-hidden');
        return;
      }
      const frequency = recurringRadios.find((radio) => radio.checked)?.value || 'monthly';
      const dayValue = recurringDay?.value || '15';
      const freqLabel = frequencyLabels[frequency] || 'Monthly';
      const dayLabel = dayValue === 'same' ? 'same day each month' : `day ${dayValue}`;
      reviewRecurring.textContent = `Recurring: ${freqLabel}, ${dayLabel}`;
      reviewRecurring.classList.remove('is-hidden');
    };

    const handleRecurringToggle = () => {
      if (!recurringToggle || !recurringPanel) return;
      const isActive = recurringToggle.checked;
      recurringPanel.classList.toggle('is-hidden', !isActive);
      recurringPanel.hidden = !isActive;
      updateRecurringSummary();
    };

    const renderReview = () => {
      updateTotals();
      updateReviewDonor();
      updateRecurringSummary();
    };

    let currentStep = 1;
    const setStep = (step) => {
      const normalized = Math.min(3, Math.max(1, Number(step) || 1));
      stepPanels.forEach((panelStep) => {
        const panelNumber = Number(panelStep.dataset.stepPanel);
        const active = panelNumber === normalized;
        panelStep.hidden = !active;
        panelStep.classList.toggle('is-hidden', !active);
      });
      stepperButtons.forEach((button) => {
        const targetStep = Number(button.dataset.stepTarget);
        const active = targetStep === normalized;
        button.setAttribute('aria-selected', active ? 'true' : 'false');
        if (active) {
          button.setAttribute('aria-current', 'step');
        } else {
          button.removeAttribute('aria-current');
        }
      });
      currentStep = normalized;
      if (normalized === 3) {
        renderReview();
      }
    };

    const changeStep = (target) => {
      const normalized = Math.min(3, Math.max(1, Number(target) || 1));
      if (normalized === 3 && !validateDonorForm()) {
        return;
      }
      setStep(normalized);
    };

    stepControls.forEach((button) => {
      button.addEventListener('click', () => {
        const control = button.dataset.stepControl;
        const target = button.dataset.stepTarget;
        if (control === 'back' || control === 'next') {
          changeStep(target);
          return;
        }
        if (control === 'confirm') {
          showToast('Review & payment simulated (demo)');
        }
      });
    });

    stepperButtons.forEach((button) => {
      button.addEventListener('click', () => {
        changeStep(button.dataset.stepTarget);
      });
    });

    const refreshMobileToggle = () => {
      if (!checkoutBody || !mobileToggle) return;
      const collapsed = checkoutBody.dataset.collapsed === 'true';
      const label = mobileToggle.querySelector('span');
      if (label) {
        label.textContent = collapsed ? 'Show checkout' : 'Hide checkout';
      }
      mobileToggle.setAttribute('aria-expanded', (!collapsed).toString());
    };

    const handleMobileToggle = () => {
      if (!checkoutBody) return;
      const collapsed = checkoutBody.dataset.collapsed === 'true';
      checkoutBody.dataset.collapsed = collapsed ? 'false' : 'true';
      refreshMobileToggle();
    };

    mobileToggle?.addEventListener('click', handleMobileToggle);
    recurringRadios.forEach((radio) => radio.addEventListener('change', updateRecurringSummary));
    recurringDay?.addEventListener('change', updateRecurringSummary);
    recurringToggle?.addEventListener('change', handleRecurringToggle);
    browseButton?.addEventListener('click', () => {
      showToast('Browse campaigns (demo)');
      setStep(1);
    });
    requiredFields.forEach((field) => {
      field.addEventListener('input', () => {
        clearError(field);
        if (validationStatus) {
          validationStatus.textContent = '';
        }
      });
    });

    cartBadgeButton?.addEventListener('click', () => {
      setStep(1);
    });

    const attachAddHandlers = () => {
      getAddButtons().forEach((button) => {
        button.addEventListener('click', handleAddClick);
      });
    };

    injectAddButtons();
    attachAddHandlers();
    renderCartItems();
    setStep(1);
    handleRecurringToggle();
    if (checkoutBody) {
      checkoutBody.dataset.collapsed = 'false';
    }
    refreshMobileToggle();
    updateBadge();
  };

  /* ═══════════════════════════════════════════════════════════════════════════════
   * نقطة التهيئة الرئيسية - MAIN INITIALIZATION POINT
   * 
   * لإيقاف أي وظيفة، ضع // قبلها
   * To disable any function, add // before it
   * ═══════════════════════════════════════════════════════════════════════════════ */
  document.addEventListener("DOMContentLoaded", () => {

    /* ═══════════════════════════════════════════════════════════════════════════
     * الوظائف الأساسية - CORE FUNCTIONS (مطلوبة للتشغيل الأساسي)
     * ═══════════════════════════════════════════════════════════════════════════ */

    // تبديل الثيم (فاتح/داكن) - Theme toggle (light/dark)
    initThemeToggle();

    // القائمة الجانبية - Sidebar navigation
    initSidebar();

    // القوائم الفرعية في الشريط الجانبي - Sidebar expandable submenus
    initSidebarSubmenus();

    // جميع القوائم المنسدلة - All dropdown menus
    Dropdowns.init();

    // مساعدات الوصول وتنقل لوحة المفاتيح - Accessibility & keyboard navigation
    initAccessibilityHelpers();

    /* ═══════════════════════════════════════════════════════════════════════════
     * صفحة النظرة العامة - OVERVIEW PAGE
     * ═══════════════════════════════════════════════════════════════════════════ */

    // الصفحة الرئيسية والرسوم البيانية والخريطة - Main overview with charts & map
    initOverviewPage();

    // صفحة نظرة عامة المتبرعين - Donors overview page
    if (typeof initDonorsOverviewPage === "function") {
      initDonorsOverviewPage();
    }

    /* ═══════════════════════════════════════════════════════════════════════════
     * عروض البطاقات والجداول - VIEW TOGGLES (Cards/Table)
     * ═══════════════════════════════════════════════════════════════════════════ */

    // تبديل عرض الحملات (بطاقات/جدول) - Campaign view toggle (cards/table)
    initCampaignViewToggle();

    // تبديل عرض التبرعات (بطاقات/جدول) - Donations view toggle (cards/table)
    initDonationsViewToggle();

    // محدد نوع التبرع (يتحكم في الأعمدة المرئية) - Donation type selector
    initDonationTypeSelector();

    // تبديل عرض المتبرعين (بطاقات/جدول) - Donors view toggle (cards/table)
    initDonorsViewToggle();

    /* ═══════════════════════════════════════════════════════════════════════════
     * الفلاتر - FILTERS
     * ═══════════════════════════════════════════════════════════════════════════ */

    // فلاتر الحملات (الدرج الجانبي) - Campaign filters (side drawer)
    initCampaignFilters();

    // فلاتر التبرعات (الدرج الجانبي) - Donations filters (side drawer)
    initDonationsFilters();

    // فلاتر المتبرعين (الدرج الجانبي) - Donors filters (side drawer)
    initDonorsFilters();

    /* ═══════════════════════════════════════════════════════════════════════════
     * إجراءات الحملات - CAMPAIGN ACTIONS
     * ═══════════════════════════════════════════════════════════════════════════ */

    // قوائم إجراءات الحملات (حذف، تعديل، نسخ) - Campaign action menus
    initCampaignActions();

    // تحديث واجهة الحملات (البطاقات والصفوف) - Refresh campaign UI
    refreshCampaignUI();

    // تبويبات حالة الحملات (الكل/نشط/مكتمل) - Campaign status tabs
    initCampaignStatusTabs();

    // نافذة تأكيد إغلاق الحملة - Close campaign confirmation modal
    initCampaignCloseModal();

    /* ═══════════════════════════════════════════════════════════════════════════
     * إجراءات التبرعات والمتبرعين - DONATIONS & DONORS ACTIONS
     * ═══════════════════════════════════════════════════════════════════════════ */

    // قوائم إجراءات التبرعات - Donation action menus
    initDonationsActions();

    // قوائم إجراءات المتبرعين - Donor action menus
    initDonorsActions();

    /* ═══════════════════════════════════════════════════════════════════════════
     * لوحات المعاينة - PREVIEW PANELS
     * ═══════════════════════════════════════════════════════════════════════════ */

    // لوحة معاينة الحملة - Campaign preview side panel
    initCampaignPreview();

    // لوحة معاينة التبرع - Donation preview side panel
    initDonationsPreview();

    // لوحة معاينة المتبرع - Donor preview side panel
    initDonorsPreview();

    /* ═══════════════════════════════════════════════════════════════════════════
     * صفحة المتبرعين - DONORS PAGE
     * ═══════════════════════════════════════════════════════════════════════════ */

    // صفحة قائمة المتبرعين (الجدول والبحث والفرز) - Donors list page
    initDonorsPage();

    /* ═══════════════════════════════════════════════════════════════════════════
     * نماذج الحملات - CAMPAIGN FORMS
     * ═══════════════════════════════════════════════════════════════════════════ */

    // محدد الوسوم متعدد الاختيار - Multi-select tag picker
    initMultiSelectTags();

    // منطقة رفع صور وفيديو الحملة - Campaign image/video upload dropzone
    initCampaignImageUpload();

    // تنسيق حقول نموذج الحملة (العملة، الأرقام) - Campaign form field formatting
    initCampaignFormFormatting();

    // معاينة نموذج الحملة المباشرة - Campaign form live preview
    initCampaignFormPreview();

    // التحقق من صحة نموذج الحملة - Campaign form validation
    initCampaignFormValidation();

    // ميزات إضافية لإنشاء الحملة - Extra campaign creation features
    initCampaignCreationExtras();

    /* ═══════════════════════════════════════════════════════════════════════════
     * صفحات التفاصيل - DETAILS PAGES
     * ═══════════════════════════════════════════════════════════════════════════ */

    // صفحة تفاصيل تبرع واحد - Single donation details page
    initDonationDetailsPage();

    // صفحة تفاصيل متبرع واحد - Single donor details page
    initDonorDetailsPage();

    /* ═══════════════════════════════════════════════════════════════════════════
     * سلة التبرعات - DONATIONS CHECKOUT
     * ═══════════════════════════════════════════════════════════════════════════ */

    // سلة التبرعات وعملية الدفع - Donation cart and checkout process
    initDonationsCheckout();

    /* ═══════════════════════════════════════════════════════════════════════════
     * صفحات المتبرعين الإضافية - ADDITIONAL DONOR PAGES
     * ═══════════════════════════════════════════════════════════════════════════ */

    // صفحة تبرعات متبرع معين - Specific donor's donations page
    if (typeof initDonorDonationsPage === "function") {
      initDonorDonationsPage();
    }

    // صفحة التبرع اليدوي - Manual donation page
    if (typeof initManualDonationPage === "function") {
      initManualDonationPage();
    }

    // صفحة إضافة متبرع جديد - New donor creation page
    initDonorNewPage && initDonorNewPage();

    /* ═══════════════════════════════════════════════════════════════════════════
     * صفحات إدارية أخرى - OTHER ADMIN PAGES
     * ═══════════════════════════════════════════════════════════════════════════ */

    // صفحة الرسائل والمحادثات - Messages and conversations page
    initMessagesPage();

    // صفحة الإعدادات (الفواتير، الزكاة، أنواع التبرعات) - Settings page
    initSettingsPage();

    // صفحة إدارة الفريق (الأعضاء، الأدوار، الصلاحيات) - Team management page
    initTeamPage();

    // صفحة التكاملات الخارجية - External integrations page
    initIntegrationsPage();

    // صفحة سجل مراجعة الوصول - Access audit log page
    initAccessAuditPage();

    // صفحة تصدير البيانات - Data exports page
    if (typeof initExportsPage === "function") {
      initExportsPage();
    }

    /* ═══════════════════════════════════════════════════════════════════════════
     * الإشعارات - NOTIFICATIONS
     * ═══════════════════════════════════════════════════════════════════════════ */

    // زر تعليم جميع الإشعارات كمقروءة - Mark all notifications as read button
    const markAllNotifications = document.querySelector(".js-mark-notifications");
    if (markAllNotifications) {
      markAllNotifications.addEventListener("click", markNotificationsAsRead);
    }
  });

})();

