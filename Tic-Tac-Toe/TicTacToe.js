var grid = [["-", "-", "-"], ["-", "-", "-"], ["-", "-", "-"]];
var turn = "X";
var msg = "";
var endMsg = "";
var error = "";
var gameOver = false;

function reset() {
	grid = [["-", "-", "-"], ["-", "-", "-"], ["-", "-", "-"]];
	turn = "X";
	msg = "";
	endMsg = "";
	error = "";
	gameOver = false;
}

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

$(document).ready(function () {
    (function animloop() {
        requestAnimFrame(animloop);
        update();
    })();
});

function userClick(x, y) {
	if (gameOver) {
		return;
	}
	if (grid[x][y] == "-") {
		if (turn == "X") {
			grid[x][y] = "X";
			turn = "O";
		} else {
			grid[x][y] = "O";
			turn = "X";
		}
		error = "";
	} else {
		error = "Must be a vacant space.";
	}
}

function update() {
    $("#g00").text(grid[0][0]);
	$("#g01").text(grid[0][1]);
	$("#g02").text(grid[0][2]);
	$("#g10").text(grid[1][0]);
	$("#g11").text(grid[1][1]);
	$("#g12").text(grid[1][2]);
	$("#g20").text(grid[2][0]);
	$("#g21").text(grid[2][1]);
	$("#g22").text(grid[2][2]);
	
	if (checkForWin("X")) {
		gameOver = true;
		endMsg = "X WINS!!!";
		msg = "";
	} else if (checkForWin("O")) {
		gameOver = true;
		endMsg = "O WINS!!!";
		msg = "";
	} else if (checkForTie()) {
		gameOver = true;
		endMsg = "TIE!!!";
		msg = "";
	} else {
		msg = turn + "'s turn";
	}
	
	if (gameOver) {
		$("#restart").css("visibility", "visible");
	} else {
		$("#restart").css("visibility", "hidden");
	}
	
	$("#error").text(error);
	$("#message").text(msg);
	$("#end").text(endMsg);
}



function checkForTie() {
	for (x in grid) {
		for (y in grid) {
			if (grid[x][y] == "-") {
				return(false);
			}
		}
	}
	return(true);
}

function checkForWin(p) {
	if (grid[0][0] == p && grid[0][1] == p && grid[0][2] == p) {
		return(true);
	}
	if (grid[1][0] == p && grid[1][1] == p && grid[1][2] == p) {
		return(true);
	}
	if (grid[2][0] == p && grid[2][1] == p && grid[2][2] == p) {
		return(true);
	}
	
	
	if (grid[0][0] == p && grid[1][0] == p && grid[2][0] == p) {
		return(true);
	}
	if (grid[0][1] == p && grid[1][1] == p && grid[2][1] == p) {
		return(true);
	}
	if (grid[0][2] == p && grid[1][2] == p && grid[2][2] == p) {
		return(true);
	}
	
	
	if (grid[0][0] == p && grid[1][1] == p && grid[2][2] == p) {
		return(true);
	}
	if (grid[2][0] == p && grid[1][1] == p && grid[0][2] == p) {
		return(true);
	}
	
	return(false);
}

