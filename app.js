




/*****************************************************
**                                                  **
**                 GAME LOGIC                       **
**                                                  **
*****************************************************/

/* Initial game state setup */
const board = [[],[],[],[],[],[]]
let redPlayerName, yellowPlayerName;


let colCount = 7;
let rowCount = 6;
for (let r=0;r<rowCount;r++) {
    for (let c=0;c<colCount;c++) {
        board[r].push('blank');
    }
}
let peaks = []
for (let i = 0;i < colCount; i++){
    peaks.push(0);
}

let turnColor='red';





/* Accepting & presenting the player's move */
function move(col) {
    let row=peaks[col];
    peaks[col]++;
    board[row][col] = turnColor;
    drawMove(row,col);
    if(isWin(row,col)) declareWinner(turnColor);
    //else turnColor === 'red' ? 'yellow' : 'red';
    if (turnColor == 'red') turnColor = 'yellow';
    else turnColor = 'red';
}

/* Checking for a win */
function isWin(row, col) {

    return checkVertical(row, col) ||
           checkHorizontal(row, col) ||
           checkDiagonal(row, col);
}

function checkVertical(row, col){
    //if the column isn't at least 4 high, a vertical win is impossible
    if (row < 3) return false;
    const threeBelow = [ //compare board elements below to turnColor
        board[row-1][col],
        board[row-2][col],
        board[row-3][col]]
    return (threeBelow[0]==turnColor &&
            threeBelow[1]==turnColor &&
            threeBelow[2]==turnColor);
}

function checkHorizontal(row, col) {
    let count=1;
    
    //count the length of the leftward run:
    for (let i=1;i < colCount-1; i++) {
        if (i > col) break; //out of left bound
        if (board[row][col - i] == board[row][col]){
            count++;
        } else break;
    }
     //count the length of the rightward run:
     for (let i=1;i < 6; i++) {
        if (i + col > 6) break;
        if (board[row][col + i] == board[row][col]){
            count++;
        } else break;
     }
     return count > 3;
}

function checkDiagonal(row, col) {
    let count = 1;
    let descendingLeg = [], ascendingLeg = [];

    //put 7 values in each line of the X centered on the current move
    for(let i = 0;i < 7; i++) { 
       let ascendingElement = false;
       let descendingElement = false;
       try {
           ascendingElement = board[row-3+i][col-3+i];
       } catch(error) { ascendingLeg[i]='OOB'; }
       if (ascendingElement) ascendingLeg[i]=ascendingElement;
       try {
           descendingElement = board[row+3-i][col-3+i];
       } catch(error) { descendingLeg[i]='OOB'; }
       if (descendingElement) descendingLeg[i]=descendingElement;      
    }
    return(descendingLeg.join('').includes('redredredred') ||
           descendingLeg.join('').includes('yellowyellowyellowyellow') ||
           ascendingLeg.join('').includes('redredredred') ||
           ascendingLeg.join('').includes('yellowyellowyellowyellow'));

}

//     //add top-left to bottom-right
//     for(let i = 1; i < 5; i++) { 
//         if (board[row+i][col-i]== turnColor) {
//             count++; 
//             console.log(count,"count");
//         }
//         else break;
//     }
//     for(let i = 1; i < 5; i++) {
//         if(row < i) break;
//         if (board[row-i][col+i] == turnColor) {
//             count++; 
//             console.log(count,"count");
//         }
//         else break;
//     }
//     if (count > 3) return true;
//     count = 1; //get rid of the failed count
    
//     //add bottom-left to top-right 
//     for (let i = 1; i < 5; i++) {
//         if (board[row+i][col-i] === turnColor) {
//             count++; 
//             console.log(count,"count");
//         }
//         else break;
//     }
//     for (let i = 1; i < 5; i++) {
//         if (row < i) break;
//         if (board[row-i][col+i] === turnColor) {
//             count++; 
//             console.log(count,"count");
//         }
//         else break;
//     }
//     if (count > 3) return true;
//     return false;
// }


/*****************************************************
**                                                  **
**             DRAWING THE BOARD                    **
**                                                  **
*****************************************************/

// style the start bar
const redPlayerBox=document.getElementById('redPlayer')
const yellowPlayerBox=document.getElementById('yellowPlayer');
redPlayerBox.style.backgroundColor = `red`;
redPlayerBox.style.color='white';
yellowPlayerBox.style.backgroundColor='yellow';
yellowPlayerBox.style.color='darkBlue';


//  Draw the holding area (for a pending token drop)
const dropZone = document.getElementById('holdingArea');
let tokenColumn = Math.floor(colCount / 2);

for (let i=0; i < colCount; i++) {
    const newCell = document.createElement('div');
    newCell.className = (i == tokenColumn) ? turnColor : 'empty';
    dropZone.appendChild(newCell);
}
function moveLeft() {
    if (tokenColumn) {
        dropZone.childNodes[tokenColumn].className = 'empty';
        tokenColumn--;
        dropZone.childNodes[tokenColumn].className = turnColor;
    }
}
function moveRight() {
    if (tokenColumn < colCount - 1) {
        dropZone.childNodes[tokenColumn].className = 'empty';
        tokenColumn++;
        dropZone.childNodes[tokenColumn].className = turnColor;
    }
}


//  Create the columns of the game board
const gameDisplay = document.getElementById('theBoard');
let currentColumn = []
for (let c = 0; c < colCount ; c++){ 
    currentColumn = [];
    for(let r = 0; r < rowCount; r++) {
        currentColumn.push(board[r][c]);
    }
    drawColumn(currentColumn,c);
}
function drawColumn(column,colNum) { 
    const newColumn = document.createElement('div');
    newColumn.className=`column`;
    newColumn.id = `column${column}`
    gameDisplay.appendChild(newColumn);
    
    for (let i = 0; i < 6; i++) { //put 6 cells in the column
        const newCell=document.createElement('div');
        newCell.className =  board[i][colNum];
        newCell.id = `row${i}Col${colNum}`;
        newColumn.appendChild(newCell);
    }
}

function drawMove(row, column) {
    const currentMoveCell = document.getElementById(`row${row}Col${column}`);
    currentMoveCell.className=turnColor;
    

}

/* Reacting to a win */
function declareWinner() {
    alert(`${turnColor} wins!`)
}



/*****************************************************
**                                                  **
**           UI EVENT LISTENERS                     **
**                                                  **
*****************************************************/


const theButton = document.getElementById('startButton');
let buttonState='start';
theButton.addEventListener('click', function () {
    alert('the button is for another day');

})

document.addEventListener("keydown", function(event) {
    const key = event.key;
    switch (key) {
        case "ArrowLeft" :
            moveLeft();
            break;
        case "ArrowRight" : 
            moveRight();
            break;
        case "ArrowDown" :
            move(tokenColumn);
            dropZone.childNodes[tokenColumn].className = turnColor;
            break;
    }
})
