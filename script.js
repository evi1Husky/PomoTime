// Self adjusting timer, using performance.now() to calculate time delta

class Timer {
  #tZero = null;
  #t1 = null;
  #t2 = null;
  #interval = null;
  #minutes = null;
  #seconds = null;
  completed = false;

  constructor(minutes, seconds) {
    this.#minutes = minutes;
    this.#seconds = seconds;
    this.#tZero  = minutes * 60 + seconds;
  }

  get minutes() {
    return this.#minutes;
  }

  get seconds() {
    return this.#seconds;
  }

  #timer() {
    this.#t2 = performance.now();
    const time = this.#tZero + ((this.#t1 - this.#t2) / 1000) << 0;
    this.#minutes = (time / 60) << 0;
    this.#seconds = time - ((time / 60) << 0) * 60;
    if ((this.#minutes === 0) && (this.#seconds === 0)) {
      this.stop(false);
    }
    Renderer.updateClockFace(this.#minutes, this.#seconds);
    Renderer.updateTimeBar(this.#tZero, false);
  }

  start() {
    Renderer.resetTimeBar();
    this.#interval = setInterval(() => this.#timer(), 980);
    this.#t1 = performance.now();
  }

  stop(buttonPressed) {
    clearInterval(this.#interval);
    this.completed = true;
    if (!buttonPressed) {
      Renderer.setTimeBarTo0();
    }
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

  static updateTimeBar(initialSeconds) {
    const decrement = 100 / initialSeconds;
    let containerWidth = getComputedStyle(this.#timeBarContainer).width;
    let timeBarWidth = getComputedStyle(this.#timeBar).width;
    timeBarWidth = timeBarWidth.replace(/[^\d.-]/g,"");
    containerWidth = containerWidth.replace(/[^\d.-]/g,"");
    const widthPercent = ((timeBarWidth / containerWidth) * 100) - decrement;
    this.#timeBar.style.width = `${widthPercent}%`;
  }

  static setTimeBarTo0() {
    this.#timeBar.style.width = "0%";
  }

  static resetTimeBar() {
    this.#timeBar.style.width = "100%";
  }

  static clockFaceColorBreak() {
    this.#clockFace.style.color = "rgb(157, 207, 83)";
  }

  static clockFaceColorWork() {
    this.#clockFace.style.color = "tomato";
    this.#timeBar.style.backgroundColor = "rgb(157, 207, 83)";
  }

  static clockFaceColorTimeOut() {
    this.#clockFace.style.color = "rgb(255, 42, 63)";
    this.#timeBar.style.backgroundColor = "rgb(255, 42, 63)";
  }

  static #startButton = document.querySelector(".start");
  static #continueButton = document.querySelector(".continue");

  static #addEventListener(button) {
    button.addEventListener("mouseover", () => {
      button.style.background = "tomato";
    });
    button.addEventListener("mouseleave", () => {
      button.style.background = "#9dcf53";
    });
  }

  static addButtonEffects() {
    this.#addEventListener(this.#startButton);
    this.#addEventListener(this.#continueButton);
  }
}

// Main class, contains game loop and logic 

class Pomodoro {
  #timer = Object;
  #startButton = document.querySelector(".start");
  #continueButton = document.querySelector(".continue");
  #workTime = [0, 5];
  #shortBreak = [0, 3];
  #longBreak = [0, 7];
  #breakTimeOut = [1, 10];
  #buttonPressed = false;

  loop() {
    Renderer.addButtonEffects();
    this.#continueButton.addEventListener("click", () => {
      this.#buttonPressed = true;
      this.#disableContinueButton();
      this.#startButton.disabled = false;
      setTimeout(() => {
        Renderer.clockFaceColorWork();
        Renderer.updateClockFace(...this.#workTime);
        this.#startButton.click();
      }, 3000);
    });
    Renderer.updateClockFace(...this.#workTime);
    Renderer.updateTabTitle("PomoTime");
    this.#buttonPressed = true;
    this.#startButton.addEventListener("click", () => {
      this.#disableStartButton();
      Renderer.clockFaceColorWork();
      Renderer.updateClockFace(...this.#workTime);
      this.#timer = new Timer(...this.#workTime);
      this.#timer.start();
      this.#waitForBreak();
    });
  }

  #checkIfTimerStopped() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(this.#timer.completed);
      }, 3000);
    });
  }

  async #waitForBreak() {
    const hasStopped = await this.#checkIfTimerStopped();
    if (!hasStopped) {
      this.#waitForBreak();
    } else {
      Renderer.updateClockFace(...this.#shortBreak);
      Renderer.clockFaceColorBreak();
      this.#timer = new Timer(...this.#shortBreak);
      this.#timer.start();
      this.#breakTime();
    }
  }

  async #breakTime() {
    const hasStopped = await this.#checkIfTimerStopped();
    if (!hasStopped) {
      await this.#breakTime();
    } else {
      Renderer.updateClockFace(...this.#breakTimeOut);
      this.#timer = new Timer(...this.#breakTimeOut);
      this.#timer.start();
      this.#buttonPressed = false;
      this.#enableContinueButton();
      this.#waitFromBreak();
    }
  }

  async #waitFromBreak() {
    const hasStopped = await this.#checkIfTimerStopped();
    if (this.#timer.minutes < 1) {
      Renderer.clockFaceColorTimeOut();
    }
    if (this.#buttonPressed) {
      this.#timer.stop(true);
      return;
    } else if (!hasStopped) {
      this.#waitFromBreak();
    } else {
      this.#disableContinueButton();
      return alert("game over");
    }
  }

  #disableStartButton() {
    this.#startButton.disabled = true;
    this.#startButton.style.background = "#424752";
  }

  #enableContinueButton() {
    this.#continueButton.disabled = false;
    this.#continueButton.style.background = "rgb(157, 207, 83)";
    this.#startButton.style.display = "none";
    this.#continueButton.style.display = "block";
  }

  #disableContinueButton() {
    this.#continueButton.disabled = true;
    this.#continueButton.style.background = "#424752";
  }
}

const pomodoro = new Pomodoro();
pomodoro.loop();
