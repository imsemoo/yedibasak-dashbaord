// Utility to read CSS variables with trimming
const getCssVar = (variable) => getComputedStyle(document.body).getPropertyValue(variable).trim();

const Dropdowns = (() => {
  let toggles = [];
  let panels = [];
  const attr = "data-dropdown-target";

  const findPanel = (id) => panels.find((panel) => panel.dataset.dropdownPanel === id);
  const findToggle = (id) => toggles.find((toggle) => toggle.getAttribute(attr) === id);

  const closeAll = () => {
    panels.forEach((panel) => panel.classList.remove("is-open"));
    toggles.forEach((toggle) => toggle.setAttribute("aria-expanded", "false"));
  };

  const open = (id) => {
    const panel = findPanel(id);
    const toggle = findToggle(id);
    if (!panel || !toggle) return;
    closeAll();
    panel.classList.add("is-open");
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
    const id = event.currentTarget.getAttribute(attr);
    toggleDropdown(id);
  };

  const handleToggleKeydown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const id = event.currentTarget.getAttribute(attr);
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

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleEsc);
  };

  return { init, closeAll, open, toggle: toggleDropdown };
})();

document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "donations-dashboard-theme";
  const app = document.querySelector(".app");
  const sidebarToggles = document.querySelectorAll(".js-sidebar-toggle");
  const sidebarOverlay = document.querySelector(".js-sidebar-overlay");
  const themeToggle = document.querySelector(".js-theme-toggle");
  const themeToggleIcon = themeToggle ? themeToggle.querySelector("i") : null;
  const mobileQuery = window.matchMedia("(max-width: 992px)");
  const notificationsToggle = document.querySelector(".js-notifications-toggle");
  const markAllNotifications = document.querySelector(".js-mark-notifications");

  let barChart;
  let donutChart;

  const barCategories = ["Education", "Healthcare", "Emergency Relief", "Operations", "Community"];
  const donutLabels = ["One-time", "Recurring", "Corporate", "In-kind"];

  const syncThemeIcon = (theme) => {
    if (!themeToggleIcon) return;
    themeToggleIcon.className = theme === "dark" ? "fas fa-moon" : "fas fa-sun";
  };

  const getTheme = () => (document.body.getAttribute("data-theme") === "dark" ? "dark" : "light");

  const updateChartsTheme = () => {
    if (!barChart && !donutChart) return;
    const palette = {
      primary: getCssVar("--color-primary") || "#15C5CE",
      primaryDeep: getCssVar("--color-primary-deep") || "#0F9AA2",
      primarySoft: getCssVar("--color-primary-soft") || "#E5FBFC",
      border: getCssVar("--color-border") || "#E1E5F0",
      text: getCssVar("--color-text-main") || "#1F2933",
      muted: getCssVar("--color-text-muted") || "#6B7280",
      card: getCssVar("--color-card-bg") || "#FFFFFF",
      background: getCssVar("--color-bg") || "#F5F7FB",
    };
    const themeMode = getTheme();

    if (barChart) {
      barChart.updateOptions({
        colors: [palette.primary],
        chart: { foreColor: palette.text, background: palette.card },
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
        colors: [palette.primary, palette.primaryDeep, "#22C55E", "#F59E0B"],
        legend: { labels: { colors: palette.text } },
        stroke: { colors: [palette.background] },
        tooltip: { theme: themeMode },
      });
    }
  };

  const applyTheme = (theme) => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    syncThemeIcon(theme);
    updateChartsTheme();
  };

  const initTheme = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored || (prefersDark ? "dark" : "light");
    document.body.setAttribute("data-theme", initial);
    syncThemeIcon(initial);
  };

  const closeMobileSidebar = () => {
    if (!app) return;
    app.classList.remove("sidebar-open");
  };

  const toggleSidebar = () => {
    if (!app) return;
    if (mobileQuery.matches) {
      app.classList.toggle("sidebar-open");
      app.classList.remove("sidebar-collapsed");
    } else {
      app.classList.toggle("sidebar-collapsed");
      app.classList.remove("sidebar-open");
    }
  };

  const getChartPalette = () => ({
    primary: getCssVar("--color-primary") || "#15C5CE",
    primaryDeep: getCssVar("--color-primary-deep") || "#0F9AA2",
    primarySoft: getCssVar("--color-primary-soft") || "#E5FBFC",
    border: getCssVar("--color-border") || "#E1E5F0",
    text: getCssVar("--color-text-main") || "#1F2933",
    muted: getCssVar("--color-text-muted") || "#6B7280",
    card: getCssVar("--color-card-bg") || "#FFFFFF",
    background: getCssVar("--color-bg") || "#F5F7FB",
  });

  const buildCharts = () => {
    const palette = getChartPalette();
    const themeMode = getTheme();

    const barOptions = {
      chart: {
        type: "bar",
        height: 320,
        toolbar: { show: false },
        foreColor: palette.text,
        background: palette.card,
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
    };

    const donutOptions = {
      chart: {
        type: "donut",
        height: 320,
      },
      labels: donutLabels,
      series: [44, 26, 18, 12],
      colors: [palette.primary, palette.primaryDeep, "#22C55E", "#F59E0B"],
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

  const markNotificationsAsRead = () => {
    const notificationPanel = document.querySelector('[data-dropdown-panel="notifications"]');
    if (!notificationPanel) return;
    const unreadItems = notificationPanel.querySelectorAll(".dropdown-notification.is-unread");
    unreadItems.forEach((item) => item.classList.remove("is-unread"));
    const badge = notificationsToggle?.querySelector(".badge-dot");
    if (badge) {
      badge.classList.add("is-hidden");
    }
  };

  // Initialize theme before charts for correct colors
  initTheme();

  // Initialize dropdowns
  Dropdowns.init();

  // Build charts after theme is set
  buildCharts();

  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = getTheme() === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
    });
  }

  // Sidebar toggles
  sidebarToggles.forEach((btn) => {
    btn.addEventListener("click", toggleSidebar);
  });

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeMobileSidebar);
  }

  // Close mobile sidebar when resizing to desktop
  mobileQuery.addEventListener("change", () => {
    if (!mobileQuery.matches) {
      closeMobileSidebar();
    }
  });

  // Mark notifications as read
  if (markAllNotifications) {
    markAllNotifications.addEventListener("click", () => {
      markNotificationsAsRead();
    });
  }
});
