(() => {
  const clock = document.querySelector("#live-clock");
  const year = document.querySelector("#current-year");

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
})();
