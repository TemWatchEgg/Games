//file is in "Documents"
//these are items and locations that are referenced outside of the setUpEverything function

function startHandler(event){
	var startUp = document.querySelector("#startUp");
	startUp.style.display = "none";
	var theGame = document.querySelector("#theGame");
	theGame.style.display = "inline-block";
	render();
}

function setUpEverything(){
	input.addEventListener("keydown", keyDownHandler, false);
	document.querySelector("#startButton").addEventListener("click", startHandler, false);
	
	//areas
	var forest = new Area("forest", "");
	var stump = new Area("stump", "");
	var inHole = new Area("hole", 'You are in the hole. <br>Type "out" or "up" to exit the hole.');
	var stream = new Area("stream", "");
	var doorway = new Area("doorway", "");
	var southPath = new Area("path", "The path is blocked by a giant sign.");
	
	//characteristics of areas
	forest.getDescription = forestDesc;
	stump.getDescription = stumpDesc;
	stream.getDescription = streamDesc;
	doorway.getDescription = doorwayDesc;
	
	//exits
	doorway.addExit(new Exit("north", forest));
	doorway.addExit(new Exit("south", southPath));
	forest.addExit(new Exit("west", stump));
	forest.addExit(new Exit("east", stream));
	forest.addExit(new Exit("south", doorway));
	southPath.addExit(new Exit("north", doorway));
	stream.addExit(new Exit("west", forest));
	stump.addExit(new Exit("east", forest));
	
	//items	
	var hole = new Item("hole", "", stump);
	  hole.examine = lookHole;
	  hole.useOn = putInHole;
	  hole.use = useHole;
	var rock = new Item("rock", "It's a perfectly normal rock.", forest, "normal");
	  rock.useOn = useRockOn;
	var streamItem = new Item("stream", "", stream);
	  streamItem.examine = lookStream;
	  streamItem.take = takeStream;
	var statue = new Item("statue", "Better not go near it; You might get cursed or something!", doorway);
	  statue.take = tooHeavy;
	var door = new Item("door", "", doorway, "closed");
	  door.examine = lookDoor;
	  door.take = tooHeavy;
	  door.use = useDoor;
	  door.isBlockingExit = goThroughDoor;
	var sign = new Item("sign", 'The sign says, "To be continued..." in giant text.', southPath)
	  sign.take = tooHeavy;
	
	//setup finished; ready to begin game
	
	player.location = forest;
	//render();
	
	//remove this for final version of game
	cheat.location = inHole;
	cheat.thingsToPutInSack = [];
}//set up everything

/************************
  override functions
  ***********************/

function putInHole(thing) {
	if (thing.name == "rock") {
		if (thing.state == "normal") {
			thing.state = "magic";
			thing.description = "The rock has a hole in it. <br>Therefore, it is magic.";
			thing.use = useRock;
			gameMessage += "Congratulations! The rock is now magic. <br>(Everyone knows rocks with holes in them are magic.)";
		} else {
			gameMessage += "It already has a hole in it.";
		}
	} else if (thing.name == "door") {
		gameMessage += "It's stuck in the ground.";
	} else if (thing.name == "sign") {
		getAreaByName("hole").addItem(thing);
		gameMessage += "You put the " + thing.name + " in the hole.";
		thing.location.description = "The sign is gone. <br>Unfortunately, there really is nothing over here. <br>Sorry!";
	} else {
		getAreaByName("hole").addItem(thing);
		gameMessage += "You put the " + thing.name + " in the hole.";
	}
}

function useHole() {
	if (player.sack.findItemNamed("hole")) {
		gameMessage += "Try setting it down first.";
	} else {
		movePlayer(getAreaByName("hole"));
		getAreaByName("hole").exits = [new Exit("out", player.previousLocation), new Exit("up", player.previousLocation)];
		gameMessage += "You climb into the hole.";
	}
}

function lookStream() {
	gameMessage += (
		this.location.name == "stream" 
		? "It fits in very well here." 
		: "What is it doing here?"
	);
}

function takeStream() {
	if (this.location.name == "hole") {
		this.defaultTakeFunction();
		gameMessage += " <br>How did you do that?";
	} else {
		gameMessage += "No.";
	}
}

function forestDesc() {
	var stumpString = (getItemByName("hole").location.name == "stump") ? "To the west is an old rotting stump. " : "To the west is a boring old stump. ";
	var streamString = (getItemByName("stream").location.name == "stream") ? "East of you is a stream. " : "East of you is a dead end. ";
	
	return("You are in the woods. <br>" + stumpString + "<br>" + streamString + "<br>There's a large door to the south.");
}

function stumpDesc() {
	return (
		this.findItemNamed("hole")
		? "The stump is hollow. <br>It's a completely normal stump." 
		: "The stump looks like a nice place to sit. <br>You have better things to do, though."
	);
}

function streamDesc() {
	return (
		this.findItemNamed("stream") 
		? "The stream is very atmospheric." 
		: "There's nothing here."
	);
}

function doorwayDesc() {
	var statueString = (
		this.findItemNamed("statue") 
		? " <br>A stone statue of a dog snarls menacingly at you."
		: ""
	);
	var doorString = (
		this.findItemNamed("door").state == "closed" 
		? "There is a large door blocking the path to the south." 
		: "A large door stands open to the south."
	);
	return(statueString + doorString);
}

function lookHole() {
	if (this.location == player.sack) {
		gameMessage += "There's a hole in your pocket!";
	} else if (this.location.name == "stump") {
		gameMessage += "It's too dark to see what's inside the stump.";
	} else {
		gameMessage += "Be careful! you might fall in.";
	}
}

function lookDoor() {
	gameMessage += (
		this.state == "closed" 
		? "The door has a strangely shaped hole in it. <br>Perhaps a keyhole of some sort?" 
		: "Now that the door is open, you can go further south!"
	);
}

function useRock() {
	gameMessage += "You look through the hole in the rock. <br>Everything looks the same.";
}

function useRockOn(thing) {
	if (this.state == "magic" && player.location.findItemNamed("statue") && thing.name == "statue") {
		gameMessage += "You give the statue of a dog a statue of a donut and it has a statue of a snack. <br>Your statue of a score has increased by a statue of a point.";
		this.remove();
	} else if (player.location.findItemNamed("door") && thing.name == "door" && !thing.location.findItemNamed("statue")) {
		if (this.state == "magic") {
			gameMessage += "You test the rock in the hole. <br>It fits perfectly! <br>The door mysteriously opens.";
			this.remove();
			thing.state = "open";
		} else {
			gameMessage += "Nope. Doesn't fit.";
		}
	} else if (player.location.findItemNamed("door") && thing.name == "door" && thing.location.findItemNamed("statue")) {
		gameMessage += "The statue looks intimidating... You get the feeling that it might come to life at any moment. <br>You'd better not risk it.";
	} else {
		gameMessage += "I don't know what you want me to do with them.";
	}
}

function tooHeavy() {
	if (this.location.name == "hole") {
		this.defaultTakeFunction();
		gameMessage += " <br>How did you do that?";
	} else {
		gameMessage += "It's too heavy.";
	}
}

function useDoor() {
	gameMessage += 'Try typing "south" instead.';
}

function goThroughDoor(theExit) {
	if (this.state == "closed" && theExit.destination.name == "stream") {
		gameMessage += "The door is blocking the path forward.";
		return(true);
	}
}