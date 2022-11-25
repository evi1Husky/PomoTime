class Renderer {
  static #tab = document.getElementById("tab");
  static #clockFace = document.getElementById("clock-face");
  static #timeBar = document.getElementById("time-bar");
  static #timeBarContainer = document.getElementById("time-bar-container");
  static #initialSeconds = null;

  static updateClockFace(message) {
    if (typeof message === "number"){
      this.#initialSeconds = message;
    }
    if (typeof message === "string") {
      this.#clockFace.textContent = message;
      this.#tab.textContent = message;
      this.#updateTimeBar(this.#initialSeconds);
    }
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
}

let timerWorker = new Worker("timerWorker.js");
timerWorker.onmessage = function(event){
  Renderer.updateClockFace(event.data);
};
