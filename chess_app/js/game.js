/*
Todo next: 
    Project desc:
    - update Readme.md

    Frontend:
    - rethink button design
    - style time duration list
    - add timer thin divider
    - add Chess subtitle styled 

    Backend:
    - write a lot o GOOD test / document functions
    - refactoring:
        - no separate [i, j] => field object instead 
*/

class Game {

    constructor() {

        this.N = 8;

        /**
         * Stores entire information about pieces locations. By convention white
         * pieces are positive numbers, black pieces are negative numbers and 
         * zero denotes empty field. Absoulute value denotes piece type:
         *  1: pawn
         *  2: bishop
         *  3: knight
         *  4: rock
         *  5: queen
         *  6: king
         */
        this.board = Array.apply(null, Array(this.N));
        
        /**
         * Stores information about next turn. It can be either 1 if next move 
         * belongs to white, and -1 if next move belongs to black.
         */
        this.whoseTurn;

        /**
         * Stores information about possible castling for each side. Castling is 
         * permitted if (1) both king and selected rock did not move during the 
         * game. Additional conditions are checked during actual move by 
         * getCastleMoves method. Note that first array element corresponds to 
         * long castle (rock on column 0), and second one to short castle (rock
         * on column 7). 
         */
        this.canCastle;

        /**
         * Stores information about possible en passant move. It is cleared 
         * right after each move. It can be either empty array if en passant
         * is not possible or contain one element denoting coordinates of 
         * possible en passant move (where attacing pawn lands after move)
         */
        this.enpassant;

        /**  
         * Determines what piece is pawn promoted to for both sides. It is 
         * supposed to be dynamically changed upon arrival of each pawn to the 
         * last line (selection from UI)
         */
        this.promotion;

        /**
         * Store information about king. First object kingPosition tracks 
         * current board position of both kings which is helpful for determining
         * check and check mate states. Second object kingChecked determines if 
         * either white or black king is currently in the checked state. 
         */
        this.kingPosition;
        this.kingChecked;

        /**
         * If true:
         *  (1) move() method will terminate right after calling
         *  (2) getMoves() method will always return empty array
         * This state variable is used to block the game during promotion 
         * decision made by player.
         */
        this.blockGame;

        // Initialize all fields
        this.resetGame();

    }

    get checkMate() {
        return this.isCheckMate(this.whoseTurn);
    }

    get repr() {
        return this.drawBoard();
    }
    
    populateBoard() {
        this.board.forEach((row, index) => {
            switch(index) {
                case 0:
                    this.board[index] = [4, 3, 2, 5, 6, 2, 3, 4]
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
    }

    /**
     * Reset game object as if it would be initialized again. Resets pieces 
     * positions and all state variables.
     */
    resetGame() {
        this.populateBoard();
        this.whoseTurn = 1;
        this.canCastle = {'-1': [true, true], '1': [true, true]};
        this.enpassant = [];
        this.promotion = {'-1': -5, '1': 5};
        this.kingPosition = {'-1': [7, 4], '1': [0, 4]};
        this.kingChecked = {'-1': false, '1': false};
        this.blockGame = true;
    }

    clearBoard() {
        this.board = Array.from(Array(this.N), _ => Array(this.N).fill(0));
    }

    toggleBlockGame() {
        this.blockGame = !this.blockGame;
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

    isAlly(piece, i, j) {
        if (piece * this.board[i][j] > 0) {
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

    /**
     * Checks if position is occupied by the enemy piece of certain type. 
     * 
     * @param {number} piece            Piece type.
     * @param {number} i                Row number.
     * @param {number} j                Column number
     * @param {number} enemyPieceType   Enemy piece type.
     */
    isEnemyType(piece, i, j, enemyPieceType) {
        if (this.isEnemy(piece, i, j) && this.isPieceType(i, j, enemyPieceType)) {
            return true;
        }
        return false;
    }

    /**
     * Checks if piece on position (i, j) is attacked by any piece of the enemy.
     * 
     * @param {number} piece 
     * @param {number} i 
     * @param {number} j 
     * 
     * @return {boolean} 
     */
    isAttacked(piece, i, j) {
        let pieceSign = Math.sign(piece);
        let increments;
        let directions;

        // Pawn threat
        increments = [1, -1];
        for (let idx = 0; idx < increments.length; idx++) {

            let increment = increments[idx];

            if (this.isInBoard(i+pieceSign, j+increment)) {
                if (this.isEnemyType(piece, i+pieceSign, j+increment, 1)) {
                    console.log('pawn attacking');
                    return true;
                }
            }
        }

        // Knight threat
        increments = [[1, 2], [-1, 2], [1, -2], [-1, -2], 
                      [2, 1], [-2, 1], [2, -1], [-2, -1]];
        for (let idx = 0; idx < increments.length; idx++) {

            let increment = increments[idx];
            
            if (this.isInBoard(i+increment[0], j+increment[1])) {
                if (this.isEnemyType(piece, i+increment[0], j+increment[1], 3)) {
                    console.log('knight attacking');
                    return true;
                }
            }
        }
        
        // King threat
        increments = [[1, 1], [-1, 1], [1, -1], [-1, -1], 
                      [0, 1], [0, -1], [1, 0], [-1, 0]];
        for (let idx = 0; idx < increments.length; idx++) {

            let increment = increments[idx];
            
            if (this.isInBoard(i+increment[0], j+increment[1])){
                if (this.isEnemyType(piece, i+increment[0], j+increment[1], 6)) {
                    console.log('king attacking');
                    return true;
                }
            }
        }

        // Long range (diagonal) threat
        directions = [[1, 1], [-1, 1], [1, -1], [-1, -1]]
        for (let idx = 0; idx < directions.length; idx++) {

            let direction = directions[idx];
            let steps = 1;
            let move = [i + steps * direction[0], j + steps * direction[1]];

            while (this.isInBoard(move[0], move[1])) {

                if (this.isEnemyType(piece, move[0], move[1], 2)) {
                    console.log('bishop attacking');
                    return true;
                } else if (this.isEnemyType(piece, move[0], move[1], 5)) {
                    console.log('queen attacking');
                    return true;
                } else if (this.isAlly(piece, move[0], move[1]) || 
                           this.isEnemy(piece, move[0], move[1])) {
                    break;
                }

                steps += 1;
                move = [i + steps * direction[0], j + steps * direction[1]];
            }
        }

        // Long range (straight line) threat
        directions = [[1, 0], [-1, 0], [0, 1], [0, -1]]
        for (let idx = 0; idx < directions.length; idx++) {

            let direction = directions[idx];
            let steps = 1;
            let move = [i + steps * direction[0], j + steps * direction[1]];

            while (this.isInBoard(move[0], move[1])) {

                if (this.isEnemyType(piece, move[0], move[1], 4)) {
                    console.log('rock attacking');
                    return true;
                } else if (this.isEnemyType(piece, move[0], move[1], 5)) {
                    console.log('queen attacking');
                    return true;
                } else if (this.isAlly(piece, move[0], move[1]) ||
                           this.isEnemy(piece, move[0], move[1])) {
                    break;
                }

                steps += 1;
                move = [i + steps * direction[0], j + steps * direction[1]];
            }
        }

        return false;
    }

    isChecked(side) {
        return this.isAttacked(side * 6, 
            this.kingPosition[side][0], this.kingPosition[side][1]);
    }

    /**
     * Checks if after making a move king is or becomes attacked.
     * 
     * @param {Array} moveFrom 
     * @param {Array} moveTo 
     */
    isCheckedAfterMove(moveFrom, moveTo) {
        let pieceFrom = this.board[moveFrom[0]][moveFrom[1]];
        let pieceTo = this.board[moveTo[0]][moveTo[1]];
        let returnValue;

        // Fake move
        this.board[moveTo[0]][moveTo[1]] = pieceFrom;
        this.board[moveFrom[0]][moveFrom[1]] = 0;
        if (Math.abs(pieceFrom) === 6) {
            this.kingPosition[Math.sign(pieceFrom)] = moveTo;
        }

        if (this.isChecked(Math.sign(pieceFrom))) {
            returnValue = true;
        } else {
            returnValue = false;
        }

        // Undo fake move
        this.board[moveFrom[0]][moveFrom[1]] = pieceFrom;
        this.board[moveTo[0]][moveTo[1]] = pieceTo;
        if (Math.abs(pieceFrom) === 6) {
            this.kingPosition[Math.sign(pieceFrom)] = moveFrom;
        }

        return returnValue;
    }

    isCheckMate(side) {
        let moves;
        let piecesPositions = this.getPiecesPositions(side);

        if (!this.isChecked(side)) {
            return false;
        }

        for (let idx = 0; idx < piecesPositions.length; idx++) {
            moves = this.getMoves(piecesPositions[idx][0], piecesPositions[idx][1]);
            if (moves.length !== 0) {
                return false;
            }
        }

        return true;
    }

    /*********************
     * Movement checking *
     *********************/

    getPiecesPositions(side) {
        let positions = [];
        this.board.forEach((row, i) => {
            row.forEach((piece, j) => {
                if (Math.sign(piece) === side){
                    positions.push([i, j]);
                }
            });
        });
        return positions;
    }

    searchLongMoves(piece, i, j, directions) {
        
        let moves = [];

        directions.forEach(direction => {

            let steps = 1;
            let move = [i + steps * direction[0], j + steps * direction[1]];

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
                move = [i + steps * direction[0], j + steps * direction[1]];
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

    /**
     * Automatically check castle possibility and return array of possible king 
     * moves related to castling.
     * 
     * @param {number} side 
     */
    getCastleMoves(side) {
        let moves = [];
        let castleLine = 0;

        if (side === -1) {
            castleLine = 7;
        }

        // Check long castle
        if (this.canCastle[side][0]) {
            if (this.board[castleLine][1] === 0 &
                this.board[castleLine][2] === 0 & 
                this.board[castleLine][3] === 0) {
                if (!this.isAttacked(side, castleLine, 2) &
                    !this.isAttacked(side, castleLine, 3) &
                    !this.isAttacked(side, castleLine, 4)) {
                        moves.push([castleLine, 2]);
                    }
            }
        } 

        // Check short castle
        if (this.canCastle[side][1]) {
            if (this.board[castleLine][5] === 0 &
                this.board[castleLine][6] === 0) {
                if (!this.isAttacked(side, castleLine, 4) &
                    !this.isAttacked(side, castleLine, 5)) {
                        moves.push([castleLine, 6]);
                    }
            }
        }

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

            // Move from first line
            if (((piece === 1) && (i === 1)) || ((piece === -1) && (i === this.N-2))) {
                if (this.isEmpty(i+piece, j) & this.isEmpty(i+2*piece, j)){
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
                    if (this.enpassant.containsSubarray([i+piece, j+increment])) {
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
            moves.push(...this.getCastleMoves(Math.sign(piece)));
        } else {
            throw "selected piece is not a knight but getKnightMoves was called";
        }

        return moves;
    }

    getMoves(i, j) {

        if (this.blockGame) { return [] }

        let piece = this.board[i][j];
        let moves;
    
        if (this.whoseTurn !== Math.sign(piece)) {
            return [];
        }

        switch (Math.abs(piece)) {

            case 1:
                moves = this.getPawnMoves(i, j);
                break;
            case 2:
                moves = this.getBishopMoves(i, j);
                break;
            case 3:
                moves = this.getKnightMoves(i, j);
                break;
            case 4:
                moves = this.getRockMoves(i, j);
                break;
            case 5:
                moves = this.getQueenMoves(i, j);
                break;
            case 6:
                moves = this.getKingMoves(i, j);
                break;

        }

        // Exclude moves leading to check or not escaping check
        moves = moves.filter(move => !this.isCheckedAfterMove([i, j], move))

        return moves;
    }
    /************************
     * Controlling the game *
     ************************/

    move(moveFrom, moveTo) {

        if (this.blockGame) {return}

        let piece = this.board[moveFrom[0]][moveFrom[1]];

        this.board[moveTo[0]][moveTo[1]] = piece;
        this.board[moveFrom[0]][moveFrom[1]] = 0;

        /**
         * Handle castling:
         *  (1) if castle was performed move also the rock
         *  (2) if king was moved deny both castling
         *  (3) if rock was moved deny specific castling
         */
        if (Math.abs(piece) === 6) {
            if (Math.abs(moveTo[1] - moveFrom[1]) === 2) {
                let castleLine = this.kingPosition[Math.sign(piece)][0];
                let rockInitColumn;
                let rockEndColumn;

                // Right castle and left castle
                if (moveTo[1] > moveFrom[1]) { 
                    rockInitColumn = 7;
                    rockEndColumn = 5; 
                } else { 
                    rockInitColumn = 0;
                    rockEndColumn = 3;
                }

                this.board[castleLine][rockInitColumn] = 0;
                this.board[castleLine][rockEndColumn] = Math.sign(piece) * 4;
                this.canCastle[Math.sign(piece)] = [false, false];
            }
        }
        if (this.canCastle[Math.sign(piece)].some(e => e)) {
            if (Math.abs(piece) === 6) {
                this.canCastle[Math.sign(piece)] = [false, false];
            } else if ([moveFrom].containsSubarray([0, 0])) {
                this.canCastle[1][0] = false;
            } else if ([moveFrom].containsSubarray([0, 7])) {
                this.canCastle[1][1] = false;
            } else if ([moveFrom].containsSubarray([7, 0])) {
                this.canCastle[-1][0] = false;
            } else if ([moveFrom].containsSubarray([7, 7])) {
                this.canCastle[-1][1] = false;
            }
        }
        
        /**
         * Handle en passant:
         *  (1) if en passant kill was performed remove killed pawn
         *  (2) if pawn was moved from the first line update enpassant array
         */
        if (this.enpassant.length !== 0){
            if ((Math.abs(piece) === 1) & this.enpassant.containsSubarray(moveTo)) {
                this.board[moveTo[0] - piece][moveTo[1]] = 0;
            }
            this.enpassant = [];
        }
        if (Math.abs(piece) === 1) {
            if (Math.abs(moveTo[0] - moveFrom[0]) === 2){
                this.enpassant.push([moveFrom[0]+piece, moveFrom[1]])
            }
        }

        /**
         * Handle promotion:
         *  (1) if pawn reach last line it transforms to piece defined in 
         *      coresponding promotion object
         */
        if ((Math.abs(piece) === 1) & ((moveTo[0] === 0) | (moveTo[0] === 7))) {
            this.board[moveTo[0]][moveTo[1]] = this.promotion[Math.sign(piece)]
        }

        // Update king variables
        if (Math.abs(piece) === 6) {
            this.kingPosition[Math.sign(piece)] = moveTo;
        }

        //=== procedures for the other side ====================================
        this.whoseTurn *= -1;
        //======================================================================
    
        // Check and check-mate detection
        this.kingChecked[this.whoseTurn] = this.isChecked(this.whoseTurn);

        
        if (this.isCheckMate(this.whoseTurn)) {
            this.blockGame = true;
        }
    
    }

    moveSafe(moveFrom, moveTo) {

        let validMoves = this.getMoves(moveFrom[0], moveFrom[1]);

        if (validMoves.containsSubarray(moveTo)) {
            this.move(moveFrom, moveTo);
        } else {
            console.log('invalid move...');
        }

    }

}