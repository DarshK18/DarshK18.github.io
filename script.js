(() => {
  const clock = document.querySelector("#live-clock");
  const year = document.querySelector("#current-year");
  const themeToggle = document.querySelector("#theme-toggle");
  const themeIcon = document.querySelector("#theme-icon");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const root = document.documentElement;

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  if (clock) {
    const updateClock = () => {
      clock.textContent = new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(new Date());
    };
    updateClock();
    window.setInterval(updateClock, 1000);
  }

  if (themeToggle && themeIcon) {
    const applyTheme = (theme, save = false) => {
      const isDark = theme === "dark";
      root.dataset.theme = isDark ? "dark" : "light";
      themeIcon.textContent = isDark ? "☼" : "☾";
      const label = isDark ? "Switch to light mode" : "Switch to dark mode";
      themeToggle.setAttribute("aria-label", label);
      themeToggle.title = label;
      if (themeColor) {
        themeColor.content = isDark ? "#111113" : "#fefefe";
      }
      if (save) {
        window.localStorage.setItem("portfolio-theme", isDark ? "dark" : "light");
      }
    };

    const savedTheme = window.localStorage.getItem("portfolio-theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(savedTheme === "dark" || (!savedTheme && systemPrefersDark) ? "dark" : "light");
    themeToggle.addEventListener("click", () => {
      applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
    });
  }
})();
