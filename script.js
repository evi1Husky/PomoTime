"use strict";

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
    this.#startButton.style.background = "#424752";
    this.#startButton.disabled = true;
  }

  static enableStartButton() {
    this.#startButton.disabled = false;
    this.#startButton.style.background = "rgb(157, 207, 83)";
    this.#startButton.textContent = "➜";
    this.#startButton.style.fontSize = "2.5rem";
  }

  static updateClockColor(time, timer) {
    switch (timer) {
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
    if ((timer === 2) && (time[0] < 1)) {
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
  static #buttonClick = new Audio("mixkit-mouse-click-close-1113.wav");

  static alarm(time, timer) {
    if ((time[0] === 0) && (time[1] === this.#timerAlarm.duration << 0)) {
      this.#timerAlarm.play();
    }
    if ((timer === 2)&&(time[0] === 0) && (time[1] === 59)) {
      this.#timerAlarm.play();
    }
  }

  static buttonClick() {
    this.#buttonClick.play();
  }

  static resetAlarm() {
    this.#timerAlarm.pause();
    this.#timerAlarm.currentTime = 0;
  }

  static addAudioContext() {
    const audioContext = window.AudioContext;
    const audioCtx = new audioContext();
    return audioCtx;
  }
}

class Pomodoro {
  #startButton = document.getElementById("start");
  #timerWorker = new Worker("timerWorker.js");
  #buttonClicked = false;
  #setTimeOut = 0;
  #currentTimer = 1;
  #workTime = [0, 16];
  #shortBreak = [0, 40];
  #longBreak = [0, 5];
  #timerSchedule = {
    1: this.#workTime,
    2: this.#shortBreak,
  };
  #round = 0;

  loop() {
    Renderer.updateClockFace(this.#timerSchedule[this.#currentTimer]);
    Renderer.buttonEffects(this.#startButton);
    this.#startButton.addEventListener("click", () => {
      AudioPlayer.resetAlarm();
      pomodoro.#currentTimer = 1;
      this.#round++;
      Renderer.disableStartButton();
      if (!this.#buttonClicked) {
        AudioPlayer.addAudioContext();
      }
      if (this.#buttonClicked) {
        this.#timerWorker.terminate();
        this.#timerWorker = null;
        this.#timerWorker = new Worker("timerWorker.js");
        this.#setTimeOut = 1500;
      }
      AudioPlayer.buttonClick();
      setTimeout(() => {
        this.#buttonClicked = true;
        this.#checkForLongBreak(this.#round);
        this.#timerWorker.onmessage = function handler(event){
          if (event.data === "stopped"){
            pomodoro.#currentTimer++;
            switch (pomodoro.#currentTimer) {
            case 2:
              Renderer.enableStartButton();
              break;
            case 3:
              pomodoro.#gameOver();
              Renderer.updateClockColor(event.data, pomodoro.#currentTimer);
              break;
            }
            pomodoro.#timerWorker.postMessage(pomodoro.#timerSchedule[pomodoro.#currentTimer]);
          } else {
            Renderer.updateClockColor(event.data, pomodoro.#currentTimer);
            Renderer.updateClockFace(event.data);
            AudioPlayer.alarm(event.data, pomodoro.#currentTimer);
          }
        };
        this.#timerWorker.postMessage(this.#timerSchedule[this.#currentTimer]);
      }, this.#setTimeOut);
    });
  }

  #gameOver() {
    this.#timerWorker.terminate();
    Renderer.disableStartButton();
  }

  #checkForLongBreak(round) {
    if (round % 4 === 0) {
      this.#timerSchedule[2] = this.#longBreak;
    } else {
      this.#timerSchedule[2] = this.#shortBreak;
    }
  }
}

const pomodoro = new Pomodoro();
pomodoro.loop();
