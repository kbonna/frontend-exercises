const { Game } = require('./chess');

const game = new Game();

// getPawnMoves
test('pawn move from first line (white)', () => {
    game.clearBoard();
    game.board[1][0] = 1;
    expect(game.getPawnMoves(1, 0).sort()).toEqual([[3, 0], [2, 0]].sort());
});

test('pawn move from first line (black)', () => {
    game.clearBoard();
    game.board[6][1] = -1;
    expect(game.getPawnMoves(6, 1).sort()).toEqual([[5, 1], [4, 1]].sort());
});

test('pawn blocked by ally)', () => {
    game.clearBoard();
    game.board[2][6] = 1;
    game.board[3][6] = 1;
    expect(game.getPawnMoves(2, 6)).toEqual([]);
});

test('pawn with attack possibility near board edge', () => {
    game.clearBoard();
    game.board[5][7] = -1;
    game.board[4][6] = 1;
    expect(game.getPawnMoves(5, 7).sort()).toEqual([[4, 6], [4, 7]].sort());
});


