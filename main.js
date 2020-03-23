const gameArea = document.getElementById("gamearea");

const DIRECTION = {
  UP: 1,
  LEFT: 2,
  RIGHT: 3,
  DOWN: 4
};

const KIND = {
  EMPTY: "",
  FOOD: "food",
  SNAKE: "snake"
};

function Pos(x, y) {
  let pos = { x, y };
  pos.clone = function() {
    return Pos(this.x, this.y);
  };
  return pos;
}

document.addEventListener("keydown", titleScreenKeyHandler);

function titleScreenKeyHandler(event) {
  if (event.isComposing || event.repeat || event.keyCode === 229) {
    return;
  }

  if (event.key == " ") {
    if (!gameArea.gameInProgress) startGame();
  }
}

function startGame() {
  gameArea.gameInProgress = true;

  document.getElementById("titlescreen").classList.remove("active");
  document.getElementById("gamescreen").classList.add("active");

  createGrid();
  createSnake();
  createFood();

  setScore(0);

  let updateHandler = setInterval(update, 70);

  document.addEventListener("keydown", keyHandler);

  function update() {
    updateDirection();
    moveSnake();
  }

  function setScore(newScore) {
    gameArea.score = newScore;
    document.getElementById("score").innerText = newScore;
  }

  function addScore(value) {
    setScore(gameArea.score + value);
  }

  function updateDirection() {
    let snake = gameArea.snake;
    if (snake.nextDirection.length == 0) return;

    let newDirection = snake.nextDirection.shift();
    if (snake.direction == newDirection) return;

    //check for opposites and ignore
    if (newDirection + snake.direction == 5) return;

    snake.direction = newDirection;
  }

  function moveSnake() {
    let snake = gameArea.snake;
    let currentHead = snake[snake.length - 1];
    let head = currentHead.clone();

    switch (snake.direction) {
      case DIRECTION.UP:
        head.y -= 1;
        break;
      case DIRECTION.DOWN:
        head.y += 1;
        break;
      case DIRECTION.LEFT:
        head.x -= 1;
        break;
      case DIRECTION.RIGHT:
        head.x += 1;
        break;
    }

    if (isSnake(head) || isOOB(head)) {
      endGame();
    }

    if (isFood(head)) {
      createFood();
      addScore(10);
    } else {
      let tail = snake.shift();
      setCell(tail, KIND.EMPTY);
      addScore(1);
    }

    snake.push(head);
    setCell(head, KIND.SNAKE);
  }

  function keyHandler(event) {
    if (event.isComposing || event.repeat || event.keyCode === 229) {
      return;
    }

    let snake = gameArea.snake;

    switch (event.key) {
      case "ArrowUp":
      case "w":
        snake.nextDirection.push(DIRECTION.UP);
        break;
      case "ArrowDown":
      case "s":
        snake.nextDirection.push(DIRECTION.DOWN);
        break;
      case "ArrowLeft":
      case "a":
        snake.nextDirection.push(DIRECTION.LEFT);
        break;
      case "ArrowRight":
      case "d":
        snake.nextDirection.push(DIRECTION.RIGHT);
        break;
    }
    // console.log(event);
  }

  function endGame() {
    document.removeEventListener("keydown", keyHandler);
    clearInterval(updateHandler);
    alert("You died!");
    document.getElementById("gamescreen").classList.remove("active");
    document.getElementById("titlescreen").classList.add("active");
    gameArea.gameInProgress = false;
  }

  function createGrid() {
    function addCell(parent, kind, pos) {
      let cell = document.createElement("div");
      cell.className = "cell " + kind + " col" + pos.x + " row" + pos.y;
      parent.appendChild(cell);
    }

    //clear gameArea
    gameArea.innerHTML = "";

    //get size of 1 cell
    addCell(gameArea, "snake", Pos(1, 1));
    let cellWidth = gameArea.children[0].clientWidth;
    let cellHeight = gameArea.children[0].clientHeight;

    //get max row/col
    gameArea.maxRow = Math.floor(gameArea.clientHeight / cellHeight);
    gameArea.maxCol = Math.floor(gameArea.clientWidth / cellWidth);

    //clear gameArea
    gameArea.innerHTML = "";

    //create game grid
    for (let nRow = 1; nRow <= gameArea.maxRow; nRow++) {
      for (let nCol = 1; nCol <= gameArea.maxCol; nCol++) {
        addCell(gameArea, "", Pos(nCol, nRow));
      }
    }
  }

  function createSnake() {
    let startX = Math.floor(gameArea.maxCol / 2);
    let startY = Math.floor(gameArea.maxRow / 2);

    gameArea.snake = [];
    gameArea.snake.direction = DIRECTION.RIGHT;
    gameArea.snake.nextDirection = [];
    gameArea.snake.push(Pos(startX - 2, startY));
    gameArea.snake.push(Pos(startX - 1, startY));
    gameArea.snake.push(Pos(startX, startY));

    gameArea.snake.forEach(pos => setCell(pos, KIND.SNAKE));
  }

  function createFood() {
    function rnd(max) {
      return Math.floor(Math.random() * max) + 1;
    }

    let pos = Pos(rnd(gameArea.maxCol), rnd(gameArea.maxRow));

    while (!isEmpty(pos)) {
      pos = Pos(rnd(gameArea.maxCol), rnd(gameArea.maxRow));
    }

    setCell(pos, KIND.FOOD);
  }

  function getCell(pos) {
    return document.getElementsByClassName("col" + pos.x + " row" + pos.y)[0];
  }

  function setCell(pos, kind) {
    let cell = getCell(pos);
    if (cell == undefined) return;

    switch (kind) {
      case KIND.SNAKE:
        if (cell.classList.contains(KIND.FOOD))
          cell.classList.remove(KIND.FOOD);
        cell.classList.add(KIND.SNAKE);
        break;

      case KIND.FOOD:
        if (cell.classList.contains(KIND.SNAKE))
          cell.classList.remove(KIND.SNAKE);
        cell.classList.add(KIND.FOOD);
        break;

      default:
        if (cell.classList.contains(KIND.FOOD))
          cell.classList.remove(KIND.FOOD);
        if (cell.classList.contains(KIND.SNAKE))
          cell.classList.remove(KIND.SNAKE);
        break;
    }
  }

  function isSnake(pos) {
    try {
      return getCell(pos).classList.contains(KIND.SNAKE);
    } catch {
      return false;
    }
  }
  function isFood(pos) {
    try {
      return getCell(pos).classList.contains(KIND.FOOD);
    } catch {
      return false;
    }
  }
  function isEmpty(pos) {
    try {
      let cl = getCell(pos).classList;
      return !cl.contains(KIND.SNAKE) && !cl.contains(KIND.FOOD);
    } catch {
      return false;
    }
  }
  function isOOB(pos) {
    return (
      pos.x < 1 ||
      pos.y < 1 ||
      pos.x > gameArea.maxCol ||
      pos.y > gameArea.maxRow
    );
  }
}
