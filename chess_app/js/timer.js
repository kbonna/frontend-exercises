class Timer {
    constructor(game, ui, clockWhite, clockBlack) {
        this.game = game;
        this.ui = ui;
        this.clockWhite = clockWhite;
        this.clockBlack = clockBlack;

        this.tElapsedWhite;
        this.tElapsedBlack;
        this.initTime;
        this.maxTime;
        this.paused = true;
        this.resetTimer();
    }

    resetTimer() {
        this.tElapsedWhite = 0;
        this.tElapsedBlack = 0;
        this.initTime = Date.now();
        this.paused = true;
    }

    togglePause() {
        if (this.paused) {
            this.initTime = Date.now();
            this.paused = false;
            this.tickTimer();
        } else {
            this.cacheTime();
            this.paused = true;
        }
    }

    cacheTime() {
        if (this.game.whoseTurn === 1) {
            this.tElapsedWhite += Date.now() - this.initTime;
        } else if (this.game.whoseTurn === -1) {
            this.tElapsedBlack += Date.now() - this.initTime;
        }
        this.initTime = Date.now();
    }

    /**
     * Converts number of seconds into printable timer format (mm.ss). Assumes
     * integer input.
     *
     * @param {number} t
     */
    static getPrintableTime(t) {
        let minutes = Math.floor(t / 60);
        let seconds = t - minutes * 60;
        return `${minutes
            .toString()
            .padStart(2, '0')}.${seconds.toString().padStart(2, '0')}`;
    }

    tickTimer() {
        let tElapsed;
        let tLeft;

        if (!this.paused) {
            if (this.game.whoseTurn === 1) {
                tElapsed =
                    (Date.now() - this.initTime + this.tElapsedWhite) / 1000;
                tLeft = Math.round(this.maxTime - tElapsed);
                this.clockWhite.innerHTML = Timer.getPrintableTime(tLeft);
                this.clockBlack.innerHTML = Timer.getPrintableTime(
                    Math.round(this.maxTime - this.tElapsedBlack / 1000)
                );
            } else {
                tElapsed =
                    (Date.now() - this.initTime + this.tElapsedBlack) / 1000;
                tLeft = Math.round(this.maxTime - tElapsed);
                this.clockBlack.innerHTML = Timer.getPrintableTime(tLeft);
                this.clockWhite.innerHTML = Timer.getPrintableTime(
                    Math.round(this.maxTime - this.tElapsedWhite / 1000)
                );
            }
            if (tElapsed > this.maxTime) {
                this.cacheTime();
                this.handleTimeExceeded();
            } else {
                setTimeout(() => {
                    this.tickTimer();
                }, 500);
            }
        }
    }

    handleTimeExceeded() {
        let endGameMsg;
        if (this.game.whoseTurn === -1) {
            endGameMsg = 'Time over! White won!';
            this.clockBlack.innerHTML = '00:00';
        } else {
            endGameMsg = 'Time over! Black won!';
            this.clockWhite.innerHTML = '00:00';
        }
        this.togglePause();
        this.game.toggleBlockGame();
        this.ui.toggleEnabled = false;
        window.alert(endGameMsg);
    }
}
