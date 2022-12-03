"use strict";

// Renderer class holds methods for updating and animating user interface elements

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
    this.#startButton.style.pointerEvents = "none";
    this.#startButton.disabled = true;
    setTimeout(() => {
      this.#startButton.style.background = "#424752";
    }, 30);
  }

  static enableStartButton() {
    this.#startButton.style.pointerEvents = "auto";
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
      if (button.id === "apply-settings") {
        button.style.background = "rgb(157, 207, 83)";
      } else {
        button.style.background = "tomato";
      }
    });
    button.addEventListener("mouseleave", () => {
      if (button.id === "start") {
        button.style.background = "#9dcf53";
      } else {
        button.style.background = "#a4a6aa";
      }
    });
    button.addEventListener("touchstart", () => {
      if (button.id === "apply-settings") {
        button.style.background = "rgb(157, 207, 83)";
      } else {
        button.style.background = "tomato";
      }
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

  static updateInfoDisplay(message, currentTimer, pomodoroJustReceived) {
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
    if (pomodoroJustReceived) {
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
      this.#infoDisplay.innerHTML = 
        "You've gathered all the 🍅 <br>congratulations ✨";
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

  static gameOverTakeAwayTomatoes(amount) {
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

/* AudioPlayer class, uses Web Audio API to load and play sound effects,
as well as provide volume control */

class AudioPlayer {
  static #soundsArray = [
    new Audio("sounds/mixkit-sound-alert-in-hall-1006.wav"),
    new Audio("sounds/mixkit-mouse-click-close-1113.wav"),
    new Audio("sounds/mixkit-long-pop-2358.wav"),
    new Audio("sounds/mixkit-bubble-pop-up-alert-notification-2357.wav"),
    new Audio("sounds/mixkit-dramatic-metal-explosion-impact-1687.wav"),
    new Audio("sounds/mixkit-game-success-alert-2039.wav"),
    new Audio("sounds/mixkit-spaceship-alarm-998.wav"),
    new Audio("sounds/mixkit-clear-mouse-clicks-2997.wav"),
  ];

  static #sourcesArray = [];
  static effectsVolume = null;
  static alarmVolume = null;
  static finalAlarmVolume = null;

  static createAudioContext() {
    return new (window.AudioContext);
  }

  static connectAudioNodes(audioContext) {
    this.effectsVolume = audioContext.createGain();
    this.alarmVolume = audioContext.createGain();
    this.finalAlarmVolume = audioContext.createGain();
    this.effectsVolume.connect(audioContext.destination);
    this.alarmVolume.connect(audioContext.destination);
    this.finalAlarmVolume.connect(audioContext.destination);
    for (let index = 0; index < this.#soundsArray.length; index++) {
      this.#sourcesArray.push(
        audioContext.createMediaElementSource(this.#soundsArray[index]));
      this.#sourcesArray[index].connect(audioContext.destination);
      if (index === 0) {
        this.#sourcesArray[index].connect(this.alarmVolume);
      } else if (index === 6) {
        this.#sourcesArray[index].connect(this.finalAlarmVolume);
      } else {
        this.#sourcesArray[index].connect(this.effectsVolume);
      }
    }
    this.alarmVolume.gain.value = 0;
    this.finalAlarmVolume.gain.value = 1;
    this.effectsVolume.gain.value = 0;
  }

  static alarm(time, timer) {
    if ((timer === 1) && (time[0] === 0) && 
      (time[1] === this.#soundsArray[0].duration << 0)) {
      this.#soundsArray[0].play();
    }
    if ((timer === 2) && (time[0] === 0) && (time[1] === 59)) {
      this.#soundsArray[0].play();
    }
    if ((timer === 2) && (time[0] === 0) && 
      (time[1] === this.#soundsArray[6].duration << 0)) {
      this.#soundsArray[6].play();
    }
  }

  static buttonClick() {
    this.#soundsArray[1].play();
  }

  static tomatoPop() {
    this.#soundsArray[2].play();
  }

  static tomatoShrink() {
    this.#soundsArray[3].play();
  }

  static gameOverSound() {
    this.#soundsArray[4].play();
  }

  static gameWinSound() {
    this.#soundsArray[5].play();
  }

  static settingsClick() {
    this.#soundsArray[7].play();
  }

  static resetAlarm() {
    this.#soundsArray[0].pause();
    this.#soundsArray[6].pause();
  }
}

// Utility class with misc methods for accessing local storage etc 

class Utility {
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

  static saveSettings() {
    localStorage.setItem("workMinutes", Settings.workTime[0]);
    localStorage.setItem("workSeconds", Settings.workTime[1]);
    localStorage.setItem("shortBreakMinutes", Settings.shortBreak[0]);
    localStorage.setItem("shortBreakSeconds", Settings.shortBreak[1]);
    localStorage.setItem("longBreakMinutes", Settings.longBreak[0]);
    localStorage.setItem("longBreakSeconds", Settings.longBreak[1]);
  }

  static loadSettings() {
    if ("workMinutes" in localStorage) {
      pomodoro.workTime[0] = Number(localStorage.getItem("workMinutes"));
      pomodoro.workTime[1] = Number(localStorage.getItem("workSeconds"));
      pomodoro.shortBreak[0] = Number(localStorage.getItem("shortBreakMinutes"));
      pomodoro.shortBreak[1] = Number(localStorage.getItem("shortBreakSeconds"));
      pomodoro.longBreak[0] = Number(localStorage.getItem("longBreakMinutes"));
      pomodoro.longBreak[1] = Number(localStorage.getItem("longBreakSeconds"));
      pomodoro.timerSchedule[1] = pomodoro.workTime;
      pomodoro.timerSchedule[2] = pomodoro.shortBreak;
    }
  }
}

//Settings menu

class Settings {
  static #settingsButton = document.querySelector(".settings");
  static #settingsMenu = document.querySelector(".settings-menu");
  static #closeMenu = document.querySelector(".close-menu");
  static #applySettingsButton = document.querySelector(".apply-settings");

  static #inputForms = [
    document.getElementById("work-minutes"),
    document.getElementById("work-seconds"),
    document.getElementById("short-break-minutes"),
    document.getElementById("short-break-seconds"),
    document.getElementById("long-break-minutes"),
    document.getElementById("long-break-seconds"),
  ];

  static workTime = [];
  static shortBreak = [];
  static longBreak = [];

  static init() {
    this.#settingsButtonEvent(this.#settingsButton);
    this.#closeButtonEvent(this.#closeMenu);
    Renderer.buttonEffects(this.#applySettingsButton);
    this.#applySettingsButtonEvent(this.#applySettingsButton);
    this.#timeInputEvents();
  }

  static #formInputCallback(event, form, formNumber) {
    if (this.#validateInput(event.data, form.value.length)) {
      switch (formNumber) {
      case 1:
        this.workTime[0] = parseInt(Number(form.value));
        break;
      case 2:
        this.workTime[1] = parseInt(Number(form.value));
        break;
      case 3:
        this.shortBreak[0] = parseInt(Number(form.value));
        break;
      case 4:
        this.shortBreak[1] = parseInt(Number(form.value));
        break;
      case 5:
        this.longBreak[0] = parseInt(Number(form.value));
        break;
      case 6:
        this.longBreak[1] = parseInt(Number(form.value));
        break;
      }
    } else {
      this.#replaceInvalidValues(form);
    }
  }

  static #timeInputEvents() {
    for (let index = 0; index < this.#inputForms.length; index++) {
      this.#inputForms[index].addEventListener("input", (event) => {
        this.#formInputCallback(event, this.#inputForms[index], index + 1);
      });
    }
    this.#settingsMenu.addEventListener("click", () => {
      for (let index = 0; index < this.#inputForms.length; index++) {
        this.#formatFormValue(this.#inputForms[index]);
      }
    });
  }

  static #validateInput(input, length) {
    if ((typeof Number(input) === "number") && 
      (length === 1 && Number(input) <= 5) ||
      (length === 2 && Number(input) <= 9) ||
      (length === 0)) {
      return true;
    } else {
      return false;
    }
  }

  static #formatFormValue(form) {
    if (Number(form.value < 10) && 
        (form.value.length === 1)) {
      form.value = "0" + form.value;
    }
  }

  static #replaceInvalidValues(input) {
    input.value = 0;
  }

  static #applySettings() {
    pomodoro.workTime = this.workTime;
    pomodoro.timerSchedule[1] = this.workTime;
    if (!pomodoro.buttonClicked) {
      Renderer.updateClockFace(this.workTime);
    }
    pomodoro.shortBreak = this.shortBreak;
    pomodoro.timerSchedule[2] = this.shortBreak;
    pomodoro.longBreak = this.longBreak;
  }

  static #applySettingsButtonEvent(button) {
    button.addEventListener("click", () => {
      button.style.background = "tomato";
      AudioPlayer.settingsClick();
      setTimeout(() => {
        button.style.background = "#424752";
      }, 120);
      setTimeout(() => {
        this.#applySettings();
        Utility.saveSettings();
        this.#settingsMenu.style.display = "none";
      }, 500);
    });
  }

  static #setInitialValues() {
    this.#inputForms[0].value = pomodoro.workTime[0];
    this.#inputForms[1].value = pomodoro.workTime[1];
    this.workTime = pomodoro.workTime;
    this.#formatFormValue(this.#inputForms[0]);
    this.#formatFormValue(this.#inputForms[1]);
    this.#inputForms[2].value = pomodoro.shortBreak[0];
    this.#inputForms[3].value = pomodoro.shortBreak[1];
    this.shortBreak = pomodoro.shortBreak;
    this.#formatFormValue(this.#inputForms[2]);
    this.#formatFormValue(this.#inputForms[3]);
    this.#inputForms[4].value = pomodoro.longBreak[0];
    this.#inputForms[5].value = pomodoro.longBreak[1];
    this.longBreak = pomodoro.longBreak;
    this.#formatFormValue(this.#inputForms[4]);
    this.#formatFormValue(this.#inputForms[5]);
  }
 
  static #settingsButtonEvent(button) {
    button.addEventListener("mouseover", () => {
      button.style.color = "rgb(157, 207, 83)";
      button.style.transition = "0s";
    });
    button.addEventListener("mouseleave", () => {
      button.style.color = "#a4a6aa";
      button.style.transition = "1.3s";
    });
    button.addEventListener("touchstart", () => {
      button.style.color = "rgb(157, 207, 83)";
    });
    button.addEventListener("touchend", () => {
      button.style.color = "#a4a6aa";
      button.style.transition = "1.3s";
    });
    button.addEventListener("click", () => {
      button.style.color = "tomato";
      button.style.transition = "0s";
      button.disabled = true;
      AudioPlayer.settingsClick();
      setTimeout(() => {
        button.style.color = "rgb(157, 207, 83)";
      }, 120);
      const style = getComputedStyle(this.#settingsMenu);
      setTimeout(() => {
        if (style.display === "none") {
          this.#settingsMenu.style.display = "flex";
          this.#setInitialValues();
        } else {
          this.#settingsMenu.style.display = "none";
        }
        setTimeout(() => {
          button.disabled = false;
        }, 500);
      }, 200);
    });
  }

  static #closeButtonEvent(button) {
    button.addEventListener("mouseover", () => {
      button.style.color = "#25282e";
      button.style.borderColor = "tomato";
      button.style.backgroundColor = "tomato";
    });
    button.addEventListener("mouseleave", () => {
      button.style.color = "#a4a6aa";
      button.style.borderColor = "#a4a6aa";
      button.style.backgroundColor = "#ffffff00";
    });
    button.addEventListener("touchstart", () => {
      button.style.color = "#25282e";
      button.style.borderColor = "tomato";
      button.style.backgroundColor = "tomato";
    });
    button.addEventListener("touchend", () => {
      button.style.color = "#a4a6aa";
      button.style.borderColor = "#a4a6aa";
      button.style.backgroundColor = "#ffffff00";
    });
    button.addEventListener("click", () => {
      button.style.backgroundColor = "rgb(157, 207, 83)";
      button.style.borderColor = "rgb(157, 207, 83)";
      AudioPlayer.settingsClick();
      const style = getComputedStyle(this.#settingsMenu);
      setTimeout(() => {
        if (style.display === "none") {
          this.#settingsMenu.style.display = "flex";
        } else {
          this.#settingsMenu.style.display = "none";
        }    
      }, 200);
    });
  }
}

// Main app class featuring game loop and logic

class Pomodoro {
  #startButton = document.getElementById("start");
  #tryAgain = document.getElementById("try-again");
  #closeButton = document.getElementById("close");
  #timerWorker = new Worker("timerWorker.js");
  buttonClicked = false;
  #setTimeOut = 0;
  #currentTimer = 1;
  workTime = [25, 0];
  shortBreak = [5, 0];
  longBreak = [15, 0];
  #tomatoesToWin = 18;
  timerSchedule = {
    1: this.workTime,
    2: this.shortBreak,
  };
  #round = 0;
  #currentGameScore = 0;
  #tomatoArray = [];
  tomatoScore = 0;
  #pomodoroJustReceived = false;

  loop() {
    Settings.init();
    Utility.loadSettings();
    this.tomatoScore = Utility.loadProgress();
    Renderer.updateTomatoScore(this.tomatoScore);
    Renderer.updateInfoDisplay(null, null);
    Renderer.updateClockFace(this.workTime);
    Renderer.updateTab("PomoTime");
    Renderer.buttonEffects(this.#startButton);
    Renderer.buttonEffects(this.#tryAgain);
    Renderer.buttonEffects(this.#closeButton);
    this.#startButton.addEventListener("click", () => {
      Renderer.disableStartButton();
      if (!this.buttonClicked) {
        const audioContext = AudioPlayer.createAudioContext();
        AudioPlayer.connectAudioNodes(audioContext);
      }
      Renderer.idleClockFace(this.#round);
      AudioPlayer.resetAlarm();
      this.#currentTimer = 1;
      if (this.buttonClicked) {
        this.#timerWorker.terminate();
        this.#timerWorker = null;
        this.#timerWorker = new Worker("timerWorker.js");
        this.#setTimeOut = 700;
      }
      AudioPlayer.buttonClick();
      setTimeout(() => {
        this.buttonClicked = true;
        this.#addTomatoToArray(this.#round);
        Renderer.updateTomatoScore(this.tomatoScore);
        Renderer.updateTomatoArray(this.#currentGameScore);
        this.#checkIfAllTomatoesGathered(this.#tomatoArray);
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
              pomodoro.timerSchedule[pomodoro.#currentTimer]);
          } else {
            Renderer.updateClockColor(event.data, pomodoro.#currentTimer);
            Renderer.updateClockFace(event.data);
            Renderer.updateInfoDisplay(event.data, pomodoro.#currentTimer,
              pomodoro.#pomodoroJustReceived);
            AudioPlayer.alarm(event.data, pomodoro.#currentTimer);
          }
        };
        this.#timerWorker.postMessage(this.timerSchedule[this.#currentTimer]);
      }, this.#setTimeOut);
    });
  }

  #gameOver() {
    this.#timerWorker.terminate();
    Renderer.disableStartButton();
    AudioPlayer.gameOverSound();
    const length = this.#tomatoArray.length;
    this.#round = 0;
    Renderer.gameOverTakeAwayTomatoes(length);
    Renderer.endGameMessage(true, this.#tomatoArray.length);
    this.tomatoScore -= this.#tomatoArray.length;
    this.#tomatoArray.length = 0;
    Utility.saveProgress(this.tomatoScore);
    this.tomatoScore -= 10;
    Utility.saveProgress(this.tomatoScore);
    this.#tryAgainButtonEvent();
  }

  #tryAgainButtonEvent() {
    this.#tryAgain.addEventListener("click", () => {
      AudioPlayer.buttonClick(this.isIos);
      this.#tryAgain.style.pointerEvents = "none";
      setTimeout(() => {
        this.#tryAgain.style.background = "#424752";
      }, 30);
      setTimeout(() => {
        location.reload();
      }, 500);
    });
  }

  #checkForLongBreak(round) {
    if (round % 4 === 0) {
      this.timerSchedule[2] = this.longBreak;
    } else {
      this.timerSchedule[2] = this.shortBreak;
    }
  }

  #checkIfAllTomatoesGathered(tomatoArray) {
    if (tomatoArray.length === this.#tomatoesToWin) {
      this.#gameWon();
    }
  }

  #gameWon() {
    this.tomatoScore += 10;
    Utility.saveProgress(this.tomatoScore);
    Renderer.updateTomatoScore(this.tomatoScore);
    AudioPlayer.gameWinSound();
    this.#timerWorker.terminate();
    this.#startButton.style.display = "none";
    this.#closeButton.style.display = "block";
    Renderer.endGameMessage(false, this.#tomatoArray.length);
    this.#closeButton.addEventListener("click", () => {
      AudioPlayer.buttonClick(this.isIos);
      this.#closeButton.style.pointerEvents = "none";
      setTimeout(() => {
        this.#closeButton.style.background = "#424752";
      }, 30);
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
      this.#pomodoroJustReceived = true;
      setTimeout(() => {
        this.#pomodoroJustReceived = false;
      }, 4000);
      Utility.saveProgress(this.tomatoScore);
    }
  }
}

const pomodoro = new Pomodoro();
pomodoro.loop();
