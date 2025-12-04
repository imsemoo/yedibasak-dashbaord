(() => {
  "use strict";

  // Utility helper to read CSS variables
  const getCssVar = (variable) => getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

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
  let refreshRegionsMapTheme = () => {};
  let donationsMapInitialized = false;

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
  });

  // Refresh chart colors on theme changes without re-instantiating
  const updateChartsTheme = () => {
    if (!barChart && !donutChart) return;
    const palette = chartPalette();
    const themeMode = getTheme();

    if (barChart) {
      barChart.updateOptions({
        colors: [palette.primary],
        chart: { foreColor: palette.text, background: palette.surface },
        grid: { borderColor: palette.border },
        xaxis: {
          labels: { style: { colors: barCategories.map(() => palette.muted) } },
          axisBorder: { color: palette.border },
          axisTicks: { color: palette.border },
        },
        yaxis: { labels: { style: { colors: [palette.muted] } } },
        tooltip: { theme: themeMode },
        stroke: { colors: [palette.primary] },
      });
    }

    if (donutChart) {
      donutChart.updateOptions({
        colors: [palette.primary, palette.primaryStrong, "#22C55E", "#F59E0B"],
        legend: { labels: { colors: palette.text } },
        stroke: { colors: [palette.background] },
        tooltip: { theme: themeMode },
      });
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
    updateChartsTheme();
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
    const themeMode = getTheme();

    const barOptions = {
      chart: {
        type: "bar",
        height: 320,
        toolbar: { show: false },
        foreColor: palette.text,
        background: palette.surface,
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
        borderColor: palette.border,
        strokeDashArray: 3,
      },
      xaxis: {
        categories: barCategories,
        axisBorder: { color: palette.border },
        axisTicks: { color: palette.border },
        labels: {
          style: {
            colors: barCategories.map(() => palette.muted),
            fontWeight: 500,
          },
        },
      },
      yaxis: {
        labels: {
          style: { colors: [palette.muted], fontWeight: 500 },
        },
      },
      tooltip: {
        theme: themeMode,
        y: { formatter: (val) => `$${val.toLocaleString()}` },
      },
      dataLabels: {
        enabled: false,
      },
      states: {
        active: { filter: { type: "none" } },
        hover: { filter: { type: "none" } },
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
      chart: {
        type: "donut",
        height: 320,
      },
      labels: donutLabels,
      series: [44, 26, 18, 12],
      colors: [palette.primary, palette.primaryStrong, "#22C55E", "#F59E0B"],
      stroke: {
        colors: [palette.background],
      },
      legend: {
        position: "bottom",
        labels: { colors: palette.text },
        fontWeight: 600,
      },
      dataLabels: { enabled: false },
      tooltip: { theme: themeMode },
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
      barChart = new ApexCharts(barEl, barOptions);
      barChart.render();
    }

    if (donutEl) {
      donutChart = new ApexCharts(donutEl, donutOptions);
      donutChart.render();
    }
  };

  const initCharts = () => {
    buildCharts();
    updateChartsTheme();
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
      const border = getCssVar("--color-border") || "#e2e8f3";
      return {
        high: { fill: primary, stroke: border },
        medium: { fill: primaryStrong, stroke: border },
        low: { fill: muted, stroke: border },
      };
    };

    const map = L.map(mapContainer, { worldCopyJump: true, zoomControl: false });
    map.setView([12, 10], 2.5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);

    const updateMarkerStyles = (activeId, hoverId = "") => {
      const palette = getLevelStyles();
      markers.forEach(({ marker, baseRadius, region }) => {
        const colors = palette[region.level] || palette.low;
        const isActive = region.id === activeId;
        const isHover = hoverId && region.id === hoverId && !isActive;
        const radius = baseRadius + (isActive ? 3 : isHover ? 1.5 : 0);
        marker.setStyle({
          color: colors.stroke,
          fillColor: colors.fill,
          radius,
          weight: isActive ? 3 : 2,
          fillOpacity: isActive ? 0.95 : isHover ? 0.9 : 0.85,
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
        fillOpacity: 0.88,
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
        row.addEventListener("mouseenter", () => setHoverRegion(id));
        row.addEventListener("mouseleave", () => setHoverRegion(activeRegionId));
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
    initCharts();
    initCampaignViewToggle();
    initDonationsViewToggle();
    initCampaignFilters();
    initDonationsFilters();
    initCampaignActions();
    initDonationsActions();
    initCampaignPreview();
    initDonationsPreview();
    initMultiSelectTags();
    initCampaignImageUpload();
    initCampaignFormFormatting();
    initCampaignFormPreview();
    initCampaignFormValidation();
    initDonationDetailsPage();

    const markAllNotifications = document.querySelector(".js-mark-notifications");
    if (markAllNotifications) {
      markAllNotifications.addEventListener("click", markNotificationsAsRead);
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    initDonationsMap();
  });

  window.addEventListener("load", () => {
    initDonationsMap();
  });
})();
