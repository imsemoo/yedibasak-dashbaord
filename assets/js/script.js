(() => {
  "use strict";

  // Utility helper to read CSS variables
  const getCssVar = (variable) => getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

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

  // Dropdown controller for notifications and user menu
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
  const DONORS_VIEW_STORAGE_KEY = "dd_donors_view_mode";
  const mobileQuery = window.matchMedia("(max-width: 1023px)");
  const barCategories = ["Education", "Healthcare", "Emergency Relief", "Operations", "Community"];
  const donutLabels = ["One-time", "Recurring", "Corporate", "In-kind"];
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

  const applyTheme = (theme) => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    syncThemeIcon(theme);
    updateChartsForTheme(theme);
    updateMapForTheme(theme);
    refreshRegionsMapTheme();
  };

  // Persist theme preference and wire up toggle
  const initThemeToggle = () => {
    const themeToggle = document.querySelector(".js-theme-toggle");
    const stored = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored || (prefersDark ? "dark" : "light");

    document.body.setAttribute("data-theme", initial);
    syncThemeIcon(initial);

    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const nextTheme = getTheme() === "dark" ? "light" : "dark";
        applyTheme(nextTheme);
      });
    }
  };

  // Handle sidebar for mobile (slide over) and desktop (collapse)
  const initSidebar = () => {
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

    sidebarToggles.forEach((btn) => {
      btn.setAttribute("aria-expanded", "false");
      btn.addEventListener("click", toggleSidebar);
    });

    overlay?.addEventListener("click", closeMobileSidebar);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMobileSidebar();
      }
    });

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

  const initCharts = () => {
    buildCharts();
    updateChartsForTheme(getTheme());
  };

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

  const initOverviewPage = () => {
    const root = document.querySelector(".overview-page");
    if (!root) return;
    initCharts();
    initDonationsMap();
    initOverviewMiniCharts();
    initOverviewAnimations(root);
  };

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

    const map = L.map(mapContainer, { worldCopyJump: true, zoomControl: false });
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

  // Improve keyboard flow for skip link and main focus
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

  // Off-canvas filters for campaigns list
  const initCampaignFilters = () => {
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

  // View toggle for campaigns (cards vs table)
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

  // Local dropdowns for campaign actions
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

  // Quick campaign preview side sheet
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

  const initDonationsViewToggle = () => {
    const viewToggle = document.querySelector(".view-toggle[data-view-context='donations']");
    const viewButtons = viewToggle ? Array.from(viewToggle.querySelectorAll(".view-toggle__btn")) : [];
    const views = Array.from(document.querySelectorAll(".donations-view"));
    if (!viewToggle || !viewButtons.length || !views.length) return;

    const validModes = viewButtons.map((btn) => btn.dataset.viewMode).filter(Boolean);
    const stored = localStorage.getItem(DONATIONS_VIEW_STORAGE_KEY);
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

  const initDonationsFilters = () => {
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

  const initDonorsFilters = () => {
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

    trigger.addEventListener("click", toggle);
    closeButtons.forEach((btn) => btn.addEventListener("click", close));
    backdrop?.addEventListener("click", close);

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

    fields.forEach((field) => field.addEventListener("change", updateBadge));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && offcanvas.classList.contains("is-open")) {
        close();
      }
    });

    updateBadge();
  };

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
        lastEl.textContent = dataset?.donorLastGift || "—";
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

  const initDonorsPage = () => {
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

  // Campaign form preview
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

    document.addEventListener("campaign:imageChange", (event) => {
      const detail = event.detail || {};
      handleImageChange(detail.src, detail.isPlaceholder);
    });

    document.addEventListener("campaign:tagsChange", (event) => {
      setPreviewTags(event.detail?.tags || []);
      animatePreviewCard();
    });

    syncPreview();
    setPreviewImage(defaultImage, true);
  };

  // Multi-select for tags/categories
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

  // Image upload drag/drop with validation + preview bridge
  const initCampaignImageUpload = () => {
    const upload = document.querySelector("[data-upload]");
    if (!upload) return;

    const dropzone = upload.querySelector("[data-upload-dropzone]");
    const input = upload.querySelector('input[type="file"]');
    const previewImg = upload.querySelector(".image-upload__preview-img");
    const placeholder = upload.querySelector(".image-upload__placeholder");
    const errorEl = upload.querySelector("[data-upload-error]");
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const maxSize = 5 * 1024 * 1024;
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
      document.dispatchEvent(new CustomEvent("campaign:imageChange", { detail: { src: null, isPlaceholder: true } }));
    };

    const applyPreview = (url) => {
      placeholder?.classList.add("is-hidden");
      if (previewImg) {
        previewImg.src = url;
        previewImg.classList.remove("is-hidden");
      }
      document.dispatchEvent(new CustomEvent("campaign:imageChange", { detail: { src: url, isPlaceholder: false } }));
    };

    const handleFile = (file) => {
      if (!file) {
        resetPreview();
        return;
      }
      const isValidType = allowedTypes.includes(file.type) || (file.type === "" && /\.(png|jpe?g|webp)$/i.test(file.name));
      const isValidSize = file.size <= maxSize;
      if (!isValidType || !isValidSize) {
        showError("Only JPG, PNG, or WebP under 5 MB.");
        if (input) input.value = "";
        resetPreview();
        return;
      }
      clearError();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      objectUrl = URL.createObjectURL(file);
      applyPreview(objectUrl);
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

  // Form formatting helpers (currency, capitalization, counters)
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

  // Soft validation states and submit guardrails
  const initCampaignFormValidation = () => {
    const form = document.querySelector(".js-campaign-form");
    if (!form) return;

    const nameField = form.querySelector("#campaignName");
    const targetField = form.querySelector("#targetAmount");
    const tagsHidden = form.querySelector("[data-multi-hidden]");
    const tagsControl = form.querySelector(".multi-select__control");

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

  const showToast = (message, variant = "success") => {
    const container = document.querySelector(".toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast toast--${variant}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 4200);
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

  const initManualDonationPage = () => {
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
    const currencySymbols = { USD: "$", EUR: "€", TRY: "₺" };

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
              <p class="donor-result__meta">${donor.email} · ${donor.city}</p>
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
        summaryEmail.textContent = donorEmail || "—";
      }
      if (summaryLocation) {
        summaryLocation.textContent = customLocationParts.length ? customLocationParts.join(", ") : "—";
      }
      if (summaryAmount) {
        summaryAmount.textContent = amountValue > 0 ? `${currencySymbols[currencyField.value] || ""}${formatAmountDisplay(amountValue)}` : "—";
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
          : "—";
      }
      if (summaryAllocation) {
        summaryAllocation.textContent = allocationField.value.trim() || "—";
      }
      if (summaryMethod) {
        summaryMethod.textContent = paymentMethodField.value
          ? paymentMethodField.selectedOptions?.[0]?.textContent?.trim()
          : "—";
      }
      if (summaryDate) {
        summaryDate.textContent = formatPreviewDate(dateField.value) || "—";
      }
      if (summaryReference) {
        summaryReference.textContent = referenceField.value.trim() || "—";
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
      dateField.value = new Date().toISOString().split("T")[0];
    }

    setDonorMode("existing");
    renderDonorResults();
    updateSummary();
  };

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

  const initDonorDetailsPage = () => {
    const page = document.querySelector(".donor-details-page");
    if (!page) return;
    buildDonorGivingChart();
    initDonorHistoryFilters(page);
    initDonorSegments(page);
    setupDonationTimelineReveal(page);
  };

  const initDonorNewPage = () => {
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
      if (!(event.target instanceof HTMLSelectElement)) return;
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

  const initMessagesPage = () => {
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

  const initSettingsPage = () => {
    const page = document.querySelector(".settings-page");
    if (!page) return;

    const navItems = Array.from(page.querySelectorAll(".settings-nav__item"));
    const panels = Array.from(page.querySelectorAll(".settings-panel"));
    const previewLabel = page.querySelector("[data-theme-preview-value]");
    const themeRadios = Array.from(page.querySelectorAll('input[name="preferences-theme"]'));

    const activateTab = (tab) => {
      if (!tab) return;
      navItems.forEach((item) => {
        item.classList.toggle("is-active", item.dataset.settingsTab === tab);
      });

      panels.forEach((panel) => {
        panel.classList.toggle("settings-panel--active", panel.dataset.settingsPanel === tab);
      });
    };

    const updateThemePreview = () => {
      if (!previewLabel || !themeRadios.length) return;
      const active = themeRadios.find((radio) => radio.checked);
      const previewText = active?.dataset?.preview || active?.value || "System default";
      previewLabel.textContent = `Theme: ${previewText}`;
    };

    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        const tab = item.dataset.settingsTab;
        activateTab(tab);
      });
    });

    themeRadios.forEach((radio) => {
      radio.addEventListener("change", updateThemePreview);
    });

    const first = navItems[0];
    if (first && first.dataset.settingsTab) {
      activateTab(first.dataset.settingsTab);
    }
    updateThemePreview();
  };

  const initDonationDetailsPage = () => {
    const page = document.querySelector(".donation-details-page");
    if (!page) return;

    setupDonationDetailsActions(page);
    setupDonationDetailsStickyBar(page);
    setupDonationTimelineReveal(page);
  };

  document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    initSidebar();
    initSidebarSubmenus();
    Dropdowns.init();
    initAccessibilityHelpers();
    initOverviewPage();
    initCampaignViewToggle();
    initDonationsViewToggle();
    initDonorsViewToggle();
    initCampaignFilters();
    initDonationsFilters();
    initDonorsFilters();
    initCampaignActions();
    initDonationsActions();
    initDonorsActions();
    initCampaignPreview();
    initDonationsPreview();
    initDonorsPreview();
    initDonorsPage();
    initMultiSelectTags();
    initCampaignImageUpload();
    initCampaignFormFormatting();
    initCampaignFormPreview();
    initCampaignFormValidation();
    initDonationDetailsPage();
    initDonorDetailsPage();
    initManualDonationPage();
    initDonorNewPage && initDonorNewPage();
    initMessagesPage();
    initSettingsPage();

    const markAllNotifications = document.querySelector(".js-mark-notifications");
    if (markAllNotifications) {
      markAllNotifications.addEventListener("click", markNotificationsAsRead);
    }
  });

})();
