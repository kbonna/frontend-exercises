const padKeys = document.querySelectorAll('.pad__key');

getPadKey = keyCode =>
    Array.from(padKeys).filter(
        padKey => padKey.dataset.key == String(keyCode)
    )[0];

function disableLooping(padKey, audio) {
    padKey.isLooping = false;
    padKey.classList.remove('pad__key--looping');
    clearInterval(audio.interval);
}

function enableLooping(padKey, audio) {
    padKey.isLooping = true;
    padKey.classList.add('pad__key--looping');
    audio.play();
    audio.interval = setInterval(() => {
        audio.play();
    }, 0);
}

function normalPlay(padKey, audio) {
    padKey.classList.add('pad__key--playing');
    padKey.timeout = setTimeout(() => {
        padKey.classList.remove('pad__key--playing');
    }, audio.duration * 1000);
    audio.currentTime = 0;
    audio.play();
}

function stopPlay(padKey, audio) {
    padKey.classList.remove('pad__key--playing');
    audio.pause();
    audio.currentTime = 0;
}

window.addEventListener('keydown', e => {
    const audio = document.querySelector(`audio[data-key="${e.keyCode}"]`);

    if (audio) {
        const padKey = getPadKey(e.keyCode);

        if (padKey.isLooping || (!audio.ended && e.ctrlKey)) {
            // stop playing if key is looping
            // stop playing if Ctrl+ is used and audio did not end yet
            stopPlay(padKey, audio);
            disableLooping(padKey, audio);
        } else if (!padKey.isLooping && e.shiftKey) {
            stopPlay(padKey, audio);
            enableLooping(padKey, audio);
        } else {
            normalPlay(padKey, audio);
        }
    } else {
        return;
    }
});
