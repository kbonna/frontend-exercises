/**
 * Checks if array contains specific subarray. Used to check if a field is one
 * of array elements.
 *
 * @param {Array<number>} subArray - Array of numbers
 *
 * @returns {boolean}
 */
Array.prototype.containsSubarray = function(subArr) {
    if (!Array.isArray(subArr)) {
        throw new TypeError(`${subArr} is not an array`);
    }

    for (let idx = 0; idx < this.length; idx++) {
        let match = true;

        for (let idy = 0; idy < subArr.length; idy++) {
            if (this[idx][idy] !== subArr[idy]) {
                match = false;
                break;
            }
        }

        if (match) {
            return true;
        }
    }
    return false;
};

/**
 * Checks if two arrays contains same set of vectors.
 *
 * @param {Array<Array>} arr - Array of fields
 *
 * @returns {boolean}
 */
Array.prototype.isSameAs = function(arr) {
    if (this.length !== arr.length) {
        return false;
    }
    for (let idx = 0; idx < this.length; idx++) {
        if (!this.containsSubarray(arr[idx])) {
            return false;
        }
    }
    return true;
};

/**
 * Class implementing entire chess functionality. It stores current game state,
 * checks and perform all moves, detect check and check-mate states.
 *
 * @class Game
 */
class Game {
    constructor() {
        /**
         * Chessboard size.
         *
         * @type {number}
         */
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
         *
         * @type {Array<Array>}
         */
        this.board = Array.apply(null, Array(this.N));

        /**
         * Stores information about next turn. It can be either 1 if next move
         * belongs to white, and -1 if next move belongs to black.
         *
         * @type {number}
         */
        this.whoseTurn;

        /**
         * Stores information about possible castling for each side. Castling is
         * permitted if  both king and selected rock did not move during the
         * game. Additional conditions are checked during actual move by
         * getCastleMoves method. Note that first array element corresponds to
         * long castle (rock on column 0), and second one to short castle (rock
         * on column 7).
         *
         * @type {Object}
         */
        this.canCastle;

        /**
         * Stores information about possible en passant move. It is cleared
         * right after each move. It can be either empty array if en passant
         * is not possible or contain one element denoting coordinates of
         * possible en passant move (where attacing pawn lands after move)
         *
         * @type {Array}
         */
        this.enpassant;

        /**
         * Determines what piece is pawn promoted to for both sides. It is
         * supposed to be dynamically changed upon arrival of each pawn to the
         * last line (selection from UI)
         *
         * @type {Object}
         */
        this.promotion;

        /**
         * Tracks current board position of both kings which is helpful for
         * determining check and check mate states.
         *
         * @type {Object}
         */
        this.kingPosition;

        /**
         * Determines if either white or black king is currently in the checked
         * state.
         *
         * @type {Object}
         */
        this.kingChecked;

        /**
         * If true:
         *  (1) move() method will terminate right after calling
         *  (2) getMoves() method will always return empty array
         * This state variable is used to block the game during promotion
         * decision made by player.
         *
         * @type {boolean}
         */
        this.isBlocked;

        // Initialize all fields
        this.resetGame();

        // Useful const arrays
        this.MOVES = {
            knightIncrements: [
                [1, 2],
                [-1, 2],
                [1, -2],
                [-1, -2],
                [2, 1],
                [-2, 1],
                [2, -1],
                [-2, -1]
            ],
            kingIncrements: [
                [1, 1],
                [-1, 1],
                [1, -1],
                [-1, -1],
                [0, 1],
                [0, -1],
                [1, 0],
                [-1, 0]
            ],
            diagonalDirections: [
                [1, 1],
                [-1, 1],
                [1, -1],
                [-1, -1]
            ],
            straightLineDirections: [
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1]
            ]
        };
    }

    /***************
     * Set methods *
     ***************/

    /**
     * Resets game object as if it would be initialized again. Resets pieces
     * positions and all state variables.
     */
    resetGame() {
        this.setBoard();
        this.whoseTurn = 1;
        this.canCastle = { '-1': [true, true], '1': [true, true] };
        this.enpassant = [];
        this.promotion = { '-1': -5, '1': 5 };
        this.kingPosition = { '-1': [7, 4], '1': [0, 4] };
        this.kingChecked = { '-1': false, '1': false };
        this.isBlocked = true;
    }

    /**
     * Resets board. Place all pieces on their initial positions.
     */
    setBoard() {
        this.board.forEach((row, index) => {
            switch (index) {
                case 0:
                    this.board[index] = [4, 3, 2, 5, 6, 2, 3, 4];
                    break;
                case 1:
                    this.board[index] = new Array(this.N).fill(1);
                    break;
                case this.N - 2:
                case this.N - 1:
                    this.board[index] = this.board[this.N - index - 1].map(
                        e => -1 * e
                    );
                    break;
                default:
                    this.board[index] = new Array(this.N).fill(0);
            }
        });
    }

    /**
     * Places piece on a specific position.
     *
     * @param {number} i - Row number
     * @param {number} j - Column number
     * @param {number} piece - Piece to be placed
     */
    setPiece(i, j, piece) {
        this.board[i][j] = piece;
    }

    /**
     * Removes all pieces from the board.
     */
    clearBoard() {
        this.board = Array.from(Array(this.N), _ => Array(this.N).fill(0));
    }

    /**
     * Adds enpassant possibility. For testing purpose only.
     *
     * @param {Array<number>} field - Field to move after enpassant.
     */
    setEnpassant(field) {
        this.enpassant = [field];
    }

    /**
     * For testing purpose only.
     */
    disableCastling() {
        this.canCastle = { '-1': [false, false], '1': [false, false] };
    }

    /**
     * For testing purpose only.
     */
    resetCastling() {
        this.canCastle = { '-1': [true, true], '1': [true, true] };
    }

    /**
     * Toggle between blocked and not blocked state.
     */
    toggleBlockGame() {
        this.isBlocked = !this.isBlocked;
    }

    /*********************
     * Visualize methods *
     *********************/

    /**
     * @property {null} - Formatted chessboard representation as a string
     */
    get repr() {
        return this.drawBoard();
    }

    /**
     * Print formatted representation of the chessboard to the console.
     *
     * @param {Array<Array>} [boardOptional] - Optional board to use instead of
     *  the current chessboard.
     */
    drawBoard(boardOptional) {
        let boardReversed;
        let boardString = '';

        if (typeof boardOptional === 'undefined') {
            boardReversed = this.board.slice().reverse();
        } else {
            boardReversed = boardOptional.slice().reverse();
        }

        boardReversed.forEach((row, i) => {
            boardString += `:${this.N - i - 1}:  `;
            row.forEach(e => {
                if (e < 0) {
                    boardString += `${e} `;
                } else {
                    boardString += ` ${e} `;
                }
            });
            boardString += '\n';
        });
        boardString +=
            ` i \n${' '.repeat(4)}j:` +
            Array.from({ length: this.N }, (x, i) => i).reduce(
                (a, b) => `${a}::${b}`
            );
        console.log(boardString);
    }

    /**
     * Print formatted chessboard to the console and highlight specified moves.
     *
     * @param {Array<Array>} moves - Moves to highlight
     */
    drawMoves(moves) {
        let boardWithMoves = this.board.slice();
        moves.forEach(move => {
            boardWithMoves[move[0]][move[1]] = String.fromCharCode(2746);
        });
        this.drawBoard(boardWithMoves);
    }

    /*****************
     * Check methods *
     *****************/

    isPieceType(i, j, pieceType) {
        if (Math.abs(this.board[i][j]) === pieceType) {
            return true;
        }
        return false;
    }

    isInBoard(i, j) {
        if (i >= 0 && i <= this.N - 1 && j >= 0 && j <= this.N - 1) {
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

    isEnemy(i, j, piece) {
        if (piece * this.board[i][j] < 0) {
            return true;
        }
        return false;
    }

    isAlly(i, j, piece) {
        if (piece * this.board[i][j] > 0) {
            return true;
        }
        return false;
    }

    /**
     * Checks if position is occupied by the enemy piece of certain type.
     *
     * @param {number} i - Row number
     * @param {number} j - Column number
     * @param {number} piece - Piece type
     * @param {number} enemyPieceType - Enemy piece type.
     */
    isEnemyType(i, j, piece, enemyPieceType) {
        if (
            this.isEnemy(i, j, piece) &&
            this.isPieceType(i, j, enemyPieceType)
        ) {
            return true;
        }
        return false;
    }

    isAttackedByPawn(i, j, piece) {
        let pieceSign = Math.sign(piece);
        let increments = [1, -1];
        for (let idx = 0; idx < increments.length; idx++) {
            let increment = increments[idx];

            if (this.isInBoard(i + pieceSign, j + increment)) {
                if (this.isEnemyType(i + pieceSign, j + increment, piece, 1)) {
                    return true;
                }
            }
        }
        return false;
    }

    isAttackedByKnight(i, j, piece) {
        for (let idx = 0; idx < this.MOVES.knightIncrements.length; idx++) {
            let increment = this.MOVES.knightIncrements[idx];

            if (this.isInBoard(i + increment[0], j + increment[1])) {
                if (
                    this.isEnemyType(
                        i + increment[0],
                        j + increment[1],
                        piece,
                        3
                    )
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    isAttackedByKing(i, j, piece) {
        for (let idx = 0; idx < this.MOVES.kingIncrements.length; idx++) {
            let increment = this.MOVES.kingIncrements[idx];

            if (this.isInBoard(i + increment[0], j + increment[1])) {
                if (
                    this.isEnemyType(
                        i + increment[0],
                        j + increment[1],
                        piece,
                        6
                    )
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    isAttackedOnDiagonal(i, j, piece) {
        for (let idx = 0; idx < this.MOVES.diagonalDirections.length; idx++) {
            let direction = this.MOVES.diagonalDirections[idx];
            let steps = 1;
            let it = i + steps * direction[0];
            let jt = j + steps * direction[1];

            while (this.isInBoard(it, jt)) {
                if (this.isEnemyType(it, jt, piece, 2)) {
                    return true;
                } else if (this.isEnemyType(it, jt, piece, 5)) {
                    return true;
                } else if (
                    this.isAlly(it, jt, piece) ||
                    this.isEnemy(it, jt, piece)
                ) {
                    break;
                }
                steps += 1;
                it = i + steps * direction[0];
                jt = j + steps * direction[1];
            }
        }
        return false;
    }

    isAttackedOnStraightLine(i, j, piece) {
        for (
            let idx = 0;
            idx < this.MOVES.straightLineDirections.length;
            idx++
        ) {
            let direction = this.MOVES.straightLineDirections[idx];
            let steps = 1;
            let it = i + steps * direction[0];
            let jt = j + steps * direction[1];

            while (this.isInBoard(it, jt)) {
                if (this.isEnemyType(it, jt, piece, 4)) {
                    return true;
                } else if (this.isEnemyType(it, jt, piece, 5)) {
                    return true;
                } else if (
                    this.isAlly(it, jt, piece) ||
                    this.isEnemy(it, jt, piece)
                ) {
                    break;
                }
                steps += 1;
                it = i + steps * direction[0];
                jt = j + steps * direction[1];
            }
        }
        return false;
    }

    /**
     * Checks if piece on position (i, j) is attacked by any piece of the enemy.
     *
     * @param {number} i - Row number
     * @param {number} j - Column number
     * @param {number} piece - Piece that is asking the question
     */
    isAttacked(i, j, piece) {
        if (this.isAttackedByPawn(i, j, piece)) {
            return true;
        }
        if (this.isAttackedByKnight(i, j, piece)) {
            return true;
        }
        if (this.isAttackedByKing(i, j, piece)) {
            return true;
        }
        if (this.isAttackedOnDiagonal(i, j, piece)) {
            return true;
        }
        if (this.isAttackedOnStraightLine(i, j, piece)) {
            return true;
        }
        return false;
    }

    isChecked(side) {
        return this.isAttacked(
            this.kingPosition[side][0],
            this.kingPosition[side][1],
            side * 6
        );
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
            moves = this.getMoves(
                piecesPositions[idx][0],
                piecesPositions[idx][1]
            );
            if (moves.length !== 0) {
                return false;
            }
        }

        return true;
    }

    /***************
     * Get methods *
     ***************/

    /**
     * @property {boolean} - Tells you if game is over
     */
    get checkMate() {
        return this.isCheckMate(this.whoseTurn);
    }

    getPiece(i, j) {
        return this.board[i][j];
    }

    getPiecesPositions(side) {
        let positions = [];
        this.board.forEach((row, i) => {
            row.forEach((piece, j) => {
                if (Math.sign(piece) === side) {
                    positions.push([i, j]);
                }
            });
        });
        return positions;
    }

    /**
     * Returns all moves than can be extended by multiplying amount of steps in
     * some direction. Terminates search when edge of the board is reached or
     * another piece is spotted.
     *
     * @param {number} i - Row number
     * @param {number} j - Column number
     * @param {number} piece - Piece getting moves
     * @param {Array<Array>} directions - List of incremented fields
     */
    getLongMoves(i, j, piece, directions) {
        let moves = [];

        directions.forEach(direction => {
            let steps = 1;
            let move = [i + steps * direction[0], j + steps * direction[1]];

            while (this.isInBoard(move[0], move[1])) {
                if (this.isEmpty(move[0], move[1])) {
                    moves.push(move);
                } else if (this.isEnemy(move[0], move[1], piece)) {
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

    /**
     * Returns all moves than can be reached by adding elements from fields
     * list. Exclude moves that lead to leaving the board and moves that gives
     * collision with ally piece.
     *
     * @param {number} i - Row number
     * @param {number} j - Column number
     * @param {number} piece - Piece getting moves
     * @param {Array<Array>} fields - List of field changes
     */
    getShortMoves(i, j, piece, fields) {
        let moves = [];

        fields.forEach(increments => {
            let move = [i + increments[0], j + increments[1]];

            if (this.isInBoard(move[0], move[1])) {
                if (this.isEmpty(move[0], move[1])) {
                    moves.push(move);
                } else if (this.isEnemy(move[0], move[1], piece)) {
                    moves.push(move);
                }
            }
        });

        return moves;
    }

    /**
     * Returns possible castle moves for king located on position (i, j).
     * Castling can be performend only when:
     *  (1) King and rock did not move since the beginning of the game. This is
     *      handled by canCastle property.
     *  (2) King is not checked.
     *
     * @param {number} i - Row number
     * @param {number} j - Column number
     */
    getCastleMoves(i, j) {
        const side = Math.sign(this.board[i][j]);
        let castleLine = 0;
        let moves = [];

        if (side === -1) {
            castleLine = 7;
        }

        // Check long castle
        if (this.canCastle[side][0]) {
            if (
                (this.board[castleLine][1] === 0) &
                (this.board[castleLine][2] === 0) &
                (this.board[castleLine][3] === 0)
            ) {
                if (
                    !this.isAttacked(castleLine, 2, side) &
                    !this.isAttacked(castleLine, 3, side) &
                    !this.isAttacked(castleLine, 4, side)
                ) {
                    moves.push([castleLine, 2]);
                }
            }
        }

        // Check short castle
        if (this.canCastle[side][1]) {
            if (
                (this.board[castleLine][5] === 0) &
                (this.board[castleLine][6] === 0)
            ) {
                if (
                    !this.isAttacked(castleLine, 4, side) &
                    !this.isAttacked(castleLine, 5, side)
                ) {
                    moves.push([castleLine, 6]);
                }
            }
        }

        return moves;
    }

    /**
     * Returns possible enpassant moves for pawn located on position (i, j).
     * Enpassant kill can be performend only when:
     *  (1) In the previous move opponent pawn moved by 2 from the first line.
     *  (2) Enpassant kill won't lead to king exposure to the check.
     *
     * @param {number} i - Row number
     * @param {number} j - Column number
     */
    getEnpassantMoves(i, j) {
        let piece = this.board[i][j];
        let moves = [];

        [1, -1].forEach(increment => {
            const moveTo = [i + piece, j + increment];

            if (this.enpassant.containsSubarray(moveTo)) {
                // Fake enpassant kill
                this.board[i][j + increment] = 0;

                if (!this.isCheckedAfterMove([i, j], moveTo)) {
                    moves.push([i + piece, j + increment]);
                }

                // Undo fake move
                this.board[i][j + increment] = -piece;
            }
        });
        return moves;
    }

    getPawnMoves(i, j) {
        let piece = this.board[i][j];
        let moves = [];

        if (piece === 1 || piece === -1) {
            // Basic move
            if (this.isEmpty(i + piece, j)) {
                moves.push([i + piece, j]);
            }

            // Move from first line
            if (
                (piece === 1 && i === 1) ||
                (piece === -1 && i === this.N - 2)
            ) {
                if (
                    this.isEmpty(i + piece, j) & this.isEmpty(i + 2 * piece, j)
                ) {
                    moves.push([i + 2 * piece, j]);
                }
            }

            // Attack
            [1, -1].forEach(increment => {
                if (this.isInBoard(i + piece, j + increment)) {
                    if (this.isEnemy(i + piece, j + increment, piece)) {
                        moves.push([i + piece, j + increment]);
                    }
                }
            });

            // En passant attack
            moves.push(...this.getEnpassantMoves(i, j));
        } else {
            throw 'selected piece is not a pawn but getPawnMoves was called';
        }
        return moves;
    }

    getKnightMoves(i, j) {
        let piece = this.board[i][j];
        let moves = [];

        if (piece === 3 || piece === -3) {
            moves.push(
                ...this.getShortMoves(i, j, piece, this.MOVES.knightIncrements)
            );
        } else {
            throw 'selected piece is not a knight but getKnightMoves was called';
        }
        return moves;
    }

    getBishopMoves(i, j) {
        let piece = this.board[i][j];
        let moves = [];

        if (piece === 2 || piece === -2) {
            moves.push(
                ...this.getLongMoves(i, j, piece, this.MOVES.diagonalDirections)
            );
        } else {
            throw 'selected piece is not a bishop but getBishopMoves was called';
        }
        return moves;
    }

    getRockMoves(i, j) {
        let piece = this.board[i][j];
        let moves = [];

        if (piece === 4 || piece === -4) {
            moves.push(
                ...this.getLongMoves(
                    i,
                    j,
                    piece,
                    this.MOVES.straightLineDirections
                )
            );
        } else {
            throw 'selected piece is not a rock but getRockMoves was called';
        }
        return moves;
    }

    getQueenMoves(i, j) {
        let piece = this.board[i][j];
        let moves = [];

        if (piece === 5 || piece === -5) {
            moves.push(
                ...this.getLongMoves(
                    i,
                    j,
                    piece,
                    this.MOVES.straightLineDirections
                )
            );
            moves.push(
                ...this.getLongMoves(i, j, piece, this.MOVES.diagonalDirections)
            );
        } else {
            throw 'selected piece is not a queen but getQueenMoves was called';
        }
        return moves;
    }

    getKingMoves(i, j) {
        let piece = this.board[i][j];
        let moves = [];

        if (piece === 6 || piece === -6) {
            moves.push(
                ...this.getShortMoves(i, j, piece, this.MOVES.kingIncrements)
            );
            moves.push(...this.getCastleMoves(i, j));
        } else {
            throw 'selected piece is not a knight but getKnightMoves was called';
        }

        return moves;
    }

    getMoves(i, j) {
        if (this.isBlocked) {
            return [];
        }

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
        moves = moves.filter(move => !this.isCheckedAfterMove([i, j], move));

        return moves;
    }

    /************************
     * Controlling the game *
     ************************/

    move(moveFrom, moveTo) {
        if (this.isBlocked) {
            return;
        }

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
        if (this.enpassant.length !== 0) {
            if (
                (Math.abs(piece) === 1) &
                this.enpassant.containsSubarray(moveTo)
            ) {
                this.board[moveTo[0] - piece][moveTo[1]] = 0;
            }
            this.enpassant = [];
        }
        if (Math.abs(piece) === 1) {
            if (Math.abs(moveTo[0] - moveFrom[0]) === 2) {
                this.enpassant.push([moveFrom[0] + piece, moveFrom[1]]);
            }
        }

        /**
         * Handle promotion:
         *  (1) if pawn reach last line it transforms to piece defined in
         *      coresponding promotion object
         */
        if ((Math.abs(piece) === 1) & ((moveTo[0] === 0) | (moveTo[0] === 7))) {
            this.board[moveTo[0]][moveTo[1]] = this.promotion[Math.sign(piece)];
        }

        // Update king variables
        if (Math.abs(piece) === 6) {
            this.kingPosition[Math.sign(piece)] = moveTo;
        }

        // Procedures for the other side
        this.whoseTurn *= -1;

        // Check and check-mate detection
        [-1, 1].forEach(side => {
            this.kingChecked[side] = this.isChecked(side);
        });
        // this.kingChecked[this.whoseTurn] = this.isChecked(this.whoseTurn);
        // this.kingChecked[-this.whoseTurn] = this.isChecked(-this.whoseTurn);

        if (this.isCheckMate(this.whoseTurn)) {
            this.isBlocked = true;
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

if (typeof module !== 'undefined') {
    module.exports = Game;
}
