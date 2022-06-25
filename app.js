/*****************************************************
 **                                                  **
 **                 GAME LOGIC                       **
 **                                                  **
 *****************************************************/

/* Initial game state setup */
const board = [[], [], [], [], [], []];
let redPlayerName, yellowPlayerName;
let gameInProgress = false;
let buttonState = "start";
let mode = "twoPlayer";
let colCount = 7;
let rowCount = 6;
let peaks = [];

function boardInit() {
  //clear the board, if this is a reset
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
boardInit();
let turnColor = "red";

/* Accepting & presenting the player's move */
function move(col) {
  console.log(gameInProgress);
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
      if (mode=="onePlayer") botMove();
    }
    else turnColor = "red";
  }
}

/* Checking for a win */
function isWin(row, col) {
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
    newColumn.id = `column${column}`;
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
}

//add a button
const bottomSection = document.getElementById("foot");
bottomSection.setAttribute("display", "flex")
bottomSection.setAttribute("flex-direction","row");
const theButton = document.createElement("div");
const theOtherButton = document.createElement("div");
theButton.innerText = "1P";
theButton.setAttribute("class", "bottomButton1");
theOtherButton.setAttribute("class", "bottomButton2");
theOtherButton.innerText="2P"
bottomSection.appendChild(theButton);
bottomSection.appendChild(theOtherButton);


function drawMove(row, column) {
  const currentMoveCell = document.getElementById(`row${row}Col${column}`);
  currentMoveCell.className = turnColor;
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
  setTimeout(
    () => {
      clearTheBoard();
    },3
  )
}

function buttonStuff(id) {
  alert(`buttonStuff(${id})`)
  if (gameInProgress) { //ignore the button during an active game
    return true;
    alert("buttonstuff return")
  }
  redPlayerName = redPlayerBox.innerText;  /* IS THIS GETTING ANY INPUT?? */
  if(id==='1p') {
    mode = "onePlayer";
    yellowPlayerName = 'Computer';
    turnColor = "red";
    alert("buttonStuff2")
  }
  else {
    mode = "twoPlayer";
    yellowPlayerName  = yellowPlayerBox.innerText;
    alert("buttonStuff3")
  }
  gameInProgress = true;
  theButton.setAttribute("display","none");
  theOtherButton.setAttribute("display","none")
  alert("buttonStuff4")
  
}


drawTheBoard();
/*****************************************************
 **                                                  **
 **            USER-FACING CONTROLS                  **
 **                                                  **
 *****************************************************/


// style the start bar
const redPlayerBox = document.getElementById("redPlayer");
const yellowPlayerBox = document.getElementById("yellowPlayer");
redPlayerBox.style.backgroundColor = `red`;
redPlayerBox.style.color = "white";
redPlayerBox.setAttribute("class", "disabled");
yellowPlayerBox.setAttribute("class", "disabled");

/*****************************************************
 **                                                  **
 **                EVENT LISTENERS                   **
 **                                                  **
 *****************************************************/
theButton.addEventListener("click", function () {
  alert("button1");
  buttonStuff('1p');
});
theOtherButton.addEventListener("click", function () {
  alert("button2");
  buttonStuff('2p');
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

/***************  Hal9000 **************************** */
function botMove() {
  let targetColumn;
  //can I win right now?
  for(let i = 0; i < colCount; i++) {
    if (peaks[i] < 5 ) { //check to see if column is not full
      board[peaks[i]][i] = 'yellow' //test the play
      if (isWin(peaks[i],i)) {
        targetColumn = i;
        board[peaks[i]][i] = "blank"  //revert the cell
        break;
      }
      board[peaks[i]][i] = "blank";
    }
  }
  //is there a play I MUST block now?
  turnColor = 'red'; //think about your future, man!
  for (let i = 0; i < colCount; i++) {
    if (peaks[i] < 5) {
      board[peaks[i]][i] = 'red' //test the play
      if (isWin(peaks[i],i)) {
        targetColumn = i;
        board[peaks[i]][i] = "blank"  //revert the cell
        break;
      }
      board[peaks[i]][i] = "blank";
  

    }
  }
  turnColor = 'yellow'; //back to the present
  if(!targetColumn) { //no winning or blocking play; just play.
    targetColumn = Math.floor(Math.random() * 6);
    while(peaks[targetColumn] > 4) {
      targetColumn = Math.floor(Math.random() * 6);
    }
  }
  //Hal has decided where to play
  //  execute the move:
  while (targetColumn > tokenColumn) {
    moveRight();
  }
  while (targetColumn < tokenColumn) {
    moveLeft();
  }
  move(tokenColumn);
}

