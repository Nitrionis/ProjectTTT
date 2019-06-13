'use strict';
let path = require('path');
let express = require('express');
let session = require('express-session');
let bodyParser = require('body-parser');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let staticPath = path.join(__dirname, '../');

app.use(express.static(staticPath));
app.use(session({ secret: 'topsecret' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let sqlite3 = require('sqlite3');
let db = new sqlite3.Database('users.db', (error) => {
    if (error) {
        console.error(error.message)
    } else {
        console.log("Connect to the database")
    }
});

let port = 8080;

app.set('port', port);

var gamesDict = {};
var roomsDict = {};

app.post('/login', function (req, res) {
    if (req.body.mail.length == 0 || req.body.password.length == 0) {
        res.send({
            res: false,
            msg: 'wrong email or password'
        });
        return;
    }
    db.serialize(() => {
        db.each("SELECT * FROM users WHERE email='" + req.body.mail + "'", (err, row) => {
            if (err)
                console.error(err.message);
            if (req.body.password == row.password) {
                res.send({
                    res: true,
                    name: row.name
                });
            } 
            else
                res.send({
                    res: false,
                    msg: 'wrong login or password'
                });
        });
    });
});

app.post('/registration', function (req, res) {
    if (req.body.name.length == 0
        || req.body.mail.length == 0
        || req.body.password.length == 0)
    {
        res.send({
            res: false,
            msg: 'wrong login or email or password'
        });
        return;
    }
    db.serialize(function () {
        db.each("SELECT count(name) as res FROM users WHERE name='" + req.body.name
            + "' or email = '" + req.body.mail + "'",
            (err, row) => {
            if (err)
                console.error(err.message);
            if (row.res != 0) {
                res.send({
                    res: false,
                    msg: 'wrong login or email'
                });
            }
            else {
                var stmt = db.prepare("INSERT INTO users VALUES (Null, ?, ?, ?, 0, 0)");
                stmt.run(req.body.name, req.body.mail, req.body.password, function (error) {
                    if (error) {
                        console.error(error.message);
                        res.send({
                            res: false,
                            msg: 'wrong login or email'
                        });
                    } else {
                        res.send({ res: true });
                        console.log("User successfully registered with email:".concat(req.body.mail));
                    }
                });
                stmt.finalize();
            }
        });
    });
});

app.get('/logout', function (req, res) {
    console.log('logout ' + req.session.id);
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});

app.get('/getRooms', function (req, res) {
    res.send(roomsDict);
});

app.get('/getRecords', function (req, res) {
    db.serialize(() => {
        db.all("SELECT name, victories, defeats FROM users ORDER BY victories DESC", [], (err, rows) => {
            if (err)
                console.error(err.message);
            res.send(rows);
        });
    });
});

app.post('/createRoom', function (req, res) {
    if (!(req.body.name in roomsDict)) {
        roomsDict[req.body.name] = {
            victories: 0, // TODO
            defeats: 0 // TODO
        };
        gamesDict[req.body.name] = {
            step: 0,
            gameOver: true,
            nameOne: null,
            nameTwo: null,
            socketOne: null,
            socketTwo: null,
            nextSocket: null,
            timeoutId: null,
            grid: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
            clickCount: 0
        };
        res.send({ res: true });
    }
    else res.send({ res: false });
});

app.post('/connectToRoom', function (req, res) {
    if (req.body.name in roomsDict) {
        delete roomsDict[req.body.name];
        res.write({ res: true });
    }
    else res.write({ res: false });
    res.end();
});

io.on('connection', function (socket) {
    var state = {
        game: null,
        name: null,
        opponentSocket: null
    };
    socket.on('disconnect', function () {
        if (state.game != null && state.game.nameOne != null) {
            delete gamesDict[state.game.nameOne];
            if (state.game.nameOne in roomsDict)
                delete roomsDict[state.game.nameOne];
            disconnectGameOver(state.game, state.name);
            if (state.game.timeoutId != null)
                clearTimeout(state.game.timeoutId);
        }
    });
    socket.once('setupGame', function (data) {
        console.log('setupGame');
        state.name = data.userName;
        state.game = gamesDict[data.roomName];
        if (data.userName == data.roomName) {
            console.log('room creator');
            // room creator
            state.game.socketOne = socket;
            state.game.nextSocket = socket;
            state.game.nameOne = data.userName;
            state.game.opponentConnected = function () {
                console.log('opponentConnected');
                state.opponentSocket = state.game.socketTwo;
                state.game.socketOne.emit('launchGame', {
                    opponentName: state.game.nameTwo
                });
                state.game.socketTwo.emit('launchGame', {
                    opponentName: state.game.nameOne
                });
                state.game.timeoutId = setTimeout(function () {
                    state.game.gameOver = true;
                    var vicData = {
                        grid: data.grid,
                        clickCount: 0,
                        msgTop: 'CONGRATULATIONS',
                        msgBot: 'YOU WON :)'
                    };
                    var defData = {
                        grid: data.grid,
                        clickCount: 0,
                        msgTop: 'DEFEAT',
                        msgBot: ':('
                    }
                    if (state.game.nextSocket == state.game.socketOne) {
                        state.game.socketTwo.emit('gameOver', vicData);
                        state.game.socketOne.emit('gameOver', defData);
                        updateUserDataInBD(state.game.nameOne, false);
                        updateUserDataInBD(state.game.nameTwo, true);
                    }
                    else {
                        state.game.socketOne.emit('gameOver', vicData);
                        state.game.socketTwo.emit('gameOver', defData);
                        updateUserDataInBD(state.game.nameOne, true);
                        updateUserDataInBD(state.game.nameTwo, false);
                    }
                }, 20000);
            };
        }
        else {
            console.log('connected user');
            // connected user
            state.game.gameOver = false;
            state.game.socketTwo = socket;
            state.game.nameTwo = data.userName;
            state.opponentSocket = state.game.socketOne;
            state.game.opponentConnected();
        }
    });
    socket.on('changeGrid', function (data) {
        if (state.opponentSocket != null && state.game.nextSocket == socket) {
            if (state.game.timeoutId != null)
                clearTimeout(state.game.timeoutId);
            state.game.timeoutId = setTimeout(function () {
                state.game.gameOver = true;
                var vicData = {
                    grid: data.grid,
                    clickCount: 0,
                    msgTop: 'CONGRATULATIONS',
                    msgBot: 'YOU WON :)'
                };
                var defData = {
                    grid: data.grid,
                    clickCount: 0,
                    msgTop: 'DEFEAT',
                    msgBot: ':('
                }
                if (state.game.nextSocket == state.game.socketOne) {
                    state.game.socketTwo.emit('gameOver', vicData);
                    state.game.socketOne.emit('gameOver', defData);
                    updateUserDataInBD(state.game.nameOne, false);
                    updateUserDataInBD(state.game.nameTwo, true);
                }
                else {
                    state.game.socketOne.emit('gameOver', vicData);
                    state.game.socketTwo.emit('gameOver', defData);
                    updateUserDataInBD(state.game.nameOne, true);
                    updateUserDataInBD(state.game.nameTwo, false);
                }
            }, 20000);
            if (checkGrid(state.game.grid, data.grid)) {
                // check next socket
                let res = checkWin(data.grid);
                console.log(res);

                state.game.grid = data.grid;
                state.game.clickCount++;

                if (res == 0) {
                    state.game.socketOne.emit('updateGrid', {
                        grid: data.grid,
                        clickCount: state.game.clickCount,
                        isMyTurn: socket == state.game.socketOne ? false : true
                    });
                    state.game.socketTwo.emit('updateGrid', {
                        grid: data.grid,
                        clickCount: state.game.clickCount,
                        isMyTurn: socket == state.game.socketOne ? true : false
                    });
                    if (socket == state.game.socketOne)
                        state.game.nextSocket = state.game.socketTwo;
                    else
                        state.game.nextSocket = state.game.socketOne;
                }
                if (res == 1) {
                    state.game.gameOver = true;
                    var vicData = {
                        grid: data.grid,
                        clickCount: state.game.clickCount,
                        msgTop: 'CONGRATULATIONS',
                        msgBot: 'YOU WON :)'
                    };
                    var defData = {
                        grid: data.grid,
                        clickCount: state.game.clickCount,
                        msgTop: 'DEFEAT',
                        msgBot: ':('
                    }
                    if (socket == state.game.socketOne) {
                        state.game.socketOne.emit('gameOver', vicData);
                        state.game.socketTwo.emit('gameOver', defData);
                        updateUserDataInBD(state.game.nameOne, true);
                        updateUserDataInBD(state.game.nameTwo, false);
                    }
                    else {
                        state.game.socketTwo.emit('gameOver', vicData);
                        state.game.socketOne.emit('gameOver', defData);
                        updateUserDataInBD(state.game.nameOne, false);
                        updateUserDataInBD(state.game.nameTwo, true);
                    }
                }
                if (res == 2) {
                    state.game.gameOver = true;
                    var data = {
                        grid: data.grid,
                        clickCount: state.game.clickCount,
                        msgTop: 'STANDOFF',
                        msgBot: ':|'
                    };
                    state.game.socketOne.emit('gameOver', data);
                    state.game.socketTwo.emit('gameOver', data);
                }
            }
        }
    });
});

server.listen(port, function () {
    console.log('server running on port ' + port);
});

function disconnectGameOver(game, name) {
    if (game.gameOver)
        return;
    if (game.nameOne == name) {
        // User one disconnect
        if (game.nameTwo != null) {
            game.socketTwo.emit('userDisconnected', {
                name: game.nameTwo,
                msgTop: 'CONGRATULATIONS',
                msgBot: 'YOU WON'
            });
            updateUserDataInBD(game.nameOne, false);
            updateUserDataInBD(game.nameTwo, true);
            game.nameOne = null;
        }
    }
    else {
        // User two disconnect
        if (game.nameOne != null) {
            game.socketOne.emit('userDisconnected', {
                name: game.nameOne,
                msgTop: 'CONGRATULATIONS',
                msgBot: 'YOU WON'
            });
            updateUserDataInBD(game.nameOne, true);
            updateUserDataInBD(game.nameTwo, false);
            game.nameTwo = null;
        } 
    }
}

function checkGrid(prevGrid, newGrid) {
    let difCount = 0;
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
            if (prevGrid[i][j] != newGrid[i][j]) {
                difCount++;
                if (prevGrid[i][j] != 0)
                    difCount++;
            }
    return difCount <= 1;
}

function checkWin(newGrid) {
    let res = [0, 0, 0];

    res[checkLine(newGrid, 0, 0, 1, 0)]++;
    res[checkLine(newGrid, 0, 1, 1, 0)]++;
    res[checkLine(newGrid, 0, 2, 1, 0)]++;

    res[checkLine(newGrid, 0, 0, 0, 1)]++;
    res[checkLine(newGrid, 1, 0, 0, 1)]++;
    res[checkLine(newGrid, 2, 0, 0, 1)]++;

    res[checkLine(newGrid, 0, 0, 1, 1)]++;
    res[checkLine(newGrid, 2, 0,-1, 1)]++;

    if (res[1] > 0)
        return 1; // Return win
    if (res[2] == 8)
        return 2; // Return draw
    return 0; // nothing
}

function checkLine(newGrid, startX, startY, dirX, dirY) {
    let res = [0, 0, 0];
    for (let x = startX, y = startY, i = 0; i < 3; i++, x += dirX, y += dirY)
        res[newGrid[x][y]]++;
    if (res[1] == 3 || res[2] == 3)
        return 1;
    if (res[1] != 0 && res[2] != 0)
        return 2;
    return 0;
}

function updateUserDataInBD(username, isWin) {
    let sqlText;
    if (isWin)
        sqlText = "UPDATE users SET victories = victories + 1 WHERE name = ?";
    else
        sqlText = "UPDATE users SET defeats = defeats + 1 WHERE name = ?";
    var params = [username];
    db.run(sqlText, params, function (error) {
        if (error)
            console.error(error.message);
        else
            console.log("User update successfully ".concat(username));
    });
}