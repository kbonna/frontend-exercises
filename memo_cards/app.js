const nextCardElement = document.getElementById('next-card');
const prevCardElement = document.getElementById('prev-card');
const addCardElement = document.getElementById('add-card');
const delCardsElement = document.getElementById('delete-cards');

const modalElement = document.querySelector('.modal');
const addCardModalElement = document.getElementById('add-card-modal');
const closeModalElement = document.getElementById('close-modal');
const questionElement = document.getElementById('modal__question');
const answerElement = document.getElementById('modal__answer');

const cardsHolder = document.querySelector('.cards');
const cardsCounter = document.querySelector('.current__number');

let flipped = false;

/******************
 * Button actions *
 ******************/

function addCard() {
    contentFront = questionElement.value;
    contentBack = answerElement.value;
    if (!getNumberOfCards()) {
        createCard(contentFront, contentBack);
    } else {
        createCard(contentFront, contentBack, 'card--invisible-right');
    }
    modalElement.classList.add('modal--hidden');
    resetModal();
}

function nextCard() {
    const cards = Array.from(cardsHolder.children);

    currentIdx = cards.findIndex(card =>
        card.classList.contains('card--visible')
    );

    if (currentIdx == cards.length - 1) {
        return;
    }
    flipDefaultCard();

    cards[currentIdx].classList.remove('card--visible');
    cards[currentIdx].classList.add('card--invisible-left');
    cards[currentIdx + 1].classList.remove('card--invisible-right');
    cards[currentIdx + 1].classList.add('card--visible');

    setNumberOfCards();
    saveToStorage(cardsHolder, cardsCounter);
}

function prevCard() {
    const cards = Array.from(cardsHolder.children);

    currentIdx = cards.findIndex(card =>
        card.classList.contains('card--visible')
    );

    if (currentIdx == 0) {
        return;
    }
    flipDefaultCard();

    cards[currentIdx].classList.remove('card--visible');
    cards[currentIdx].classList.add('card--invisible-right');
    cards[currentIdx - 1].classList.remove('card--invisible-left');
    cards[currentIdx - 1].classList.add('card--visible');

    setNumberOfCards();
    saveToStorage(cardsHolder, cardsCounter);
}

function delCards() {
    cardsHolder.innerHTML = '';
    cardsCounter.innerHTML = '/';
    localStorage.clear();
}

function flipCard() {
    if (!getNumberOfCards()) {
        return;
    }
    if (!flipped) {
        getCurrentCard().children[0].classList.add('card__inner--flipped');
        flipped = true;
    } else {
        getCurrentCard().children[0].classList.remove('card__inner--flipped');
        flipped = false;
    }
}

function flipDefaultCard() {
    getCurrentCard().children[0].classList.remove('card__inner--flipped');
    flipped = false;
}

function openModal() {
    modalElement.classList.remove('modal--hidden');
}

function closeModal() {
    modalElement.classList.add('modal--hidden');
    resetModal();
}

/********************
 * Helper functions *
 *******************/

function createCard(contentFront, contentBack, cls = 'card--visible') {
    const newHTML = `<div class="card ${cls}">
        <div class="card__inner">
            <div class="card__front">
                <p>${contentFront}</p>
                <div class="card__hint">
                    <i class="material-icons md-18 mr-3">refresh</i>
                    <span>Flip</span>
                </div>
            </div>
            <div class="card__back">
                <p>${contentBack}</p>
                <div class="card__hint">
                    <i class="material-icons md-18 mr-3">refresh</i>
                    <span>Flip</span>
                </div>
            </div>
        </div>
    </div>`;

    cardsHolder.insertAdjacentHTML('beforeend', newHTML);

    setNumberOfCards();
    saveToStorage(cardsHolder, cardsCounter);
}

function setNumberOfCards() {
    cardsCounter.textContent = `${getCurrentIndex() + 1}/${getNumberOfCards()}`;
}

function getCurrentIndex() {
    return Array.from(cardsHolder.children).findIndex(card =>
        card.classList.contains('card--visible')
    );
}

function getCurrentCard() {
    return Array.from(cardsHolder.children)[getCurrentIndex()];
}

function getNumberOfCards() {
    return Array.from(cardsHolder.children).length;
}

function saveToStorage(cardsHolder, numberOfCards) {
    localStorage.setItem('cardsHolderInnerHTML', cardsHolder.innerHTML);
    localStorage.setItem('numberOfCardsInnerHTML', numberOfCards.innerHTML);
}

function loadFromStorage() {
    cardsHolder.innerHTML = localStorage.getItem('cardsHolderInnerHTML');
    cardsCounter.innerHTML = localStorage.getItem('numberOfCardsInnerHTML');
}

function resetModal() {
    questionElement.value = null;
    answerElement.value = null;
}

loadFromStorage();
cardsHolder.addEventListener('click', flipCard);
nextCardElement.addEventListener('click', nextCard);
prevCardElement.addEventListener('click', prevCard);
addCardElement.addEventListener('click', openModal);
delCardsElement.addEventListener('click', delCards);
addCardModalElement.addEventListener('click', addCard);
closeModalElement.addEventListener('click', closeModal);
