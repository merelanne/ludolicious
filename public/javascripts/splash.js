

var main = function(){

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
$(document).ready(main);

cookie_name = "Times_visited";

function doCookie() {
	if(document.cookie){
		index = document.cookie.indexOf(cookie_name);
	} 

	else{
		index = -1;
		console.log("no");
	}
	var expires = "Monday, 04-Feb-2019 05:00:00 CET"

	if (index == -1){
		document.cookie=cookie_name+"=1; expires=" + expires;
	} 

	else {
		countbegin = (document.cookie.indexOf("=", index) + 1);
		countend = document.cookie.indexOf(";", index);
		if (countend == -1) {
			countend = document.cookie.length;
		}
		count = eval(document.cookie.substring(countbegin, countend)) + 1;
		document.cookie=cookie_name+"="+count+"; expires=" + expires;
	}

	window.alert("You have entered this screen " + gettimes() + " times before." )
}


function gettimes() {
	if(document.cookie) {
		index = document.cookie.indexOf(cookie_name);
		if (index != -1) {
			countbegin = (document.cookie.indexOf("=", index) + 1);
			countend = document.cookie.indexOf(";", index);

			if (countend == -1) {
				countend = document.cookie.length;
			}
			count = document.cookie.substring(countbegin, countend);
			}
	}
	return count;


}
