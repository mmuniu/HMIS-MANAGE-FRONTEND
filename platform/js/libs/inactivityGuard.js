/**
 * Created by PhpStorm.
 * User: Lexx YungCarter
 */
let timeoutID;

function setup() {
    this.addEventListener('mousemove', resetTimer, false);
    this.addEventListener('mousedown', resetTimer, false);
    this.addEventListener('keypress', resetTimer, false);
    this.addEventListener('DOMMouseScroll', resetTimer, false);
    this.addEventListener('mousewheel', resetTimer, false);
    this.addEventListener('touchmove', resetTimer, false);
    this.addEventListener('MSPointerMove', resetTimer, false);

    startTimer();
}

// start setup
setup();

function startTimer() {
    console.log('process.env.MIX_APP_LOCK_SESSION_MINUTES', process.env.MIX_APP_LOCK_SESSION_MINUTES);
    timeoutID = window.setTimeout(goInactive, 60000 * process.env.MIX_APP_LOCK_SESSION_MINUTES); // 60s(1 min) * 20 min
}

function resetTimer(e) {
    window.clearTimeout(timeoutID);

    goActive();
}

function goInactive() {
    // window.events.$emit('APP_LOGOUT');
    // window.location.reload(true);
}

function goActive() {
    startTimer();
}
