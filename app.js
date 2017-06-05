/**
 * Created by Jens on 5/06/2017.
 */

const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require('mysql');
const session = require("express-session");
const io = require('socket.io');
const Minesweeper = require('./minesweeper');


var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'minesweeper'
});

connection.connect();

var app = express();



app.use(session({
    secret:'secret'
}));


app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//UNCOMMENDEN

/*
app.get('/',function(req,res,next){
   res.redirect('/index.html');
});
*/
app.get('/index.html',function(req,res,next){
    if(req.session.loggedin) {next();}
    else {res.redirect("/login.html");}
});


app.get("/login.html", function (req, res) {
    res.render("form", {
        title: "LOGIN",
        action: "/doLogin",
        btnText: "login",

    })
});

app.get("/register.html", function (req, res) {
    res.render("form", {
        title: "REGISTER",
        action: "/doRegister",
        btnText: "register"
    })
});

app.post("/doLogin", doLogin);

function doLogin(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    fetchUserFromDB(username, password, success => {
        if (success) {
            req.session.loggedin =username;
            res.redirect('/index.html');

        }
        else {
            res.render("form", {
                title: "LOGIN",
                action: "/doLogin",
                btnText: "login",
                error: "failed to login " + username
            })
        }
    });
}


app.post("/doRegister", doRegister);

function doRegister(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    addUser2DB(username, password, success => {
        if (success) {
            req.session.loggedin =username;
            res.redirect('/index.html');
        }
        else {
            res.render("form", {
                title: "REGISTER",
                action: "/doRegister",
                btnText: "register",
                error: "failed to register " + username

            })
        }
    });


}


function addUser2DB(username, password, cb) {
    connection.query(
        "INSERT INTO user(username, password) values(?,?);",
        [username, password],
        (err, data) => {
            if (err) console.log("err", err);
            else console.log("data", data);
        })

}

function fetchUserFromDB(username, password, cb) {
    connection.query(
        "Select password from user where username= ?;",
        [username],
        (err, data) =>
            cb(!err &&
                (data.length === 1) &&
                (data[0].password === password))
    );

}
let game = new Minesweeper(10, 10, 10);
app.use(express.static('public'));
 const httpServer = http.createServer(app);

 const serverSocket = io(httpServer);

 serverSocket.on('connection',function(socket){
    console.log("received connection");

    function sendServerResponse(serverResponse){
            socket.emit('serverResponse',serverResponse);
            socket.broadcast.emit('serverResponse',serverResponse);
    }


    socket.emit('gameCreated',{rows:10,cols:10});
    socket.on('clientAccess',function(data){
        game.access(data.row,data.col,data.user).forEach(sendServerResponse);
    });
    socket.on('clientPlantFlag',function(data){
       game.plantFlag(data.row,data.col,data.user).forEach(sendServerResponse);


    });
 });


httpServer.listen(8090, function () {

    console.log("webserver running at 8090");
});

