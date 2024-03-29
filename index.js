// import alerts from "/alerts.js"

// var util = require('util');
// var socket = io('http://192.168.48.37:3000/');
//192.168.48.37:3000/
//138.19.113.68

// var socket = io('http://localhost:3000/');
const GameModeType = {
    offline: "offline",
    lobby: "lobby",
    room: "room"
}

var socket

try {
    socket = io.connect('https://arcane-wave-75215.herokuapp.com/', {
    // socket = io.connect('https://secured-server-reversi-server.apps.us-west-2.online-starter.openshift.com/', {
        // socket = io.connect('http://localhost:3000', {

        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 99999
    });
    gameMode = GameModeType.lobby

} catch (error) {
    alert("Fail to initialize socket io. Game will enter offline mode.")
    gameMode = GameModeType.offline;
}

const abortKey = "q"

var mySocketId

var playerName

var gameMode;

var isHost;

var memberToken;

// var offlineMode;

var activeRoomId;

var loggedInUsername;

// var chessColor = 0;

// var gameDefaultState = [
//     [null, null, null, null, null, null, null, null],
//     [null, null, null, null, null, null, null, null],
//     [null, null, null, null, null, null, null, null],
//     [null, null, null, null, null, null, null, null],
//     [null, null, null, null, null, null, null, null],
//     [null, null, null, null, null, null, null, null],
//     [null, null, null, null, null, null, null, null],
//     [null, null, null, null, null, null, null, null],
// ];

var usernameHolder;

var gameState = [
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
var enoughPlayer = null;

var noOfWhite;
var noOfBlack;

var directions = [
    [0, 1],
    [1, 1],
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, -1],
    [-1, 0],
    [-1, 1]
]

var InputStates = Object.freeze({
    "texting": "texting",
    "regUsername": "regUsername",
    "regPassword": "regPassword",
    "logUsername": "logUsername",
    "logPassword": "logPassword",
    "roomId": "roomId"
})

var inputState = InputStates.texting;

function connectToSocket() {

}

function emitMove(x, y) {

    if (gameMode == GameModeType.room /*&& isYourTurn()*/) {
        console.log("emitting move to server")

        socket.emit("emit move", { x: x, y: y }, activeRoomId, socket.id)
    }


}

function emit() {

    socket.emit('emit from client', null);
}

function initServerEmitHandler() {



    socket.on('connect', function () {
        console.log('connected to server');
        $("#connection-status").text("connected to server")
        mySocketId = socket.id
        console.log("mySocketId: " + mySocketId)
        playerName = "Player_" + mySocketId.substring(0, 4)

        addMessage("Welcome to the lobby!")

        // setInputPlaceholder(trimmedSocketId(mySocketId))
        // addMessage(playerName)

    });

    socket.on('disconnect', function () {
        console.log('disconnected to server');
        $("#connection-status").text("disconnected to server")

    });

    socket.on('reconnect', function () {
        console.log('reconnected to server');
        $("#connection-status").text("reconnected to server")

    });

    socket.on('emit move from server', function (move) {
        console.log(JSON.stringify(move));

        let x = move.x;
        let y = move.y;

        processMove(x, y)

    })

    socket.on('room full msg from server', function (sockets) {
        // alert("A player enter your room. Let's go!")

        addMessage(sockets.guest + " joined your room. Let's go!")
        addMessage("You are white. White will move first.")

        setEnoughPlayer(true)

        // this.enoughPlayer = true;
        // console.log("enoughPlayer: " + this.enoughPlayer)


    })

    socket.on('emit from server', function (msg) {
        // alert("yoyo")
        console.log(msg)
    })

    socket.on("broadcast room message from server", function(broadcast){
        const sender = broadcast.sender
        const text = broadcast.text

        const displayText = sender + ": " + text

        addMessage(displayText)
    })

    socket.on("broadcast lobby message from server", function(broadcast){
        const sender = broadcast.sender
        const text = broadcast.text

        const displayText = sender + ": " + text

        addMessage(displayText)
    })
}

function onload() {

    var boardContainer = $(".board-container")
    boardContainer.hide();

    for (var y = 7; y >= 0; y--) {
        for (var x = 0; x <= 7; x++) {

            renderSqaure(x, y)

            let square = getSquare(x, y)

            square.data("position", { x: x, y: y })

            square.click(function (event) {

                console.log("isYourTurn(): " + isYourTurn())
                console.log("gameMode: " + gameMode + ", enoughPlayer: " + enoughPlayer)
                console.log("activeRoomId: " + activeRoomId)
                if (!isYourTurn() || (gameMode == GameModeType.room && !enoughPlayer)) {
                    //disable click
                    return
                }
                // console.log("DEBUG")
                console.log("gameTurn: " + gameTurn)
                var element = $("#" + event.currentTarget.id)
                console.log("x: " + element.data("position").x + ", y: " + element.data("position").y)
                var x = element.data("position").x
                var y = element.data("position").y

                if (getSquareState(x, y) == null) {

                    emitMove(x, y)
                    processMove(x, y)

                }

            })
        }
    }



    addCreateRoomButton()

    addJoinRoomByIdButton()

    addLeaveRoomButton()

    // leaveRoom()

    if (gameMode == GameModeType.offline) {
        enterOfflineMode();
    } else {
        enterLobby();
        initServerEmitHandler()
    }

    // initGameState()

    // canEmptySquaresPlaceChess()

    addRegisterButton()
    addLoginButton()
    addLogoutButton()

    clearInputField()
    clearAllMessage()
    // addNewLineInMessage()
    addInputFieldEventListener()

    // addButtonOnTouchEndState()

}

function broadcastMsg(text){

    var name;

    if (isLoggedIn()){
        name = loggedInUsername
    }else{
        name = socket.id
        console.log(name)
    }
    
    if (isInRoom()) {
        
        socket.emit("broadcast message to room", {roomId: activeRoomId, text:text, sender: name})

    } else{
        socket.emit("broadcast message to lobby", {text:text, sender: name})

    }
}

function isInRoom(){
    if (!activeRoomId){
        return false
    }else{
        return true
    }
}

function isLoggedIn(){
    if (memberToken == null) {
        return false
    }else{
        return true
    }
}

function addButtonOnTouchEndState(){
    document.querySelectorAll("button").on('touchstart', function(){
        console.log("touchstart")
        $(this).css("background-color", "#0000ff")
    })

    document.querySelectorAll("button").on('touchend', function(){
        console.log("touchend")
        $(this).css("background-color", "#fff")
    })
}


function changeInputState(state) {
    inputState = state
}

function enterTextingState() {
    changeInputState(InputStates.texting)
    setInputPlaceholder("")
    inputPasswordModeOff()
}

function enterLNameState() {
    changeInputState(InputStates.logUsername)
    inputPasswordModeOff()
    setInputPlaceholder("Enter Username")
}

function enterLPasswordState() {
    changeInputState(InputStates.logPassword)
    inputPasswordModeOn()
    setInputPlaceholder("Enter Password")
}

function enterRNameState() {
    setInputPlaceholder("Enter Username (at least 5 characters)")

    changeInputState(InputStates.regUsername)
    inputPasswordModeOff()
}

function enterRPasswordState() {
    changeInputState(InputStates.regPassword)
    //input secure
    inputPasswordModeOn()
    setInputPlaceholder("Enter Password (at least 5 characters)")
}

function enterRoomIdState() {
    changeInputState(InputStates.roomId)
    inputPasswordModeOff()
}

function trimmedSocketId(socketId) {
    return socketId.substring(0, 5)
}

function inputPasswordModeOn() {
    $("#input").prop("type", "password")
}

function inputPasswordModeOff() {
    $("#input").prop("type", "text")
}

function setInputPlaceholder(placeholder) {
    // var input = document.getElementById("input")
    $("#input").prop("placeholder", placeholder)
}

function submitText(text) {
    // addMessage(text)
    broadcastMsg(text)
    inputState = InputStates.texting
}

function submitRegUsername(name) {

    if (name.length < 5) {
        // enterLNameState()
        addMessage("Username must contain at least 5 characters. Please try another username:")
        enterRNameState()
    } else {
        usernameHolder = name
        addMessage(name)
        addMessage("Enter Password: (at least 5 characters)")

        enterRPasswordState()

    }


}

function submitRegPassword(password) {
    var name = usernameHolder
    var password = password

    if (password.length < 5) {
        addMessage("Password must contain at least 5 characters. Please try another password:")
        enterRPasswordState()
    } else {
        //call register api
        register(name, password, function (json) {
            console.log("success")
            console.log("json: " + JSON.stringify(json))

            // var code = json.code
            // console.log("code: " + JSON.stringify(code))
            addMessage("Registration succeeds! You can now log in to save/view your battle results!")

        }, function (json) {
            console.log("failure")
            console.log("json: " + JSON.stringify(json))

            if (json) {
                var code = json.code
                console.log("code: " + JSON.stringify(code))
    
                if (code == RegistrationErrorType.duplicatedUsername) {
                    addMessage("Registration fails. Sorry, someone has taken that username already. Please try another name:")
                    enterRNameState()
                } else if (code == RegistrationErrorType.invalidRequestBody) {
                    addMessage("Registration fails. Invalid username or password")
                    enterTextingState()
                }
            }else{
                addMessage("Registration fails. (Unknown error)")
                enterTextingState()
            }

            

            // const message = 

            //1003: Someone has taken that username
            //1004: Invalid name/pw


        })
    }
}

function submitRoomId(id) {

}

function submitLogUsername(name) {
    // addMessage("")
    usernameHolder = name
    addMessage(name)
    addMessage("Enter Password:")
    enterLPasswordState()
}

function storeMemberToken(token){
    memberToken = token
}

function clearMemberToken(){
    memberToken = null
}

function logout(){
    enableLoginBtn()
    enableRegisterBtn()
    disableLogoutBtn()
    addMessage("Logged out.")
    clearMemberToken()
}

function emitSocketChangeName(name){
    socket.emit("emit socket change name", name)
}

function submitLogPassword(password) {
    const name = usernameHolder

    addMessage("Loading...")

    // const password = password

    loginByUsernamePassword(name, password, function(json){
        // console.log("json.userData.win: " + json.userData.win)

        enableLogoutBtn()

        disableLoginBtn()

        disableRegisterBtn()

        console.log("json.token:" + json.token)

        storeMemberToken(json.token)

        loggedInUsername = name

        addMessage("\b\rLogin successful." + " Hi, " + name + "!" + "\b\rThis is your battle history:\b\rWins: " + json.userData.win + "\b\rLoss: " + json.userData.loss + "\b\rDraw: " + json.userData.draw)
        // addMessage("This is your battle history:\b\rWins: " + json.win + "\b\rLoss: " + json.loss + "\b\rDraw: " + json.draw)
        enterTextingState()

        emitSocketChangeName(loggedInUsername)

    }, function(json){

        if (json){
            var code = json.code
                console.log("code: " + JSON.stringify(code))
    
                if (code == LoginErrorType.incorrectNamePassword) {
                    addMessage("Login fails. Incorrect username or password.")
                    enterTextingState()
                } else if (code == LoginErrorType.invalidUsernamePassword) {
                    addMessage("Login fails. Invalid username or password.")
                    enterTextingState()
                }

        }else{
            addMessage("Login fails. (Unknown error)")
            enterTextingState()
        }

    })
}

function changeInputUIState(state) {
    var input = document.getElementById("input")
    //placeholder, text color...
    switch (state) {
        case InputStates.texting:
    }
}

function addInputFieldEventListener() {
    var input = document.getElementById("input")
    var value = input.value
    input.addEventListener("keyup", function (event) {


        if (!((event.target.value.isEmpty) || !(event.target.value))) {
            if (event.keyCode === 13) {
                console.log("event.target.value: " + event.target.value)

                var inputValue = event.target.value

                event.preventDefault();
                // addMessage(input.value)
                // var input = document.getElementById("input")
                // var value = input.value
                clearInputField()


                switch (inputState) {
                    case InputStates.texting:
                        submitText(inputValue)
                        break
                    case InputStates.regUsername:
                        if (inputValue == abortKey) {
                            addMessage("Registration aborted.")
                            enterTextingState()
                        } else {
                            submitRegUsername(inputValue)
                        }
                        break
                    case InputStates.regPassword:
                        submitRegPassword(inputValue)
                        break
                    case InputStates.logUsername:
                        submitLogUsername(inputValue)
                        break
                    case InputStates.logPassword:
                        submitLogPassword(inputValue)
                        break
                    case InputStates.roomId:
                        submitRoomId(inputValue)
                        break
                }

            }
        }

    })
}

function displayRegistrationInstruction() {
    // enterRNameState()

    var message = "\r\nRegistration Instruction:\r\n1. Enter username.\r\n2. Enter password.\b\r(Insert \"" + abortKey + "\" to abort registration.)\r\nUpon successful registration, you may log in to keep track of your battle results!"
    addMessage(message)

}

function proceedOnRegistration() {

}

function clearInputField() {
    var input = document.getElementById("input")
    input.value = ""
}

function clearAllMessage() {
    var textArea = document.getElementById("message")
    textArea.value = ""
}

function addMessage(message) {
    var date = new Date();
    var h = date.getHours()
    var hour;
    if (h < 10) {
        hour = "0" + h.toString()
    } else {
        hour = h.toString()
    }
    var m = date.getMinutes()
    var min;
    if (m < 10) {
        min = "0" + m.toString()
    } else {
        min = m.toString()
    }
    var s = date.getSeconds()
    var second;
    if (s < 10) {
        second = "0" + s.toString()
    } else {
        second = s.toString()
    }
    var timeString = "[" + hour + ":" + min + ":" + second + "] "
    console.log("timeString: " + timeString)

    var textArea = document.getElementById("message")
    var currentMsg = textArea.value
    console.log("addMessage:" + currentMsg)
    // var newLine = "\r\n"
    newMessage = currentMsg + timeString + message// + newLine
    textArea.value = newMessage
    textArea.scrollTop = textArea.scrollHeight;
    addNewLineInMessage()
}

function addNewLineInMessage() {
    var textArea = document.getElementById("message")
    var currentMsg = textArea.value
    var newLine = "\r\n"
    newMessage = currentMsg + newLine
    textArea.value = newMessage
    textArea.scrollTop = textArea.scrollHeight;
}

function setEnoughPlayer(value) {
    enoughPlayer = value
}

function resetGameState() {
    gameTurn = 0;
    gameState = [
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
    ];
    removeAllChess()
    $(".white-hint").remove();
    $(".black-hint").remove();

}


function isYourTurn() {
    if (gameMode == GameModeType.offline || gameMode == GameModeType.lobby) {
        return true
    } else {
        if (isHost) {

            if (gameTurn == 0) {
                //0 is your turn
                return true
            } else {
                //1 is oppo's turn
                return false
            }

        } else {
            if (gameTurn == 1) {
                //1 is your turn
                return true
            } else {
                //0 is oppo's turn
                return false
            }
        }
    }
}

function enterRoom(roomId, isHost) {

    console.log("Enter Room")
    this.isHost = isHost
    console.log("this.isHost: " + this.isHost)
    activeRoomId = roomId
    $("#create-room").prop("disabled", true)
    $('#join-room').prop("disabled", true)
    $('#leave-room').prop("disabled", false)
    gameMode = GameModeType.room

    initGameState()

    canEmptySquaresPlaceChess()
}

function enterLobby() {
    // console.log("enoughPlayer: " + this.enoughPlayer)

    console.log("Enter Lobby")
    // enoughPlayer = false;

    enoughPlayer = null;
    // console.log("enoughPlayer: " + this.enoughPlayer)

    activeRoomId = null
    $("#create-room").prop("disabled", false)
    $('#join-room').prop("disabled", false)
    $('#leave-room').prop("disabled", true)
    gameMode = GameModeType.lobby

    initGameState()

    canEmptySquaresPlaceChess()



}

function enterOfflineMode() {
    $("#create-room").prop("disabled", true)
    $('#join-room').prop("disabled", true)
    $('#leave-room').prop("disabled", true)
    gameMode = GameModeType.offline

    initGameState()

    canEmptySquaresPlaceChess()

}

// function enterOnlineMode() {

// }

function emitWin(win) {
    if (win) {
        socket.emit("client emit win", true)
    } else {
        socket.emit("client emit win", false)
    }
}

function enableLoginBtn(){
    var button = $('#account-login')
    button.prop("disabled", false)
}

function disableLoginBtn(){
    var button = $('#account-login')
    button.prop("disabled", true)
}

function enableRegisterBtn(){
    var button = $('#account-register')
    button.prop("disabled", false)
}

function disableRegisterBtn(){
    var button = $('#account-register')
    button.prop("disabled", true)
}

function disableLogoutBtn(){
    console.log("disabling logout button")
    var button = $('#account-logout')
    button.prop("disabled", true)
}

function enableLogoutBtn(){
    var button = $('#account-logout')
    button.prop("disabled", false)
}

function postGameResult(type){

    postGameResultByToken(memberToken, type, function(json){

        // console.log("json: " + JSON.stringify(json))

    }, function(json){
        // console.log("json: " + JSON.stringify(json))
    })
}

function addLogoutButton(){
    var element = $('#account-button-container-3')
    element.append('<button id="account-logout">Logout</button>')
    var button = $('#account-logout')
    button.click(function (event) {
        logout()
    })

    // button.prop("disabled", true)
    if (!isLoggedIn()){
        // console.log("isLoggedIn(): " + isLoggedIn())
        disableLogoutBtn()
    }
}

function addRegisterButton() {
    var element = $('#account-button-container-3')
    element.append('<button id="account-register">Register</button>')
    var button = $('#account-register')
    button.click(function (event) {
        // postGameResult(gameResultType.win)

        // proceedOnRegistration()
        displayRegistrationInstruction()
        addMessage("Please enter username: (at least 5 characters)")
        enterRNameState()
    })
}

function addLoginButton() {
    var element = $('#account-button-container-3')
    element.append('<button id="account-login">Login</button>')
    var button = $('#account-login')
    button.click(function (event) {

        displayLoginInstruction()

        enterLNameState()

    })
}

function displayLoginInstruction(){
    var message = "\r\nLogin Instruction:\r\n1. Enter username.\r\n2. Enter password.\b\r(Insert \"" + abortKey + "\" to abort login.)\r\nUpon successful login, you can view your battle results!"
    addMessage(message)
}


function addLeaveRoomButton() {
    var element = $('#room-button-container-3')
    element.append('<button id="leave-room">Leave Room</button>')

    var button = $('#leave-room')
    button.click(function (event) {
        button.prop("disabled", true)
        if (activeRoomId != null) {
            emitFromLeaveRoomButton(activeRoomId)
        }
    })

}

function emitFromLeaveRoomButton(roomId) {
    socket.emit("leave room by id", roomId, function (msg) {
        // alert(msg)
        addMessage("You have left room: " + roomId + "." + " You are now in the lobby.")
        // addMessage("You are now in the lobby.")



        // addNewLineInMessage()
        enterLobby()
        // var button = $('#leave-room')
        // button.prop("disabled", false)
    })
}

function addJoinRoomByIdButton() {
    var element = $('#room-button-container-3')
    element.append('<button id="join-room">Join Room</button>')

    var button = $('#join-room')
    button.click(function (event) {

        // postGameResult(gameResultType.win)

        var roomId = prompt("Insert Room Id")
        // var string = JSON.stringify(roomId);
        // console.log("string: " + string)
        if (roomId != null) {
            emitFromJoinRoomButton(roomId)
        }
    })
}

function emitFromJoinRoomButton(roomId) {
    socket.emit("join room by id", roomId, function (response) {
        // alert(response)
        if (response.joinable) {
            enterRoom(response.roomId, response.isHost)
            addMessage("You are now in room: " + response.roomId + ".")
            addMessage("You are black. White will move first.")
            setEnoughPlayer(true)
        } else {
            // console.log("Cannot join room: " + response.unjoinableReason)
            console.log("response: " + JSON.stringify(response))
            addMessage("Fail to join room: " + roomId + ".")
            if (response.unjoinableReason == "full") {
                //room full
                addMessage("Reason: room is full.")
            } else {
                //room does not exist
                addMessage("Reason: room does not exist.")
            }
        }

    })
}

function addCreateRoomButton() {
    var element = $('#room-button-container-3')
    element.append('<button id="create-room">Create Room</button>')

    var button = $('#create-room')
    // var jbutton = $('#join-room')
    button.click(function (event) {
        button.prop("disabled", true)
        var jbutton = $('#join-room')
        jbutton.prop("disabled", true)
        // console.log("button clicked")
        emitFromOpenRoomButton();
    });
}

function emitFromOpenRoomButton() {
    socket.emit("create room", null, function (response) {
        // alert("Created room: " + response.roomId);

        var roomId = response.roomId
        console.log("Created room id: " + response.roomId);

        addMessage("You have successfully created a room." + " You are now in room: " + roomId + "." + " Others can join this room using the id." + " Waiting for someone to join the room...")
        // addMessage("You are now in room: " + roomId + ".")
        // addMessage("Others can join this room using the id.")
        // addMessage("Waiting for someone to join the room...")


        // addNewLineInMessage()
        // console.log("Created room response:"  + util.inspect(response))
        // console.log("DEBUG enoughPlayer: " + enoughPlayer)
        enterRoom(response.roomId, response.isHost)

        var button = $('#create-room')
        button.prop("disabled", true)
    })
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

    var text;

    text = noOfWhite

    if (gameTurn == 0) {
        $(".indicator-container").empty()
        $(".indicator-container").append('<div class="white-indicator"></div>')
    }

    element.html(text);
}

function displayNoOfBlack() {
    var element = $(".blackScore")
    var text;
    // if (gameTurn == 1){
    //     text = "*"  + noOfBlack
    // }else{
    text = noOfBlack
    // }

    if (gameTurn == 1) {
        $(".indicator-container").empty()
        $(".indicator-container").append('<div class="black-indicator"></div>')
    }

    element.html(text);
}

function switchGameTurn() {
    if (gameTurn == 0) {
        gameTurn = 1
    } else {
        gameTurn = 0
    }
    updateChessCount()
}

function initGameState() {

    resetGameState()

    //33, 44 black
    placeChessOn(3, 4)
    switchGameTurn()
    placeChessOn(3, 3)
    switchGameTurn()
    //34, 43 white
    placeChessOn(4, 3)
    switchGameTurn()
    placeChessOn(4, 4)
    switchGameTurn()

    console.log("isYourTurn(): " + isYourTurn())
}

function renderSqaure(x, y) {
    var selectorString = 'squareId_' + x + '' + y;
    $('#squares-container').append('<div id="' + selectorString + '" class="square"></div>')
}

function getSquare(x, y) {
    var element = $("#" + "squareId_" + x + "" + y)
    return element
}

function removeAllChess() {

    console.log("removing all chess")

    $('.whiteChess').remove();
    $('.blackChess').remove();


    // gameState.forEach((row, y) => {
    //     row.forEach((element, x) => {
    //         removeChessOn(x, y)
    //     });
    // });
}

function removeChessOn(x, y) {
    var element = getSquare(x, y)
    element.empty();
}

function placeChessOn(x, y) {
    // console.log("Placing chess on x: " + x + " y: " + y)
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
    // console.log("gameState: " + gameState);
    // element.unbind();
    // switchGameTurn()
    // updateChessCount()
}

function placeBlackChessOn(x, y) {
    var element = getSquare(x, y)
    element.empty();
    element.append('<div class="blackChess"></div>')
    // square.append('<div class="chess"></div>')
    setSqaureStateBlack(x, y)
    // console.log("gameState: " + gameState);
    // element.unbind();
    // switchGameTurn()
    // updateChessCount()
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

    // console.log("noOfBlack: " + noOfBlack + ", noOfWhite: " + noOfWhite)
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

function canEmptySquaresPlaceChess() {



    $(".white-hint").remove();
    $(".black-hint").remove();

    // console.log("gameState: " + gameState)

    var arrayOfEmptyPosition = [];
    gameState.forEach(function (element, index) {
        let y = index
        element.forEach(function (element, index) {
            let x = index
            if (element == null) {
                arrayOfEmptyPosition.push({ x: x, y: y })
            }
        });
    });



    var arrayOfPossibleMovement = [];

    arrayOfEmptyPosition.forEach(position => {
        let x = position.x;
        let y = position.y;
        var hasValidMove = false;
        directions.forEach(direction => {

            let dx = direction[0]
            let dy = direction[1]
            let tail = getNearestTailWithCustomDirection(x, y, dx, dy)
            if (tail != null) {
                // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> PROCESS MOVE TAIL x: " + tail.x + ", y: " + tail.y)
                hasValidMove = true
            }
        });
        if (hasValidMove) {
            arrayOfPossibleMovement.push(position)

            if (isYourTurn()) {
                if (gameTurn == 0) {
                    getSquare(x, y).append('<div class="white-hint"></div>')

                } else {
                    getSquare(x, y).append('<div class="black-hint"></div>')

                }
            }

        }
    });

    arrayOfPossibleMovement.forEach(element => {
        // console.log("element.x: " + element.x + ", element.y: " + element.y)
    });

    if (arrayOfPossibleMovement.length == 0) {
        return false
    } else {
        return true
    }

}

function processMove(x, y) {

    console.log("processMove")

    var head = { x: x, y: y }

    var validMove = false;



    directions.forEach(element => {
        let dx = element[0]
        let dy = element[1]
        let tail = getNearestTailWithCustomDirection(x, y, dx, dy)
        if (tail != null) {
            // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> PROCESS MOVE TAIL x: " + tail.x + ", y: " + tail.y)
            flipEnemiesInCustomDirection(head, tail)
            validMove = true
        }
    });

    if (validMove) {

        // if(gameMode == GameModeType.room && isYourTurn()){
        //     console.log("emitMove x: " + x + " y: "+ y)
        //     // console.log
        //     emitMove(x, y)
        // }

        placeChessOn(x, y)
        switchGameTurn()



        let hasPlacement = canEmptySquaresPlaceChess()

        // console.log("hasPlacement: " + hasPlacement)

        if (!hasPlacement) {
            switchGameTurn()
            let opponentHasPlacement = canEmptySquaresPlaceChess()
            if (opponentHasPlacement) {
                //continue
                // console.log("continue")
            } else {
                //game end
                console.log("game end")

                checkWinner()
            }
        } else {

        }
    }

    function checkWinner() {
        if (noOfWhite > noOfBlack) {
            if (isHost) {
                //win
                
            } else {
                //lose
            }
        } else if (noOfWhite < noOfBlack) {
            if (isHost) {
                //lose
            } else {
                //win
            }
        } else if (noOfWhite == noOfBlack) {
            // tie
        }

    }

    // let northTail = getNearestNorthTail(x, y);
    // if (northTail != null){
    //     flipEnemiesInCustomDirection(head, northTail)
    //     validMove = true;
    // }

    // let northEastTail = getNearestNorthEastTail(x, y)
    // if (northEastTail != null){
    //     flipEnemiesInCustomDirection(head, northEastTail);
    //     validMove = true;
    // }

    // let eastTail = getNearestEastTail(x, y)
    // if (eastTail != null){
    //     flipEnemiesInCustomDirection(head, eastTail);
    //     validMove = true;
    // }

    // let southEastTail = getNearestSouthEastTail(x, y)
    // if (southEastTail != null){
    //     flipEnemiesInCustomDirection(head, southEastTail);
    //     validMove = true;
    // }

    // let southEastTail = getNearestSouthEastTail(x, y)
    // if (southEastTail != null){
    //     flipEnemiesInCustomDirection(head, southEastTail);
    //     validMove = true;
    // }

}

function getNearestTailWithCustomDirection(x, y, xDir, yDir) {
    // console.log("x: " + x + " y: " + y + " xDir: " + xDir + " yDir: " + yDir)
    var tail = null
    var xSquareUntilWall;
    var ySquareUntilWall;

    var unitXDir = xDir///Math.abs(xDir);
    var unitYDir = yDir///Math.abs(yDir);

    if (xDir < 0) {
        xSquareUntilWall = x
    } else if (xDir > 0) {
        xSquareUntilWall = getMaxRowIndex() - x
    }

    if (yDir < 0) {
        ySquareUntilWall = y
    } else if (yDir > 0) {
        ySquareUntilWall = getMaxColumnIndex() - y
    }

    // console.log("xSquareUntilWall: " + xSquareUntilWall + ", ySquareUntilWall: " + ySquareUntilWall)


    var squareUntilWall;

    if (unitXDir == 0) {
        squareUntilWall = ySquareUntilWall
    } else if (unitYDir == 0) {
        squareUntilWall = xSquareUntilWall
    } else {
        squareUntilWall = Math.min(xSquareUntilWall, ySquareUntilWall);
    }


    // console.log("squareUntilWall: " + squareUntilWall)

    if (squareUntilWall == 0) {
        // console.log("squareUntilWall == 0")
        tail = null
    } else {
        // console.log("x + unitXDir: " + x + unitXDir + ", y + unitYDir: " + y + unitYDir)
        var nextSquareState = getSquareState(x + unitXDir, y + unitYDir);

        if (nextSquareState == null || nextSquareState == gameTurn) {
            // console.log("nextSquareState == null || nextSquareState == gameTurn")
            tail = null
        } else {
            var i, j;

            let shouldKeepXUnchanged = unitXDir == 0;
            let shouldKeepYUnchanged = unitYDir == 0;

            let shouldIncrementX = shouldIncrement(unitXDir)
            let shouldIncrementY = shouldIncrement(unitYDir)

            // console.log("shouldIncrementX: " + shouldIncrementX)
            // console.log("shouldIncrementY: " + shouldIncrementY)

            for (i = x + unitXDir * 2, j = y + unitYDir * 2; squareUntilWall >= 0; shouldKeepXUnchanged ? (i = i) : (shouldIncrementX ? i++ : i--), shouldKeepYUnchanged ? (j = j) : (shouldIncrementY ? j++ : j-- , squareUntilWall--)) {
                var squareState;
                if (i > getMaxRowIndex() || i < 0 || j > getMaxColumnIndex() || j < 0) {
                    squareState = null
                } else {
                    squareState = getSquareState(i, j)
                }
                // console.log("i: " + i + ", j: " + j + ", squareState: " + squareState)
                if (squareState == gameTurn) {
                    //ally
                    // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Found Ally!")
                    tail = { x: i, y: j }
                    squareUntilWall = -1
                } else if (squareState == null) {
                    // console.log("Empty Tail!")
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

function shouldIncrement(unitDir) {
    if (unitDir > 0) {
        return true
    } else if (unitDir < 0) {
        return false
    } else {
        return false
    }
}

function operateFlipIndex(unitDir, index) {
    if (unitDir > 0) {
        increment(index)
    } else if (unitDir < 0) {
        decrement(index)
    } else {
        return false
    }
}

function decrement(k) {
    k--
}

function increment(k) {
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

function flipEnemiesInCustomDirection(head, tail) {
    let headY = head.y;
    let tailY = tail.y;
    let headX = head.x;
    let tailX = tail.x;

    var shouldKeepXUnchanged = tailX == headX;
    var shouldKeepYUnchanged = tailY == headY;

    var shouldIncrementX = tailX > headX
    var shouldIncrementY = tailY > headY

    var i, j;

    for (shouldKeepXUnchanged ? (i = headX) : (shouldIncrementX ? (i = headX + 1) : (i = headX - 1)), shouldKeepYUnchanged ? (j = headY) : (shouldIncrementY ? (j = headY + 1) : (j = headY - 1));
        (shouldKeepXUnchanged ? (i == tailX) : (shouldIncrementX ? (i <= tailX) : (i >= tailX))) && (shouldKeepYUnchanged ? (j == tailY) : (shouldIncrementY ? (j <= tailY) : (j >= tailY)));
        shouldKeepXUnchanged ? (i = i) : (shouldIncrementX ? (i++) : (i--)), shouldKeepYUnchanged ? (j = j) : (shouldIncrementY ? (j++) : (j--))) {
        placeChessOn(i, j)
    }

}

function flipSouthWestEnemies(head, tail) {
    let headY = head.y;
    let tailY = tail.y;
    let headX = head.x;
    let tailX = tail.x;

    var i, j;

    for (i = headX - 1, j = headY - 1; i >= tailX, j >= tailY; i-- , j--) {
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

























{/* <div class="board-container">
        <div class="board">
            <!-- a row 1-->
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>

            <!-- a row 2-->
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>

            <!-- a row 3-->
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>

            <!-- a row 4-->
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
        </div>
        <!-- a row 5-->
        <div class="river-row"></div>

        <div class="board">
            <!-- a row 6-->
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>

            <!-- a row 7-->
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>

            <!-- a row 8-->
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>

            <!-- a row 9-->
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>
            <div class="grid"></div>

        </div>
    </div> */}