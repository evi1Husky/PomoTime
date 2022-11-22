// Self adjusting timer, using performance.now() to calculate time delta

class Timer {
  #previousSeconds = Math.floor(performance.now() / 1000);
  #currentSeconds = Math.floor(performance.now() / 1000);
  #interval = Object;
  #minutes = 0;
  #seconds = 0;
  #initialSeconds = 0;
  completed = false;

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
    this.#interval = setInterval(() => this.#timer(), 450);

  }

  stop() {
    clearInterval(this.#interval);
    Renderer.updateClockFace(this.#minutes, this.#seconds);
    Renderer.updateTimeBar(this.#initialSeconds, true);
    this.completed = true;
  }

  stopButton() {
    clearInterval(this.#interval);
    Renderer.updateClockFace(this.#minutes, this.#seconds);
    this.completed = true;
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

  static resetTimeBar() {
    this.#timeBar.style.width = "100%";
  }

  static clockFaceColorBreak() {
    this.#clockFace.style.color = "rgb(157, 207, 83)";
  }

  static clockFaceColorWork() {
    this.#clockFace.style.color = "tomato";
  }
}

// Main class, contains game loop and logic 

class Pomodoro {
  #timer = Object;
  #startButton = document.querySelector(".start");
  #continueButton = document.querySelector(".continue");
  #workTime = [0, 2];
  #shortBreak = [0, 2];
  #breakTimeOut = [0, 10];
  #buttonPressed = false;

  loop() {
    this.#continueButton.addEventListener("click", () => {
      this.#buttonPressed = true;
      this.#continueButton.disabled = true;
      this.#continueButton.style.background = "#424752";
      setTimeout(() => {
        this.#enableStartButton();
        Renderer.resetTimeBar();
        Renderer.clockFaceColorWork();
        Renderer.updateClockFace(...this.#workTime);
      }, 3000);
    });
    Renderer.updateClockFace(...this.#workTime);
    Renderer.updateTabTitle("PomoTime");
    this.#buttonPressed = true;
    this.#startButton.addEventListener("click", () => {
      this.#disableStartButton();
      Renderer.resetTimeBar();
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
      }, 2000);
    });
  }
  
  async #waitForBreak() {
    const hasStopped = await this.#checkIfTimerStopped();
    if (hasStopped === false) {
      return this.#waitForBreak();
    } else {
      Renderer.updateClockFace(...this.#shortBreak);
      Renderer.clockFaceColorBreak();
      this.#timer = new Timer(...this.#shortBreak);
      Renderer.resetTimeBar();
      this.#timer.start();
      this.#breakTime();
    }
  }

  async #breakTime() {
    const hasStopped = await this.#checkIfTimerStopped();
    if (hasStopped === false) {
      return this.#breakTime();
    } else {
      Renderer.resetTimeBar();
      Renderer.clockFaceColorWork();
      this.#timer = new Timer(...this.#breakTimeOut);
      Renderer.updateClockFace(...this.#breakTimeOut);
      this.#timer.start();
      this.#buttonPressed = false;
      this.#enableContinueButton();
      this.#waitFromBreak();
    }
  }

  async #waitFromBreak() {
    const hasStopped = await this.#checkIfTimerStopped();
    if (this.#buttonPressed) {
      this.#timer.stopButton();
      return;
    } else if (hasStopped === false) {
      return this.#waitFromBreak();
    } else {
      return alert("game over");
    }
  }

  #disableStartButton() {
    this.#startButton.disabled = true;
    this.#startButton.style.background = "#424752";
  }

  #enableStartButton() {
    this.#startButton.disabled = false;
    this.#startButton.style.background = "rgb(157, 207, 83)";
    this.#startButton.style.display = "block";
    this.#continueButton.style.display = "none";
  }

  #enableContinueButton() {
    this.#continueButton.disabled = false;
    this.#continueButton.style.background = "rgb(157, 207, 83)";
    this.#startButton.style.display = "none";
    this.#continueButton.style.display = "block";
  }
}

const pomodoro = new Pomodoro();
pomodoro.loop();
