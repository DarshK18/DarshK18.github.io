(() => {
  const canvas = document.querySelector(".life-canvas");
  const clock = document.querySelector("#live-clock");
  const year = document.querySelector("#current-year");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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

  if (!(canvas instanceof HTMLCanvasElement)) {
    return;
  }

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  const cellSize = 12;
  const tickLength = 145;
  let columns = 0;
  let rows = 0;
  let cells = new Uint8Array(0);
  let nextCells = new Uint8Array(0);
  let frameId = 0;
  let lastTick = 0;
  let generation = 0;
  let pixelRatio = 1;
  let width = 0;
  let height = 0;

  const seed = () => {
    cells = new Uint8Array(columns * rows);
    nextCells = new Uint8Array(columns * rows);
    for (let index = 0; index < cells.length; index += 1) {
      cells[index] = Math.random() < 0.19 ? 1 : 0;
    }
    generation = 0;
  };

  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    columns = Math.ceil(width / cellSize);
    rows = Math.ceil(height / cellSize);
    seed();
    draw();
  };

  const draw = () => {
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.fillStyle = "rgba(243, 134, 161, 0.23)";
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        if (cells[row * columns + column]) {
          context.fillRect(column * cellSize + 2, row * cellSize + 2, 3, 3);
        }
      }
    }
  };

  const tick = () => {
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        let neighbors = 0;
        for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
          for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
            if (rowOffset === 0 && columnOffset === 0) {
              continue;
            }
            const neighborRow = row + rowOffset;
            const neighborColumn = column + columnOffset;
            if (
              neighborRow >= 0 &&
              neighborRow < rows &&
              neighborColumn >= 0 &&
              neighborColumn < columns
            ) {
              neighbors += cells[neighborRow * columns + neighborColumn];
            }
          }
        }

        const index = row * columns + column;
        nextCells[index] = neighbors === 3 || (cells[index] === 1 && neighbors === 2) ? 1 : 0;
      }
    }

    [cells, nextCells] = [nextCells, cells];
    generation += 1;
    if (generation >= 180) {
      seed();
    }
  };

  const animate = (timestamp) => {
    if (timestamp - lastTick >= tickLength) {
      tick();
      draw();
      lastTick = timestamp;
    }
    frameId = window.requestAnimationFrame(animate);
  };

  const setMotion = () => {
    window.cancelAnimationFrame(frameId);
    if (reducedMotion.matches) {
      seed();
      draw();
      return;
    }
    lastTick = 0;
    frameId = window.requestAnimationFrame(animate);
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();
  setMotion();
  reducedMotion.addEventListener("change", setMotion);
})();
