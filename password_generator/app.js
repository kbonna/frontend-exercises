class PasswordGenerator {
    constructor(
        length = 6,
        useUppercase = false,
        useNumbers = false,
        useSymbols = false
    ) {
        this._length = length;
        this._useUppercase = useUppercase;
        this._useNumbers = useNumbers;
        this._useSymbols = useSymbols;

        this._letters = 'abcdefghijklmnopqrstuvwxyz';
        this._uppercase = this._letters.toUpperCase();
        this._numbers = '0123456789';
        this._symbols = '"!#$%&\'()*+,-./:;<=>?@[]^_`{|}~';
    }

    get length() {
        return this._length;
    }

    set length(value) {
        if (typeof value !== 'number') {
            throw new TypeError('length should be number');
        }
        this._length = value;
    }

    set useUppercase(value) {
        if (typeof value !== 'boolean') {
            throw new TypeError('useUppercase should be boolean');
        }
        this._useUppercase = value;
    }

    set useNumbers(value) {
        if (typeof value !== 'boolean') {
            throw new TypeError('useNumbers should be boolean');
        }
        this._useNumbers = value;
    }

    set useSymbols(value) {
        if (typeof value !== 'boolean') {
            throw new TypeError('useSymbols should be boolean');
        }
        this._useSymbols = value;
    }

    get flags() {
        let _flags = 'l';
        if (this._useUppercase) {
            _flags += 'u';
        }
        if (this._useNumbers) {
            _flags += 'n';
        }
        if (this._useSymbols) {
            _flags += 's';
        }
        return _flags;
    }

    getChar() {
        switch (this.getRandom(this.flags)) {
            case 'l':
                return this.getRandom(this._letters);
            case 'u':
                return this.getRandom(this._uppercase);
            case 'n':
                return this.getRandom(this._numbers);
            case 's':
                return this.getRandom(this._symbols);
        }
    }

    getPassword() {
        let password = '';
        for (let i = 0; i < this._length; i++) {
            password += this.getChar();
        }
        return password;
    }

    getRandom = str => str[Math.floor(Math.random() * str.length)];
}

pg = new PasswordGenerator();

// Get DOM elements
passwordField = document.getElementsByClassName('password-field')[0];
flagLength = document.getElementById('flag__length');
dispLenght = document.getElementById('flag__length-disp');
flagUppercase = document.getElementById('flag__uppercase');
flagNumbers = document.getElementById('flag__numbers');
flagSymbols = document.getElementById('flag__symbols');
btn = document.getElementById('generate');

// Event listeners
flagLength.oninput = function() {
    dispLenght.innerHTML = this.value;
};

btn.addEventListener('click', e => {
    pg.length = Number(flagLength.value);
    pg.useUppercase = flagUppercase.checked;
    pg.useNumbers = flagNumbers.checked;
    pg.useSymbols = flagSymbols.checked;

    passwordField.innerHTML = pg.getPassword();
});

// Set default values
dispLenght.innerHTML = pg.length;
flagLength.value = pg.length;
