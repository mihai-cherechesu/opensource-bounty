var express = require('express');
var cors = require('cors');
const fetch = (...args) => 
    import('node-fetch').then(({default: fetch}) => fetch(...args));
var bodyParser = require('body-parser');

const CLIENT_ID = "76cfd539e20fe2120972"
const CLIENT_SECRET = "e8328379aea9944097de2220c70345a0f66b3dbc"

var app = express();

app.use(cors());
app.use(bodyParser.json());

//code being passed from frontend
app.get('/getAccessToken', async function (req, res) {
    const params = "?client_id=" +  CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&code=" + req.query.code;
    await fetch("https://github.com/login/oauth/access_token" + params, {
        method: "POST",
        headers: {
            "Accept": "application/json"
        }
    }).then((response) => {
        return response.json();
    }).then((data) => {
        console.log(data);
        res.json(data);
    });
});


//getUserData
//access token is going to be passed in as an Authorization header

app.get('/getUserData', async function (req, res){
    console.log("Auth header:" + req.get("Authorization"))
    
    await fetch("https://api.github.com/user", {
        method: "GET",
        headers: {
            "Authorization": req.get("Authorization")
        }
    }).then((response) => {
        return response.json();
    }).then((data) => {
        console.log(data);
        res.json(data);
    });
}) 

app.listen(4000, function (){
    console.log("CORS server running on port 4000")
});