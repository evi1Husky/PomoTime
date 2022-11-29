"use strict";

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

  get output() {
    return [this.#minutes, this.#seconds];
  }

  get initialTimeSeconds() {
    return this.#tZero;
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
    postMessage(this.output);
  }

  start() {
    postMessage(this.initialTimeSeconds);
    this.#t1 = performance.now();
    this.#interval = setInterval(() => this.#timer(), 990);
  }

  stop() {
    clearInterval(this.#interval);
    postMessage("stopped");
  }
}

self.onmessage = function(event){
  const timer = new Timer(...event.data);
  self.postMessage([...event.data]);
  timer.start();
};
