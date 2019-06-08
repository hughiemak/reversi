
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
                var element = $("#" + event.target.id)
                // console.log("x: " + element.data("position").x + ", y: " + element.data("position").y)
                var x = element.data("position").x
                var y = element.data("position").y
                placeChessOn(x, y)
                switchGameTurn()
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
    element.append('<div class="whiteChess"></div>')
    // square.append('<div class="chess"></div>')
    gameState[y][x] = 0;
    console.log("gameState: " + gameState);
    element.unbind();
    updateChessCount()
}

function placeBlackChessOn(x, y) {
    var element = getSquare(x, y)
    element.append('<div class="blackChess"></div>')
    // square.append('<div class="chess"></div>')
    gameState[y][x] = 1;
    console.log("gameState: " + gameState);
    element.unbind();
    updateChessCount()
}

function updateChessCount(){
    var whiteCount = 0
    var blackCount = 0

    gameState.forEach(element => {
        element.forEach(element => {
            if (element == 1) {
                whiteCount += 1
            }else if (element == 0){
                blackCount += 1
            }
        });
    });

    noOfBlack = blackCount;
    noOfWhite = whiteCount;

    console.log("noOfBlack: " + noOfBlack + ", noOfWhite: " + noOfWhite)
    displayChessScores()
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