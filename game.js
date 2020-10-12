
var game = function (gameID) {
	this.gameID = gameID;
	this.currentPlayer = 0;
	this.playerList = [];
	this.playerConnections = [];
	this.pawnList = [];
	this.occupiedTiles = [];
	this.thrownNumber;
	this.isLastSix = false;

	this.finalStatus = null;

	this.redPath = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43];
	this.yellowPath = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 50, 51, 52, 53];
	this.bluePath = [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 60, 61, 62, 63];
	this.greenPath = [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 70, 71, 72, 73];
	this.pathList = [this.redPath, this.yellowPath, this.bluePath, this.greenPath];

}

game.prototype.isFull = function () {
	return (this.playerList.length === 4);
}

game.prototype.addPlayer = function (connection) {
	this.playerConnections.push(connection);
	this.createPlayer(this.playerList.length);
	return this.playerList.length-1;
}

game.prototype.createPlayer = function(i) {
	let currPawnList = [];
	for (var j = 0; j < 4; j++) {
		// let the start values be the same as the starting square ID's,
		// being 44, 45, 46, 47 for the first player, 54,55 etc. for the second player.
		var start = 44 + i * 10 + j;
		var pawn = new Pawn(i * 4 + j, start, -1, i);
		currPawnList[j] = pawn;
		this.pawnList[i * 4 + j] = pawn;
		this.occupiedTiles[i * 4 + j] = start;
	}
	this.playerList[i] = new Player(currPawnList, this.pathList[i]);
	console.log("created player %s!", i);
}

game.prototype.isOccupied = function (tile) {
	for (var i = 0; i < this.occupiedTiles.length; i++) {
		if (tile === this.occupiedTiles[i]) {
			return i;
		}
	}
	return -1;
}

game.prototype.kill = function (pawn) {
	pawn.currCoord = -1;
	this.occupiedTiles[pawn.pawnID] = pawn.startCoord;
}

game.prototype.updatePawnCoord = function (pawn) {
	if (pawn.currCoord === -1) {
		pawn.currCoord = 0;
	} else {
		pawn.currCoord += this.thrownNumber;
	}
	if (pawn.currCoord > 43) {
		pawn.currCoord = 43 - (pawn.currCoord - 43);
	}
}

game.prototype.currentPlayerColor = function () {
	return this.getColor(this.currentPlayer);
}

game.prototype.getColor = function (n) {
	if (n === 0) {
		return "Red";
	}
	if (n === 1) {
		return "Yellow";
	}
	if (n === 2) {
		return "Blue";
	}
	if (n === 3) {
		return "Green";
	}
}

game.prototype.nextTurn = function () {
	if (this.currentPlayer === this.playerList.length - 1) {
		this.currentPlayer = 0;
	} else {
		this.currentPlayer++;
	}
	this.thrownNumber = -1;
}

game.prototype.getPlayer = function (x) {
	return this.playerList[x];
}

game.prototype.getCurrentPlayer = function () {
	return this.getPlayer(this.currentPlayer);
}

game.prototype.move = function (pawn, to) {
	this.updatePawnCoord(pawn);
	n = this.isOccupied(to);
	if (n !== -1) {
		let soonToBeDeadPawn = this.pawnList[n];
		this.kill(soonToBeDeadPawn);
	}
	this.isLastSix = false;
	if (this.thrownNumber === 6) {
		this.isLastSix = true;
	}
	this.thrownNumber = -1;
	this.occupiedTiles[pawn.pawnID] = to;
	// drawPawns();
}

game.prototype.allHome = function () {
	for (var i = 0; i < 4; i++) {
		if (this.getCurrentPlayer().pawnList[i].currCoord !== -1) {
			return false;
		}
	}
	return true;
}

game.prototype.win = function () {
	if (this.occupiedTiles.includes(40) && this.occupiedTiles.includes(41) && this.occupiedTiles.includes(42) && this.occupiedTiles.includes(43)) {
		console.log("Red is the winner");
		$("#winner").html("Red");
		return true;
	}
	if (this.occupiedTiles.includes(50) && this.occupiedTiles.includes(51) && this.occupiedTiles.includes(52) && this.occupiedTiles.includes(53)) {
		console.log("Yellow is the winner");
		$("#winner").html("Yellow");
		return true;
	}
	if (this.occupiedTiles.includes(60) && this.occupiedTiles.includes(61) && this.occupiedTiles.includes(62) && this.occupiedTiles.includes(63)) {
		console.log("Blue is the winner");
		$("#winner").html("Blue");
		return true;
	}
	if (this.occupiedTiles.includes(70) && this.occupiedTiles.includes(71) && this.occupiedTiles.includes(72) && this.occupiedTiles.includes(73)) {
		console.log("Green is the winner");
		$("#winner").html("Green");
		return true;
	}
	return false;
}


game.prototype.calculateNextTile = function (pawn, number) {
	var player = pawn.player;
	var path = this.getPlayer(player).path;
	var nextTile = -1;

	if (this.getCurrentPlayer() !== this.getPlayer(player)) {
		return;
	}	
	
	if (this.thrownNumber > 0) {
		if (pawn.currCoord === -1 && this.thrownNumber === 6) {
			nextTile = path[0];
		} else if (pawn.currCoord !== -1) {

			if(pawn.currCoord + this.thrownNumber >= path.length){
				var overBounds = (path.length - 1) - (pawn.currCoord + this.thrownNumber);
				// console.log("Sorry, out of bounds");
				var newCoord = (path.length - 1) + overBounds;
				return path[newCoord];
			}
			else{
				nextTile = pawn.currCoord + this.thrownNumber;
				nextTile = path[nextTile];
			}
		}
	}
	return nextTile;
}

function Pawn(pawnID, start, curr, player) {
	this.pawnID = pawnID;
	this.startCoord = start;
	this.currCoord = curr;
	this.player = player;
}

// Basic constructor of a player. It only has got its pawnlist residing in the object.
function Player(pawnList, path) {
	this.pawnList = pawnList;
	this.path = path;
	this.toString = function () {
		var outputString = "";
		for (var i = 0; i < 4; i++) {
			outputString += String(pawnList[i].startCoord) + String(pawnList[i].currCoord) + "\n";
		}
		return outputString;
	}
}

module.exports = game;