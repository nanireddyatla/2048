var board;
var score = 0;
var rows = 4;
var columns = 4;

let touchstartX = 0;
let touchstartY = 0;
let touchendX = 0;
let touchendY = 0;

window.onload = function () {
    displayScores();
    setGame();

    const gestureZone = document.getElementById('board');

    gestureZone.addEventListener('touchstart', function (event) {
        touchstartX = event.changedTouches[0].screenX;
        touchstartY = event.changedTouches[0].screenY;
    }, false);

    gestureZone.addEventListener('touchend', function (event) {
        touchendX = event.changedTouches[0].screenX;
        touchendY = event.changedTouches[0].screenY;
        handleGesture();
    }, false);
}

window.onbeforeunload = function () {
    if (score != 0) saveScore(score);
}

function makeArray(w, h, val) {
    var arr = [];
    for (let i = 0; i < h; i++) {
        arr[i] = [];
        for (let j = 0; j < w; j++) {
            arr[i][j] = val;
        }
    }
    return arr;
}

function setGame() {
    board = makeArray(rows, columns, 0)

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            let num = board[r][c];
            updateTile(tile, num);
            document.getElementById("board").append(tile);
        }
    }
    setTwo();
    setTwo();
}

function updateTile(tile, num) {
    tile.innerText = "";
    tile.classList.value = "";
    tile.classList.add("tile");
    if (num > 0) {
        tile.innerText = num.toString();
        if (num <= 4096) {
            tile.classList.add("x" + num.toString());
        } else {
            tile.classList.add("x8192");
        }
    }
}

function handleGesture() {

    const diffX = touchendX - touchstartX;
    const diffY = touchendY - touchstartY;
    const ratioX = Math.abs(diffX / diffY);
    const ratioY = Math.abs(diffY / diffX);
    const absDiff = Math.abs(ratioX > ratioY ? diffX : diffY);

    if (absDiff < 30) {
        return;
    }
    if (touchendY === touchstartY) {
        // console.log('Tap');
        dir.T = true;
    } else if (ratioX > ratioY) {
        if (diffX >= 0) {
            // console.log('right swipe');
            slideRight();
            setTwo();
        } else {
            // console.log('left swipe');
            slideLeft();
            setTwo();
        }
    } else {
        if (diffY >= 0) {
            // console.log('down swipe');
            slideDown();
            setTwo();
        } else {
            // console.log('up swipe');
            slideUp();
            setTwo();
        }
    }
    document.getElementById("score").innerText = score;
    doCheck(score);
}

document.addEventListener('keyup', (e) => {
    if (e.code == "ArrowLeft") {
        slideLeft();
        setTwo();
    }
    else if (e.code == "ArrowRight") {
        slideRight();
        setTwo();
    }
    else if (e.code == "ArrowUp") {
        slideUp();
        setTwo();
    }
    else if (e.code == "ArrowDown") {
        slideDown();
        setTwo();
    }
    document.getElementById("score").innerText = score;
    doCheck(score);
})

function filterZero(row) {
    return row.filter(num => num != 0);
}

function slide(row) {
    row = filterZero(row);
    for (let i = 0; i < row.length - 1; i++) {
        if (row[i] == row[i + 1]) {
            row[i] *= 2;
            row[i + 1] = 0;
            score += row[i];
        }
    }
    row = filterZero(row);
    while (row.length < columns) {
        row.push(0);
    }
    return row;
}

function slideLeft() {
    for (let r = 0; r < rows; r++) {
        let row = board[r];
        row = slide(row);
        board[r] = row;
        for (let c = 0; c < columns; c++) {
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

function slideRight() {
    for (let r = 0; r < rows; r++) {
        let row = board[r];
        row.reverse();
        row = slide(row)
        board[r] = row.reverse();
        for (let c = 0; c < columns; c++) {
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

function slideUp() {
    for (let c = 0; c < columns; c++) {
        let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
        row = slide(row);
        for (let r = 0; r < rows; r++) {
            board[r][c] = row[r];
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

function slideDown() {
    for (let c = 0; c < columns; c++) {
        let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
        row.reverse();
        row = slide(row);
        row.reverse();
        for (let r = 0; r < rows; r++) {
            board[r][c] = row[r];
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

function setTwo() {
    if (!hasEmptyTile()) {
        return;
    }
    let found = false;
    while (!found) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        if (board[r][c] == 0) {
            board[r][c] = 2;
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            tile.innerText = "2";
            tile.classList.add("x2");
            found = true;
        }
    }
}

function hasEmptyTile() {
    let count = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] == 0) {
                return true;
            }
        }
    }
    return false;
}


function isGameOver() {
    if (hasEmptyTile()) return false;
    return checkHorGameOver() && checkVerGameOver();
}

function checkHorGameOver() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns - 1; j++) {
            if (board[i][j] == board[i][j + 1]) return false;
        }
    }
    return true;
}

function checkVerGameOver() {
    for (let i = 0; i < rows - 1; i++) {
        for (let j = 0; j < columns; j++) {
            if (board[i][j] === board[i + 1][j]) return false;
        }
    }
    return true;
}

function doCheck(score) {
    if (isGameOver()) {
        alert("Game Over and your score is : " + score + '.');
        location.reload();
    }
}

function saveScore(score) {
    let scores = localStorage.getItem('gameScores');

    scores = scores ? JSON.parse(scores) : [];

    const newScore = {
        score: score,
        timestamp: new Date().toISOString()
    };

    scores.push(newScore);

    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 5);

    localStorage.setItem('gameScores', JSON.stringify(scores));
}

function displayScores() {
    let scoresContainer = document.getElementById('scoreboard');

    let scores = localStorage.getItem('gameScores');

    scores = scores ? JSON.parse(scores) : [];

    scoresContainer.innerHTML = '';

    scores.forEach((score, index) => {
        let listItem = document.createElement('li');
        let date = new Date(score.timestamp);
        listItem.textContent = `Score ${index + 1}: ${score.score} (Timestamp: ${date})`;
        scoresContainer.appendChild(listItem);
    });
}
