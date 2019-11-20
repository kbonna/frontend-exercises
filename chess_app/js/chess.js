/*
Convention regarding board representation: 
    0: empty field
    1: pawn
    2: knight
    3: bishop
    4: rock
    5: king
    6: queen
*/

class Game {

    constructor() {

        this.board = new Array(8);
            for (let i = 0; i < this.board.length; i++) {
                this.board[i] = new Array(8);
                this.board[i].fill(0);
            }
            
    }

    get repr() {
        return this._drawBoard();
    }
    
    _drawBoard() {
        let boardString = ''
        this.board.forEach(row => {
            row.forEach(e => {
                boardString += e
            });
            boardString += '\n'
        });
        console.log(boardString);
    }


}

const game = new Game;

game.repr;