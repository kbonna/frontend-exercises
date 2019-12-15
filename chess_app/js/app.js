Array.prototype.containsSubarray = function(subArray) {
    for (let idx = 0; idx < this.length; idx++) {
        let match = true;
        for (let idy = 0; idy < subArray.length; idy++) {
            if (this[idx][idy] !== subArray[idy]) {
                match = false;
                break;
            }
        }
        if (match) {
            return true;
        }
    }
    return false;
}

/************
 * End Game *
 ************/

function handleCheckMate(game, timer, ui) {
    let endGameMsg; 
        if (game.whoseTurn === -1) {
            endGameMsg = 'Check mate! White won!';
        } else {
            endGameMsg = 'Check mate! Black won!';
        }
    timer.togglePause();
    ui.toggleEnabled = false;
    window.alert(endGameMsg);
}

/*********************
 * Grab DOM elements *
 *********************/ 
const clockWhite = document.querySelector('.clock__time--white');
const clockBlack = document.querySelector('.clock__time--black');
const clockSetting = document.querySelector('#clock__setting')

const toggleButton = document.querySelector('#toggle');
const restartButton = document.querySelector('#restart');
const swapButton = document.querySelector('#swap');

const fieldList = document.querySelectorAll('.board__field');
const promotionModal = document.querySelector('.modal-promotion');
const promotionPieces = document.querySelectorAll('.modal-promotion__piece');
const board = new Array(8);

let reversed = false;

for (let idx = 0; idx < board.length; idx++) {
    board[idx] = new Array(8);
}

// Convert fieldList into 2D array consistent with Game.board
fieldList.forEach((field, idx) => {
    board[7 - Math.floor(idx / 8)][idx % 8] = field;
});

/************************
 * UI display functions *
 ************************/

function draw() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {

            switch (game.board[i][j]) {
                case 0:
                    board[i][j].innerHTML = '';
                    break;
                case 1:
                    board[i][j].innerHTML = '<img src="img/pawn-white.svg" alt="white pawn" class="piece">';
                    break;
                case -1:
                    board[i][j].innerHTML = '<img src="img/pawn-black.svg" alt="black pawn" class="piece">';
                    break;
                case 2:
                    board[i][j].innerHTML = '<img src="img/bishop-white.svg" alt="white bishop" class="piece">';
                    break;
                case -2:
                    board[i][j].innerHTML = '<img src="img/bishop-black.svg" alt="black bishop" class="piece">';
                    break;
                case 3:
                    board[i][j].innerHTML = '<img src="img/knight-white.svg" alt="white knight" class="piece">';
                    break;
                case -3:
                    board[i][j].innerHTML = '<img src="img/knight-black.svg" alt="black knight" class="piece">';
                    break;
                case 4:
                    board[i][j].innerHTML = '<img src="img/rock-white.svg" alt="white rock" class="piece">';
                    break;
                case -4:
                    board[i][j].innerHTML = '<img src="img/rock-black.svg" alt="black rock" class="piece">';
                    break;
                case 5:
                    board[i][j].innerHTML = '<img src="img/queen-white.svg" alt="white queen" class="piece">';
                    break;
                case -5:
                    board[i][j].innerHTML = '<img src="img/queen-black.svg" alt="black queen" class="piece">';
                    break;
                case 6:
                    board[i][j].innerHTML = '<img src="img/king-white.svg" alt="white king" class="piece">';
                    break;
                case -6:
                    board[i][j].innerHTML = '<img src="img/king-black.svg" alt="black king" class="piece">';
                    break;
            }

        }
    }
}

function highlightMoves(moves) {
    moves.forEach(move => {
        board[move[0]][move[1]].classList.add('highlight');
    });
}

function cancelHighlight() {
    board.forEach(row => {
        row.forEach(field => {
            field.classList.remove('highlight')
        });
    });
}

function showPromotionModal() {
    promotionModal.style.display = 'grid';
}

function hidePromotionModal() {
    promotionModal.style.display = 'none';
}

function performPromotion() {

    if (ui.currentPiece < 0) {
        promotionPieces[0].src = 'img/bishop-black.svg';
        promotionPieces[1].src = 'img/knight-black.svg';
        promotionPieces[2].src = 'img/rock-black.svg';
        promotionPieces[3].src = 'img/queen-black.svg';
    } else {
        promotionPieces[0].src = 'img/bishop-white.svg';
        promotionPieces[1].src = 'img/knight-white.svg';
        promotionPieces[2].src = 'img/rock-white.svg';
        promotionPieces[3].src = 'img/queen-white.svg';
    }

    showPromotionModal();

    // Block the game until promotion piece is chosen
    game.blockGame = true;
}

const ui = {
    toggleEnabled: true,
    gameStarted: false,
    highlight: false,
    movesAllowed: [],
    moveFrom: [],
    moveTo: [],
    currentPiece: null
}

/**********************
 * Initialize objects *
 **********************/

let game = new Game;
let timer = new Timer(game, ui, clockWhite, clockBlack);

draw();

/*******************
 * Event listeners *
 *******************/

toggleButton.addEventListener('click', e => {

    if (!ui.gameStarted) {
        timer.maxTime = clockSetting[clockSetting.selectedIndex].value * 60;
        ui.gameStarted = true;
        clockSetting.disabled = true;
    }

    if (ui.toggleEnabled) {
        timer.togglePause();
        game.toggleBlockGame();

        if (toggleButton.innerHTML === 'Start') {
            toggleButton.innerHTML = 'Pause';
        } else {
            toggleButton.innerHTML = 'Start';
        }
    }
});

restartButton.addEventListener('click', e => {
    clockWhite.innerHTML = '--.--';
    clockBlack.innerHTML = '--.--';
    toggleButton.innerHTML = 'Start';
    ui.gameStarted = false;
    clockSetting.disabled = false;
    
    game.resetGame();
    timer.resetTimer();
    
    ui.toggleEnabled = true;
    cancelHighlight();
    draw();
});

swapButton.addEventListener('click', e => {
    board.reverse();
    reversed = !reversed;
    draw();
})

promotionPieces.forEach(p => {
    p.addEventListener('click', e => {

        // Change promotion choice for promoting side 
        switch (e.target.id) {
            case 'promo-bishop':
                game.promotion[Math.sign(ui.currentPiece)] = Math.sign(ui.currentPiece) * 2;
                break;
            case 'promo-knight':
                game.promotion[Math.sign(ui.currentPiece)] = Math.sign(ui.currentPiece) * 3;
                break;
            case 'promo-rock':
                game.promotion[Math.sign(ui.currentPiece)] = Math.sign(ui.currentPiece) * 4;
                break;
            case 'promo-queen':
                game.promotion[Math.sign(ui.currentPiece)] = Math.sign(ui.currentPiece) * 5;
                break;
        }

        game.blockGame = false;
        hidePromotionModal();
        
        // Proceed with the move
        game.move(ui.moveFrom, ui.moveTo);
        if (game.checkMate) { handleCheckMate(game, timer, ui) };
        draw();

    });
});

board.forEach((row, ii) => {
    row.forEach((field, j) => {
        field.addEventListener('click', e => {

            // Interpreting clicks for upside down board (change first coordinate)
            let i = ii;
            if (reversed) {i = 7 - ii;}

            // Show possible moves for piece
            if (!ui.highlight) {

                ui.moveFrom = [i, j];
                ui.currentPiece = game.board[i][j];
                ui.movesAllowed = game.getMoves(i, j);

                if (ui.movesAllowed.length !== 0) {
                    highlightMoves(ui.movesAllowed);
                    draw();
                    ui.highlight = true;
                }

            // Perform move if possible
            } else {

                ui.moveTo = [i, j];

                if (ui.movesAllowed.containsSubarray(ui.moveTo)) {
                    // Open promotion dialog if needed 
                    if ((Math.abs(ui.currentPiece) === 1) & (ui.moveTo[0] === 0 | ui.moveTo[0] === 7)) {
                        performPromotion();
                    }
                    timer.cacheTime();
                    game.move(ui.moveFrom, ui.moveTo);
                    if (game.checkMate) { handleCheckMate(game, timer, ui) };
                    draw();
                } 
                cancelHighlight();
                ui.highlight = false;
            }
        });
    });
});
