
var timer = function() {
	this.seconds = 0;
	this.minutes = 0;
};

timer.prototype.increment = function() {
    if (this.seconds === 59) {
        this.seconds = 0;
        this.minutes++;
    } else {
        this.seconds++;
    }
}

timer.prototype.toString = function (x) {
    if (x < 10) {
        return "0" + String(x);
    } else {
        return String(x);
    } 
}

timer.prototype.getTime = function() {
    return "Time: " + this.toString(this.minutes) + ":" + this.toString(this.seconds);
}

timer.prototype.reset = function() {
    this.seconds = 0;
    this.minutes = 0;
}

module.exports = timer;

