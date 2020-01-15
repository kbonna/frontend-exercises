// Grab DOM elements
const digits = document.querySelectorAll('.clock__digit');
const shield = document.querySelector('.clock__shield');
const secondHand = document.querySelector('.clock__second-hand');
const minuteHand = document.querySelector('.clock__minute-hand');
const hourHand = document.querySelector('.clock__hour-hand');

const RADIUS = 150;
console.log(RADIUS);

deg_to_rad = angle => (angle / 180) * Math.PI;

Math.sin();

digits.forEach((digit, id) => {
    const phi = deg_to_rad(id + 1) * 30;
    const x = 0.875 * RADIUS * Math.sin(phi);
    const y = 0.875 * RADIUS * Math.cos(phi);

    digit.style.top = `${RADIUS - y}px`;
    digit.style.right = `${RADIUS - x}px`;
    digit.style.transform = `translate(50%, -50%) rotate(${phi}rad)`;
});

function set_clock() {
    const now = new Date();

    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    secondHand.style.transform = `rotate(${(seconds / 60) * 360}deg)`;
    minuteHand.style.transform = `rotate(${(minutes / 60) * 360}deg)`;
    hourHand.style.transform = `rotate(${(hours / 12) * 360}deg)`;

    setTimeout(set_clock, 1000);
}

set_clock();
