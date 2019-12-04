const openModalBtn = document.querySelector('.button');
const closeModalBtn = document.querySelector('.modal__exit');
const modal = document.querySelector('.modal');

function hideModal() {
    modal.style.display = 'none';
} 

function showModal() {
    modal.style.display = 'block';
}

openModalBtn.addEventListener('click', e => {
    showModal();
});

closeModalBtn.addEventListener('click', e => {
    hideModal();
});

modal.addEventListener('click', e => {
    if (e.target.className === 'modal') {
        hideModal();
    };
});