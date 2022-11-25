class Timer {
  #minutes = null;
  #seconds = null;
  #tZero = null;
  #t1 = null;
  #t2 = null;
  #interval = null;

  constructor(minutes, seconds) {
    this.#minutes = minutes;
    this.#seconds = seconds;
    this.#tZero  = minutes * 60 + seconds;
  }

  #timer() {
    this.#t2 = performance.now();
    const time = this.#tZero + ((this.#t1 - this.#t2) / 1000) << 0;
    this.#minutes = (time / 60) << 0;
    this.#seconds = time - ((time / 60) << 0) * 60;
    if ((this.#minutes < 0) || (this.#seconds < 0)) {
      this.#minutes = 0;
      this.#seconds = 0;
      this.stop();
    }
    this.#output(this.#minutes, this.#seconds);
  }

  start() {
    postMessage(this.#tZero);
    this.#t1 = performance.now();
    this.#interval = setInterval(() => this.#timer(), 990);
  }

  stop() {
    clearInterval(this.#interval);
  }

  #output(minutes, seconds) {
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    postMessage(`${minutes}:${seconds}`);
  }
}

let timer = new Timer(24, 57);
timer.start();
