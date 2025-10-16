class Minesweeper {
    constructor(gridSize = 6, containerSelector = '.grid-main'){
        this.gridSize = gridSize;
        this.gridArea = gridSize * gridSize;
        this.container = document.querySelector(containerSelector);

        this.gridArr = [];
        this.statusGrid = [];
        this.numOfMines = 0;
        this.nonMineCount = 0;
        this.isGameOver = false;
        this.gameStarted = false;
        this.flagCount = 0;

        // Timer properties
        this.startTime = null;
        this.timerInterval = null;
        this.elapsedTime = 0;

        // UI elements
        this.mineCountDisplay = document.getElementById('mine-count');
        this.timerDisplay = document.getElementById('timer-display');
        this.title = document.querySelector('.title');
        this.resetButton = document.getElementById('reset-button');
        this.resetButton?.addEventListener('click', () => this.restart());

        this.squares = [];

        this.init();
    }
    
    init() {
        this.createArrays();
        this.calculateMines();
        this.createGrid();
        this.placeMines();
        this.calculateProximity();
        this.attachEventListeners();
        this.updateMineCounter();
        this.resetTimer();
    }
    
    updateMineCounter() {
        const remainingMines = this.numOfMines - this.flagCount;
        if (this.mineCountDisplay) {
            if (remainingMines >= 0) {
                this.mineCountDisplay.textContent = remainingMines;
            }
        }
    }

    resetTimer() {
        this.gameStarted = false;
        this.startTime = null;
        this.elapsedTime = 0;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        if (this.timerDisplay) {
            this.timerDisplay.textContent = '00:00';
        }
    }

    startTimer() {
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.startTime = Date.now();
            this.timerInterval = setInterval(() => {
                this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
                this.updateTimerDisplay();
            }, 1000);
        }
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.elapsedTime / 60);
        const seconds = this.elapsedTime % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        if (this.timerDisplay) {
            this.timerDisplay.textContent = timeString;
        }
    }

    createArrays() {
        this.gridArr = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(0));
        this.statusGrid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill('covered'));
        this.flagCount = 0;
    }

        calculateMines() {
        const minMines = 1;
        const maxMines = Math.floor(this.gridArea / 3);
        
        this.numOfMines = Math.floor(Math.random() * (maxMines - minMines + 1)) + minMines;
        this.nonMineCount = this.gridArea - this.numOfMines;
    }

    createGrid() {
        this.container.innerHTML = ''; // Clear existing grid
        const containerWidth = parseFloat(window.getComputedStyle(this.container).width);
        
        for (let i = 0; i < this.gridArea; i++) {
            const squareSideLength = (containerWidth / this.gridSize) - 2;
            
            const gridSquare = document.createElement('div');
            gridSquare.style.width = `${squareSideLength}px`;
            gridSquare.style.height = `${squareSideLength}px`;
            gridSquare.classList.add('grid-square');
            
            const row = Math.floor(i / this.gridSize);
            const col = i % this.gridSize;
            
            gridSquare.dataset.row = row;
            gridSquare.dataset.col = col;
            
            this.container.appendChild(gridSquare);
        }
        
        this.squares = document.querySelectorAll('.grid-square');
    }

    placeMines() {
        for (let i = 0; i < this.numOfMines; i++) {
            let row = Math.floor(Math.random() * this.gridSize);
            let col = Math.floor(Math.random() * this.gridSize);
            if (this.gridArr[row][col] === 0) {
                this.gridArr[row][col] = 'X';
            } else {
                i--; // Try again
            }
        }
    }
    
    calculateProximity() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.gridArr[row][col] === 'X') continue;
                
                let mineCount = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        
                        const newRow = row + i;
                        const newCol = col + j;
                        
                        if (this.isValidPosition(newRow, newCol) && 
                            this.gridArr[newRow][newCol] === 'X') {
                            mineCount++;
                        }
                    }
                }
                this.gridArr[row][col] = mineCount;
            }
        }
    }
    
    isValidPosition(row, col) {
        return row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize;
    }
    
    attachEventListeners() {
        this.squares.forEach((square) => {
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            
            square.addEventListener('click', () => this.handleCellClick(row, col));
            square.addEventListener('contextmenu', (e) => this.handleRightClick(e, row, col));
        });
    }
    
    handleCellClick(row, col) {
        if (this.statusGrid[row][col] !== 'covered' || this.isGameOver) return;
        
        // Start timer on first click
        this.startTimer();
        
        const cellValue = this.gridArr[row][col];
        
        if (cellValue === 'X') {
            this.gameOver(false);
        } else if (cellValue === 0) {
            this.revealAdjacentBlanks(row, col);
            this.checkWin();
        } else {
            this.revealCell(row, col);
            this.checkWin();
        }
    }
    
    handleRightClick(e, row, col) {
        e.preventDefault();
        if (this.isGameOver) return;
        
        const square = e.target;
        const currentStatus = this.statusGrid[row][col];
        
        switch(currentStatus) {
            case 'revealed':
                return;
            case 'covered':
                if(this.flagCount < this.numOfMines){
                    square.textContent = '🚩';
                    this.statusGrid[row][col] = 'flagged';
                    this.flagCount++;
                    break;
                }
                break
            case 'flagged':
                square.textContent = '?';
                this.statusGrid[row][col] = 'marked';
                this.flagCount--;
                break;
            case 'marked':
                square.textContent = '';
                this.statusGrid[row][col] = 'covered';
                break;
        }
        
        this.updateMineCounter();
    }
    
    revealCell(row, col) {
        if (this.statusGrid[row][col] === 'revealed') return;
        
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        const cellValue = this.gridArr[row][col];
        
        this.statusGrid[row][col] = 'revealed';
        
        if (cellValue === 'X') {
            square.style.backgroundColor = '#ff4444';
            square.style.border = '2px inset #ff4444';
            square.textContent = '💣';
        } else {
            square.style.backgroundColor = '#f0f0f0';
            square.style.border = '1px solid #999';
            square.textContent = cellValue === 0 ? "" : cellValue;
            this.nonMineCount--;
            
            // Add number colors
            if (cellValue > 0) {
                const colors = ['', '#0000ff', '#008000', '#ff0000', '#000080', '#800000', '#008080', '#000000', '#808080'];
                square.style.color = colors[cellValue] || '#000000';
            }
        }
    }
    
    revealAdjacentBlanks(row, col) {
        if (!this.isValidPosition(row, col) || this.statusGrid[row][col] === 'revealed') {
            return;
        }
        
        const cellValue = this.gridArr[row][col];
        if (cellValue === 'X') return;
        
        this.revealCell(row, col);
        
        if (cellValue !== 0) return;
        
        // Recursively reveal adjacent blank cells
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                this.revealAdjacentBlanks(row + i, col + j);
            }
        }
    }
    
    gameOver(won) {
        this.isGameOver = true;
        this.stopTimer();
        

        if (!won) {
            // Reveal all mines
            this.squares.forEach(square => {
                const row = parseInt(square.dataset.row);
                const col = parseInt(square.dataset.col);
                if (this.gridArr[row][col] === 'X' && this.statusGrid[row][col] !== 'revealed') {
                    square.style.backgroundColor = '#ff4444';
                    square.style.border = '2px inset #ff4444';
                    square.textContent = '💣';
                }
            });
            this.title.innerHTML = `You hit a mine! Try Again`;
        } else {
            
            this.title.innerHTML = `Congratulations! You won!`;
        }
    }
    
    checkWin() {
        if (this.nonMineCount === 0) {
            this.gameOver(true);
        }
    }
    
    // Public method to restart the game
    restart() {
        this.title.innerHTML = `Minesweeper`;
        this.isGameOver = false;
        this.stopTimer();
        this.init();
    }
    
    // Public method to change difficulty
    setDifficulty(gridSize) {
        this.gridSize = gridSize;
        this.gridArea = gridSize * gridSize;
        this.restart();
    }
}

let newGame = new Minesweeper(5)