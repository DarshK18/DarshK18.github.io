(() => {
  const localHosts = ["localhost", "127.0.0.1", "::1", "[::1]"];
  window.PORTFOLIO_CHAT_API_BASE = localHosts.includes(window.location.hostname)
    ? "http://127.0.0.1:8001"
    : "";
})();
