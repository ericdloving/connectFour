//   ¡Conectar Cuatro! by Eric Loving
//                               2022

/*****************************************************
 **                                                  **
 **                 GAME LOGIC                       **
 **                                                  **
 *****************************************************/

/* Initial game state setup */
const board = [[], [], [], [], [], []];   //each internal array is a row.
let redPlayerName, yellowPlayerName;    
let gameInProgress = false;               //to update controls appropriately
let mode = "twoPlayer";
let colCount = 7;    //for future functionality -- not all code segments
let rowCount = 6;    //  currently support dynamic grid size.
let peaks = [];      
const startMsg = "Enter Names Above & Press Start (1P / 2P)";

function boardInit() {
  //clear the board
  for (let r = 0; r < rowCount; r++) {
    while (board[r][0]) {
      board[r].pop();
    }
  }
  //initialize the board
  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < colCount; c++) {
      board[r].push("blank");
    }
  }
  peaks.length = 0;
  for (let i = 0; i < colCount; i++) {
    peaks.push(0);
  }
}
//wrap up game state setup
boardInit();
let turnColor = "red";

/* Accepting the players' moves and calling for visual updates */
function move(col) {
  if (gameInProgress) {
    let row = peaks[col];
    peaks[col]++;
    board[row][col] = turnColor;
    drawMove(row, col);
    if (isWin(row, col)) {
      declareWinner(turnColor);
      return true;
    }
    if (turnColor == "red") {
      turnColor = "yellow";
      if (mode == "onePlayer") botMove();
    } else turnColor = "red";
  }
}
function morePlaysExist() {  //if false, it's a draw
  return board.includes("empty");
}

/* Checking for a win */
function isWin(row, col) {
  if (morePlaysExist()) {
    if (
      checkVertical(row, col) ||
      checkHorizontal(row, col) ||
      checkDiagonal(row, col)
    )
      return true;
    alert("It's a draw");
    boardInit();
    clearTheBoard();
    gameInProgress = false;
  }
  return (
    checkVertical(row, col) ||
    checkHorizontal(row, col) ||
    checkDiagonal(row, col)
  );
}

function checkVertical(row, col) {
  //if the column isn't at least 4 high, a vertical win is impossible
  if (row < 3) return false;
  const threeBelow = [
    //compare board elements below to turnColor
    board[row - 1][col],
    board[row - 2][col],
    board[row - 3][col],
  ];
  return (
    threeBelow[0] == turnColor &&
    threeBelow[1] == turnColor &&
    threeBelow[2] == turnColor
  );
}

function checkHorizontal(row, col) {
  let count = 1;

  //count the length of the leftward run:
  for (let i = 1; i < colCount - 1; i++) {
    if (i > col) break; //out of left bound
    if (board[row][col - i] == board[row][col]) {
      count++;
    } else break;
  }
  //count the length of the rightward run:
  for (let i = 1; i < 6; i++) {
    if (i + col > 6) break;
    if (board[row][col + i] == board[row][col]) {
      count++;
    } else break;
  }
  return count > 3;
}

function checkDiagonal(row, col) {
  let count = 1;
  let descendingLeg = [],
    ascendingLeg = [];

  //put 7 values in each line of the X centered on the current move
  for (let i = 0; i < 7; i++) {
    let ascendingElement = false;
    let descendingElement = false;
    try {
      ascendingElement = board[row - 3 + i][col - 3 + i];
    } catch (error) {
      ascendingLeg[i] = "OOB";
    }
    if (ascendingElement) ascendingLeg[i] = ascendingElement;
    try {
      descendingElement = board[row + 3 - i][col - 3 + i];
    } catch (error) {
      descendingLeg[i] = "OOB";
    }
    if (descendingElement) descendingLeg[i] = descendingElement;
  }
  //each leg array contains half the X -- if either leg has 4 connected tokens,
  //   then this is a winning play
  return (
    descendingLeg.join("").includes("redredredred") ||
    descendingLeg.join("").includes("yellowyellowyellowyellow") ||
    ascendingLeg.join("").includes("redredredred") ||
    ascendingLeg.join("").includes("yellowyellowyellowyellow")
  );
}

/*****************************************************
 **                                                  **
 **             DRAWING THE BOARD                    **
 **                                                  **
 *****************************************************/

//  Draw the holding area (for a pending token drop)
const dropZone = document.getElementById("holdingArea");
let tokenColumn = Math.floor(colCount / 2);

//the cells above the board where the player moves the token before dropping it
for (let i = 0; i < colCount; i++) {
  const newCell = document.createElement("div");
  newCell.className = i == tokenColumn ? turnColor : "empty";
  dropZone.appendChild(newCell);
}
function moveLeft() {
  if (tokenColumn) {
    dropZone.childNodes[tokenColumn].className = "empty";
    tokenColumn--;
    dropZone.childNodes[tokenColumn].className = turnColor;
  }
}
function moveRight() {
  if (tokenColumn < colCount - 1) {
    dropZone.childNodes[tokenColumn].className = "empty";
    tokenColumn++;
    dropZone.childNodes[tokenColumn].className = turnColor;
  }
}

//  Create the columns of the game board
const gameDisplay = document.getElementById("theBoard");

function drawTheBoard() {
  let currentColumn = [];

  for (let c = 0; c < colCount; c++) {
    currentColumn = [];
    for (let r = 0; r < rowCount; r++) {
      currentColumn.push(board[r][c]);
    }
    drawColumn(currentColumn, c);
  }

  function drawColumn(column, colNum) {
    const newColumn = document.createElement("div");
    newColumn.className = `column`;
    newColumn.id = `column${colNum}`;
    gameDisplay.appendChild(newColumn);

    for (let i = 0; i < 6; i++) {
      //put 6 cells in the column
      const newCell = document.createElement("div");
      newCell.className = board[i][colNum];
      newCell.id = `row${i}Col${colNum}`;
      newColumn.appendChild(newCell);
    }
  }
}
function clearTheBoard() {
  //discard each column of cells on the game board
  while (gameDisplay.firstChild) {
    let elem = gameDisplay.firstChild;
    while (elem.firstChild) {
      elem.removeChild(elem.firstChild);
    }
    gameDisplay.removeChild(gameDisplay.firstChild);
  }
  //dispose of the token positions
  boardInit();
  drawTheBoard();
  messageArea.innerText = startMsg;
}

function drawMove(row, column) {
  const moveCell = document.getElementById(`row${row}Col${column}`);
  moveCell.className = turnColor;
}

/* Reacting to a win */
function declareWinner() {
  gameInProgress = false;
  try {
    dropZone.children[tokenColumn].setAttribute("class", "empty");
  } catch (error) {}
  setTimeout(
    () =>
      alert(`${turnColor == "red" ? redPlayerName : yellowPlayerName} wins!`),
    2
  );
  setTimeout(() => {
    clearTheBoard();
  }, 3);
}

function buttonStuff(id) {
  if (gameInProgress == true) {
    //ignore the button during an active game
    return true;
  }
  redPlayerName = redPlayerBox.value;
  if (!redPlayerName) {
    redPlayerName = "Blinky";
    redPlayerBox.value = redPlayerName;
  }

  if (id === "1p") {
    mode = "onePlayer";
    yellowPlayerName = "Computer";
    yellowPlayerBox.value = "Computer";
    turnColor = "red";
  } else {
    mode = "twoPlayer";
    yellowPlayerName = yellowPlayerBox.value;
  }
  gameInProgress = true;
  messageArea.innerText = "Use Arrow Keys To Play";
  theButton.setAttribute("display", "none");
  theOtherButton.setAttribute("display", "none");
}

drawTheBoard();
/******************************************************
 **                                                  **
 **            USER-FACING CONTROLS                  **
 **                                                  **
 *****************************************************/
//start buttons
const bottomSection = document.getElementById("foot");
bottomSection.setAttribute("display", "flex");
bottomSection.setAttribute("flex-direction", "row");
const theButton = document.createElement("div");
const theOtherButton = document.createElement("div");
theButton.innerText = "1P";
theButton.setAttribute("class", "bottomButton1");
theOtherButton.setAttribute("class", "bottomButton2");
theOtherButton.innerText = "2P";
bottomSection.appendChild(theButton);
bottomSection.appendChild(theOtherButton);
// style the input bar
const redPlayerBox = document.getElementsByTagName("input")[0];
const yellowPlayerBox = document.getElementsByTagName("input")[1];
redPlayerBox.style.backgroundColor = `red`;
redPlayerBox.style.color = "white";
yellowPlayerBox.style.backgroundColor = "yellow";
const messageArea = document.getElementById("bottomText");
messageArea.innerText = startMsg;
messageArea.setAttribute("background", "orange");

/******************************************************
 **                                                  **
 **                EVENT LISTENERS                   **
 **                                                  **
 *****************************************************/
theButton.addEventListener("click", function () {
  buttonStuff("1p");
});
theOtherButton.addEventListener("click", function () {
  buttonStuff("2p");
});
/***********--  KEYBOARD CONTROLS -- ************** */
document.addEventListener("keydown", function (event) {
  if (!gameInProgress) return;

  const key = event.key;
  switch (key) {
    case "ArrowLeft":
      moveLeft();
      break;
    case "ArrowRight":
      moveRight();
      break;
    case "ArrowDown":
      move(tokenColumn);
      dropZone.childNodes[tokenColumn].className = turnColor;
      break;
  }
});
/**********--    MOUSE CONTROLS --******************** */

// not yet implemented :-(

/******************************************************
 **                                                  **
 **               *** HAL 9000 ***                   **
 **                                                  **
 *****************************************************/
function botMove() {
  let targetColumn;
  //can I win right now?
  for (let i = 0; i < colCount; i++) {
    if (peaks[i] < 5) {
      //check to see if column is not full
      board[peaks[i]][i] = "yellow"; //test the play
      if (isWin(peaks[i], i)) {
        targetColumn = i;
        board[peaks[i]][i] = "blank"; //revert the cell
        break;
      }
      board[peaks[i]][i] = "blank";
    }
  }
  //is there a play I MUST block now?
  turnColor = "red"; //where do you see yourself three seconds from now, Blinky?
  for (let i = 0; i < colCount; i++) {
    if (peaks[i] < 5) {
      board[peaks[i]][i] = "red"; //test the play
      if (isWin(peaks[i], i)) {
        targetColumn = i;
        board[peaks[i]][i] = "blank"; //revert the cell
        break;
      }
      board[peaks[i]][i] = "blank";
    }
  }
  turnColor = "yellow"; //back to the present
  if (!targetColumn) {
    //no winning or blocking play detected; just play on a random column
    targetColumn = Math.floor(Math.random() * 6);
    while (peaks[targetColumn] > 4) {  // picks again if the chosen column is full
      targetColumn = Math.floor(Math.random() * 6);
    }
  }

  // Hal has decided where to play--
  //  execute the move:
  let botMovementId; //ticker for animating Hal's traversal of the dropZone to get their token to the target
  if (targetColumn > tokenColumn) {  //move toward the target column
    botMovementId = setInterval(moveRight, 300);
    setTimeout(  //stop the movement when you reach the target
      clearInterval,
      301 * (targetColumn - tokenColumn),
      botMovementId
    );
  }

  if (targetColumn < tokenColumn) {
    botMovementId = setInterval(moveLeft, 300);  //move toward the target column
    setTimeout( 
      clearInterval,
      301 * (tokenColumn - targetColumn),
      botMovementId
    );
  }

  setTimeout(
    function (target) {
      move(target);  //open the pod bay doors
      dropZone.childNodes[tokenColumn].className = "red";
    },
    300 + 303 * Math.abs(targetColumn - tokenColumn),
    targetColumn
  );
}
