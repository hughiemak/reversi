
var gameState =
    [
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
    ];

var gameTurn = 0;

var noOfWhite;
var noOfBlack;

function onload() {

    var boardContainer = $(".board-container")
    boardContainer.hide();

    for (var y = 7; y >= 0; y--) {
        for (var x = 0; x <= 7; x++) {

            renderSqaure(x, y)

            let square = getSquare(x, y)

            square.data("position", { x: x, y: y })

            square.click(function (event) {
                console.log("DEBUG")
                var element = $("#" + event.currentTarget.id)
                console.log("x: " + element.data("position").x + ", y: " + element.data("position").y)
                var x = element.data("position").x
                var y = element.data("position").y

                console.log("getNearestNorthTail(x, y): " + getNearestNorthTail(x, y))

                if (getNearestNorthTail(x, y) != null) {
                    // flipSouthWestEnemies({ x: x, y: y }, getNearestSouthWestTail(x, y))
                    flipEnemiesInCustomDirection({ x: x, y: y }, getNearestNorthTail(x, y))
                }

                //if chess has not been placed
                // if (canPlaceChess(x,y)){
                placeChessOn(x, y)
                switchGameTurn()
                // }

            })
        }
    }

    initGameState()
}

function getSquareState(x, y) {
    return gameState[y][x]
}

function setSqaureStateWhite(x, y) {
    gameState[y][x] = 0
}

function setSqaureStateBlack(x, y) {
    gameState[y][x] = 1
}

function setSquareStateNull(x, y) {
    gameState[y][x] = null
}

function displayChessScores() {
    displayNoOfWhite()
    displayNoOfBlack()
}

function displayNoOfWhite() {
    var element = $(".whiteScore")
    element.html(noOfWhite);

}

function displayNoOfBlack() {
    var element = $(".blackScore")
    element.html(noOfBlack);
}

function switchGameTurn() {
    if (gameTurn == 0) {
        gameTurn = 1
    } else {
        gameTurn = 0
    }
}

function initGameState() {
    //33, 44 black
    placeBlackChessOn(3, 3)
    placeBlackChessOn(4, 4)
    //34, 43 white
    placeWhiteChessOn(3, 4)
    placeWhiteChessOn(4, 3)
}

function renderSqaure(x, y) {
    var selectorString = 'squareId_' + x + '' + y;
    $('#squares-container').append('<div id="' + selectorString + '" class="square"></div>')
}

function getSquare(x, y) {
    var element = $("#" + "squareId_" + x + "" + y)
    return element
}

function placeChessOn(x, y) {
    if (gameTurn == 0) {
        placeWhiteChessOn(x, y)
    } else {
        placeBlackChessOn(x, y)
    }
}

function placeWhiteChessOn(x, y) {
    var element = getSquare(x, y)
    element.empty();
    element.append('<div class="whiteChess"></div>')
    // square.append('<div class="chess"></div>')
    setSqaureStateWhite(x, y)
    console.log("gameState: " + gameState);
    // element.unbind();
    updateChessCount()
}

function placeBlackChessOn(x, y) {
    var element = getSquare(x, y)
    element.empty();
    element.append('<div class="blackChess"></div>')
    // square.append('<div class="chess"></div>')
    setSqaureStateBlack(x, y)
    console.log("gameState: " + gameState);
    // element.unbind();
    updateChessCount()
}

function updateChessCount() {
    var whiteCount = 0
    var blackCount = 0

    gameState.forEach(element => {
        element.forEach(element => {
            if (element == 0) {
                whiteCount += 1
            } else if (element == 1) {
                blackCount += 1
            }
        });
    });

    noOfBlack = blackCount;
    noOfWhite = whiteCount;

    console.log("noOfBlack: " + noOfBlack + ", noOfWhite: " + noOfWhite)
    displayChessScores()
}

function isEmpty(x, y) {
    if (getSquareState(x, y) == null) {
        return true
    } else {
        return false
    }
}

function canPlaceChess(x, y) {
    if (isEmpty(x, y)) {

    }
}

function getMaxRowIndex() {
    let count = gameState[0].length
    return count - 1
}

function getMaxColumnIndex() {
    let count = gameState.length
    return count - 1
}

function processMove(x, y){

    var head = {x:x, y:y}

    var validMove = false;

    let northTail = getNearestNorthTail(x, y);
    if (northTail != null){
        flipEnemiesInCustomDirection(head, northTail)
        validMove = true;
    }

    let northEastTail = getNearestNorthEastTail(x, y)
    if (northEastTail != null){
        flipEnemiesInCustomDirection(head, northEastTail);
        validMove = true;
    }


}

function getNearestTailWithCustomDirection(x, y, xDir, yDir){
    var tail = null
    var xSquareUntilWall;
    var ySquareUntilWall;

    var unitXDir = xDir/Math.abs(xDir);
    var unitYDir = yDir/Math.abs(yDir);

    if (xDir < 0) {
        xSquareUntilWall = x
    }else if (xDir > 0){
        xSquareUntilWall = getMaxRowIndex() - x
    }

    if (yDir < 0) {
        ySquareUntilWall = y
    }else if (yDir > 0){
        ySquareUntilWall = getMaxColumnIndex() - y
    }

    console.log("xSquareUntilWall: " + xSquareUntilWall + ", ySquareUntilWall: " + ySquareUntilWall)

    let squareUntilWall = Math.min(xSquareUntilWall, ySquareUntilWall);

    console.log("squareUntilWall: " + squareUntilWall)

    if (squareUntilWall == 0) {
        console.log("squareUntilWall == 0")
        tail = null
    } else {
        var nextSquareState = getSquareState(x + unitXDir, y + unitYDir);

        if (nextSquareState == null || nextSquareState == gameTurn) {
            console.log("nextSquareState == null || nextSquareState == gameTurn")
            tail = null
        } else {
            var i, j;

            let shouldIncrementX = shouldIncrement(unitXDir)
            let shouldIncrementY = shouldIncrement(unitYDir)

            console.log("shouldIncrementX: " + shouldIncrementX)
            console.log("shouldIncrementY: " + shouldIncrementY)

            for(i = x + unitXDir * 2, j = y + unitYDir * 2; squareUntilWall >= 0 ; shouldIncrementX? i++ : i--, shouldIncrementY? j++:j--, squareUntilWall--){
                var squareState = getSquareState(i, j);
                console.log("i: "  + i + ", j: "  + j +", squareState: " + squareState)
                if (squareState == gameTurn) {
                    //ally
                    console.log("Found Ally!")
                    tail = { x: i, y: j }
                    squareUntilWall = -1
                } else if (squareState == null) {
                    console.log("Empty Tail!")
                    //empty
                    tail = null
                    squareUntilWall = -1
                } else if (squareState != gameTurn) {
                    //enemy
                }
            }

        }

    }
    return tail
}

// function wallIsHit(unitDir, ){

// }

function shouldIncrement(unitDir){
    if(unitDir > 0){
        return true
    }else if (unitDir < 0){
        return false
    }
}

function operateFlipIndex(unitDir, index){
    if(unitDir > 0){
        increment(index)
    }else if (unitDir < 0){
        decrement(index)
    }
}

function decrement(k){
    k--
}

function increment(k){
    k++
}

function getNearestSouthWestTail(x, y) {
    return getNearestTailWithCustomDirection(x, y, -1, -1)
}

function getNearestSouthEastTail(x, y) {
    return getNearestTailWithCustomDirection(x, y, 1, -1)
}

function getNearestNorthEastTail(x, y) {
    return getNearestTailWithCustomDirection(x, y, 1, 1)
}

function getNearestNorthWestTail(x, y) {
    return getNearestTailWithCustomDirection(x, y, -1, 1)
}

function flipEnemiesInCustomDirection(head, tail){
    let headY = head.y;
    let tailY = tail.y;
    let headX = head.x;
    let tailX = tail.x;

    var shouldKeepXUnchanged = tailX == headX;
    var shouldKeepYUnchanged = tailY == headY;

    var shouldIncrementX = tailX > headX
    var shouldIncrementY = tailY > headY

    var i, j;

    for(shouldKeepXUnchanged ? (i = headX):(shouldIncrementX ? (i = headX +1) : (i = headX - 1)), shouldKeepYUnchanged ? (j = headY) : (shouldIncrementY ? (j = headY + 1) : (j = headY - 1));
        shouldKeepXUnchanged ? (i == tailX):(shouldIncrementX ? (i <= tailX) : (i >= tailX)), shouldKeepYUnchanged ? (j == tailY):(shouldIncrementY ? (j <= tailY) : (j >= tailY));
        shouldKeepXUnchanged ? (i = i): (shouldIncrementX ? (i++) : (i--)), shouldKeepYUnchanged ? (j = j):(shouldIncrementY ? (j++) : (j--))){
            placeChessOn(i, j)
    }

}

function flipSouthWestEnemies(head, tail) {
    let headY = head.y;
    let tailY = tail.y;
    let headX = head.x;
    let tailX = tail.x;

    var i, j;

    for (i = headX - 1, j = headY - 1; i >= tailX, j >= tailY; i--, j--) {
        placeChessOn(i, j)
    }
}

function getNearestWestTail(x, y) {
    let squareUntilWall = x;

    console.log("squareUntilWall: " + squareUntilWall)

    var tail = null;

    if (squareUntilWall == 0) {
        tail = null
    } else {
        let nextSquareState = getSquareState(x - 1, y)

        console.log("nextSquareState: " + nextSquareState)

        if (nextSquareState == null || nextSquareState == gameTurn) {
            tail = null
        } else {
            for (var i = x - 2; i >= 0; i--) {
                let squareState = getSquareState(i, y);
                console.log("squareState: " + squareState)
                if (squareState == gameTurn) {
                    console.log("found an ally")
                    tail = { x: i, y: y }
                    i = -1
                } else if (squareState == null) {
                    tail = null
                    i = -1
                } else if (squareState != gameTurn) {

                }
            }
        }
    }

    return tail
}

function flipWestEnemies(head, tail) {
    let y = head.y
    let headX = head.x;
    let tailX = tail.x;

    for (var i = headX - 1; i >= tailX; i--) {
        placeChessOn(i, y)
    }
}

function getNearestEastTail(x, y) {
    let maxRowIndex = gameState[y].length - 1;
    let squareUntilWall = maxRowIndex - y;

    console.log("squareUntilWall: " + squareUntilWall)

    var tail = null;

    if (squareUntilWall == 0) {
        tail = null
    } else {
        let nextSquareState = getSquareState(x + 1, y)
        console.log("nextSquareState: " + nextSquareState)
        if (nextSquareState == null || nextSquareState == gameTurn) {
            tail = null
        } else {
            for (var i = x + 2; i <= maxRowIndex; i++) {
                let squareState = getSquareState(i, y);
                console.log("squareState: " + squareState)
                if (squareState == gameTurn) {
                    console.log("found an ally")
                    tail = { x: i, y: y }
                    i = maxRowIndex + 1
                } else if (squareState == null) {
                    tail = null
                    i = maxRowIndex + 1
                } else if (squareState != gameTurn) {

                }
            }
        }
    }
    return tail
}

function flipEastEnemies(head, tail) {
    let y = head.y
    let headX = head.x;
    let tailX = tail.x;

    for (var i = headX + 1; i <= tailX; i++) {
        placeChessOn(i, y)
    }
}

function getNearestSouthTail(x, y) {

    let squareUntilWall = y;

    console.log("squareUntilWall: " + squareUntilWall)

    var tail = null;

    if (squareUntilWall == 0) {
        tail = null
    } else {
        let nextSquareState = getSquareState(x, y - 1);

        console.log("nextSquareState: " + nextSquareState)

        if (nextSquareState == null || nextSquareState == gameTurn) {
            tail = null
        } else {
            for (var i = y - 2; i >= 0; i--) {
                let squareState = getSquareState(x, i);
                console.log("squareState: " + squareState)
                if (squareState == gameTurn) {
                    console.log("found an ally")
                    tail = { x: x, y: i }
                    i = -1
                } else if (squareState == null) {
                    tail = null
                    i = -1
                } else if (squareState != gameTurn) {

                }
            }
        }
    }

    return tail
}

function flipSouthEnemies(head, tail) {
    let x = head.x
    let headY = head.y;
    let tailY = tail.y;

    for (var i = headY - 1; i >= tailY; i--) {
        placeChessOn(x, i)
    }
}

function getNearestNorthTail(x, y) {
    let maxColumnIndex = gameState.length - 1;
    let squareUntilWall = maxColumnIndex - y;

    console.log("squareUntilWall: " + squareUntilWall)

    var tail = null;

    if (squareUntilWall == 0) {
        tail = null
    } else {
        let nextSquareState = getSquareState(x, y + 1);

        console.log("nextSquareState: " + nextSquareState)

        if (nextSquareState == null || nextSquareState == gameTurn) {
            tail = null
        } else {
            for (var i = y + 2; i <= maxColumnIndex; i++) {
                let squareState = getSquareState(x, i);
                console.log("squareState: " + squareState)
                if (squareState == gameTurn) {
                    console.log("found an ally")
                    tail = { x: x, y: i }
                    i = maxColumnIndex + 1
                } else if (squareState == null) {
                    tail = null
                    i = maxColumnIndex + 1
                } else if (squareState != gameTurn) {

                }
            }
        }
    }

    return tail

}

function flipNorthEnemies(head, tail) {
    let x = head.x
    let headY = head.y;
    let tailY = tail.y;

    for (var i = headY + 1; i <= tailY; i++) {
        placeChessOn(x, i)
    }
}

function canFlipNorth(x, y) {
    let maxColumnIndex = gameState.length - 1;
    var foundClosingChess = false;
    let squareUntilWall = maxColumnIndex - y;

    for (var i = y + 1; i <= maxColumnIndex; i++) {
        let squareState = getSquareState(x, i);
        console.log("canFlipNorth")
        if (squareState == gameTurn) {
            foundClosingChess = true
            continue
        }
        return false

    }

    // if (squareUntilWall > 0) {
    //     for(var i = 1; i <= squareUntilWall; i++){
    //         let squareState = gameState[x][y + i];
    //         if (squareState == null){
    //             canFindNorthAlly = false
    //         }else if (squareState == gameTurn){
    //             if (i == 1) {
    //                 console.log(i + ": squareState == gameTurn")
    //                 canFindNorthAlly = false
    //             }else{
    //                 console.log(i + ": squareState == gameTurn")
    //                 canFindNorthAlly = true
    //                 return false
    //             }
    //         }else if (squareState != gameTurn){
    //             if (i == squareUntilWall){
    //                 console.log(i + ": squareState != gameTurn")
    //                 canFindNorthAlly = false
    //             }else{
    //                 console.log(i + ": squareState != gameTurn")
    //                 continue
    //             }
    //         }
    //     }
    // }else{
    //     console.log("Hit the Wall")
    //     canFindNorthAlly = false
    // }

    // return canFindNorthAlly
}

window.onload = onload();


// <!-- a row 1-->
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <!-- a row 2-->
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <!-- a row 3-->
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <!-- a row 4-->
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <!-- a row 5-->
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <!-- a row 6-->
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <!-- a row 7-->
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <!-- a row 8-->
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <!-- a row 9-->
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <!-- a row 10-->
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>
//         <div class="square"></div>