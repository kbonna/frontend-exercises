const game = new Game;
game.repr;

/*********************
 * Grab DOM elements *
 *********************/ 
const fieldList = document.querySelectorAll('.board__field');
const board = new Array(8);
for (let idx = 0; idx < board.length; idx++) {
    board[idx] = new Array(8);
}

// Convert fieldList into 2D array consistent with Game.board
fieldList.forEach((field, idx) => {
    board[7 - Math.floor(idx / 8)][idx % 8] = field;
});

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

draw();

/*******************
 * Event listeners *
 *******************/
let highlight = false;
let moveFrom;
let movesAllowed;

board.forEach((row, i) => {
    row.forEach((field, j) => {
        field.addEventListener('click', (e) => {

            if (!highlight) {
                movesAllowed = game.getMoves(i, j);

                if (movesAllowed.length !== 0) {

                    highlightMoves(movesAllowed);
                    moveFrom = [i, j];

                    draw();
                    highlight = true;
                }

            } else {
                if (movesAllowed.containsSubarray([i, j])) {
                    game.move(moveFrom, [i, j]);
                    draw();
                } 

                cancelHighlight();
                highlight = false;
            }
        });
    });
});
