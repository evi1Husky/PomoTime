// Self adjusting timer, using performance.now() to calculate time delta

class Timer {
  #previousSeconds = Math.floor(performance.now() / 1000);
  #currentSeconds = Math.floor(performance.now() / 1000);
  #interval = Object;
  #minutes = 0;
  #seconds = 0;
  #initialSeconds = 0;

  constructor(minutes, seconds) {
    this.#minutes = minutes;
    this.#seconds = seconds;
    this.#initialSeconds = minutes * 60 + seconds;
  }

  #timer() {
    this.#previousSeconds = Math.floor(performance.now() / 1000);
    if (this.#currentSeconds != this.#previousSeconds) {
      this.#seconds += this.#currentSeconds - this.#previousSeconds;
      if ((this.#seconds < 0) && (this.#minutes >= 0)) {
        this.#seconds = 59;
        this.#minutes--;
      } else if ((this.#minutes === 0) && (this.#seconds === 0)) {
        this.stop();
      }
      Renderer.updateClockFace(this.#minutes, this.#seconds);
      Renderer.updateTimeBar(this.#initialSeconds, false);
    }
    this.#currentSeconds = this.#previousSeconds;
  }

  start() {
    this.#timer();
    this.#interval = setInterval(() => this.#timer(), 350);
  }

  stop() {
    clearInterval(this.#interval);
    Renderer.updateClockFace(this.#minutes, this.#seconds);
    Renderer.updateTimeBar(this.#initialSeconds, true);
  }
}

// Renderer class for updating user interface and creating animations

class Renderer {
  static #tab = document.getElementById("tab");
  static #clockFace = document.getElementById("clock-face");

  static updateClockFace(minutes, seconds) {
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    this.#clockFace.textContent = `${minutes}:${seconds}`;
    this.#tab.textContent = `${minutes}:${seconds}`;
  }

  static updateTabTitle(message) {
    this.#tab.textContent = message;
  }

  static #timeBar = document.getElementById("time-bar");
  static #timeBarContainer = document.getElementById("time-bar-container");

  static updateTimeBar(initialSeconds, timerStopped) {
    const decrement = 100 / initialSeconds;
    let containerWidth = getComputedStyle(this.#timeBarContainer).width;
    let timeBarWidth = getComputedStyle(this.#timeBar).width;
    timeBarWidth = timeBarWidth.replace(/[^\d.-]/g,"");
    containerWidth = containerWidth.replace(/[^\d.-]/g,"");
    let widthPercent = timeBarWidth / containerWidth;
    widthPercent *= 100;
    widthPercent -= decrement;
    this.#timeBar.style.width = widthPercent + "%";
    if (timerStopped) {
      this.#timeBar.style.width = "0%";
    }
  }
}

// Main class, contains game loop and logic 

class Pomodoro {
  #timer = Object;
  #startButton = document.querySelector(".start");
  #workTime = [25, 0];

  loop() {
    Renderer.updateClockFace(...this.#workTime);
    Renderer.updateTabTitle("PomoTime");
    this.#startButtonEvent();
  }

  #startButtonEvent() {
    this.#startButton.addEventListener("click", () => {
      this.#startButton.disabled = true;
      this.#startButton.style.background = "#424752";
      this.#timer = new Timer(...this.#workTime);
      this.#timer.start();
    });
  }
}

const pomodoro = new Pomodoro();
pomodoro.loop();
