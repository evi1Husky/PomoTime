"use strict";

// Renderer class holds methods for updating and animating user inteface elements

class Renderer {
  static #tab = document.getElementById("tab");
  static #clockFace = document.getElementById("clock-face");
  static #timeBar = document.getElementById("time-bar");
  static #timeBarContainer = document.getElementById("time-bar-container");
  static #initialSeconds = undefined;
  static #startButton = document.querySelector(".start");
  static #tryAgainButton = document.querySelector(".try-again");
  static #totalTomatoScore = document.querySelector(".total-tomato-score");
  static #tomatoArray = document.querySelector(".pomodoro-array");
  static #infoDisplay = document.querySelector(".info-display");
  static #totalScore = document.querySelector(".total-score");
  static #tomatoSVG = document.querySelector(".score-tomato");

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
      if (button.id === "start") {
        button.style.background = "#9dcf53";
      } else {
        button.style.background = "#a4a6aa";
      }
    });
    button.addEventListener("touchstart", () => {
      button.style.background = "tomato";
    });
    button.addEventListener("touchend", () => {
      if (button.id === "start") {
        button.style.background = "#9dcf53";
      } else {
        button.style.background = "#a4a6aa";
      }
    });
  }

  static updateTomatoScore(tomatoScore) {
    this.#totalTomatoScore.textContent = tomatoScore;
  }

  static updateTomatoArray(score) {
    if (score != 0) {
      this.#tomatoArray.appendChild(this.#tomatoFactory(score));
      const tomato = document.getElementById(`tomato${score}`);
      AudioPlayer.tomatoPop();
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
        return;
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

  static updateInfoDisplay(message, currentTimer, pomodoroJustRecieved) {
    const previousText = this.#infoDisplay.textContent;
    if (message === null) {
      this.#infoDisplay.textContent = "Press start to begin ✨";
    }
    if (currentTimer === 1) {
      this.#infoDisplay.textContent = "Time to focus";
    }
    if ((currentTimer === 1) && (message[0] < 1) && (message[1] < 20)) {
      this.#infoDisplay.textContent = "It's time to take a break";
    }
    if (currentTimer === 2) {
      this.#infoDisplay.textContent = "It's time to take a break";
      this.#tab.textContent = "break time";
    }
    if ((currentTimer === 2) && (message[0] < 1)) {
      this.#infoDisplay.textContent = "Time is running out 🔥";
    }
    if (pomodoroJustRecieved) {
      this.#infoDisplay.textContent = "+1 🍅";
    }
    const textNow = this.#infoDisplay.textContent;
    if (previousText != textNow) {
      this.#textAnimation(this.#infoDisplay);
    }
  }

  static endGameMessage(isGameOver, length) {
    if (isGameOver) {
      this.#clockFace.textContent = "X_X";
      this.#tab.textContent = "Game Over";
      if (length === 0) {
        this.#infoDisplay.textContent = "Game Over";
      } else {
        this.#infoDisplay.textContent = "You've lost all your 🍅";
      }
    } else {
      this.#clockFace.textContent = "Well Done!";
      this.#clockFace.style.fontSize = "4.5rem";
      this.#clockFace.style.padding = "11.5%";
      this.#timeBar.style.display = "none";
      this.#infoDisplay.textContent = 
        "You've gathered all the 🍅, congratulations.";
      this.#tab.textContent = "PomoTimer";
    }
  }

  static #tryAgain() {
    this.#startButton.style.display = "none";
    this.#tryAgainButton.style.display = "block";
  }
 
  static #textAnimation(textElement) {
    let opacity = 0;
    textElement.style.opacity = `${opacity}%`;
    function textAppear() {
      if (opacity === 100) {
        window.cancelAnimationFrame(textAppear);
        return;
      }
      opacity += 4;
      textElement.style.opacity = `${opacity}%`;
      requestAnimationFrame(textAppear);
    }
    textAppear();
  }

  static gameOverTakeAwayTomatos(amount) {
    let timeOut = 0;
    for (let i = amount; i >= 1; i--) {
      timeOut += 700;
      setTimeout(() => {
        const tomato = document.getElementById(`tomato${i}`);
        AudioPlayer.tomatoShrink();
        Renderer.#tomatoShrinkAnimation(tomato);
      }, timeOut);
    }
    setTimeout(() => {
      Renderer.#totalTomatoScore.textContent = pomodoro.tomatoScore;
      this.#tryAgain();
    }, timeOut + 500);
  }

  static #tomatoShrinkAnimation(tomato) {
    let height = 2;
    tomato.style.height = `${height}rem`;

    function tomatoShrink() {
      if (height <= 0) {
        Renderer.#tomatoArray.removeChild(tomato);
        Renderer.#totalTomatoScore.textContent -= 1;
        window.cancelAnimationFrame(tomatoShrink);
        return;
      } else {
        height -= 0.2;
        tomato.style.height = `${height}rem`;
        requestAnimationFrame(tomatoShrink);
      }
    }

    tomatoShrink();
  }
}

// AudioPlayer class loads and plays audio files

class AudioPlayer {
  static #timerAlarm = new Audio("alert1.wav");
  static #buttonClick = new Audio("mixkit-mouse-click-close-1113.wav");
  static #pop = new Audio("mixkit-long-pop-2358.wav");
  static #shrink =
    new Audio("mixkit-bubble-pop-up-alert-notification-2357.wav");
  static #gameOver = new Audio("mixkit-dramatic-metal-explosion-impact-1687.wav");
  static #gameWin = new Audio("mixkit-game-success-alert-2039.wav");

  static alarm(time, timer) {
    if ((time[0] === 0) && (time[1] === this.#timerAlarm.duration << 0)) {
      this.#timerAlarm.play();
    }
    if ((timer === 2)&&(time[0] === 0) && (time[1] === 59)) {
      this.#timerAlarm.play();
    }
  }

  static gameOverSound() {
    this.#gameOver.play();
  }

  static gameWinSound() {
    this.#gameWin.play();
  }

  static buttonClick(isIos) {
    if (!isIos) {
      this.#buttonClick.play();
    }
  }

  static tomatoPop() {
    this.#pop.play();

  }

  static tomatoShrink() {
    this.#shrink.play();
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

// Utility class with misc methods for accessing local storage, detecting iOS etc 

class Utility {
  static detectiOS() {
    let platform = 
    window.navigator?.userAgentData?.platform || window.navigator.platform,
      iosPlatforms = ["iPhone", "iPad", "iPod"],
      iOS = null;
    if (iosPlatforms.indexOf(platform) !== -1) {
      iOS = true;
    } else {
      iOS = false;
    }
    return iOS;
  }

  static saveProgress(num) {
    let score =+ num;
    localStorage.setItem("pomodoroScore", score);
  }

  static loadProgress() {
    if ("pomodoroScore" in localStorage) {
      return localStorage.getItem("pomodoroScore");
    } else {
      return 0;
    }
  }
}

// Main app class featuring game loop and logic

class Pomodoro {
  #startButton = document.getElementById("start");
  #tryAgain = document.getElementById("try-again");
  #closeButton = document.getElementById("close");
  #timerWorker = new Worker("timerWorker.js");
  #buttonClicked = false;
  #setTimeOut = 0;
  #currentTimer = 1;
  #workTime = [2, 10];
  #shortBreak = [2, 0];
  #longBreak = [2, 25];
  #timerSchedule = {
    1: this.#workTime,
    2: this.#shortBreak,
  };
  #round = 0;
  #currentGameScore = 0;
  #tomatoArray = [];
  tomatoScore = 0;
  #tomatosToWin = 18;
  #pomodoroJustRecieved = false;

  loop() {
    this.tomatoScore = Utility.loadProgress();
    Renderer.updateTomatoScore(this.tomatoScore);
    const isIos = Utility.detectiOS();
    Renderer.updateInfoDisplay(null, null);
    Renderer.updateClockFace(this.#timerSchedule[this.#currentTimer]);
    Renderer.updateTab("PomoTime");
    Renderer.buttonEffects(this.#startButton);
    Renderer.buttonEffects(this.#tryAgain);
    Renderer.buttonEffects(this.#closeButton);
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
        this.#setTimeOut = 700;
      }
      AudioPlayer.buttonClick(isIos);
      setTimeout(() => {
        this.#buttonClicked = true;
        this.#addTomatoToArray(this.#round);
        Renderer.updateTomatoScore(this.tomatoScore);
        Renderer.updateTomatoArray(this.#currentGameScore);
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
            pomodoro.#timerWorker.postMessage(
              pomodoro.#timerSchedule[pomodoro.#currentTimer]);
          } else {
            Renderer.updateClockColor(event.data, pomodoro.#currentTimer);
            Renderer.updateClockFace(event.data);
            Renderer.updateInfoDisplay(event.data, pomodoro.#currentTimer,
              pomodoro.#pomodoroJustRecieved);
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
    AudioPlayer.gameOverSound();
    const length = pomodoro.#tomatoArray.length;
    pomodoro.#round = 0;
    pomodoro.tomatoScore -= 100;
    Utility.saveProgress(this.tomatoScore);
    pomodoro.tomatoScore -= length;
    Renderer.gameOverTakeAwayTomatos(length);
    Renderer.endGameMessage(true, pomodoro.#tomatoArray.length);
    pomodoro.#tomatoArray.length = 0;
    pomodoro.#tryAgainButtonEvent();
  }

  #tryAgainButtonEvent() {
    pomodoro.#tryAgain.addEventListener("click", () => {
      AudioPlayer.buttonClick(pomodoro.isIos);
      pomodoro.#tryAgain.style.background = "#424752";
      pomodoro.#tryAgain.disabled = true;
      setTimeout(() => {
        location.reload();
      }, 500);
    });
  }

  #checkForLongBreak(round) {
    if (round % 4 === 0) {
      this.#timerSchedule[2] = this.#longBreak;
    } else {
      this.#timerSchedule[2] = this.#shortBreak;
    }
  }

  #checkIfAllTomatosGathered(tomatoArray) {
    if (tomatoArray.length === this.#tomatosToWin) {
      this.#gameWon();
    }
  }

  #gameWon() {
    pomodoro.tomatoScore += 100;
    Utility.saveProgress(this.tomatoScore);
    Renderer.updateTomatoScore(this.tomatoScore);
    AudioPlayer.gameWinSound();
    this.#timerWorker.terminate();
    this.#startButton.style.display = "none";
    this.#closeButton.style.display = "block";
    Renderer.endGameMessage(false, pomodoro.#tomatoArray.length);
    this.#closeButton.addEventListener("click", () => {
      AudioPlayer.buttonClick(pomodoro.isIos);
      this.#closeButton.style.background = "#424752";
      setTimeout(() => {
        document.body.innerHTML = "";
      }, 500);
    });
  }

  #addTomatoToArray(round) {
    if (round != 0) {
      this.#tomatoArray.push("🍅");
      this.tomatoScore++;
      this.#currentGameScore++;
      this.#pomodoroJustRecieved = true;
      setTimeout(() => {
        this.#pomodoroJustRecieved = false;
      }, 4000);
      Utility.saveProgress(this.tomatoScore);
    }
  }
}

let pomodoro = new Pomodoro();
pomodoro.loop();
