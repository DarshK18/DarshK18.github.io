(() => {
  const clock = document.querySelector("#live-clock");
  const year = document.querySelector("#current-year");
  const themeToggle = document.querySelector("#theme-toggle");
  const themeIcon = document.querySelector("#theme-icon");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const root = document.documentElement;

  const applyTheme = (theme, save = false) => {
    const isDark = theme === "dark";
    root.dataset.theme = isDark ? "dark" : "light";
    themeIcon.textContent = isDark ? "☼" : "☾";
    const label = isDark ? "Switch to light mode" : "Switch to dark mode";
    themeToggle.setAttribute("aria-label", label);
    themeToggle.title = label;
    themeToggle.setAttribute("aria-pressed", String(isDark));
    if (themeColor) themeColor.content = isDark ? "#111113" : "#f4f5f6";
    if (save) {
      try {
        window.localStorage.setItem("portfolio-theme", isDark ? "dark" : "light");
      } catch {
        // The selected theme still applies for this page even if storage is unavailable.
      }
    }
  };

  if (themeToggle && themeIcon) {
    let savedTheme = null;
    try {
      savedTheme = window.localStorage.getItem("portfolio-theme");
    } catch {
      // Use the system preference when browser storage is unavailable.
    }
    const systemPrefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    applyTheme(savedTheme === "dark" || (!savedTheme && systemPrefersDark) ? "dark" : "light");
    themeToggle.addEventListener("click", () => {
      applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
    });
  }

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

  const projectCards = [...document.querySelectorAll(".project-card[data-categories]")];
  const projectFilters = document.querySelectorAll(".project-filters [data-filter]");
  const projectCount = document.querySelector("#project-count");
  if (projectCards.length && projectFilters.length) {
    projectFilters.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        let visibleCount = 0;
        projectFilters.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        projectCards.forEach((card) => {
          const matches = filter === "all" || card.dataset.categories.split(/\s+/).includes(filter);
          card.hidden = !matches;
          if (matches) visibleCount += 1;
        });
        if (projectCount) projectCount.textContent = String(visibleCount).padStart(2, "0");
      });
    });
  }

  const credentialCards = [...document.querySelectorAll(".credential-item[data-kind]")];
  const credentialFilters = document.querySelectorAll(".credential-filters [data-credential-filter]");
  const credentialCount = document.querySelector("#credential-count");
  if (credentialCards.length && credentialFilters.length) {
    credentialFilters.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.credentialFilter;
        let visibleCount = 0;
        credentialFilters.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        credentialCards.forEach((card) => {
          const matches = filter === "all" || card.dataset.kind === filter;
          card.hidden = !matches;
          if (matches) visibleCount += 1;
        });
        if (credentialCount) credentialCount.textContent = String(visibleCount).padStart(2, "0");
      });
    });
  }

  const gameModeButtons = document.querySelectorAll("[data-game-mode]");
  const gameModePanels = document.querySelectorAll("[data-game-panel]");
  if (gameModeButtons.length && gameModePanels.length) {
    gameModeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const selectedMode = button.dataset.gameMode;
        gameModeButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        gameModePanels.forEach((panel) => {
          panel.hidden = panel.dataset.gamePanel !== selectedMode;
        });
      });
    });
  }

  const game = document.querySelector("#signal-game");
  if (game) {
    const levels = [
      { start: [0, 0], exit: [5, 5], signals: [[2, 1], [4, 1], [1, 4]], walls: [[1, 2], [3, 2], [4, 4]] },
      { start: [0, 5], exit: [5, 0], signals: [[1, 4], [3, 4], [4, 1]], walls: [[1, 5], [2, 3], [4, 3], [3, 1], [5, 2]] },
      { start: [0, 0], exit: [5, 5], signals: [[0, 3], [3, 1], [4, 4]], walls: [[1, 1], [2, 1], [2, 3], [4, 2], [1, 4], [3, 4]] },
      { start: [0, 5], exit: [5, 0], signals: [[0, 3], [2, 4], [4, 1]], walls: [[1, 2], [2, 2], [3, 2], [3, 4], [4, 4]] },
      { start: [5, 0], exit: [0, 5], signals: [[4, 2], [2, 4], [0, 3]], walls: [[1, 3], [2, 3], [3, 3], [3, 1], [4, 4], [1, 1]] },
      { start: [0, 0], exit: [5, 5], signals: [[1, 1], [3, 3], [4, 5]], walls: [[1, 2], [2, 2], [3, 4], [4, 2], [2, 4], [1, 4], [4, 1]] },
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

  const patternBoard = document.querySelector("#pattern-board");
  if (patternBoard) {
    const patterns = [
      [0, 2, 1],
      [1, 3, 0, 2],
      [2, 0, 3, 1, 2],
      [3, 1, 2, 0, 3, 1],
      [0, 3, 1, 2, 0, 1, 3],
      [2, 1, 3, 0, 2, 3, 1, 0],
    ];
    const keys = [...patternBoard.querySelectorAll("[data-pattern-tone]")];
    const levelLabel = document.querySelector("#pattern-level");
    const message = document.querySelector("#pattern-message");
    const progress = document.querySelector("#pattern-progress");
    const startButton = document.querySelector("#pattern-start");
    const nextButton = document.querySelector("#pattern-next");
    let levelIndex = 0;
    let inputIndex = 0;
    let acceptingInput = false;

    const updateLevel = () => {
      levelLabel.textContent = `STAGE ${String(levelIndex + 1).padStart(2, "0")} / ${String(patterns.length).padStart(2, "0")}`;
      progress.textContent = "REPEAT THE SIGNALS";
      message.textContent = "Ready when you are.";
      nextButton.hidden = true;
      startButton.disabled = false;
    };

    const showSequence = () => {
      acceptingInput = false;
      inputIndex = 0;
      startButton.disabled = true;
      nextButton.hidden = true;
      message.textContent = "Watch the pattern…";
      progress.textContent = `${patterns[levelIndex].length} SIGNALS`;
      let sequenceIndex = 0;
      const flashNext = () => {
        if (sequenceIndex >= patterns[levelIndex].length) {
          acceptingInput = true;
          startButton.disabled = false;
          message.textContent = "Your turn. Repeat the pattern.";
          progress.textContent = `0 / ${patterns[levelIndex].length}`;
          return;
        }
        const key = keys[patterns[levelIndex][sequenceIndex]];
        key.classList.add("is-lit");
        window.setTimeout(() => {
          key.classList.remove("is-lit");
          sequenceIndex += 1;
          window.setTimeout(flashNext, 190);
        }, 450);
      };
      window.setTimeout(flashNext, 300);
    };

    keys.forEach((key) => {
      key.addEventListener("click", () => {
        if (!acceptingInput) return;
        key.classList.add("is-lit");
        window.setTimeout(() => key.classList.remove("is-lit"), 170);
        if (Number(key.dataset.patternTone) !== patterns[levelIndex][inputIndex]) {
          acceptingInput = false;
          message.textContent = "That sequence did not match. Watch it again and retry.";
          progress.textContent = "TRY AGAIN";
          startButton.disabled = false;
          return;
        }
        inputIndex += 1;
        progress.textContent = `${inputIndex} / ${patterns[levelIndex].length}`;
        if (inputIndex === patterns[levelIndex].length) {
          acceptingInput = false;
          message.textContent = levelIndex === patterns.length - 1 ? "All six stages complete. Excellent recall." : "Correct pattern. Stage cleared.";
          nextButton.textContent = levelIndex === patterns.length - 1 ? "Play again ↻" : "Next stage →";
          nextButton.hidden = false;
          startButton.disabled = true;
        }
      });
    });

    startButton.addEventListener("click", showSequence);
    nextButton.addEventListener("click", () => {
      levelIndex = levelIndex === patterns.length - 1 ? 0 : levelIndex + 1;
      updateLevel();
    });
    updateLevel();
  }

  const evidenceFact = document.querySelector("#evidence-fact");
  if (evidenceFact) {
    const rounds = [
      { fact: "InkForge is a LangGraph pipeline for planning, researching, and drafting technical articles.", claim: "InkForge uses LangGraph to plan, research, and draft technical articles.", supported: true },
      { fact: "RAGGuard checks faithfulness, PII leakage, toxicity, p95 latency, and cost per query.", claim: "RAGGuard evaluates image-generation quality and GPU temperature.", supported: false },
      { fact: "The gesture-to-text system recognizes 50+ hand gestures with 88% accuracy.", claim: "The gesture-to-text system reports 88% gesture-recognition accuracy.", supported: true },
      { fact: "Darshan worked as an AI Engineer Intern at YBI Foundation from September 2025 to March 2026.", claim: "Darshan’s YBI Foundation internship ran from 2024 to 2025.", supported: false },
      { fact: "The Weather AI Agent uses a Gemini ReAct agent with live weather lookups and optional web search.", claim: "The Weather AI Agent is built around a Gemini ReAct agent.", supported: true },
      { fact: "The Expense Tracker MCP Agent uses a FastMCP backend and SQLite tools.", claim: "The Expense Tracker MCP Agent stores its tools in MongoDB.", supported: false },
      { fact: "BenchWiki maps 80 evaluations by capability and status.", claim: "BenchWiki currently maps 80 evaluations.", supported: true },
      { fact: "The Birth Weight Predictor is an end-to-end Flask and scikit-learn application.", claim: "The Birth Weight Predictor is a LangGraph multi-agent system.", supported: false },
    ];
    const claim = document.querySelector("#evidence-claim");
    const levelLabel = document.querySelector("#evidence-level");
    const scoreLabel = document.querySelector("#evidence-score");
    const message = document.querySelector("#evidence-message");
    const choiceButtons = [...document.querySelectorAll("[data-evidence-choice]")];
    const nextButton = document.querySelector("#evidence-next");
    let roundIndex = 0;
    let score = 0;
    let answered = false;

    const showRound = () => {
      const round = rounds[roundIndex];
      evidenceFact.textContent = round.fact;
      claim.textContent = round.claim;
      levelLabel.textContent = `ROUND ${String(roundIndex + 1).padStart(2, "0")} / ${String(rounds.length).padStart(2, "0")}`;
      scoreLabel.textContent = `SCORE ${String(score).padStart(2, "0")}`;
      message.textContent = "Does the evidence support this claim?";
      nextButton.hidden = true;
      nextButton.textContent = roundIndex === rounds.length - 1 ? "See final score →" : "Next round →";
      choiceButtons.forEach((button) => { button.disabled = false; });
      answered = false;
    };

    choiceButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        const choiceIsSupported = button.dataset.evidenceChoice === "supported";
        const isCorrect = choiceIsSupported === rounds[roundIndex].supported;
        if (isCorrect) score += 1;
        scoreLabel.textContent = `SCORE ${String(score).padStart(2, "0")}`;
        if (roundIndex === rounds.length - 1) {
          message.textContent = `Final score: ${score} / ${rounds.length}. ${isCorrect ? "Correct." : "Round complete."} Play again to try for a higher score.`;
          nextButton.textContent = "Play again ↻";
        } else {
          message.textContent = isCorrect
            ? "Correct. The claim matches the portfolio evidence."
            : `Not quite. This claim is ${rounds[roundIndex].supported ? "supported" : "not supported"} by the evidence.`;
        }
        choiceButtons.forEach((item) => { item.disabled = true; });
        nextButton.hidden = false;
      });
    });

    nextButton.addEventListener("click", () => {
      if (roundIndex === rounds.length - 1) {
        roundIndex = 0;
        score = 0;
      } else {
        roundIndex += 1;
      }
      showRound();
    });
    showRound();
  }

})();
