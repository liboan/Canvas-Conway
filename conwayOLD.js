var CONST_UNIT = 10;
var CONST_WIDTH = myCanvas.width/CONST_UNIT;
var CONST_HEIGHT = myCanvas.height/CONST_UNIT;
var CONST_SIZE = CONST_WIDTH * CONST_HEIGHT;

var worldA = new Array(CONST_SIZE);
var worldB = new Array(CONST_SIZE);
var gene = 3;
var randomThresh = 0.2
var timer;
var mousedown;

for (var i = 0; i < CONST_SIZE; i++) {
	worldA[i] = 0;
	worldB[i] = 0;
}

var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');


function index(x,y) { 				//as opposed to old, array goes left to right, reading-style.
	return 1*(y*CONST_WIDTH + x);
}

function fill(x,y,color) {
	context.fillStyle = 'white';

	switch (color) {
		case 2:
			context.fillStyle = 'yellow';
			break;
		case 3:
			context.fillStyle = 'green';
			break;
		case 4:
			context.fillStyle = 'blue';
			break;
		default:
			context.fillStyle = 'white';
	}

	/*if (color == 3) {
		context.fillStyle = "green";
	}

	else {
		context.fillStyle = "white";
	}*/

	context.beginPath();
	context.fillRect(x*CONST_UNIT,y*CONST_UNIT,CONST_UNIT,CONST_UNIT);
	context.closePath();
}

function printWorld(world) {
	for (var a = 0; a < world.length; a++) {
		var score = checkSurroundings(world,a);
		console.log(a + ": " + world[a] + " score: " + score);
	}
}

function randomGene(threshold) { //parameter determines spawn chance of non-green 
	if (Math.random() < threshold) { //lower threshold spawns gene-1
		return -1;
	}
	else if (Math.random() > 1 - threshold) { //higher threshold spawns gene+1
		return 1;
	}
	else { //if between, spawn gene
		return 0;
	}
}

function purgeWorld(world) {
	for (a = 0; a < world.length; a++) {
		world[a] = 0;
	}
	return world;
}

function copyWorld(origin,destination) {
	for (a = 0; a < origin.length; a++) {
		destination[a] = origin[a];
	}
	return destination; //spits out array
}

function fillGrid(world) {
	for (var i = 0; i < CONST_HEIGHT; i++) {
		for (var j = 0; j < CONST_WIDTH; j++) {
			//console.log("filling " + index(j,i) + " with " + world[index(j,i)]);
			fill(j,i,world[index(j,i)]);
			/*if (world[index(j,i)] != 0) {
				fill(j,i,world[index(j,i)]);
			}
			else {
				fill(j,i,0);
			}*/
		}
	}
}


function randomFill(probability, world) {
	for (i = 0; i < CONST_HEIGHT; i++) {
	  for (j = 0; j < CONST_WIDTH; j++) {
	    var random = Math.random();
	    //console.log("RANDOM = " + random);
	    if (random < probability) {
	    	world[index(j,i)] = 1*(gene + randomGene(randomThresh));
	    	//document.write(index(i,j) + " ");
	    	console.log("Filled " + j + "," + i + " at index " + index(j,i))
	    }
	    else {
	    	world[index(j,i)] = 0;
	    }
	  }
	}
	fillGrid(world);
}

function checkSurroundings(world,index) {
	//coordinates
	var northwest = 1*(index - CONST_WIDTH - 1);
	var north = 1*(index - CONST_WIDTH);
	var northeast = 1*(index - CONST_WIDTH + 1);
	var west = 1*(index - 1);
	var east = 1*(index + 1);
	var southwest = 1*(index + CONST_WIDTH - 1);
	var south = 1*(index + CONST_WIDTH);
	var southeast = 1*(index + CONST_WIDTH + 1);

	var score = 0;

	if (northwest >= 0 && northwest < CONST_SIZE && world[northwest] != 0) {
		//console.log("NW");
		score++;
	}

	if (north >= 0 && north < CONST_SIZE && world[north] != 0) {
		//console.log("N");
		score++;
	}

	if (northeast >= 0 && northeast < CONST_SIZE && world[northeast] != 0) {
		//console.log("NE");
		score++;
	}

	if (west >= 0 && west < CONST_SIZE && world[west] != 0) {
		//console.log("W");
		score++;
	}

	if (east >= 0 && east < CONST_SIZE && world[east] != 0) {
		//console.log("E");
		score++;
	}

	if (southwest >= 0 && southwest < CONST_SIZE && world[southwest] != 0) {
		//console.log("SW");
		score++;
	}

	if (south >= 0 && south < CONST_SIZE && world[south] != 0) {
		//console.log("S");
		score++;
	}
	
	if (southeast >= 0 && southeast < CONST_SIZE && world[southeast] != 0) {
		//console.log("SE");
		score++;
	}
	return score;
}

function liveOrDie(world, index) {  //going for single-case instead
		//console.log("for " + index);
		var score = checkSurroundings(worldA,index);
		if (world[index] != 0) { //occupied
			if (score > world[index] || score < (world[index]-1)) { //bigger than gene = overcrowded, less than gene-1 = lonely
				console.log("Killed " + index + " member: " + world[index]);
				//console.log("World A index 7: " + worldA[7] + " World B index 7: " + worldB[7]); 
				return 0;
			}
			else {
				console.log("Let " + index + " live, member: " + world[index]);
				return world[index];
			}
		}

		else { //unoccupied
			if (score == gene) { //exactly gene # of neighbors = create one randomly
				//console.log("Created " + index + " score: " + score);
				console.log(index + " is unoccupied, filling");
				return 1*(gene+randomGene(randomThresh));
			}
			//console.log(index + " is unoccupied but will not be filled");
			return 0;
		}
}

randomFill(0.2, worldA);
playing = true;

play();



/*console.log(".........................worldA......................");
printWorld(worldA);
worldB = liveOrDie(worldA,worldB);
console.log(".........................worldB......................");
printWorld(worldB);*/

function play() {
	timer = window.setInterval(function() {
		 stage();
	},1000);

}

function pause() {
    if (playing) {
   	    clearInterval(timer);
    	playing = false;
    	document.getElementById("playpause").value = "Click to play";
    }
    else {
    	play();
    	playing = true;
    	document.getElementById("playpause").value = "Click to pause";          
    }
}

function stage() {
	for (var i = 0; i < worldA.length; i++) {
		worldB[i] = liveOrDie(worldA,i);

		//console.log("passing " + i);
		/*if (liveOrDie(worldA,i) != 0) { //if not 0, meaning survive or birth
			worldB[i] = gene;
			console.log("worldB[" + i + "] is " + worldB[i] + ", not 0");
		}
		else { //false = dead
			worldB[i] = 0;
		}*/
	} 
	fillGrid(worldB); //now that worldB is done, we print it
	console.log("........worldB........");
	//printWorld(worldB);
	worldA = copyWorld(worldB,worldA); //copy worldB to worldA SOMETHING IS WRONG HERE
	console.log(".....worldA copied....");
	//printWorld(worldA);
	worldB = purgeWorld(worldB); //purge worldB	
	console.log("...worldB purged......");
	//printWorld(worldB);
}

canvas.addEventListener('mousedown', function (evt) {
    mousedown = true;
},false);

canvas.addEventListener('mousemove', function (evt) {
    var coordX, coordY;
    coordX = Math.floor(evt.offsetX / 10);
    coordY = Math.floor(evt.offsetY / 10);
    //document.getElementById("mousePos").innerHTML = coordX + "," + coordY + " " + coordX*coordY;        

    if (mousedown && coordX < CONST_WIDTH && coordY < CONST_HEIGHT) {

      worldA[index(coordX,coordY)] = gene;
      //fillCircleGrid(worldA); no need to fill whole grid every time for one cell
      fill(coordX,coordY,3);         
    }

},false);

canvas.addEventListener('mouseup', function(evt) {
    mousedown = false;
},false);
