const root = document.documentElement;
const inputElements = document.querySelectorAll('input');
const selectElements = document.querySelectorAll('select');

inputElements.forEach(input => {
    input.addEventListener('input', update);
});

selectElements.forEach(select => {
    select.addEventListener('change', update);
});

function update(e) {
    root.style.setProperty(`--${e.target.name}`, e.target.value);
}
