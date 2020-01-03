function divideIntoSpans(headerTagElement, className) {
    const text = headerTagElement.innerText;
    let newText = '';

    text.split('').forEach(e => {
        newText += `<span class="${className}">${e}</span>`;
    });
    headerTagElement.innerHTML = newText;
    return document.getElementsByClassName(className);
}

function addTitleClass(className) {
    titleArr[i].classList.add(className);
    i++;
    if (i === titleArr.length) {
        clearInterval(intervalTitle);
    }
}

function addSubtitleClass(className) {
    subtitleArr[j].classList.add(className);
    j++;
    if (j === subtitleArr.length) {
        clearInterval(intervalSubtitle);
    }
}

// Divide headers into spans
const title = document.querySelector('.title');
const subtitle = document.querySelector('.subtitle');

const titleArr = divideIntoSpans(title, 'title__span');
const subtitleArr = divideIntoSpans(subtitle, 'subtitle__span');

// Add title animation
let i = 0;
let j = 0;

const intervalTitle = setInterval(addTitleClass, 200, 'title__span--visible');
const intervalSubtitle = setInterval(
    addSubtitleClass,
    100,
    'subtitle__span--visible'
);
