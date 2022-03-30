//write boat.use function that adds boat to goWith list and gives appropriate message
//it moves them into the river, and the river sweeps them to dockStairs.
//player can't get out of boat until it gets to dockStairs, if no oars. Don't take boat when get out.

/*************************
	Templates:
	*************************/

function Item (myName, myDescription, myLocation, myState) {
	this.name = myName;
	this.description = myDescription;
	this.location = null;
	this.state = myState;
	itemList.push(this);
	
	if (myLocation) {
		myLocation.addItem(this);
	}
	
	this.use = function () {
		gameMessage += "I don't know how to use a " + this.name + ".";
		// This is the default 'use' function, which is just a message.  Many
		// items will override it with a specialized use.
	}
	
	this.useOn = function (thing) {
		gameMessage += "I don't know what you want me to do with them.";
	}
	
	this.drop = function () {
		// This is the default 'drop' function.  Some items will override it
		// with a specialized drop, for example a mirror that breaks if you drop it,
		// or a handcuff that is locked to your wrist so you can't get rid of it.
		if (player.sack.containsItem(this)) {
			player.location.addItem(this);
		} else {
			console.log("BUG! Drop item " + this.name + " called when item is not in sack.");
		}
	}
	
	this.examine = function () {
		//next follows default description; some items will override 
		if (this.description != null && this.description != "") {
			gameMessage += this.description;
		} else {
			gameMessage += "There is nothing special about it."
		}
	}//this.examine
	
	this.leftBehind = function () {
		//this will be called when player leaves something in an area
	}
	
	// NOTE: if the player typed "back" or "go back" then theExit will be a temporary exit
	// leading to the player's previous location, with no name or special properties
	this.isBlockingExit = function (theExit) {
		// When the player attempts to use an exit, we will first call blockExit(theExit) on
		// each of the items in the player's location and the player's inventory.  Normally,
		// they will all return false, and the player will go through the exit.
		// If an item wants to prevent the player from using an exit, it should override
		// isBlockingExit(theExit) with a function that gives a message about the exit being
		// blocked, and return true.  This will often be based on the state of the item.
		// Examples: a large boulder blocks a tunnel until it is rolled aside.  A magic frog
		// blocks all exits until it is thanked.  A box is too large to fit through a
		// door, so the player can't use that door while carrying the box.
		// Note: theExit is provided as a parameter, so the item can choose to block just one specific
		// exit or all exits, and can look at properties you might store on the exit.
		return false;
	}
	
	this.defaultTakeFunction = function () {
		// This is the default 'take' function.  Some items will override it
		// with a specialized take, for example a bowl of milk that spills if
		// you take it, or a giant boulder that is too heavy to take.
		if (this.location != player.location) {
			console.log("BUG! Take item " + this.name + " called when player is in " + player.location.description + " and item is not there.");
		}
		
		player.sack.addItem(this);
		gameMessage += "You take the " + this.name + ".";
		
		}
		
		this.take = this.defaultTakeFunction;
	
	this.remove = function () {
		this.location.removeItem(this);
	}
	
}//function Item

function getItemByName(itemName) {
	for (i in itemList) {
		if (itemList[i].name == itemName) {
			return(itemList[i]);
		}
	}
	return(null);
}

function Area(myName, myDescription) {//area
	this.name = myName;
	this.description = myDescription;
	this.getDescription = function () {
		return this.description;
	}//get description
	areaList.push(this);
	
	this.exits = [];
	this.items = [];
	
	this.addExit = function (newExit) {
		this.exits.push(newExit);
	}//addExit
	
	this.addItem = function (newItem) {
		//console.log(newItem.name + " is in " + (newItem.location ? newItem.location.name : "NULL") + " at beginning of addItem.");
		if (newItem.location != null) {
			newItem.location.removeItem(newItem);
		}
		this.items.push(newItem);
		newItem.location = this;
	}//addItem
	
	this.removeItem = function (myItem) {
		if (this.containsItem(myItem)) {
			var myItemIndexNumber = this.items.indexOf(myItem);
         	this.items.splice(myItemIndexNumber, 1);
         	myItem.location = null;
        }//if
	}//remove myItem
	
	this.containsItem = function(myItem) {
		return (myItem.location == this);
		//if myItem isn't in this location, then statement is false
	}//contains myItem
	
	this.findItemNamed = function(itemName) {
		for (var i = 0; i < this.items.length; i++) {
			if (this.items[i].name == itemName) {
				return this.items[i];
			}
		}
		return null;
	}
	
	this.tryExit = function(playerInput) {
		// Return true if we processed the command (i.e. the player's input matched the name of
		// an exit from this area, and we have either moved the player there or run some blocked exit code).
		// Return false if we didn't find an exit matching that input.
		// (Special case: If player typed "back" and there's no exit by that name, treat it as
		// an exit leading to player's previous location.)
		const NO_EXIT_FOUND = "NOT AN EXIT";
		var theExit = NO_EXIT_FOUND;
		for (var i = 0; i < this.exits.length; i++) {
			if (playerInput == this.exits[i].direction) {
				theExit = this.exits[i];
				break;
			}
		}//looping thru looking at exits
		if ((theExit == NO_EXIT_FOUND) && (playerInput == "back")) {
			theExit = new Exit("back", player.previousLocation);
		}
		if ((theExit == NO_EXIT_FOUND) || !theExit.destination) {
			return false;
		}
		
		if (this.somethingBlocksExit(theExit)) {
			return true;
		}
		
		// Don't change previous location if player is staying in same spot, or 'back' will break!
		movePlayer(theExit.destination, theExit.specialHandling);
		
		return true;
	} // tryExit
	
	this.somethingBlocksExit = function(theExit) {//returns true if anything is blocking the exit
		/* This is almost the same as writing
		var blockA = somethingInListBlocksExit(this.items, theExit);
		var blockB = somethingInListBlocksExit(player.sack.items, theExit);
		return (blockA || blockB);
		*/
		return (somethingInListBlocksExit(this.items, theExit) ||
				somethingInListBlocksExit(player.sack.items, theExit));
	}
	
	this.getContents = function() {
		var itemNames = "";
		for (var i = 0; i < this.items.length; i++) {
			if (i > 0) {
				itemNames += ", ";
			}
			itemNames += this.items[i].name;
		}//for
		return itemNames;
	}//this.getContents
}//functionArea

function getAreaByName(areaName) {
	for (i in areaList) {
		if (areaList[i].name == areaName) {
			return(areaList[i]);
		}
	}
	return(null);
}

function Exit(myDirection, myDestination, specialHandling) {
	// specialHandling is an optional function that will be called after the player goes through the exit
	this.specialHandling = specialHandling;
	this.direction = myDirection;
	this.destination = myDestination;
}//function Exit

function movePlayer(newLocation, specialHandling) {
	for (var i = 0; i < player.goWith.length; i++) {
		newLocation.addItem(player.goWith[i]);
	}
	for (var i = 0; i < player.location.items.length; i++) {
		player.location.items[i].leftBehind();
	}//loop thru all items at that destination
	if (newLocation != player.location) {
		player.previousLocation = player.location;
	}
	player.location = newLocation;
	if (specialHandling) {
		specialHandling();
	}
}//function movePlayer

function somethingInListBlocksExit(listOfItems, theExit) {
	for (var i = 0; i < listOfItems.length; i++) {
		if (listOfItems[i].isBlockingExit(theExit)) {
			return true;
		}
	}
	return false;
}

	/*************************
	End of templates; begin globals
	*************************/

var itemList = [];
var areaList = [];

var player = {
	location: null,//this is defined as program runs
	previousLocation: null,
	sack: new Area("backpack", "You are in a backpack. How did that happen?"),
	goWith: [], //things that move along with player, but aren't carried
	
	itemHereNamed: function (name) {
		var item = this.sack.findItemNamed(name);
		if (!item) {
			item = this.location.findItemNamed(name);
		}
		return(item);
	}
	
}//player

var input = document.querySelector("#input");
var output = document.querySelector("#output");
var gameMessage = "";

var cheat = {
	location: null,
	thingsToPutInSack: []
}//cheat

	/**************************
	End of globals; begin infrastructure
	**************************/
// standardDirections is an object; brackets enclose an associative array, a set of properties 
// that can be accessed by the first word of each pair of words (e.g. standardDirections["north"])	
const standardDirections = {
	"north":true,
	"south":true,
	"east":true,
	"west":true,
	"up":true,
	"down":true,
	"back":true,
	"out":true
}


function keyDownHandler(event) {
  if (event.keyCode == 13) {
    playGame();
  }
}

function playGame(){
	var playersInput = input.value;
	playersInput = playersInput.toLowerCase();
	//console.log("You typed " + playersInput);
	var wordsTyped = playersInput.split(" ");//divides into several strings, in an array wordsTyped
	var destination;
	if (wordsTyped[0]=="go") {
		wordsTyped.splice(0,1);	
	}
	var myThing = wordsTyped[1];
	switch (wordsTyped[0]) {
		case "take":
		case "get":
			getSomething(myThing);
			break;
		case "drop":
			dropSomething(myThing);
			break;
		case "look":
		case "x":
		case "examine":
			examineSomething(myThing);
			break;
		case "use":
			if (wordsTyped[2] == "on") {
				useSomething(myThing, wordsTyped[3]);
			} else {
				useSomething(myThing, null);
			}
			break;
		case "help":
			helpSomething();
			break;
		case "hint":
			hintSomething();
			break;
		case "cheat":
			//remove in final version of game
			cheatSomething();
			break;
		default:
			var usedExit = player.location.tryExit(wordsTyped[0]);//returns true if exit found, false if not found
			if (!usedExit) {
				if (standardDirections[wordsTyped[0]]) {
				//note syntax for accessing item in associative array
					gameMessage += "You can't go that way.";
				} else {
					gameMessage += "I don't understand how to " + input.value + ".";
				}
			}
			break;
	}//switch

	
	render();
}//playGame

function render(){
	output.innerHTML =  "<em>" + gameMessage + "</em><br><br>";
	output.innerHTML += player.location.getDescription();
	output.innerHTML += "<br>"
	
	var itemsHere = player.location.getContents();
	if (itemsHere != "") {
		output.innerHTML += "<br><br>You see: <strong>" + itemsHere + "</strong>.";
	}
	var carrying = player.sack.getContents();
	if (carrying == "") {
		carrying = "nothing";
	}
	output.innerHTML += "<br>" + "You are carrying <strong>" + carrying + "</strong>.<br><br>";
	
	input.value = ""; 
 	input.focus();
 	gameMessage = ""; 
}//render

/************************
  action functions
  ***********************/

function getSomething(thing) {
	var itemInSack = player.sack.findItemNamed(thing);
	var itemHere = player.location.findItemNamed(thing);
	if (itemInSack != null) {
		gameMessage += "You already have " + thing + ".";
	} 
	else if (itemHere == null) {
			gameMessage = "There's no " + thing + " here.";
	}
	else {
		itemHere.take();
	}
}

function dropSomething(thing) {
	var myItem = player.sack.findItemNamed(thing);
	if (myItem == null) {
		gameMessage += "You don't have a " + thing + ".";
	} else {
		myItem.drop();
	}
}// dropSomething

function examineSomething(thing) {
	var myItem = player.itemHereNamed(thing);
	if (myItem != null) {
		myItem.examine();
	} else {
		gameMessage += "Either there's no " + thing + " here, or it's not worth looking at.";
	}
}//examineSomething

function useSomething(thing1, thing2) {
	var item1 = player.itemHereNamed(thing1);
	if (!thing2) {
		if (item1) {
			item1.use();
		} else {
			gameMessage += "I don't see a " + thing1 + " here.";
		}
	} else {
		var item2 = player.itemHereNamed(thing2);
		if (!item1) {
			gameMessage += "I don't see a " + thing1 + " here.";
		} else if (!item2) {
			gameMessage += "I don't see a " + thing2 + " here.";
		} else if (item1 != item2) {
			item1.useOn(item2);
		} else {
			gameMessage += 'Try just typing, "use ' + thing1 + '".'
		}
	}
}//useSomething

function cheatSomething() {
	gameMessage += "Cheat function for debugging purposes";
	movePlayer(cheat.location);
	for (i in cheat.thingsToPutInSack) {
		var item = cheat.thingsToPutInSack[i];
		player.sack.addItem(item);
	}
}

function codeCheck(words) {
	var theCode = "very hard to guess";
	if (words == theCode) {
		movePlayer(getAreaByName("secret1"));
		gameMessage = "";
	} else if (player.location.name == "start") {
		gameMessage += "Not quite.";
	}
}


setUpEverything();//this is the only thing that runs at boot-up time