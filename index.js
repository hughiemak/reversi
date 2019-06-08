
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

                console.log("getNearestNorthTail(x, y): " + getNearestSouthTail(x, y))

                if (getNearestSouthTail(x,y) != null) {
                    flipSouthEnemies({x:x, y:y}, getNearestSouthTail(x,y))
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

function displayChessScores(){
    displayNoOfWhite()
    displayNoOfBlack()
}

function displayNoOfWhite(){
    var element = $(".whiteScore")
    element.html(noOfWhite);

}

function displayNoOfBlack(){
    var element = $(".blackScore")
    element.html(noOfBlack);
}

function switchGameTurn(){
    if (gameTurn == 0) {
        gameTurn = 1
    }else{
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
    if (gameTurn == 0){
        placeWhiteChessOn(x, y)
    }else{
        placeBlackChessOn(x, y)
    }
}

function placeWhiteChessOn(x, y) {
    var element = getSquare(x, y)
    element.empty();
    element.append('<div class="whiteChess"></div>')
    // square.append('<div class="chess"></div>')
    gameState[y][x] = 0;
    console.log("gameState: " + gameState);
    // element.unbind();
    updateChessCount()
}

function placeBlackChessOn(x, y) {
    var element = getSquare(x, y)
    element.empty();
    element.append('<div class="blackChess"></div>')
    // square.append('<div class="chess"></div>')
    gameState[y][x] = 1;
    console.log("gameState: " + gameState);
    // element.unbind();
    updateChessCount()
}

function updateChessCount(){
    var whiteCount = 0
    var blackCount = 0

    gameState.forEach(element => {
        element.forEach(element => {
            if (element == 0) {
                whiteCount += 1
            }else if (element == 1){
                blackCount += 1
            }
        });
    });

    noOfBlack = blackCount;
    noOfWhite = whiteCount;

    console.log("noOfBlack: " + noOfBlack + ", noOfWhite: " + noOfWhite)
    displayChessScores()
}

function isEmpty(x, y){
    if (gameState[y][x] == null){
        return true
    }else{
        return false
    }
}

function canPlaceChess(x, y){
    if (isEmpty(x, y)){

    }
}

function getNearestSouthTail(x, y){

    let squareUntilWall = y;

    console.log("squareUntilWall: "+squareUntilWall)

    var tail = null;

    if (squareUntilWall == 0){
        tail = null
    }else{
        let nextSquareState = gameState[y-1][x];

        console.log("nextSquareState: " + nextSquareState)

        if (nextSquareState == null || nextSquareState == gameTurn) {
            tail = null
        }else{
            for(var i = y - 2; i >= 0; i--){
                let squareState = gameState[i][x];
                console.log("squareState: "+squareState)
                if (squareState == gameTurn){
                    console.log("found an ally")
                    tail = {x:x, y:i}
                    i = -1
                }else if (squareState == null){
                    tail = null
                    i = -1
                }else if (squareState != gameTurn){

                }
            }
        }
    }

    return tail
}

function flipSouthEnemies(head, tail){
    let x = head.x
    let headY = head.y;
    let tailY = tail.y;

    for(var i = headY - 1; i >= tailY; i--){
        placeChessOn(x, i)
    }
}

function getNearestNorthTail(x, y){
    let maxColumnIndex = gameState.length - 1;
    let squareUntilWall = maxColumnIndex - y;

    console.log("squareUntilWall: "+squareUntilWall)

    var tail = null;

    if (squareUntilWall == 0){
        tail = null
    }else{
        let nextSquareState = gameState[y+1][x];

        console.log("nextSquareState: " + nextSquareState)

        if (nextSquareState == null || nextSquareState == gameTurn) {
            tail = null
        }else{
            for(var i = y + 2; i <= maxColumnIndex; i++){
                let squareState = gameState[i][x];
                console.log("squareState: "+squareState)
                if (squareState == gameTurn){
                    console.log("found an ally")
                    tail = {x:x, y:i}
                    i = maxColumnIndex + 1
                }else if (squareState == null){
                    tail = null
                    i = maxColumnIndex + 1
                }else if (squareState != gameTurn){

                }
            }
        }
    }

    return tail

}

function flipNorthEnemies(head, tail){
    let x = head.x
    let headY = head.y;
    let tailY = tail.y;

    for(var i = headY + 1; i <= tailY; i++){
        placeChessOn(x, i)
    }
}

function canFlipNorth(x, y){
    let maxColumnIndex = gameState.length - 1;
    var foundClosingChess = false;
    let squareUntilWall = maxColumnIndex - y;

    for(var i = y + 1; i <= maxColumnIndex; i++) {
        let squareState = gameState[x][i];
        console.log("canFlipNorth")
        if (squareState == gameTurn){
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