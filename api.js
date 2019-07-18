function test() {
    console.log("test")
}

// const baseUrl = "http://127.0.0.1:4000"

const baseUrl = "https://cryptic-tundra-40921.herokuapp.com"

var apis = Object.freeze({
    "createUser": "/api/users",
    "loginByUsernamePassword": "/api/auth"
    // "postWinByToken"
})

function getFullpath(api) {
    const fullpath = baseUrl + api
    return fullpath
}

function handleResponse(response, json, success, failure){
    const code = response.status
    // const json = await response.json()
    console.log("status code: " + code)
    console.log("json: " + JSON.stringify(json))
    
    if (code==200){
        success(json)
    }else{
        failure(json)
    }
}

const register = async (name, password, success, failure) => {
    const path = getFullpath(apis.createUser)
    const response = await fetch(path, {
        method: 'POST',
        body: JSON.stringify(
            {
                name: name,
                password: password
            }
        ),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(function(response){
        response.json().then(function(data){
            handleResponse(response, data, success, failure)
        })
    }).catch(error => console.log("Error: " + error))
    // const json = await response.json();
    // handleResponse(response, json, success, failure)
    
}

const loginByUsernamePassword = async (name, password, success, failure) => {
    const path = getFullpath(apis.loginByUsernamePassword)
    const response = await fetch(path, {
        method: 'POST',
        body: JSON.stringify(
            {"name":name,"password":password}
        ),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(function (response) {
        response.json().then(function(data){
            console.log("token: " + response.headers.get('x-auth-token'))
            handleResponse(response, data, success, failure)
        })
    }).catch(error => console.log("Error: " + error))
}

const getUserById = async () => {
    // 127.0.0.1:4000/api/users/5d1c2edc4e37fababb3d6cd0

    const path = "http://127.0.0.1:4000/api/users/5d1c2edc4e37fababb3d6cd0"
    const response = await fetch(path)
    const myJson = await response.json();
    console.log("myJson: " + JSON.stringify(myJson))

}

const postWinByToken = async (token, success, failure) => {

}