let userInput = 6; //make this into a user input at some point.
let gridArea = userInput * userInput;

const gridArr = Array(userInput).fill().map(() => Array(userInput).fill(0));
const statusGrid = Array(userInput).fill().map(() => Array(userInput).fill('covered'));
const mainGrid = document.querySelector('.grid-main');
let mainGridSide = parseFloat(window.getComputedStyle(mainGrid).width);

let isGameOver = false;

function makeGrid(input = 6) {
    /** Logic to create the grid display */
    for (let i = 0; i < gridArea; i++) {
        let squareSideLength = (mainGridSide / input) - 2;

        let gridSquare = document.createElement('div');
        gridSquare.style.width = `${squareSideLength}px`;
        gridSquare.style.height = `${squareSideLength}px`;
        gridSquare.classList.add('grid-square');

        // Calculate row and column from index
        const row = Math.floor(i / input);
        const col = i % input;

        // Store array coordinates as data attributes
        gridSquare.dataset.row = row;
        gridSquare.dataset.col = col;

        mainGrid.appendChild(gridSquare);
    }
}

makeGrid(userInput);

let numOfMines = Math.floor(Math.random() * gridArea / 2);
let nonMineCount = gridArea - numOfMines;

function assignMines(numOfSquares) {
    for (let i = 0; i < numOfMines; i++) {
        let row = Math.floor(Math.random() * numOfSquares);
        let col = Math.floor(Math.random() * numOfSquares);
        if (gridArr[row][col] === 0) {
            gridArr[row][col] = 'X';
        } else i--;
    }
}
assignMines(userInput);

function setMineProximity(numOfSquares) {
    for (let row = 0; row < numOfSquares; row++) {
        for (let col = 0; col < numOfSquares; col++) {
            // Skip if it's already a mine
            if (gridArr[row][col] === 'X') continue;
            
            let mineCount = 0;
            
            // Check all 8 adjacent cells
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    // Skip the center cell (the cell we're checking)
                    if (i === 0 && j === 0) continue;
                    
                    const newRow = row + i;
                    const newCol = col + j;
                    
                    // Check if the adjacent cell is within bounds
                    if (newRow >= 0 && newRow < numOfSquares && 
                        newCol >= 0 && newCol < numOfSquares) {
                        
                        // If adjacent cell has a mine, increment count
                        if (gridArr[newRow][newCol] === 'X') {
                            mineCount++;
                        }
                    }
                }
            }
            
            // Set the count (0 will remain 0, numbers will show)
            gridArr[row][col] = mineCount;
        }
    }
}

setMineProximity(userInput); // Add this line

let allSquares = document.querySelectorAll('.grid-square');

allSquares.forEach((sq) => {
    const row = parseInt(sq.dataset.row);
    const col = parseInt(sq.dataset.col);
    const cellVal = gridArr[row][col];
    
    sq.addEventListener('click', () => {
        const currentCellStatus = statusGrid[row][col];
        if (currentCellStatus !== 'covered' || isGameOver) return; 

        if (cellVal === 'X') {
            gameLost();
        } else if (cellVal === 0) {
            revealAdjacentBlanks(row, col);
            checkWin();
        } else {
            tileReveal(sq, row, col);
            checkWin();
        }
    })

    sq.addEventListener('contextmenu', e => {
        e.preventDefault();
        if (isGameOver) return;
        switch(statusGrid[row][col]) {
            case 'revealed':
                return;
            case 'covered':
                sq.textContent = '!';
                statusGrid[row][col] = 'flagged';
                break;
            case 'flagged':
                sq.textContent = '?';
                statusGrid[row][col] = 'marked';
                break;
            case 'marked':
                sq.textContent = '';
                statusGrid[row][col] = 'covered';
                break;
        }
    })
})

function tileReveal(cell, row, col) {
        if (statusGrid[row][col] === 'revealed') return;

        statusGrid[row][col]= 'revealed';
        if (gridArr[row][col] === 'X') {
            cell.style.backgroundColor = 'red'; // Mine!
            cell.textContent = 'X';
        } else {
            cell.style.backgroundColor = 'white';
            cell.textContent = gridArr[row][col] === 0 ? "" : gridArr[row][col]; // Show number or empty
            nonMineCount --;
        }
}

function revealAdjacentBlanks(row, col) {
    // Check bounds
    if (row < 0 || row >= userInput || col < 0 || col >= userInput) {
        return;
    }
    
    // Find the corresponding DOM element
    const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    
    // If already revealed, stop
    if (statusGrid[row][col] === 'revealed') {
        return;
    }
    
    const cellVal = gridArr[row][col];
    
    // If it's a mine, don't reveal
    if (cellVal === 'X') {
        return;
    }
    
    // Reveal this cell
    tileReveal(square, row, col);
    
    // If this cell has a number (not 0), stop the flood fill here
    if (cellVal !== 0) {
        return;
    }
    
    // If it's a blank (0), recursively reveal all 8 adjacent cells
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue; // Skip center cell
            revealAdjacentBlanks(row + i, col + j);
        }
    }
}

function gameLost() {
    isGameOver = true;

    for (let sq of allSquares) {
        const row = parseInt(sq.dataset.row);
        const col = parseInt(sq.dataset.col);
        if (gridArr[row][col] === 'X'){
             sq.style.backgroundColor = 'red';
            sq.textContent = 'X';
            statusGrid[row][col] = 'revealed';
        }
    }
    console.log('all your base are belong to us')
}

function checkWin(){
    if (nonMineCount === 0) {
        isGameOver = true;
        console.log('A WINNER IS YOU!')
    }
}