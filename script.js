class Renderer {
  static #tab = document.getElementById("tab");
  static #clockFace = document.getElementById("clock-face");
  static #timeBar = document.getElementById("time-bar");
  static #timeBarContainer = document.getElementById("time-bar-container");
  static #initialSeconds = undefined;
  static #startButton = document.querySelector(".start");

  static updateClockFace(message) {
    if (typeof message === "number"){
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
  workTime = [0, 7];
  shortBreak = [0, 3];
  longBreak = [0, 15];
  breakTimeOut = [1, 10];
  #startButton = document.querySelector(".start");

  loop() {
    Renderer.updateClockFace(this.workTime);
    this.#startButton.addEventListener("click", () => {
      Renderer.disableStartButton();
      Renderer.updateClockFace(this.workTime);
      Renderer.resetTimeBar();
      let timerWorker = new Worker("timerWorker.js");
      timerWorker.onmessage = function(event){
        if (event.data === "completed"){
          setTimeout(() => {
            Renderer.enableStartButton();
            Renderer.updateClockFace(pomodoro.workTime);
            Renderer.resetTimeBar();
          }, 100);
        } else {
          Renderer.updateClockFace(event.data);
        }
      };
      timerWorker.postMessage(this.workTime);
    });
  }
}

let pomodoro = new Pomodoro();
pomodoro.loop();










