//board
let board;
let boardWidth = 800;
let boardHeight = 400;
let context;

//bird
let birdWidth = 30; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
  x: birdX,
  y: birdY,
  width: birdWidth,
  height: birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 50; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 240;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -5; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.4;

let gameOver = false;
let gameStarted = false;
let birdHasMoved = false;
let score = 0;
let highScore = 0;
let pipeInterval;

window.onload = function () {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d"); //used for drawing on the board

  //load images
  birdImg = new Image();
  birdImg.src = "assets/bird.png";
  birdImg.onload = function () {
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    showStartText();
  }

  topPipeImg = new Image();
  topPipeImg.src = "assets/toppipe.png";

  bottomPipeImg = new Image();
  bottomPipeImg.src = "assets/bottompipe.png";

  document.addEventListener("keydown", handleFirstMove);
  document.addEventListener("click", handleFirstMove);
}

function showStartText() {
  document.getElementById("startText").classList.remove("hidden");
}

function hideStartText() {
  document.getElementById("startText").classList.add("hidden");
}

function startGame() {
  if (!gameStarted) {
    gameStarted = true;
    hideStartText();
    pipeArray = [];
    requestAnimationFrame(update);
    pipeInterval = setInterval(placePipes, 2000); //every 2.75 seconds
  }
}

function handleFirstMove(e) {
  if (e.type === "keydown" && (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX")) {
    if (!birdHasMoved) {
      birdHasMoved = true;
      velocityY = -6;
    } else {
      moveBird();
    }
  } else if (e.type === "click") {
    if (!birdHasMoved) {
      birdHasMoved = true;
      velocityY = -6;
    } else {
      moveBird();
    }
  }

  if (gameOver) {
    retryGame();
  }
}

function update() {
  if (gameOver) {
    return;
  }
  context.clearRect(0, 0, board.width, board.height);

  //bird
  if (birdHasMoved) {
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
  }
  context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  if (bird.y > board.height) {
    endGame();
  }

  //pipes
  for (let i = 0; i < pipeArray.length; i++) {
    let pipe = pipeArray[i];
    pipe.x += velocityX;
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
      pipe.passed = true;
    }

    if (detectCollision(bird, pipe)) {
      endGame();
    }
  }

  //clear pipes
  while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
    pipeArray.shift(); //removes first element from the array
  }

  //scoreboard
  document.getElementById("scoreboard").innerText = "Score: " + Math.floor(score) + " | High Score: " + Math.floor(highScore);

  requestAnimationFrame(update);
}

function placePipes() {
  if (gameOver) {
    return;
  }

  let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
  let openingSpace = board.height / 4;

  let topPipe = {
    img: topPipeImg,
    x: pipeX,
    y: randomPipeY,
    width: pipeWidth,
    height: pipeHeight,
    passed: false
  }
  pipeArray.push(topPipe);

  let bottomPipe = {
    img: bottomPipeImg,
    x: pipeX,
    y: randomPipeY + pipeHeight + openingSpace,
    width: pipeWidth,
    height: pipeHeight,
    passed: false
  }
  pipeArray.push(bottomPipe);
}

function moveBird() {
  velocityY = -6;
}

function detectCollision(a, b) {
  return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
    a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
    a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
    a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}

function endGame() {
  gameOver = true;
  clearInterval(pipeInterval);

  // Update high score if current score is greater
  if (score > highScore) {
    highScore = score;
  }

  document.getElementById("finalScore").innerText = "Final Score: " + Math.floor(score) + "\nHigh Score: " + Math.floor(highScore);
  document.getElementById("gameOver").classList.remove("hidden");
}

function retryGame() {
  bird.y = birdY;
  velocityY = 0;
  pipeArray = [];
  score = 0;
  gameOver = false;
  gameStarted = false;
  birdHasMoved = false;
  clearInterval(pipeInterval);
  document.getElementById("gameOver").classList.add("hidden");
  context.clearRect(0, 0, board.width, board.height);
  context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
  showStartText();
}
