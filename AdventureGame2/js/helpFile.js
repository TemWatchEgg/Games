function hintSomething() {
	switch (player.location.name) {
		default:
			gameMessage += "I can't help you right now.";
			break;
	}//switch
}//hintSomething

function helpSomething() {
	gameMessage += "In case you need a reminder, here are some of the main actions you can use: " + 
  "<ul>" + 
  "<li>any direction (like north, south, east, west, up, down, out, etc.) </li>" + 
  "<li>back (to return to your previous location) </li>" + 
  "<li>examine/look/x [item]</li>" + 
  "<li>take [item]</li>" + 
  "<li>drop [item]</li>" + 
  "<li>use [item]</li>" + 
  "<li>use [item] on [item]</li>" + 
  "<li>give [item] to [person]</li>" + 
  "<li>help (this!) </li>" + 
  "<li>hint (DO NOT USE unless you're completely stumped!) </li>" + 
  "</ul>";
}

