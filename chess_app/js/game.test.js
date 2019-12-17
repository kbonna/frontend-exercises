const Game = require('./game.js');

beforeAll(() => {
    return (game = new Game());
});

afterEach(() => {
    game.resetGame();
});

// containsSubarray function

test('containsSubarray producing correct output', () => {
    const myArr = [
        [0, 0],
        [1, 1]
    ];
    const result_true = myArr.containsSubarray([0, 0]);
    const result_false = myArr.containsSubarray([2, 2]);
    expect(result_true).toBe(true);
    expect(result_false).toBe(false);
    expect(() => {
        const result_wrong = myArr.containsSubarray(null);
    }).toThrow(TypeError);
});

// populateBoard

test('resetting chessboard', () => {
    game.board[0] = [0, 0, 0, 0, 0, 0, 0, 0];
    game.setBoard();
    expect(game.board[0]).toEqual([4, 3, 2, 5, 6, 2, 3, 4]);
    expect(game.board[7]).toEqual([-4, -3, -2, -5, -6, -2, -3, -4]);
});

// clearBoard

test('removing all pieces from chessboard', () => {
    game.clearBoard();
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            expect(game.board[i][j]).toBe(0);
        }
    }
});

// toggleBlockGame

test('toggling game blocked state', () => {
    expect(game.isBlocked).toBe(true);
    game.toggleBlockGame();
    expect(game.isBlocked).toBe(false);
});

// getPawnMoves
// test('pawn move from first line (white)', () => {
//     game.clearBoard();
//     game.board[1][0] = 1;
//     expect(game.getPawnMoves(1, 0).sort()).toEqual([[3, 0], [2, 0]].sort());
// });

// test('pawn move from first line (black)', () => {
//     game.clearBoard();
//     game.board[6][1] = -1;
//     expect(game.getPawnMoves(6, 1).sort()).toEqual([[5, 1], [4, 1]].sort());
// });

// test('pawn blocked by ally)', () => {
//     game.clearBoard();
//     game.board[2][6] = 1;
//     game.board[3][6] = 1;
//     expect(game.getPawnMoves(2, 6)).toEqual([]);
// });

// test('pawn with attack possibility near board edge', () => {
//     game.clearBoard();
//     game.board[5][7] = -1;
//     game.board[4][6] = 1;
//     expect(game.getPawnMoves(5, 7).sort()).toEqual([[4, 6], [4, 7]].sort());
// });

// isAttacked

test('isAttacked validated for pawn', () => {
    // white pawn
    game.clearBoard();
    game.setPiece(0, 0, 1);
    game.setPiece(1, 1, -1);
    expect(game.isAttacked(0, 0, 1)).toBe(true);

    game.clearBoard();
    game.setPiece(0, 0, 1);
    game.setPiece(0, 1, -1);
    expect(game.isAttacked(0, 0, 1)).toBe(false);

    game.clearBoard();
    game.setPiece(0, 0, 1);
    game.setPiece(1, 1, 1);
    expect(game.isAttacked(0, 0, 1)).toBe(false);

    // black pawn
    game.clearBoard();
    game.setPiece(7, 7, -1);
    game.setPiece(6, 6, 1);
    expect(game.isAttacked(7, 7, -1)).toBe(true);

    game.clearBoard();
    game.setPiece(7, 7, -1);
    game.setPiece(6, 7, 1);
    expect(game.isAttacked(0, 0, 1)).toBe(false);

    game.clearBoard();
    game.setPiece(7, 7, -1);
    game.setPiece(6, 6, -1);
    expect(game.isAttacked(7, 7, -1)).toBe(false);
});

test('isAttacked validated for bishop', () => {
    [1, -1].forEach(side => {
        game.clearBoard();
        game.setPiece(0, 0, side);
        game.setPiece(7, 7, -2 * side);
        expect(game.isAttacked(0, 0, side)).toBe(true);

        game.clearBoard();
        game.setPiece(0, 0, side);
        game.setPiece(7, 7, 2 * side);
        expect(game.isAttacked(0, 0, side)).toBe(false);

        game.clearBoard();
        game.setPiece(0, 0, side);
        game.setPiece(1, 1, side);
        game.setPiece(7, 7, -2 * side);
        expect(game.isAttacked(0, 0, side)).toBe(false);
    });
});

test('isAttacked validated for knight', () => {
    [1, -1].forEach(side => {
        // can knight really jump?
        game.clearBoard();
        game.setPiece(0, 0, side);
        game.setPiece(1, 1, side);
        game.setPiece(0, 1, side);
        game.setPiece(1, 0, side);
        game.setPiece(1, 2, -3 * side);
        expect(game.isAttacked(0, 0, side)).toBe(true);

        game.clearBoard();
        game.setPiece(0, 0, side);
        game.setPiece(1, 1, side);
        game.setPiece(0, 1, side);
        game.setPiece(1, 0, side);
        game.setPiece(2, 1, -3 * side);
        expect(game.isAttacked(0, 0, side)).toBe(true);

        game.clearBoard();
        game.setPiece(0, 0, side);
        game.setPiece(1, 2, 3 * side);
        expect(game.isAttacked(0, 0, side)).toBe(false);
    });
});

test('isAttacked validated for rock', () => {
    [1, -1].forEach(side => {
        game.clearBoard();
        game.setPiece(0, 0, side);
        game.setPiece(7, 0, -4 * side);
        expect(game.isAttacked(0, 0, side)).toBe(true);

        game.clearBoard();
        game.setPiece(0, 0, side);
        game.setPiece(1, 0, side);
        game.setPiece(7, 0, -4 * side);
        expect(game.isAttacked(0, 0, side)).toBe(false);

        game.clearBoard();
        game.setPiece(0, 0, side);
        game.setPiece(0, 7, -4 * side);
        expect(game.isAttacked(0, 0, side)).toBe(true);

        game.clearBoard();
        game.setPiece(0, 0, side);
        game.setPiece(0, 1, side);
        game.setPiece(0, 7, -4 * side);
        expect(game.isAttacked(0, 0, side)).toBe(false);

        game.clearBoard();
        game.setPiece(0, 0, side);
        game.setPiece(7, 0, 4 * side);
        expect(game.isAttacked(0, 0, side)).toBe(false);
    });
});

test('isAttacked validated for queen', () => {
    [1, -1].forEach(side => {
        game.clearBoard();
        game.setPiece(0, 0, side);
        game.setPiece(7, 0, -5 * side);
        expect(game.isAttacked(0, 0, side)).toBe(true);

        game.clearBoard();
        game.setPiece(0, 0, side);
        game.setPiece(1, 0, side);
        game.setPiece(7, 0, -5 * side);
        expect(game.isAttacked(0, 0, side)).toBe(false);

        game.clearBoard();
        game.setPiece(0, 0, side);
        game.setPiece(7, 7, -5 * side);
        expect(game.isAttacked(0, 0, side)).toBe(true);

        game.clearBoard();
        game.setPiece(0, 0, side);
        game.setPiece(1, 1, side);
        game.setPiece(7, 7, -5 * side);
        expect(game.isAttacked(0, 0, side)).toBe(false);

        game.clearBoard();
        game.setPiece(0, 0, side);
        game.setPiece(7, 0, 5 * side);
        expect(game.isAttacked(0, 0, side)).toBe(false);
    });
});

test('isAttacked validated for king', () => {
    [1, -1].forEach(side => {
        game.clearBoard();
        game.setPiece(0, 0, side);
        game.setPiece(1, 0, -6 * side);
        expect(game.isAttacked(0, 0, side)).toBe(true);

        game.clearBoard();
        game.setPiece(0, 0, side);
        game.setPiece(0, 1, -6 * side);
        expect(game.isAttacked(0, 0, side)).toBe(true);

        game.clearBoard();
        game.setPiece(0, 0, side);
        game.setPiece(1, 1, -6 * side);
        expect(game.isAttacked(0, 0, side)).toBe(true);

        game.clearBoard();
        game.setPiece(0, 0, side);
        game.setPiece(1, 1, 6 * side);
        expect(game.isAttacked(0, 0, side)).toBe(false);
    });
});
