"use strict";

class Renderer {
  static #tab = document.getElementById("tab");
  static #clockFace = document.getElementById("clock-face");
  static #timeBar = document.getElementById("time-bar");
  static #timeBarContainer = document.getElementById("time-bar-container");
  static #initialSeconds = undefined;
  static #startButton = document.getElementById("start");

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
    this.#startButton.style.background = "#424752";
    this.#startButton.disabled = true;
  }

  static enableStartButton() {
    this.#startButton.disabled = false;
    this.#startButton.style.background = "rgb(157, 207, 83)";
    this.#startButton.textContent = "➜";
    this.#startButton.style.fontSize = "2.5rem";
  }

  static updateClockColor(mode, time) {
    switch (mode) {
    case 1:
      this.#clockFace.style.color = "tomato";
      this.#timeBar.style.backgroundColor = "rgb(157, 207, 83)";
      break;
    case 2:
      this.#clockFace.style.color = "rgb(157, 207, 83)";
      this.#timeBar.style.backgroundColor = "rgb(157, 207, 83)";
      break;
    case 3:
      this.#clockFace.style.color = "#424752";
      break;
    }
    if ((mode === 2) && (time[0] < 2) && (time[1] < 30)) {
      this.#clockFace.style.color = "rgb(255, 42, 63)";
      this.#timeBar.style.backgroundColor = "rgb(255, 42, 63)";
    }
  }

  static buttonEffects(button) {
    button.addEventListener("mouseover", () => {
      button.style.background = "tomato";
    });
    button.addEventListener("mouseleave", () => {
      button.style.background = "#9dcf53";
    });
    button.addEventListener("touchstart", () => {
      button.style.background = "tomato";
    });
    button.addEventListener("touchend", () => {
      button.style.background = "#9dcf53";
    });
  }
}

class AudioPlayer {
  static #timerAlarm = new Audio("alert1.wav");

  static alarm(time) {
    if ((time[0] === 0) && (time[1] === 13)) {
      this.#timerAlarm.play();
    }
  }

  static safariHack() {
    this.#timerAlarm.play();
    this.#timerAlarm.pause();
    this.#timerAlarm.currentTime = 0;
  }
}

class Pomodoro {
  #startButton = document.getElementById("start");
  #timerWorker = new Worker("timerWorker.js");
  #round = 1;
  #buttonClicked = false;
  #setTimeOut = 0;
  #timerMode = 1;
  #timers = {
    1: [0, 20],
    2: [0, 5],
  };

  loop() {
    Renderer.updateClockFace(this.#timers[this.#timerMode]);
    Renderer.buttonEffects(this.#startButton);
    this.#startButton.addEventListener("click", () => {
      pomodoro.#timerMode = 1;
      Renderer.disableStartButton();
      if (this.#buttonClicked) {
        this.#round++;
        this.#timerWorker.terminate();
        this.#timerWorker = null;
        this.#timerWorker = new Worker("timerWorker.js");
        this.#setTimeOut = 1500;
      } else {
        AudioPlayer.safariHack();
      }
      this.#buttonClicked = true;
      setTimeout(() => {
        this.#checkForLongBreak(this.#round);
        this.#timerWorker.onmessage = function handler(event){
          if (event.data === "stopped"){
            pomodoro.#timerMode++;
            switch (pomodoro.#timerMode) {
            case 2:
              Renderer.enableStartButton();
              break;
            case 3:
              pomodoro.#gameOver();
              Renderer.updateClockColor(pomodoro.#timerMode, event.data);
              break;
            }
            pomodoro.#timerWorker.postMessage(pomodoro.#timers[pomodoro.#timerMode]);
          } else {
            Renderer.updateClockColor(pomodoro.#timerMode, event.data);
            Renderer.updateClockFace(event.data);
            AudioPlayer.alarm(event.data);
          }
        };
        this.#timerWorker.postMessage(this.#timers[this.#timerMode]);
      }, this.#setTimeOut);
    });
  }

  #gameOver() {
    this.#timerWorker.terminate();
    Renderer.disableStartButton();
  }

  #checkForLongBreak(round) {
    if (round % 4 === 0) {
      this.#timers[2] = [0, 50];
    } else {
      this.#timers[2] = [0, 40];
    }
  }
}

let pomodoro = new Pomodoro();
pomodoro.loop();
