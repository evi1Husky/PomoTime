class Renderer {
  static #tab = document.getElementById("tab");
  static #clockFace = document.getElementById("clock-face");
  static #timeBar = document.getElementById("time-bar");
  static #timeBarContainer = document.getElementById("time-bar-container");
  static #initialSeconds = undefined;
  static #startButton = document.querySelector(".start");

  static updateClockFace(message) {
    if (typeof message === "number"){
      Renderer.resetTimeBar();
      this.#initialSeconds = message;
    }
    if (Array.isArray(message)) {
      this.#formatClockOutput(message);
      this.#updateTimeBar(this.#initialSeconds);
    }
  }

  static #formatClockOutput([minutes, seconds]) {
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    this.#clockFace.textContent = `${minutes}:${seconds}`;
    this.#tab.textContent = `${minutes}:${seconds}`;
  }

  static #updateTimeBar(initialSeconds) {
    const decrement = 100 / initialSeconds;
    let containerWidth = getComputedStyle(this.#timeBarContainer).width;
    let timeBarWidth = getComputedStyle(this.#timeBar).width;
    timeBarWidth = timeBarWidth.replace(/[^\d.-]/g,"");
    containerWidth = containerWidth.replace(/[^\d.-]/g,"");
    const widthPercent = ((timeBarWidth / containerWidth) * 100) - decrement;
    if (widthPercent < 0) {
      this.#timeBar.style.width = "0%";
    } else {
      this.#timeBar.style.width = `${widthPercent}%`;
    }
  }

  static resetTimeBar() {
    this.#timeBar.style.width = "100%";
  }

  static disableStartButton() {
    this.#startButton.disabled = true;
    this.#startButton.style.background = "#424752";
  }

  static enableStartButton() {
    this.#startButton.disabled = false;
    this.#startButton.style.background = "rgb(157, 207, 83)";
    this.#startButton.textContent = "➜";
    this.#startButton.style.fontSize = "2.5rem";
  }
}

class Pomodoro {
  #startButton = document.querySelector(".start");
  #timerWorker = new Worker("timerWorker.js");
  #round = 1;
  #timerStage = 1;
  #setTimeOut = 0;
  #timers = {
    1: [0, 3],
    2: [0, 2],
    3: [0, 15],
  };

  loop() {
    Renderer.updateClockFace(this.#timers[this.#timerStage]);
    this.#startButton.addEventListener("click", () => {
      pomodoro.#timerStage = 1;
      Renderer.disableStartButton();
      if (this.#round > 1) {
        this.#timerWorker.terminate();
        this.#timerWorker = null;
        this.#timerWorker = new Worker("timerWorker.js");
        this.#setTimeOut = 1500;
      }
      setTimeout(() => {
        this.#timerWorker.onmessage = function handler(event){
          if (event.data === "stopped"){
            pomodoro.#timerStage++;
            pomodoro.#round++;
            if (pomodoro.#timerStage === 3) {
              Renderer.enableStartButton();
            }
            pomodoro.#timerWorker.postMessage(pomodoro.#timers[pomodoro.#timerStage]);
          } else {
            Renderer.updateClockFace(event.data);
          }
        };
        this.#timerWorker.postMessage(this.#timers[this.#timerStage]);
      }, this.#setTimeOut);
    });
  }
}

let pomodoro = new Pomodoro();
pomodoro.loop();




