// snake.js
// A simple excursion into game programming using HTML5 Canvas

const gameWidth = 450;
const gameHeight = 450;
const wallSize = 5;
const snakeSpeed = 20;

// Key codes
const LEFT_ARROW = 37;
const UP_ARROW = 38;
const RIGHT_ARROW = 39;
const DOWN_ARROW = 40;
const A_KEY = 65;
const W_KEY = 87;
const D_KEY = 68;
const S_KEY = 83;
const ESC = 27;
const SPACEBAR = 32;

var context;
var segments;
var snakeLength;
var paused;
var lastDirection;
var lost;
var moveStage;
var gameMode = "classic";
var playing = false;
var head;
var apple;

function start() {
	head = {
		x: (gameWidth - 40) / 2,
		y: (gameHeight - 40) / 2,
		
		width: 20,
		height: 20,
		
		direction: "right",
		
		moveClassic: function () {
			if (this.direction == "left") {
				this.x = Math.max(0, this.x - snakeSpeed);
			} else if (this.direction == "right") {
				this.x = Math.min(gameWidth - this.width, this.x + snakeSpeed);
			}
			if (this.direction == "up") {
				this.y = Math.max(0, this.y - snakeSpeed);
			} else if (this.direction == "down") {
				this.y = Math.min(gameHeight - this.height, this.y + snakeSpeed);
			}
			if (this.x <= 0 || this.x >= gameWidth - this.width || this.y <= 0 || this.y >= gameHeight - this.height) {
				lose();
			}
			for (i in segments) {
				if (this.x == segments[i].x && this.y == segments[i].y) {
					lose();
				}
			}
			newSegment();
		},
		
		moveInfinite: function () {
			if (this.direction == "left") {
				this.x = this.x - snakeSpeed;
			} else if (this.direction == "right") {
				this.x = this.x + snakeSpeed;
			}
			if (this.direction == "up") {
				this.y = this.y - snakeSpeed;
			} else if (this.direction == "down") {
				this.y = this.y + snakeSpeed;
			}
			
			if (this.x <= -this.width) {
				this.x = gameWidth - this.width - this.getXOffset();
			} else if (this.x >= gameWidth) {
				this.x = 0 + this.getXOffset();
			}
			if (this.y <= -this.height) {
				this.y = gameHeight - this.height - this.getYOffset();
			} else if (this.y >= gameHeight) {
				this.y = 0 + this.getYOffset();
			}
			for (i in segments) {
				if (this.x == segments[i].x && this.y == segments[i].y) {
					lose();
				}
			}
			newSegment();
		},
		
		move: function () {
			if (gameMode == "classic") {
				this.moveClassic();
			} else if (gameMode == "infinite") {
				this.moveInfinite();
			}
		},
		
		getXOffset: function () {
			return (this.x % this.width);
		},
		
		getYOffset: function () {
			return (this.y % this.height);
		}
	};
	
	apple = {
		x: gameWidth / 2,
		y: gameHeight / 2,
		width: 10,
		height: 10,
		
		
		eatCheck: function () {
			if (this.x == head.x && this.y == head.y) {
				snakeLength++;
				
				do {
					this.x = head.getXOffset() + (Math.floor(Math.random() * (gameWidth / head.width - 1)) * head.width);
					this.y = head.getYOffset() + (Math.floor(Math.random() * (gameHeight / head.height - 1)) * head.height);
				} while (!this.validPos());
			}
		},
		
		validPos: function () {
			for (i in segments) {
				if (segments[i].x == this.x && segments[i].y == this.y) {
					return(false);
				}
			}
			return(true);
		},
		
		draw: function () {
			drawRectWithBorder(this.x + 5, this.y + 5, this.width, this.height, "red");
		}
	};
	
	segments = [];
	snakeLength = 5;
	paused = false;
	lost = false;
	moveStage = 5;
	playing = true;
	$("#myCanvas").focus();
}

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

$(document).ready(function () {
    var canvas = document.getElementById('myCanvas');
    canvas.width = gameWidth;
    canvas.height = gameHeight;
    context = canvas.getContext('2d');

    setUpEventHandlers();
    
    (function animloop() {
        requestAnimFrame(animloop);
        update();
    })();
});

function setUpEventHandlers() {
    $(document).keydown(keyDownHandler);

    // Click works for both mouse and touchscreen
    $("#myCanvas").click(playOrPause);
	$("#myCanvas").attr("tabindex", 0);
}

function keyDownHandler(event) {
    switch (event.keyCode) {
        case LEFT_ARROW:
			event.preventDefault();
			head.direction = "left";
            break;
		case A_KEY:
			head.direction = "left";
			break;
        case UP_ARROW:
			event.preventDefault();
			head.direction = "up";
            break;
		case W_KEY:
			head.direction = "up";
			break;
		case RIGHT_ARROW:
			event.preventDefault();
			head.direction = "right";
			break;
		case D_KEY:
			head.direction = "right";
			break;
		case DOWN_ARROW:
			event.preventDefault();
			head.direction = "down";
			break;
		case S_KEY:
			head.direction = "down";
			break;
        case ESC:
            playOrPause();
    }
}

function playOrPause() {
	if (!playing) {
		start();
		return;
	}
    if (paused) {
        paused = false;
		head.direction = lastDirection;
    } else {
        paused = true;
		lastDirection = head.direction;
		
        context.font = "80px Arial bold";
        context.fillStyle = "MediumPurple";
        context.textAlign = "center";
        context.fillText("Paused", gameWidth / 2, gameHeight / 2);
    }
}

function clearCanvas() {
    context.clearRect(0, 0, gameWidth, gameHeight);
}

function newSegment() {
	if (segments.length == snakeLength) {
		segments.splice(0, 1);
	}
	segments.push({
		x: head.x,
		y: head.y,
		width: head.width,
		height: head.height,
		
		draw: function () {
			drawRectWithBorder(this.x, this.y, this.width, this.height, "green");
		}
	})
}

function lose() {
	segments.splice(0, segments.length);
	lost = true;
	playing = false;
}

function update() {
	if (gameMode != document.getElementById('gameMode').value) {
		gameMode = document.getElementById('gameMode').value;
		start();
	}
	
	if (paused) {
		return;
	}
	
    clearCanvas();

	if (!playing && !lost) {
		var snakeIcon = $("#snakeIcon")[0];
		context.drawImage(snakeIcon, 0, 0);

		context.font = "30px Arial bold";
        context.fillStyle = "black";
		writeAtVerticalOffset("Esc to play!", 0);
	}	

    drawWalls();
	
	if (lost) {
		context.font = "80px Arial bold";		
        context.fillStyle = "red";
	    writeAtVerticalOffset("Game", -40);
		writeAtVerticalOffset("Over", 40);
		
		context.font = "30px Arial bold";
        context.fillStyle = "black";
		writeAtVerticalOffset("(press Esc to play again!)", 100);
        return;
    }
	
	if (!playing) {
		return;
	}
	
	moveStage = moveStage - 1;
	if (moveStage == 0) {
		head.move();
		moveStage = 5;
		apple.eatCheck();
	}
	for (i in segments) {
		segments[i].draw();
	}
	apple.draw();
}

function writeAtVerticalOffset(text, verticalOffset) {
	context.textAlign = "center";
	context.fillText(text, gameWidth / 2, gameHeight / 2 + verticalOffset);
}

function drawWalls() {
    drawRectWithBorder(0, 0, gameWidth, wallSize);
    drawRectWithBorder(0, 0, wallSize, gameHeight);
    drawRectWithBorder(gameWidth - wallSize, 0, wallSize, gameHeight);
	drawRectWithBorder(0, gameHeight - wallSize, gameWidth, wallSize);
}

// Generalized function for bordered rectangles.  It's overkill for how it
// ended up being used here, but I started out thinking I was working 
// toward a BreakOut game!
function drawRectWithBorder(left, top, width, height, color, borderColor) {
    context.beginPath();
    context.rect(left, top, width, height);
    context.fillStyle = (color == undefined) ? "black" : color;
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = (borderColor == undefined) ? "black" : borderColor;
    context.stroke();
}
