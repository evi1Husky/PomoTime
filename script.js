"use strict";

class Renderer {
  static #tab = document.getElementById("tab");
  static #clockFace = document.getElementById("clock-face");
  static #timeBar = document.getElementById("time-bar");
  static #timeBarContainer = document.getElementById("time-bar-container");
  static #initialSeconds = undefined;
  static #startButton = document.querySelector(".start");
  static #totalTomatoScore = document.querySelector(".total-tomato-score");
  static #tomatoArray = document.querySelector(".pomodoro-array");
  static #infoDisplay = document.querySelector(".info-display");

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

  static updateTab(message) {
    this.#tab.textContent = message;
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

  static idleClockFace(round) {
    if (round != 0){
      this.#clockFace.textContent = "--:--";
      this.#tab.textContent = "--:--";
      this.#clockFace.style.color = "#a4a6aa";
      this.#timeBar.style.backgroundColor = "#a4a6aa";
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

  static updateTomatoScore(tomatoScore) {
    this.#totalTomatoScore.textContent = tomatoScore;
  }

  static updateTomatoArray(score, isIos) {
    if (score != 0) {
      this.#tomatoArray.appendChild(this.#tomatoFactory(score));
      const tomato = document.getElementById(`tomato${score}`);
      AudioPlayer.tomatoPop(isIos);
      this.#tomatoGrowAnimation(tomato);
    }
  }

  static #tomatoGrowAnimation(tomato) {
    let height = 0;
    let width = 0;
    tomato.style.width = `${width}rem`;
    tomato.style.height = `${height}rem`;
    tomato.style.position = "absolute";

    function tomatoGrow() {
      if (height >= 2.3) {
        window.cancelAnimationFrame(tomatoGrow);
        tomatoShrink();
      } else {
        height += 0.2;
        width += 0.2;
        tomato.style.width = `${width}rem`;
        tomato.style.height = `${height}rem`;
        requestAnimationFrame(tomatoGrow);
      }
    }

    function tomatoShrink() {
      if (height <= 2) {
        window.cancelAnimationFrame(tomatoShrink);
        tomato.style.position = "relative";
      } else {
        height -= 0.3;
        width -= 0.3;
        tomato.style.width = `${width}rem`;
        tomato.style.height = `${height}rem`;
        requestAnimationFrame(tomatoShrink);
      }
    }

    tomatoGrow();
  }

  static #tomatoFactory(id) {
    const tomato = document.createElement("img");
    tomato.classList.add("array-tomato");
    tomato.setAttribute("src", "reshot-icon-tomato-S69C7UDGRW.svg");
    tomato.setAttribute("id", `tomato${id}`);
    return tomato;
  }

  static updateInfoDisplay(text) {
    this.#infoDisplay.textContent = text;
  }
}

class AudioPlayer {
  static #timerAlarm = new Audio("alert1.wav");
  static #buttonClick = new Audio("mixkit-mouse-click-close-1113.wav");
  static #pop = new Audio("mixkit-long-pop-2358.wav");

  static alarm(time, timer) {
    if ((time[0] === 0) && (time[1] === this.#timerAlarm.duration << 0)) {
      this.#timerAlarm.play();
    }
    if ((timer === 2)&&(time[0] === 0) && (time[1] === 59)) {
      this.#timerAlarm.play();
    }
  }

  static buttonClick(isIos) {
    if (!isIos) {
      this.#buttonClick.play();
    }
  }

  static tomatoPop(isIos) {
    if(isIos) {
      this.#pop = new Audio("mixkit-long-pop-2358.wav");
    }
    this.#pop.play();
  }

  static resetAlarm() {
    this.#timerAlarm.play();
    this.#timerAlarm.pause();
    this.#timerAlarm.currentTime = 0;
  }

  static addAudioContext() {
    const audioContext = window.AudioContext;
    const audioCtx = new audioContext();
    return audioCtx;
  }
}

class Utility {
  static detectiOS() {
    let platform = window.navigator?.userAgentData?.platform || window.navigator.platform,
      iosPlatforms = ["iPhone", "iPad", "iPod"],
      iOS = null;
    if (iosPlatforms.indexOf(platform) !== -1) {
      iOS = true;
    } else {
      iOS = false;
    }
    return iOS;
  }
}

class Pomodoro {
  #startButton = document.getElementById("start");
  #timerWorker = new Worker("timerWorker.js");
  #buttonClicked = false;
  #setTimeOut = 0;
  #currentTimer = 1;
  #workTime = [0, 1];
  #shortBreak = [1, 20];
  #longBreak = [0, 3];
  #timerSchedule = {
    1: this.#workTime,
    2: this.#shortBreak,
  };
  #round = 0;
  #tomatoArray = [];
  #tomatoScore = 0;

  loop() {
    const isIos = Utility.detectiOS();
    Renderer.updateInfoDisplay("Press the start button to begin. ✨");
    Renderer.updateClockFace(this.#timerSchedule[this.#currentTimer]);
    Renderer.updateTab("PomoTime");
    Renderer.buttonEffects(this.#startButton);
    this.#startButton.addEventListener("click", () => {
      Renderer.idleClockFace(this.#round);
      AudioPlayer.resetAlarm();
      pomodoro.#currentTimer = 1;
      Renderer.disableStartButton();
      if (!this.#buttonClicked) {
        AudioPlayer.addAudioContext();
      }
      if (this.#buttonClicked) {
        this.#timerWorker.terminate();
        this.#timerWorker = null;
        this.#timerWorker = new Worker("timerWorker.js");
        this.#setTimeOut = 1000;
      }
      AudioPlayer.buttonClick(isIos);
      setTimeout(() => {
        this.#buttonClicked = true;
        this.#addTomatoToArray(this.#round);
        Renderer.updateTomatoScore(this.#tomatoScore);
        Renderer.updateTomatoArray(this.#tomatoScore, isIos);
        this.#checkIfAllTomatosGathered(this.#tomatoArray);
        this.#round++;
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

  #checkIfAllTomatosGathered(tomatoArray) {
    if (tomatoArray.length === 18) {
      this.#timerWorker.terminate();
      Renderer.disableStartButton();
    }
  }

  #addTomatoToArray(round) {
    if (round != 0) {
      this.#tomatoArray.push("🍅");
      this.#tomatoScore++;
    }
  }
}

const pomodoro = new Pomodoro();
pomodoro.loop();
