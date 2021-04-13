'use strict';

function clickedGameStartButton() {
  document.getElementById("black-pass-button").addEventListener("click", passProcess, false);
  document.getElementById("white-pass-button").addEventListener("click", passProcess, false);
  document.getElementById("next-game-button").addEventListener("click", nextGameProcess, false);
  document.getElementById("display-can-put-position-button").addEventListener("click", changeDisplayCanPutPosition, false);
  document.getElementById("change-cpu-mode-button").addEventListener("click", changeCpuMode, false);

  initBoard();
  initBoardStatusArray();
  insertArrayDataToBoard();
  checkNextTurn("white", "black");

  document.getElementById("grid").style.display = "grid";
  document.getElementById("start-game-button").style.display = "none";
}

document.getElementById("start-game-button").addEventListener("click", clickedGameStartButton, false);