const slider = document.querySelector('.slider')
const slides = Array.from(document.querySelectorAll('.slider__item'))

const buttonPrev = document.querySelector('.slider__button--prev')
const buttonNext = document.querySelector('.slider__button--next')
const buttonDots = Array.from(document.querySelectorAll('.slider__dot'))

let currentSlide = 0

function distributeSlides() {

    currentWidth = slider.getBoundingClientRect().width

    for (i = 0; i < slides.length; i++) {
        slides[i].style.left = (i - currentSlide) * currentWidth + 'px'
        slides[i].style.right = -(i - currentSlide) * currentWidth + 'px'
    }

    if (currentSlide === 0) {buttonPrev.style.visibility = 'hidden'}
    else {buttonPrev.style.visibility = ''}

    if (currentSlide === slides.length - 1) {buttonNext.style.visibility = 'hidden'}
    else {buttonNext.style.visibility = ''}

    buttonDots.forEach((button) => {
        button.classList.remove('slider__dot--current')
    })

    buttonDots[currentSlide].classList.add('slider__dot--current')

}

distributeSlides()

// Event listeners

window.addEventListener('resize', distributeSlides)

buttonPrev.addEventListener('click', (e) => {
    currentSlide -= 1
    distributeSlides()
})

buttonNext.addEventListener('click', (e) => {
    currentSlide += 1
    distributeSlides()
})

for (let idx = 0; idx < buttonDots.length; idx++) {
    buttonDots[idx].addEventListener('click', (e) => {
        currentSlide = idx
        distributeSlides()
    })
}

