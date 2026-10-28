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

  const game = document.querySelector("#signal-game");
  if (game) {
    const levels = [
      { start: [0, 0], exit: [5, 5], signals: [[2, 1], [4, 1], [1, 4]], walls: [[1, 2], [3, 2], [4, 4]] },
      { start: [0, 5], exit: [5, 0], signals: [[1, 4], [3, 4], [4, 1]], walls: [[1, 5], [2, 3], [4, 3], [3, 1], [5, 2]] },
      { start: [0, 0], exit: [5, 5], signals: [[0, 3], [3, 1], [4, 4]], walls: [[1, 1], [2, 1], [2, 3], [4, 2], [1, 4], [3, 4]] },
    ];
    const board = game.querySelector("#game-board");
    const status = game.querySelector("#game-status");
    const levelLabel = game.querySelector("#game-level");
    const movesLabel = game.querySelector("#game-moves");
    const signalsLabel = game.querySelector("#game-signals");
    const resetButton = game.querySelector("#game-reset");
    const nextButton = game.querySelector("#game-next");
    let levelIndex = 0;
    let player = [...levels[0].start];
    let collected = new Set();
    let moves = 0;
    let complete = false;

    const keyOf = ([row, col]) => `${row},${col}`;
    const render = () => {
      const level = levels[levelIndex];
      const walls = new Set(level.walls.map(keyOf));
      const signals = new Set(level.signals.map(keyOf));
      board.replaceChildren();
      for (let row = 0; row < 6; row += 1) {
        for (let col = 0; col < 6; col += 1) {
          const point = [row, col];
          const key = keyOf(point);
          const cell = document.createElement("div");
          cell.className = "game-cell";
          cell.setAttribute("role", "gridcell");
          if (walls.has(key)) {
            cell.classList.add("is-wall");
            cell.setAttribute("aria-label", `Row ${row + 1}, column ${col + 1}, blocked`);
          } else if (player[0] === row && player[1] === col) {
            cell.classList.add("is-player");
            cell.textContent = "●";
            cell.setAttribute("aria-label", `Row ${row + 1}, column ${col + 1}, you`);
          } else if (signals.has(key) && !collected.has(key)) {
            cell.classList.add("is-signal");
            cell.textContent = "+";
            cell.setAttribute("aria-label", `Row ${row + 1}, column ${col + 1}, signal`);
          } else if (level.exit[0] === row && level.exit[1] === col) {
            cell.classList.add("is-exit");
            cell.textContent = collected.size === level.signals.length ? "↗" : "·";
            cell.setAttribute("aria-label", `Row ${row + 1}, column ${col + 1}, ${collected.size === level.signals.length ? "open exit" : "locked exit"}`);
          } else {
            cell.setAttribute("aria-label", `Row ${row + 1}, column ${col + 1}, empty`);
          }
          board.append(cell);
        }
      }
      levelLabel.textContent = `STAGE ${String(levelIndex + 1).padStart(2, "0")} / ${String(levels.length).padStart(2, "0")}`;
      movesLabel.textContent = `MOVES ${String(moves).padStart(2, "0")}`;
      signalsLabel.textContent = `SIGNALS ${collected.size} / ${level.signals.length}`;
    };

    const restart = () => {
      player = [...levels[levelIndex].start];
      collected = new Set();
      moves = 0;
      complete = false;
      nextButton.hidden = true;
      resetButton.hidden = false;
      status.textContent = "Collect the signals, then find the exit.";
      render();
    };

    const move = (direction) => {
      if (complete) return;
      const deltas = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
      const [dr, dc] = deltas[direction];
      const next = [player[0] + dr, player[1] + dc];
      const level = levels[levelIndex];
      if (next[0] < 0 || next[0] > 5 || next[1] < 0 || next[1] > 5 || level.walls.some(([r, c]) => r === next[0] && c === next[1])) {
        status.textContent = "Blocked. Try another direction.";
        return;
      }
      player = next;
      moves += 1;
      const key = keyOf(player);
      const found = level.signals.some((point) => keyOf(point) === key && !collected.has(key));
      if (found) {
        collected.add(key);
        status.textContent = `Signal found. ${level.signals.length - collected.size} left to collect.`;
      } else if (keyOf(player) === keyOf(level.exit) && collected.size < level.signals.length) {
        status.textContent = "Exit is locked. Find every signal first.";
      } else if (keyOf(player) === keyOf(level.exit)) {
        complete = true;
        resetButton.hidden = true;
        nextButton.hidden = false;
        nextButton.innerHTML = levelIndex === levels.length - 1 ? 'Play again <span aria-hidden="true">↻</span>' : 'Next stage <span aria-hidden="true">→</span>';
        status.textContent = `Stage clear in ${moves} moves. Nice work.`;
      } else {
        status.textContent = "Keep exploring. Find all signals, then reach the exit.";
      }
      render();
    };

    game.querySelectorAll("[data-move]").forEach((button) => {
      button.addEventListener("click", () => move(button.dataset.move));
    });
    game.addEventListener("keydown", (event) => {
      const directions = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right" };
      const direction = directions[event.key];
      if (direction) {
        event.preventDefault();
        move(direction);
      }
    });
    resetButton.addEventListener("click", restart);
    nextButton.addEventListener("click", () => {
      levelIndex = (levelIndex + 1) % levels.length;
      restart();
    });
    render();
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
