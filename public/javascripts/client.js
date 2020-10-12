var socket;

var main = function() {
	"use strict";

	if(window.innerWidth < 1500){
		window.alert("Your screen resolution isn't high enough. The game might not look like it should");
	}

	let occupiedTiles;
	let timer = new Timer();

	//werkcollege
	socket = new WebSocket("ws://localhost:3000");
    socket.onmessage = function(event){
		
		let message = JSON.parse(event.data);
		console.log(message);

		// Message for drawing shadow pawn
		if (message.type === "ADD_SHADOWPAWN") {
			let tile = message.content;
			drawShadowPawn(tile);
		}
		// Message for removing shadow pawn
		if (message.type === "REMOVE_SHADOWPAWN") {
			let tile = message.content;
			removeShadow(tile);
		}
		// Message for updating of pawns
		if (message.type === "DRAW_YO_PAWNS") {
			occupiedTiles = message.content;
			console.log(occupiedTiles);
			drawPawns(occupiedTiles);
		}
		// Message for using the die
		if (message.type === "DICE_VALUE") {
			console.log("DICE MESSAGE GOT");
			showDie();
			document.getElementById("diceAudio").play();
			document.getElementById("picture").setAttribute("src", "images/side"+message.content+".png");
			
			$('.picture').toggleClass('pictureAnimation');

			setTimeout(function() { $('.picture').toggleClass('pictureAnimation') }, 500)
			lockDice();
		}
		// Message for unlocking the die
		if (message.type === "UNLOCK_DICE") {
			unlockDice();
		}
		// Message for locking the die
		if (message.type === "LOCK_DICE") {
			lockDice();
		}
		// Message for unlocking the die
		if (message.type === "HIDE_DICE") {
			hideDie();
		}
		if (message.type === "SHOW_COLOR") {
			$("#currPlayer").html(message.content);
		}
		if (message.type === "YOU_ARE_COLOR") {
			window.alert("You are player " +message.content);
		}
		if (message.type === "ABORT") {
			setTimeout( function() {
				window.location = 'http://localhost:3000/';
			}, 5000)
			window.alert("Someone aborted the game");
			console.log("WORKED");
		}
		if (message.type === "UPDATE_TIMER") {
			let timer = message.content;
		}
		if (message.type === "WIN") {
			$('.winneris').toggleClass('winnerisafter');
		}
		if(message.type === "START_GAME"){
			$("#wait").css("color", "black");
			$("#wait").css("font-size", "100%");
			$("#wait").html("The game has started.");
		}
		if (message.type === "START_TIMER") {
			setInterval(function () {
				timer.increment();
				document.querySelector("#timer").innerText = timer.getTime();
			}, 1000);
		}
    }

    socket.onopen = function(){
        //socket.send("Hello from the client!");
        socket.send(JSON.stringify({"title": "joinGame"}));
    };

	manageClickAndHover();
	throwDice();
	hideDie();
	lockDice();
	buttons();
	
};

$(document).ready(main);

// This function should be on the client side
function manageClickAndHover() {
	var pawnList = document.querySelectorAll("*[class*=\"pawn\"]");
	for (var i = 0; i < pawnList.length; i++) {
		pawnList[i].onclick = clickOnPawn;
		$(pawnList[i]).hover(beginHover, endHover);
	}
}

// This function should stay on the client side
// The pawn should be retrieved from the server
function beginHover() {
	socket.send(JSON.stringify({
		type: "BEGIN_HOVER",
		content: this.id.substring(1)
	}));
}

// Look at the comment above
function endHover() {
	socket.send(JSON.stringify({
		type: "END_HOVER",
		content: this.id.substring(1)
	}));
}

// This function should calculate the next tile via the server,
// Then draw via the client
function drawShadowPawn(nextTile) {
	var id = "#s" + String(nextTile);
	$(id).css("box-shadow", "inset 0 0 100px 100px rgba(0, 0, 0, 0.5)");
}

function removeShadow(tile) {
	var id = "#s" + String(tile);
	$(id).css("box-shadow", "inset 0 0 100px 100px rgba(255, 255, 255, 0.0)");
}

function clickOnPawn() {
	socket.send(JSON.stringify({
		type: "CLICK_ON_PAWN",
		content: this.id.substring(1)
	}));
}

function throwDice() {
	//If you click on the button "Roll the dice"
	$("#rollDice").on("click", function (event) {
		var value = Math.floor(Math.random() * 6) + 1;

		socket.send(JSON.stringify({
			type: "THROWN_DICE",
			content: value
		}));
	});
}

// These four methods should reside in the client
function lockDice() {
	document.getElementById("rollDice").disabled = true;
}

function unlockDice() {
	document.getElementById("rollDice").disabled = false;
}

function hideDie() {
	document.getElementById("picture").style.visibility = "hidden";
}

function showDie() {
	document.getElementById("picture").style.visibility = "visible";
}

// This function should reside in client.js, make sure the occupiedTiles remain on the client side
function drawPawns(pawnList) {
	// pawnList contains the numbers of the ID's of the squares that are occupied.

	//Iterate through the list:
	for (var i = 0; i < pawnList.length; i++) {
		// Create a string representing what the query needs to look for,
		// #p0 is the pawn created in a html div.
		var id = "#p" + String(i);

		// Get the coordinate values of the squares 
		var column = $("#s" + String(pawnList[i])).css("grid-column");
		var row = $("#s" + String(pawnList[i])).css("grid-row");

		// Set the coordinate values of the squares
		$(id).css("grid-column", String(column));
		$(id).css("grid-row", String(row));
		$(id).css("visibility", "visible");
	}
}

function toggleFullScreen() {
	if ((document.fullScreenElement && document.fullScreenElement !== null) ||
		(!document.mozFullScreen && !document.webkitIsFullScreen)) {
		if (document.documentElement.requestFullScreen) {
			document.documentElement.requestFullScreen();
		} else if (document.documentElement.mozRequestFullScreen) {
			document.documentElement.mozRequestFullScreen();
		} else if (document.documentElement.webkitRequestFullScreen) {
			document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
		}
	} else {
		if (document.cancelFullScreen) {
			document.cancelFullScreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitCancelFullScreen) {
			document.webkitCancelFullScreen();
		}
	}
}

function buttons() {
	var howToPlay = document.getElementById('howToPlay');
		var credits = document.getElementById('credits');
		var button1 = document.getElementById("button1");
		var button2 = document.getElementById("button2");
		var span = document.getElementsByClassName("close")[0];
		var span2 = document.getElementsByClassName("close2")[0];
	
		button1.onclick = function() {
			  howToPlay.style.display = "block";
		}
	
		button2.onclick = function(){
			credits.style.display = "block";
		}
	
		span.onclick = function() {
		  howToPlay.style.display = "none";
		}
	
		span2.onclick = function(){
			credits.style.display = "none";
		}
	
		window.onclick = function(event) {
		  if (event.target == howToPlay || event.target == credits) {
			howToPlay.style.display = "none";
			credits.style.display = "none";
		  }
		}
};

// TIMER OBJECT
function Timer() {
	this.seconds = 0;
	this.minutes = 0;
};

Timer.prototype.increment = function() {
	if (this.seconds === 59) {
		this.seconds = 0;
		this.minutes++;
	} else {
		this.seconds++;
	}
}

Timer.prototype.toString = function (x) {
	if (x < 10) {
		return "0" + String(x);
	} else {
		return String(x);
	} 
}

Timer.prototype.getTime = function() {
	return "Time: " + this.toString(this.minutes) + ":" + this.toString(this.seconds);
}

Timer.prototype.reset = function() {
	this.seconds = 0;
	this.minutes = 0;
}
