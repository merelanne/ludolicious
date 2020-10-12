let express = require("express");
let http = require("http");
let Game = require("./game");
let messages = require("./public/javascripts/messages");
const gameStatus = require("./stats.js");
let Timer = require("./public/javascripts/timer.js");

let websocket = require("ws");

let port = process.argv[2];
let app = express();

app.set("view engine", "ejs");

let server = http.createServer(app);

const wss = new websocket.Server({ server });

let gameID = 0;

let websockets = {}; // These will be all socket connections
let currentGame = new Game(gameID++);
let connectionID = 0;

// Clean up sockets
setInterval(function() {
    for(let i in websockets){
        if(websockets.hasOwnProperty(i)){
            let gameObj = websockets[i];
            //if the gameObj has a final status, the game is complete/aborted
            if(gameObj.finalStatus!=null){
                console.log("\tDeleting element "+i);
                delete websockets[i];
            }
        }
    }
}, 50000);

wss.on("connection", function(ws) {


    let con = ws;
    con.id = connectionID++;
    let playerType = currentGame.addPlayer(con);   
    gameStatus.gamesInitialized = gameID+1;

    websockets[con.id] = currentGame;

    let drawPawnMessage = {
        type: "DRAW_YO_PAWNS",
        content: currentGame.occupiedTiles     
    }

    con.send(JSON.stringify(drawPawnMessage));
    con.send(JSON.stringify({type: "YOU_ARE_COLOR", content: currentGame.getColor(playerType)}));

    for (let i = 0; i < currentGame.playerConnections.length; i++) {
        currentGame.playerConnections[i].send(JSON.stringify(drawPawnMessage));
    }

    if (currentGame.isFull()) {
        for (let i = 0; i < currentGame.playerConnections.length; i++) {
            currentGame.playerConnections[i].send(JSON.stringify({type:"START_GAME"}));
            currentGame.playerConnections[i].send(JSON.stringify({type:"START_TIMER"}));
        }
        currentGame.playerConnections[0].send(JSON.stringify({type: "UNLOCK_DICE"}));
        currentGame = new Game(gameID++);
        
    }    
    
    con.on("message", function incoming(message) {
        let oMsg = JSON.parse(message);
        let gameObj = websockets[con.id];
        if (!gameObj.isFull()) {
            return;
        }

        // What to do when a client requests a pawn
        if (oMsg.type === "BEGIN_HOVER") {
            if (gameObj.currentPlayer === playerType) {
                let pawnNumber = oMsg.content;
                let pawn = gameObj.pawnList[pawnNumber];
                if (pawn.player === gameObj.currentPlayer) {
                    let nextTile = gameObj.calculateNextTile(pawn, gameObj.thrownNumber);
                    let returnMessage = {
                        type: "ADD_SHADOWPAWN",
                        content: nextTile
                    }
                    con.send(JSON.stringify(returnMessage));
                }
            }
        }

        if (oMsg.type === "END_HOVER") {
            if (gameObj.currentPlayer === playerType) {
                let pawnNumber = oMsg.content;
                let pawn = gameObj.pawnList[pawnNumber];
                if (pawn.player === gameObj.currentPlayer) {
                    let nextTile = gameObj.calculateNextTile(pawn, gameObj.thrownNumber);
                    let returnMessage = {
                        type: "REMOVE_SHADOWPAWN",
                        content: nextTile
                    }
                    con.send(JSON.stringify(returnMessage));
                }
            }
        }

        if (oMsg.type === "THROWN_DICE") {
            gameObj.thrownNumber = oMsg.content;
            let returnMessage = {
                type: "DICE_VALUE",
                content: gameObj.thrownNumber
            }
            for(let i = 0; i < gameObj.playerConnections.length; i++) {
                gameObj.playerConnections[i].send(JSON.stringify(returnMessage));
            }
            
		    if(gameObj.thrownNumber !== 6 && gameObj.allHome() === true) {
			    setTimeout(function() {
                    gameObj.nextTurn();
  
                    con.send(JSON.stringify({type: "LOCK_DICE"}));
                    for (let i = 0; i < gameObj.playerConnections.length; i++) {
                        gameObj.playerConnections[i].send(JSON.stringify({type: "HIDE_DICE"}));
                        gameObj.playerConnections[i].send(JSON.stringify({type: "SHOW_COLOR", content: gameObj.currentPlayerColor()}));
                    }
                    gameObj.playerConnections[gameObj.currentPlayer].send(JSON.stringify({type: "UNLOCK_DICE"}));
			    }, 1000)
		    } 
        }

        if (oMsg.type === "CLICK_ON_PAWN") {

            if (gameObj.thrownNumber === -1) {
                return;
            }
        
            var pawn = gameObj.pawnList[oMsg.content];
        
            if (pawn.currCoord === -1 && gameObj.thrownNumber !== 6) {
                return;
            }
        
            if(gameObj.getPlayer(pawn.player) === gameObj.getCurrentPlayer()){
                var nextTile = gameObj.calculateNextTile(pawn, gameObj.thrownNumber);
                if (nextTile !== -1) {
                    con.send(JSON.stringify({type: "REMOVE_SHADOWPAWN", content: nextTile}));
                    gameObj.move(pawn, nextTile);
                    con.send(JSON.stringify({type: "LOCK_DICE"}))

                    for (let i = 0; i < gameObj.playerConnections.length; i++) {
                        gameObj.playerConnections[i].send(JSON.stringify(drawPawnMessage));
                        gameObj.playerConnections[i].send(JSON.stringify({type: "HIDE_DICE"}));
                    }
                    con.send(JSON.stringify(drawPawnMessage));
                }

                if(gameObj.thrownNumber !== 6){
                    if (!gameObj.isLastSix) {
                        gameObj.nextTurn();
                        gameObj.playerConnections[gameObj.currentPlayer].send(JSON.stringify({type: "UNLOCK_DICE"}));
                        for (let i = 0; i < gameObj.playerConnections.length; i++) {
                            gameObj.playerConnections[i].send(JSON.stringify({type: "SHOW_COLOR", content: gameObj.currentPlayerColor()}));
                        } 
                    } else {
                        con.send(JSON.stringify({type: "UNLOCK_DICE"}))                        
                    }
                }
                if(gameObj.win()){
                    for (let i = 0; i < gameObj.playerConnections.length; i++) {
                        gameObj.playerConnections[i].send(JSON.stringify({
                            type: "WIN"
                        }))
                    }
                    gameStatus.gamesCompleted++;
                    gameObj.finalStatus = "WON";
                }
                for (let i = 0; i < gameObj.playerConnections.length; i++) {
                    gameObj.playerConnections[i].send(JSON.stringify({type: "SHOW_COLOR", content: gameObj.currentPlayerColor()}));
                } 
            }
        }

    });

    con.on("close", function (code) {

        console.log(con.id + " disconnected ...");

        if (code == "1001") {
            /*
            * if possible, abort the game; if not, the game is already completed
            */
            let gameObj = websockets[con.id];

                gameObj.finalStatus = "ABORTED"; 
                gameStatus.gamesAborted++;

                /*
                 * determine whose connection remains open;
                 * close it
                 */
                for (let i = 0; i < gameObj.playerConnections.length; i++) {
                    if (gameObj.playerConnections[i] != con) {
                        gameObj.playerConnections[i].send(JSON.stringify({type: "ABORT"}));
                        gameObj.playerConnections[i].close();
                        gameObj.playerConnections[i] = null;
                    }
                }      
                currentGame = new Game(gameID++);  
        }
    });
});

// Redirects
app.get("/", (req, res) => {
	res.render("splash.ejs", { gamesInitialized: gameStatus.gamesInitialized, gamesCompleted: gameStatus.gamesCompleted });
});

app.get("/game", (req, res) => {
	res.sendFile("game.html", {root: "./public"});
});

app.use(express.static(__dirname + "/public"));
server.listen(port);