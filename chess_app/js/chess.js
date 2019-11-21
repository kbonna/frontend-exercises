/*
Convention regarding board representation: 
    0: empty field
    1: pawn
    2: bishop
    3: knight
    4: rock
    5: king
    6: queen
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

        // Array for marking possible en passant moves
        this.enpassant = Array.apply(null, Array(this.N))
        this.enpassant.forEach((row, index) => {
            this.enpassant[index] = new Array(this.N).fill(0); 
        });

        });            
    }

    get repr() {
        return this.drawBoard();
    }
    
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

    isInBoard(i, j) {
        if (i >= 0 && i <= this.N-1 && j >= 0 && j <= this.N-1) {
            return true;
        }
        return false;
    }

    addIfEmptyOrEnemy(piece, i, j, moves) {
        if (this.isInBoard(i,j)) {
            if (this.board[i][j] === 0 || piece * this.board[i][j] < 0) {
                moves.push([i, j]);
            }
        }
    }

    addIfEnemy(piece, i, j, moves) {
        if (this.isInBoard(i,j)) {
            if (piece * this.board[i][j] < 0) {
                moves.push([i, j]);
            }
        }        
    }

    addIfEnPassant(piece, i, j, moves) {
        if (this.isInBoard(i,j)) {
            if (piece * this.enpassant[i][j] < 0) {
                moves.push([i, j]);
            }
        }        
    }

    getPawnMoves(i, j) {
        let piece = this.board[i][j];
        let moves = [];

        if (piece === 1 || piece === -1) {
            // Basic move
            this.addIfEmptyOrEnemy(piece, i+piece, j, moves);

            // Attack
            this.addIfEnemy(piece, i+piece, j+1, moves);
            this.addIfEnemy(piece, i+piece, j-1, moves);

            // Move from first line
            if (piece === 1) {
                if (i === 1) {
                    this.addIfEmptyOrEnemy(piece, i+2*piece, j, moves);
                }
            } else {
                if (i === this.N-2) {
                    this.addIfEmptyOrEnemy(piece, i+2*piece, j, moves);
                }
            }

            // En passant
            this.addIfEnPassant(piece, i+piece, j+1, moves);
            this.addIfEnPassant(piece, i+piece, j-1, moves);
        } else {
            throw "selected piece is not a pawn but getPawnMoves was called";
        }
        return moves;
    }

}

const game = new Game;

game.repr;
game.drawMoves(game.getPawnMoves(6, 0));
