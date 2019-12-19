const Game = require('./game.js');

beforeAll(() => {
    return (game = new Game());
});

afterEach(() => {
    game.resetGame();
    game.toggleBlockGame();
});

// containsSubarray array method

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

// isSameAs array method

test('isSameAs producing correct output', () => {
    const myArr = [
        [0, 1],
        [2, 3],
        [4, 5]
    ];
    const sameArray = [...myArr];
    const reversedArray = [...myArr.reverse()];
    const biggerArray = [...myArr, [6, 7]];
    const smallerArray = [...myArr.slice(1)];
    expect(myArr.isSameAs(sameArray)).toBe(true);
    expect(myArr.isSameAs(reversedArray)).toBe(true);
    expect(myArr.isSameAs(biggerArray)).toBe(false);
    expect(myArr.isSameAs(smallerArray)).toBe(false);
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
    game.resetGame();
    expect(game.isBlocked).toBe(true);
    game.toggleBlockGame();
    expect(game.isBlocked).toBe(false);
});

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

// getPawnMoves

test('getPawnMoves validated', () => {
    // move from the first line
    game.clearBoard();
    game.setPiece(1, 0, 1);
    expect(
        game.getPawnMoves(1, 0).isSameAs([
            [2, 0],
            [3, 0]
        ])
    ).toBe(true);

    game.clearBoard();
    game.setPiece(6, 0, -1);
    expect(
        game.getPawnMoves(6, 0).isSameAs([
            [5, 0],
            [4, 0]
        ])
    ).toBe(true);

    // regular move
    game.clearBoard();
    game.setPiece(2, 0, 1);
    expect(game.getPawnMoves(2, 0).isSameAs([[3, 0]])).toBe(true);

    game.clearBoard();
    game.setPiece(5, 0, -1);
    expect(game.getPawnMoves(5, 0).isSameAs([[4, 0]])).toBe(true);

    // enpassant kill
    game.clearBoard();
    game.setPiece(4, 0, 1);
    game.setEnpassant([5, 1]);
    expect(
        game.getPawnMoves(4, 0).isSameAs([
            [5, 0],
            [5, 1]
        ])
    ).toBe(true);

    game.clearBoard();
    game.setPiece(3, 0, -1);
    game.setEnpassant([2, 1]);
    expect(
        game.getPawnMoves(3, 0).isSameAs([
            [2, 0],
            [2, 1]
        ])
    ).toBe(true);
});

// getBishopMoves

test('getBishopMoves validated', () => {
    [1, -1].forEach(side => {
        game.clearBoard();
        game.setPiece(1, 1, 2 * side);
        game.setPiece(3, 3, -side);
        expect(
            game.getBishopMoves(1, 1).isSameAs([
                [0, 0],
                [0, 2],
                [2, 0],
                [2, 2],
                [3, 3]
            ])
        ).toBe(true);
    });
});

// getKnightMoves

test('getKnightMoves validated', () => {
    [1, -1].forEach(side => {
        game.clearBoard();
        game.setPiece(3, 3, 3 * side);
        game.setPiece(4, 5, side);
        game.setPiece(5, 4, -side);
        expect(
            game.getKnightMoves(3, 3).isSameAs([
                [5, 4],
                [5, 2],
                [4, 1],
                [1, 2],
                [2, 1],
                [2, 5],
                [1, 4]
            ])
        ).toBe(true);
    });
});

// getRockMoves

test('getRockMoves validated', () => {
    [1, -1].forEach(side => {
        game.clearBoard();
        game.setPiece(1, 1, 4 * side);
        game.setPiece(1, 3, side);
        game.setPiece(3, 1, -side);
        expect(
            game.getRockMoves(1, 1).isSameAs([
                [1, 0],
                [0, 1],
                [2, 1],
                [1, 2],
                [3, 1]
            ])
        ).toBe(true);
    });
});

// getQueenMoves

test('getQueenMoves validated', () => {
    [1, -1].forEach(side => {
        game.clearBoard();
        game.setPiece(1, 1, 5 * side);
        game.setPiece(3, 0, side);
        game.setPiece(3, 1, side);
        game.setPiece(3, 2, side);
        game.setPiece(3, 3, side);
        game.setPiece(2, 3, -side);
        game.setPiece(1, 3, -side);
        game.setPiece(0, 3, -side);
        expect(
            game.getQueenMoves(1, 1).isSameAs([
                [0, 0],
                [0, 1],
                [0, 2],
                [1, 0],
                [1, 2],
                [1, 3],
                [2, 0],
                [2, 1],
                [2, 2]
            ])
        ).toBe(true);
    });
});

// getKingMoves

test('getKingMoves validated', () => {
    [1, -1].forEach(side => {
        game.clearBoard();
        game.disableCastling();
        game.setPiece(1, 1, 6 * side);
        game.setPiece(2, 2, side);
        game.setPiece(2, 1, -side);
        expect(
            game.getKingMoves(1, 1).isSameAs([
                [0, 0],
                [0, 1],
                [0, 2],
                [1, 0],
                [1, 2],
                [2, 0],
                [2, 1]
            ])
        ).toBe(true);
    });
});

// getEnpassantMoves

test('getEnpassantMoves in normal situation', () => {
    game.clearBoard();
    game.setEnpassant([5, 4]);
    game.setPiece(4, 4, -1);
    game.setPiece(4, 5, 1);
    expect(game.getEnpassantMoves(4, 5).isSameAs([[5, 4]])).toBe(true);
});

test('getEnpassantMoves after enpassant move leading to check', () => {
    game.clearBoard();
    game.setEnpassant([5, 4]);
    game.setPiece(4, 4, -1);
    game.setPiece(4, 5, 1);
    game.setPiece(4, 0, 6);
    game.kingPosition[1] = [4, 0];
    game.setPiece(4, 7, -4);
    expect(game.getEnpassantMoves(4, 5).isSameAs([])).toBe(true);
});

// getCastleMoves

test('getCastleMoves in normal situation', () => {
    game.clearBoard();
    game.setPiece(0, 4, 6);
    game.setPiece(0, 0, 4);
    game.setPiece(0, 7, 4);
    expect(
        game.getCastleMoves(0, 4).isSameAs([
            [0, 2],
            [0, 6]
        ])
    ).toBe(true);

    game.clearBoard();
    game.setPiece(7, 4, -6);
    game.setPiece(7, 0, -4);
    game.setPiece(7, 7, -4);
    expect(
        game.getCastleMoves(7, 4).isSameAs([
            [7, 2],
            [7, 6]
        ])
    ).toBe(true);
});

test('getCastleMoves when castling fields are attacked', () => {
    game.clearBoard();
    game.setPiece(0, 4, 6);
    game.setPiece(0, 0, 4);
    game.setPiece(0, 7, 4);
    game.setPiece(7, 3, -4);
    game.setPiece(7, 5, -4);
    expect(game.getCastleMoves(0, 4).isSameAs([])).toBe(true);
});

test('getCastleMoves when castling fields are occupied', () => {
    game.clearBoard();
    game.setPiece(0, 4, 6);
    game.setPiece(0, 0, 4);
    game.setPiece(0, 7, 4);
    game.setPiece(0, 3, 3);
    game.setPiece(0, 5, 3);
    expect(game.getCastleMoves(0, 4).isSameAs([])).toBe(true);
});

test('getCastleMoves when king is checked', () => {
    game.clearBoard();
    game.setPiece(7, 4, -6);
    game.setPiece(7, 0, -4);
    game.setPiece(7, 7, -4);
    game.setPiece(0, 4, 4);
    expect(game.getCastleMoves(7, 4).isSameAs([])).toBe(true);
});
