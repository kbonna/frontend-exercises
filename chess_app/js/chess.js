/*
Convention regarding board representation: 
    0: empty field
    1: pawn
    2: bishop
    3: knight
    4: rock
    5: queen
    6: king
*/

class Game {

    constructor() {

        this.N = 8;

        this.board = Array.apply(null, Array(this.N));
        this.board.forEach((row, index) => {
            switch(index) {
                case 0:
                    this.board[index] = [4, 3, 2, 6, 5, 2, 3, 4]
                    break;
                case 1:
                    this.board[index] = new Array(this.N).fill(1);
                    break;
                case this.N-2:
                case this.N-1:
                    this.board[index] = this.board[this.N-index-1].map(e => (-1)*e);
                    break;
                default:
                    this.board[index] = new Array(this.N).fill(0);
            }
        });            

        // Array for marking possible en passant moves
        this.enpassant = Array.from(Array(this.N), _ => Array(this.N).fill(0));

        // Determining if either side is checked
        this.isChecked = {'-1': false, '1': false}

    }

    get repr() {
        return this.drawBoard();
    }
    
    clearBoard() {
        this.board = Array.from(Array(this.N), _ => Array(this.N).fill(0));
    }

    /*********************
     * Visualize methods * 
     *********************/
    drawBoard(boardOptional) {

        let boardReversed;
        let boardString = '';

        if (typeof boardOptional === 'undefined') {
            boardReversed = this.board.slice().reverse();
        } else {
            boardReversed = boardOptional.slice().reverse();
        }
        
        boardReversed.forEach((row, i) => {
            boardString += `:${this.N-i-1}:  `;
            row.forEach(e => {
                if (e < 0) {
                    boardString += `${e} `;
                } else {
                    boardString += ` ${e} `;
                }
            });
            boardString += '\n'
        });
        boardString += ` i \n${' '.repeat(4)}j:` +  
            Array.from({length: this.N}, (x,i) => i).reduce((a, b) => `${a}::${b}`);
        console.log(boardString);
    }

    drawMoves(moves) {
        let boardWithMoves = this.board.slice();
        moves.forEach(move => {
            boardWithMoves[move[0]][move[1]] = String.fromCharCode(2746); //4030
        });
        this.drawBoard(boardWithMoves);
    }

    getValidMoves(i, j) {
        //pass
    }

    /*****************
     * Check methods *
     *****************/

    isPieceType(i, j, pieceType){
        if (Math.abs(this.board[i][j]) === pieceType) {
            return true;
        }
        return false;
    }

    isInBoard(i, j) {
        if (i >= 0 && i <= this.N-1 && j >= 0 && j <= this.N-1) {
            return true;
        }
        return false;
    }

    isEmpty(i, j) {
         if (this.board[i][j] === 0) {
            return true;
        }
        return false;
    }

    isEnemy(piece, i, j) {
        if (piece * this.board[i][j] < 0) {
            return true;
        }
        return false;
    }

    isEmptyOrEnemy(piece, i, j) {
        if (this.isEmpty(i,j) || this.isEnemy(piece, i, j)) {
            return true;
        }
        return false;
    }

    isEnPassant(piece, i, j) {
        if (piece * this.enpassant[i][j] < 0) {
            return true;
        }
        return false;
    }

    isAttacked(piece, i, j) {
        let pieceSign = Math.sign(piece);
        let increments;

        // Pawn threat
        increments = [1, -1];
        for (let idx = 0; idx < increments.length; idx++) {
            let increment = increments[idx];
            if (this.isInBoard(i+pieceSign, j+increment)) {
                if (this.isEnemy(piece, i+pieceSign, j+increment) && 
                    this.isPieceType(i+pieceSign, j+increment, 1)) {
                        return true;
                }
            }
        }

        // Knight threat
        increments = [[1, 2], [-1, 2], [1, -2], [-1, -2], [2, 1], [-2, 1], [2, -1], [-2, -1]];
        for (let idx = 0; idx < increments.length; idx++) {
            let increment = increments[idx];
            if (this.isInBoard(i+increment[0], j+increment[0])) {
                if (this.isEnemy(piece, i+increment[0], j+increment[1]) &&
                    this.isPieceType(i+increment[0], j+increment[1], 3)) {
                        return true;
                }
            }
        }
        
        return false;
    }

    /*********************
     * Movement checking *
     *********************/

    searchLongMoves(piece, i, j, directions) {
        
        let moves = [];

        directions.forEach(increments => {

            let steps = 1;
            let move = [i + steps * increments[0], j + steps * increments[1]];

            while (this.isInBoard(move[0], move[1])) {
                
                if (this.isEmpty(move[0], move[1])) {
                    moves.push(move);
                } else if (this.isEnemy(piece, move[0], move[1])) {
                    moves.push(move);
                    break;
                } else {
                    break;
                }

                steps += 1;
                move = [i + steps * increments[0], j + steps * increments[1]];
            }
        });

        return moves;
    }

    searchShortMoves(piece, i, j, fields) {

        let moves = [];

        fields.forEach(increments => {

            let move = [i + increments[0], j + increments[1]]

            if (this.isInBoard(move[0], move[1])) {
                if (this.isEmpty(move[0], move[1])) {
                    moves.push(move);
                } else if (this.isEnemy(piece, move[0], move[1])) {
                    moves.push(move);
                }
            }
        });

        return moves;
    }

    getPawnMoves(i, j) {
        let piece = this.board[i][j];
        let moves = [];

        if (piece === 1 || piece === -1) {
            // Basic move
            if (this.isEmpty(i+piece, j)){
                moves.push([i+piece, j]);
            }

            console.log(i+piece)
            // Move from first line
            if (((piece === 1) && (i === 1)) || ((piece === -1) && (i === this.N-2))) {
                if (this.isEmpty(i+2*piece, j)){
                    moves.push([i+2*piece, j])
                }
            }

            // Attack
            [1, -1].forEach(increment => {
                if (this.isInBoard(i+piece, j+increment)){
                    if (this.isEnemy(piece, i+piece, j+increment)) {
                        moves.push([i+piece, j+increment]);
                    }
                    // En passant attack
                    if (this.isEnPassant(piece, i+piece, j+increment)) {
                        moves.push([i+piece, j+increment]);
                    }
                }
            });
        } else {
            throw "selected piece is not a pawn but getPawnMoves was called";
        }
        return moves;
    }

    getKnightMoves(i, j) {
        let piece = this.board[i][j];
        let moves = [];

        if (piece === 3 || piece === -3) {
            moves.push(...this.searchShortMoves(piece, i, j, [[1, 2], [-1, 2], [1, -2], [-1, -2], [2, 1], [-2, 1], [2, -1], [-2, -1]]));
        } else {
            throw "selected piece is not a knight but getKnightMoves was called";
        }
        return moves;
    }

    getBishopMoves(i, j) {
        let piece = this.board[i][j];
        let moves = [];

        if (piece === 2 || piece === -2) {
            moves.push(...this.searchLongMoves(piece, i, j, [[-1, -1], [-1, 1], [1, -1], [1, 1]]));
        } else {
            throw "selected piece is not a bishop but getBishopMoves was called";
        }
        return moves;
    }

    getRockMoves(i, j) {
        let piece = this.board[i][j];
        let moves = [];

        if (piece === 4 || piece === -4) {
            moves.push(...this.searchLongMoves(piece, i, j, [[1, 0], [-1, 0], [0, 1], [0, -1]]));
        } else {
            throw "selected piece is not a rock but getRockMoves was called";
        }
        return moves;
    }

    getQueenMoves(i, j) {
        let piece = this.board[i][j];
        let moves = [];

        if (piece === 5 || piece === -5) {
            moves.push(...this.searchLongMoves(piece, i, j, [[1, 0], [-1, 0], [0, 1], [0, -1]]));
            moves.push(...this.searchLongMoves(piece, i, j, [[-1, -1], [-1, 1], [1, -1], [1, 1]]));
        } else {
            throw "selected piece is not a queen but getQueenMoves was called";
        }
        return moves;
    }

    getKingMoves(i, j) {
        let piece = this.board[i][j];
        let moves = [];

        if (piece === 6 || piece === -6) {
            moves.push(...this.searchShortMoves(piece, i, j, [[1, 1], [-1, 1], [1, -1], [-1, -1], [0, 1], [0, -1], [1, 0], [-1, 0]]));
        } else {
            throw "selected piece is not a knight but getKnightMoves was called";
        }
        return moves;
    }
    
}

if (typeof require !== 'undefined') {
    module.exports = {Game: Game};
}

const game = new Game;

game.clearBoard();

game.board[1][3] = 1;
game.board[2][5] = -3; 
game.repr;

console.log(game.isAttacked(1, 1, 3));