'use strict';
const BOARD_SIZE = 8;
let turnOfBlack = true;
let playerTurnOfBlack = true;
let cpuTurnOfBlack = false;
let cpuMode = true;
let nowCpuTurn = false;
let cpuTimeOut = 1500;
let displayCanPutPosition = false;
let nowBoardStatusArray = [];
let pieceCount = ['black', 'white', 'space'];
pieceCount['black'] = 2;
pieceCount['white'] = 2;
pieceCount['space'] = BOARD_SIZE * BOARD_SIZE - pieceCount["black"] - pieceCount["white"];

function initBoardStatusArray() {
  for (let y = 0; y <= BOARD_SIZE + 1; ++y) {
    let line = [];
    for (let x = 0; x <= BOARD_SIZE + 1; ++x) {
      switch (y) {
        case 0:
        case BOARD_SIZE + 1:
          line.push('outzone');
          break;
        case 4:
          switch (x) {
            case 0:
            case BOARD_SIZE + 1:
              line.push('outzone');
              break;
            case 4:
              line.push('white');
              break;
            case 5:
              line.push('black');
              break;
            default:
              line.push('space');
              break;
          }
          break;
        case 5:
          switch (x) {
            case 0:
            case BOARD_SIZE + 1:
              line.push('outzone');
              break;
              case 4:
                line.push('black');
                break;
              case 5:
                line.push('white');
                break;
              default:
                line.push('space');
                break;
          }
          break;
        default:
          switch (x) {
            case 0:
            case BOARD_SIZE + 1:
              line.push('outzone');
              break;
            default:
              line.push('space');
              break;
          }
      }
    }
    nowBoardStatusArray.push(line);
  }
}


let clickedBoard = (e) => {
  let pieceId = e.target.id || e.target.parentElement.id;
  let pieceCoordinate = {
    y: parseInt(pieceId.slice(0, 1)),
    x: parseInt(pieceId.slice(2, 3))
  }
  if (nowBoardStatusArray[pieceCoordinate.y][pieceCoordinate.x] == 'space') {
    if ((turnOfBlack && playerTurnOfBlack) || (nowCpuTurn && cpuTurnOfBlack)) {
      let canTurnOverPosition = searchEnemy('black', 'white', pieceCoordinate);

      if (canTurnOverPosition.length === 0) {
        return;
      }

      let returnValues = turnOver('black', 'white', pieceCoordinate, canTurnOverPosition);

      nowBoardStatusArray = returnValues.nextTurnBoardStatusArray;

      for(let i = 0; i < pieceCount.length; ++i) {
        pieceCount[pieceCount[i]] += returnValues.nextTurnPieceCountDif[pieceCount[i]];
      }

      insertArrayDataToBoard();
      clearCanPutPositionColor();

      if (checkNextTurn('black', 'white') === 1) {
        document.getElementById('white-pass-button').style.display = 'block';
        clearCanPutPositionColor();
      } else if (checkNextTurn('black', 'white') === 2) {
        nextTurnProcess('black', 'white');
        gameEndProcess();
        return;
      }

      nextTurnProcess('black', 'white');
      nowCpuTurn = false;
    } else if ((!(turnOfBlack || playerTurnOfBlack)) || (nowCpuTurn && !(cpuTurnOfBlack))) {
      let canTurnOverPosition = searchEnemy('white', 'black', pieceCoordinate);

      if (canTurnOverPosition.length === 0) {
        return;
      }

      let returnValues = turnOver('white', 'black', pieceCoordinate, canTurnOverPosition);

      nowBoardStatusArray = returnValues.nextTurnBoardStatusArray;

      for (let i = 0; i < pieceCount.length; i++) {
        pieceCount[pieceCount[i]] += returnValues.nextTurnPieceCountDif[pieceCount[i]];
      }

      insertArrayDataToBoard();
      clearCanPutPositionColor();

      if (checkNextTurn('white', 'black') === 1) {
        document.getElementById('black-pass-button').style.display = 'block';
        clearCanPutPositionColor();
      } else if (checkNextTurn('white', 'black') === 2) {
        nextTurnProcess('white', 'black');
        gameEndProcess();
        return;
      }

      nextTurnProcess('white', 'black');
      nowCpuTurn = false;
    }
    if (!(pieceCount["space"])) {
      gameEndProcess();
      return;
    }
  }
  if (cpuMode) {
    if(document.getElementById('white-pass-button').style.display === 'block') {
      let temp = () => {document.getElementById('white-pass-button').click();}
      setTimeout(temp, cpuTimeOut);
    } else {
      if (cpuTurnOfBlack && turnOfBlack) {
        setTimeout(cpuTurn, cpuTimeOut);
      } else if (!(cpuTurnOfBlack || turnOfBlack)) {
        setTimeout(cpuTurn, cpuTimeOut);
      }
    }
  } else {
    playerTurnOfBlack = !playerTurnOfBlack;
  }
}

function searchEnemy(myColor, enemyColor, pieceCoordinate) {
  let canTurnOverPosition = [];
  for (let y = pieceCoordinate.y - 1; y <= pieceCoordinate.y + 1; ++y) {
    for (let x = pieceCoordinate.x - 1; x <= pieceCoordinate.x + 1; ++x) {
      let yDirection = y - pieceCoordinate.y;
      let xDirection = x - pieceCoordinate.x;

      if (nowBoardStatusArray[y][x] == enemyColor && nowBoardStatusArray[y][x] != 'outzone') {
        let searchPosition = { y: y, x: x }
        while (nowBoardStatusArray[searchPosition.y][searchPosition.x] == enemyColor) {
          searchPosition = {
            y: searchPosition.y + yDirection,
            x: searchPosition.x + xDirection
          }
        }
        if (nowBoardStatusArray[searchPosition.y][searchPosition.x] == myColor) {
          canTurnOverPosition.push(searchPosition);
        }
      }
    }
  }
  return canTurnOverPosition;
}

function objectSort(obj) {
  let keys = Object.keys(obj).sort();
  let map = {};
  keys.forEach((key) => {
    map[key] = obj[key];
  });
  return map;
}
function turnOver(myColor, enemyColor, pieceCoordinate, canTurnOverPosition) {
  let nextTurnBoardStatusArray = JSON.parse(JSON.stringify(nowBoardStatusArray));
  let nextTurnPieceCountDif = { "black": 0, "white": 0, "space": -1 }

  nextTurnBoardStatusArray[pieceCoordinate.y][pieceCoordinate.x] = myColor;
  ++nextTurnPieceCountDif[myColor];

  for (let i = 0; i < canTurnOverPosition.length; ++i) {
    let yDirection = (canTurnOverPosition[i].y - pieceCoordinate.y) / Math.abs(canTurnOverPosition[i].y - pieceCoordinate.y);
    let xDirection = (canTurnOverPosition[i].x - pieceCoordinate.x) / Math.abs(canTurnOverPosition[i].x - pieceCoordinate.x);
    let turnOverPosition = { x: pieceCoordinate.x, y: pieceCoordinate.y }

    while (!(JSON.stringify(objectSort(canTurnOverPosition[i])) === JSON.stringify(objectSort(turnOverPosition)))) {
      if(nextTurnBoardStatusArray[turnOverPosition.y][turnOverPosition.x] == enemyColor) {
        nextTurnBoardStatusArray[turnOverPosition.y][turnOverPosition.x] = myColor;
        ++nextTurnPieceCountDif[myColor];
        --nextTurnPieceCountDif[enemyColor];
      }
      if (yDirection) {
        turnOverPosition.y += yDirection;
      } else {
        turnOverPosition.y += 0;
      }

      if (xDirection) {
        turnOverPosition.x += xDirection;
      } else {
        turnOverPosition.x += 0;
      }
    }
  }
  return {
    "nextTurnBoardStatusArray": nextTurnBoardStatusArray,
    "nextTurnPieceCountDif": nextTurnPieceCountDif
  }
}

function canPutEnemy(nowTurnColor, nextTurnColor) {
  let passStatus = true;
  for (let y = 1; y <= BOARD_SIZE; ++y) {
    for (let x = 1; x <= BOARD_SIZE; ++x) {
      if (nowBoardStatusArray[y][x] === 'space') {
        let imagnaryPosition = { y: y, x: x }
        let canTurnOverPosition = searchEnemy(nowTurnColor, nextTurnColor, imagnaryPosition);
        if (canTurnOverPosition.length > 0) {
          if (displayCanPutPosition) {
            paintCanPutPosition(y, x);
          }
          passStatus = false;
        }
      }
    }
  }
  return passStatus;
}

function checkNextTurn(nowTurnColor, nextTurnColor) {
  if (canPutEnemy(nextTurnColor, nowTurnColor)) {
    if (canPutEnemy(nowTurnColor, nextTurnColor)) {
      return 2;
    }
    return 1;
  } else {
    return 0;
  }
}

function paintCanPutPosition(y, x) {
  document.getElementById(y + "-" + x).style.backgroundColor = "palegreen";
}

function clearCanPutPositionColor() {
  for (let y = 1; y <= BOARD_SIZE; ++y) {
    for (let x = 1; x <= BOARD_SIZE; ++x) {
      document.getElementById(y + "-" + x).style.backgroundColor = "rgba(0,0,0,0)"
    }
  }
}

function nextTurnProcess(nowTurnColor, nextTurnColor) {
  turnOfBlack = !turnOfBlack;
  nowPieces();
  changeTurnDisplay(nowTurnColor, nextTurnColor);
}

function changeTurnDisplay(nowTurnColor, nextTurnColor) {
  document.getElementById(`${nowTurnColor}-turn-display`).className = "not-now-turn";
  document.getElementById(`${nextTurnColor}-turn-display`).className = "now-turn";
}

function gameEndProcess() {
  winDecision();
  alert('勝利おめでとうございます');
  nextGameProcess();
  clearCanPutPositionColor();
}

function winDecision() {
  if (pieceCount['black'] === pieceCount['white']) {
    alert('引き分け');
  } else if (pieceCount['black'] > pieceCount['white']) {
    alert('黒の勝利');
  } else {
    alert('白の勝利');
  }
}

function passProcess() {
  if (turnOfBlack) {
    turnOfBlack = !turnOfBlack;
    document.getElementById("black-pass-button").style.display = "none";
    document.getElementById("black-turn-display").className = "not-now-turn";
    document.getElementById("white-turn-display").className = "now-turn";
    clearCanPutPositionColor();
    checkNextTurn('black', 'white');
  } else {
    turnOfBlack = !turnOfBlack;
    document.getElementById("white-pass-button").style.display = "none";
    document.getElementById("black-turn-display").className = "now-turn";
    document.getElementById("white-turn-display").className = "not-now-turn";
    clearCanPutPositionColor();
    checkNextTurn('white', 'black');
  }
}

function nextGameProcess () {
  let nextGame = confirm('続けてプレイしますか');
  if (nextGame) {
    location.href = location.href;
  } else {
    document.getElementById("next-game-button").style.display = "block";
  }
}

function nowPieces() {
  document.getElementById("now-white-pieces").innerHTML = pieceCount["white"];
  document.getElementById("now-black-pieces").innerHTML = pieceCount["black"];
}

function cpuTurn() {
  let cpuPutPosition = decideCpuPutPosition();
  nowCpuTurn = true;
  document.getElementById(cpuPutPosition.y + "-" + cpuPutPosition.x).click();
}

function decideCpuPutPosition() {
  let boardScoreArray =[];
  let higherScore = 0;
  let higherScorePosition = { y: 0, x: 0 }
  for (let y = 0; y <= BOARD_SIZE + 1; ++y) {
    let line = [];
    for (let x = 0; x <= BOARD_SIZE + 1; ++x) {
      if (nowBoardStatusArray[y][x] === 'space') {
        let nowPositionScore = 0;
        let canTurnOverPosition = [];
        let imagnaryPosition = { y: y, x: x }
        if (cpuTurnOfBlack) {
          canTurnOverPosition = searchEnemy('black', 'white', imagnaryPosition);
        } else {
          canTurnOverPosition = searchEnemy('white', 'black', imagnaryPosition);
        }
        if (canTurnOverPosition.length === 0) {
          line.push([0]);
          continue;
        }
        for (let i = 0; i < canTurnOverPosition.length; ++i) {
          let yDirection = Math.abs(canTurnOverPosition[i].y - y);
          let xDirection = Math.abs(canTurnOverPosition[i].x - x);

          if (yDirection && xDirection) {
            nowPositionScore += yDirection - 1;
          } else {
            if (yDirection) {
              nowPositionScore += yDirection - 1;
            } else {
              nowPositionScore += xDirection - 1;
            }
          }
        }
        line.push([nowPositionScore]);
      } else {
        line.push([0]);
      }
    }
    boardScoreArray.push(line);
  }
  for (let y = 0; y < BOARD_SIZE + 1; ++y) {
    for (let x = 0; x < BOARD_SIZE + 1; ++x) {
      if (higherScore < boardScoreArray[y][x]) {
        higherScore = boardScoreArray[y][x];
        higherScorePosition = { y: y, x: x }
      }
    }
  }
  return higherScorePosition;
}

function changeDisplayCanPutPosition() {
  displayCanPutPosition = !displayCanPutPosition;
  if (displayCanPutPosition) {
    document.getElementById("display-can-put-position-button").innerHTML = "Spot To Put：<br>DISPLAY";
    if (turnOfBlack) {
      canPutEnemy('black', 'white');
    } else {
      canPutEnemy('white', 'black');
    }
  } else {
    document.getElementById("display-can-put-position-button").innerHTML = "Spot To Put：<br>HIDE";
    clearCanPutPositionColor();
  }
}

function changeCpuMode() {
  cpuMode = !cpuMode;
  if (cpuMode) {
    document.getElementById("change-cpu-mode-button").innerHTML = "CPU: ON";
    cpuTurnOfBlack = !playerTurnOfBlack
  } else {
    document.getElementById("change-cpu-mode-button").innerHTML = "CPU: OFF";
  }
}

function initBoard() {
  for (let y = 0; y < BOARD_SIZE + 1; ++y) {
    if (y === 0) {
      let htmlTr = document.createElement('tr');
      let htmlTh = document.createElement('th');

      document.getElementById('board').appendChild(htmlTr);
      htmlTr.appendChild(htmlTh);

      for (let x = 0; x < BOARD_SIZE + 1; ++x) {
        if (x !== 0) {
          let htmlTh = document.createElement('th');

          htmlTh.innerHTML = x;
          htmlTr.appendChild(htmlTh);
        }
      }
    } else {
      let htmlTr = document.createElement('tr');
      let htmlTh = document.createElement('th');

      htmlTh.innerHTML = y;
      document.getElementById('board').appendChild(htmlTr);
      htmlTr.appendChild(htmlTh);

      for (let x = 0; x < BOARD_SIZE + 1; ++x) {
        if (x !== 0) {
          let htmlTd = document.createElement('td');
          let htmlDiv = document.createElement('div');

          htmlDiv.addEventListener('click', clickedBoard, false);
          htmlDiv.id = y + '-' + x;
          htmlTr.appendChild(htmlTd);
          htmlTd.appendChild(htmlDiv);
        }
      }
    }
  }
}

function insertArrayDataToBoard() {
  for (let y = 0; y <= BOARD_SIZE; ++y) {
    for (let x = 0; x <= BOARD_SIZE; ++x) {
      if (nowBoardStatusArray[y][x] === 'black') {
        document.getElementById(y + '-' + x).className = 'black';
      } else if (nowBoardStatusArray[y][x] === 'white') {
        document.getElementById(y + '-' + x).className = 'white';
      }
    }
  }
}
