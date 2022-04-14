const TILE_STATUSES = {
  HIDDEN: "hidden",
  MINE: "mine",
  NUMBER: "number",
  FLAGGED: "flagged",
};

const gameBoard = document.querySelector(".board");
const grid = document.querySelector(".grid");
const WIDTH = 10;
const BOMB_COUNT = 20;
let board = createBoard(WIDTH, BOMB_COUNT);
let flags = 0;
let bombsRemaining = BOMB_COUNT - flags;
let openedTiles = 0;
let GameOver = false;
let totalSeconds = 0;
let minute;
let seconds;
let time;

// //add header
// const header = document.querySelector("#header");
// header.appendChild(bombCounter);
// header.appendChild(restartButton);
// header.appendChild(timer);
//header.setAttribute("id", "header");

//add counter
const bombCounter = document.createElement("div");
bombCounter.setAttribute("id", "counter");
bombCounter.innerHTML = bombsRemaining;

//add restart button
const restartButton = document.createElement("button");
restartButton.classList.add("restart");
restartButton.innerHTML = "Restart";

//add timer
const timer = document.createElement("div");
timer.classList.add("timer");
timer.innerHTML = "00:00";

//add header
const header = document.querySelector("#header");
header.appendChild(bombCounter);
header.appendChild(restartButton);
header.appendChild(timer);

grid.style.setProperty("--size", WIDTH);

function startTimer() {
  if (!time) {
    countTimer();
    time = setInterval(countTimer, 1000);
  }
}

function stopTimer() {
  clearInterval(time);
  time = undefined;
}

function countTimer() {
  minute = Math.floor(
    (totalSeconds - Math.floor(totalSeconds / 3600) * 3600) / 60
  );
  seconds =
    totalSeconds - (Math.floor(totalSeconds / 3600) * 3600 + minute * 60);
  if (minute < 10) {
    minute = "0" + minute;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  totalSeconds++;
  timer.innerHTML = minute + ":" + seconds;
}

function clearGrid(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function reset(boardSize, numberOfMines) {
  totalSeconds = 0;
  flags = 0;
  openedTiles = 0;
  bombsRemaining = BOMB_COUNT - flags;
  bombCounter.innerHTML = bombsRemaining;
  GameOver = false;
  clearGrid(grid);
  board = createBoard(boardSize, numberOfMines);
  stopTimer();
  timer.innerHTML = "00:00";
}

restartButton.addEventListener("click", () => {
  reset(WIDTH, BOMB_COUNT);
});

function createBoard(boardSize, numberofMines) {
  const board = [];
  const minePositions = getMinePositions(boardSize, numberofMines);
  for (let x = 0; x < boardSize; x++) {
    const row = [];
    for (let y = 0; y < boardSize; y++) {
      const element = document.createElement("div");
      element.dataset.status = TILE_STATUSES.HIDDEN;
      element.classList.add("tile");
      const tile = {
        element,
        x,
        y,
        mine: minePositions.some(positionMatch.bind(null, { x, y })),
        get status() {
          return this.element.dataset.status;
        },
        set status(value) {
          this.element.dataset.status = value;
        },
      };
      row.push(tile);
    }
    board.push(row);
  }
  addBoard(board);
  return board;
}

function getMinePositions(boardSize, numberofMines) {
  const positions = [];

  while (positions.length < numberofMines) {
    const position = {
      x: randomNumber(boardSize),
      y: randomNumber(boardSize),
    };

    if (!positions.some((p) => positionMatch(p, position))) {
      positions.push(position);
    }
  }
  return positions;
}

function positionMatch(a, b) {
  return a.x === b.x && a.y === b.y;
}

function randomNumber(size) {
  return Math.floor(Math.random() * size);
}

// header.appendChild(bombCounter);
// header.appendChild(restartButton);
// header.appendChild(timer);

//grid.style.setProperty("--size", WIDTH);

function addBoard(board) {
  board.forEach((row) => {
    row.forEach((tile) => {
      grid.append(tile.element);
      tile.element.addEventListener("click", () => {
        click(board, tile);
      });
      tile.element.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        addFlag(tile);
      });
    });
  });
}

function addFlag(tile) {
  if (GameOver) return;
  if (
    tile.status !== TILE_STATUSES.HIDDEN &&
    tile.status !== TILE_STATUSES.FLAGGED
  )
    return;
  if (tile.status === TILE_STATUSES.FLAGGED) {
    tile.status = TILE_STATUSES.HIDDEN;
    tile.element.innerHTML = "";
    flags--;
    bombsRemaining = BOMB_COUNT - flags;
    bombsRemaining = String(bombsRemaining).padStart(2, "0");
    bombCounter.innerHTML = bombsRemaining;
  } else {
    tile.status = TILE_STATUSES.FLAGGED;
    tile.element.innerHTML = "🚩";
    flags++;
    bombsRemaining = BOMB_COUNT - flags;
    bombsRemaining = String(bombsRemaining).padStart(2, "0");
    bombCounter.innerHTML = bombsRemaining;
  }
}

function click(board, tile) {
  if (GameOver) return;
  startTimer();
  if (tile.status !== TILE_STATUSES.HIDDEN) return;

  if (tile.mine) {
    tile.status = TILE_STATUSES.MINE;
    tile.element.classList.add("explode");
    gameOver(board);
    return;
  }
  tile.status = TILE_STATUSES.NUMBER;
  const adjacentTiles = nearbyTiles(board, tile);
  const mines = adjacentTiles.filter((t) => t.mine);
  if (mines.length === 0) {
    openedTiles++;
    checkWin(board);
    adjacentTiles.forEach(click.bind(null, board));
  } else {
    tile.element.textContent = mines.length;
    tile.element.dataset.number = mines.length;
    openedTiles++;
    checkWin(board);
  }
}

function nearbyTiles(board, { x, y }) {
  const tiles = [];

  for (let xOffset = -1; xOffset <= 1; xOffset++) {
    for (let yOffset = -1; yOffset <= 1; yOffset++) {
      const tile = board[x + xOffset]?.[y + yOffset];
      if (tile) tiles.push(tile);
    }
  }
  return tiles;
}

// function checkSquare(square, currentID) {
//   const leftEdge = currentID % width === 0;
//   const rightEdge = currentID % width === width - 1;
//   setTimeout(() => {
//     if (currentID > 0 && !leftEdge) {
//       const newID = squares[parseInt(currentID) - 1].id;
//       const newSquare = document.getElementById(newID);
//       click(newSquare);
//     }
//     if (currentID > 9 && !rightEdge) {
//       const newID = squares[parseInt(currentID) + 1 - width].id;
//       const newSquare = document.getElementById(newID);
//       click(newSquare);
//     }
//     if (currentID > 9) {
//       const newID = squares[parseInt(currentID) - width].id;
//       const newSquare = document.getElementById(newID);
//       click(newSquare);
//     }
//     if (currentID > 10 && !leftEdge) {
//       const newID = squares[parseInt(currentID) - 1 - width].id;
//       const newSquare = document.getElementById(newID);
//       click(newSquare);
//     }
//     if (currentID < 99 && !rightEdge) {
//       const newID = squares[parseInt(currentID) + 1].id;
//       const newSquare = document.getElementById(newID);
//       click(newSquare);
//     }
//     if (currentID < 90 && !leftEdge) {
//       const newID = squares[parseInt(currentID) - 1 + width].id;
//       const newSquare = document.getElementById(newID);
//       click(newSquare);
//     }
//     if (currentID < 89 && !rightEdge) {
//       const newID = squares[parseInt(currentID) + 1 + width].id;
//       const newSquare = document.getElementById(newID);
//       click(newSquare);
//     }
//     if (currentID < 90) {
//       const newID = squares[parseInt(currentID) + width].id;
//       const newSquare = document.getElementById(newID);
//       click(newSquare);
//     }
//   }, 10);
// }

function gameOver(board) {
  GameOver = true;
  board.forEach((row) => {
    row.forEach((tile) => {
      if (tile.mine) {
        tile.element.innerHTML = "💥";
        //click(board, tile);
      }
    });
  });
  stopTimer();
}

// function gameOver() {
//   GameOver = true;
//   squares.forEach((square) => {
//     if (square.classList.contains("bomb")) {
//       //square.innerHTML = '💣';
//       square.innerHTML = "💥";
//       square.classList.add("checked");
//     }
//   });
//   stopTimer();
// }

function checkWin(board) {
  if (openedTiles === WIDTH * WIDTH - BOMB_COUNT) {
    board.forEach((row) => {
      row.forEach((tile) => {
        if (tile.mine && tile.status !== TILE_STATUSES.FLAGGED) {
          addFlag(tile);
        }
      });
    });
    console.log("You win!");
    GameOver = true;
    stopTimer();
  }
}
