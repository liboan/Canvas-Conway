var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
var timer;
var playing;
var flipArray = []; //array of cell coords that will be flipped, will grow and shrink
var genotypeCount = [[0,0,0]]; //counts # of members in each genotype, 00 is [i][0], 01 is [i][1], 11 is [i][2]

var rules = {
	birth: [3,3],
	survive: [2,3]
};

var CONST_UNIT = 10;
var CONST_WIDTH = myCanvas.width/CONST_UNIT;
var CONST_HEIGHT = myCanvas.height/CONST_UNIT;
var CONST_PROB = 0.1;
var CONST_TRAIT_LIST = ["color"];


//CELL AT world[x][y] will return xth column, yth row, like cartesian
var world = new Array(CONST_WIDTH); //100 columns
for (var i = 0; i < world.length; i++) {
	world[i] = new Array(CONST_HEIGHT); //50 rows
	for (var j = 0; j < world[i].length; j++) {
		world[i][j] = new Cell(0,i,j);
		world[i][j].state = 0;
		//console.log(i + ", " + j);
	}
}

//jQuery to append table rows
$(document).ready(function() {
	var $t = $("tbody");
	for (var i = 0; i < CONST_TRAIT_LIST.length; i++) {
		console.log("APPENDED");

		$t.append("<tr id = 'row" + i + "'></tr>");
	}
});

randomFill(CONST_PROB);
toggle();


//////////////////////////////////////////////
//////////////////FUNCTIONS///////////////////
//////////////////////////////////////////////


//Play functions
function toggle() {
	//alert("toggle");
	timer = window.setInterval(play,1000);
	playing = true;
}

function pause() {
	//alert("pause");
	$button = $("#playpause");
    if (playing) { 
   	    clearInterval(timer);
    	playing = false;
    	$button.val("Click to play");
    	$button.css("background-color","greenyellow");
    	//document.getElementById("playpause").value = "Click to play";
    }
    else {
    	toggle();
    	playing = true;
    	$button.val("Click to pause");    	
    	$button.css("background-color","yellow");
    	//document.getElementById("playpause").value = "Click to pause";          
    }
}

function play() {
	//console.log("play()");
	worldCheck();
	worldFlip();
	worldFill();
}

//Event handlers for mouse


$(document).ready(function() {
	$("#canvaswrapper").mousemove(function (e) {

		var mouseX = Math.floor(e.offsetX/10);
		var mouseY = Math.floor(e.offsetY/10);

		var mouseCell = world[mouseX][mouseY];
		//console.log(mouseCell);
		var mouseCellTraits = world[mouseX][mouseY].traits;
		if (mouseCell.state != 0) {
			$("#cellinfo").text(mouseX + ", " + mouseY);
			$("#cellinfo").css("background-color",mouseCell.getColor());
			for (var i = 0; i < CONST_TRAIT_LIST.length; i++) {
				$("#geneinfo").html(CONST_TRAIT_LIST[i] + " " + mouseCellTraits[i][0] + " " + mouseCellTraits[i][1]);

			}
		}
		else {
			$("#cellinfo").text("Mouse over a cell");
			$("#cellinfo").css("background-color","white");
			$("#geneinfo").text("to see its genes");
		}
		
		$("#canvaswrapper").mousedown(function (e) {
			console.log("clicked at " + mouseX + ", " + mouseY);
		});

	});



});


//rule change function
function ruleChange() {
	var newRule = document.getElementById("rules").value;
	switch (newRule) {
		case "0":
			rules.birth = [3,3];
			rules.survive = [2,3];
			break;
		case "1":
			rules.birth = [3,3];
			rules.survive = [2,4];
			break;
		case "2":
			rules.birth = [2,3];
			rules.survive = [2,3];
			break;
	}
	randomFill(CONST_PROB);
}

//Function to update table
function updateTable() {
	$(document).ready(function() {
		var totalPop = genotypeCount[0][0] + genotypeCount[0][1] + genotypeCount[0][2];
		$("#totalpop").html("Total population: <br>" + totalPop);
		for (var i = 0; i < CONST_TRAIT_LIST.length; i++) {
			var row = "#row" + i; //id of row in table
			$(row).html("");
			$(row).append("<th>" + CONST_TRAIT_LIST[i] + "</th>");
			$(row).append("<td>" + genotypeCount[i][0] + "</td>");
			$(row).append("<td>" + genotypeCount[i][1] + "</td>");
			$(row).append("<td>" + genotypeCount[i][2] + "</td>");
		}

	});
}


//Functions for cell world logic

function worldCheck() { //checks all cells, adding flipping cell's coords to flipArray
	for (var x = 0; x < world.length; x++) {
		for (var y = 0; y < world[x].length; y++) {
			var score = world[x][y].checkSurroundings();
			//console.log("FOR " + x + ", " + y);
			if (world[x][y].liveOrDie(score)) {
				//console.log("Flipping @ " + x + "," + y + " score is " + score);
				flipArray.push([x,y]);
			}
			else {
				//console.log("not flipping: " + x + "," + y + " " + world[x][y].state);
			}
		}
	}
}


function worldFlip() { //PERFORM NO CELL LOGIC DURING THIS FUNCTION traverses flipArray and flips all cells
	console.log(flipArray.length);
	for (var i = 0; i < flipArray.length; i++) {
		var x = flipArray[i][0];
		var y = flipArray[i][1];
		world[x][y].flip();
	}
	flipArray = []; //clear entire array;
}



//UTILITY FUNCTIONS
function randomFill(probability) {
	var count = 0;
	for (i = 0; i < world.length; i++) {
	  for (j = 0; j < world[i].length; j++) {
	    var random = Math.random();
	    //console.log("RANDOM = " + random);
	    if (random < probability) {
	    	world[i][j].state = 1;
	    	world[i][j].generateGene();
	    }
	    else {
	    	world[i][j].state = 0;
	    }
	  }
	}
	//console.log("filled " + count);
	worldFill(world);
}

function worldFill() {
	for (var i = 0; i < CONST_TRAIT_LIST.length; i++) {
		genotypeCount[i] = [0,0,0];
	}

	for (var x = 0; x < world.length; x++) {
		for (var y = 0; y < world[x].length; y++) {
			fill(x,y);
		}
	}
	updateTable();
}

function fill(x,y) {
	context.fillStyle = 'white';

	if (world[x][y].state != 0) {
		//console.log("not 0");
		context.fillStyle = world[x][y].getColor();
		var geneSum;
		for (var i = 0; i < CONST_TRAIT_LIST.length; i++) { //after fill, traverse genes and add to counts
			geneSum = world[x][y].traits[i][0] + world[x][y].traits[i][1];
			genotypeCount[i][geneSum]++;
		}
	}

	context.beginPath();
	context.fillRect(x*CONST_UNIT,y*CONST_UNIT,CONST_UNIT,CONST_UNIT);
	context.closePath();
}

function randomNum(range) {
	return Math.round(Math.random() * range);
}


//CELL CLASS
function Cell(state, x, y) {
	//x and y are locations in grid
	this.x = x;
	this.y = y;

	//state is an int- 1 is alive, 0 is dead
	this.state = state;

	this.survive = [2,3]; //lower and upper bounds of surviving
	this.birth = [3,3];   //and being born

	//array of genetic traits
	this.traits = [[0,0]];

	//direction variables
	var left = 1*(this.x-1+CONST_WIDTH)%CONST_WIDTH;
	var right = 1*(this.x+1)%CONST_WIDTH;
	var up = 1*(this.y-1+CONST_HEIGHT)%CONST_HEIGHT;
	var down = 1*(this.y+1)%CONST_HEIGHT;

	//flips state
	this.flip = function() {
		this.state = Math.abs(this.state-1);
	}

	//set survival thresholds based on traits
	this.setSurvive = function() {
		//[1][1] is [1,4], rest [2,3] as normal
		if (this.traits[0][0] == 1 && this.traits[0][1] == 1) {
			this.survive = rules.survive;
			this.birth = rules.birth;
		}
		else {
			this.survive = [2,3];
			this.birth = [3,3];
		}

	}

	//gets color based on genotype
	this.getColor = function() {
		if (this.state == 0) {
			return 'white';
		}
		if (this.traits[0][0] == 0 && this.traits[0][1] == 0) {
			//console.log("recessive");
			return 'yellow';
		}
		else {
			return 'greenyellow';
		}
	}
	this.color = this.getColor();

	//generates random alleles
	this.generateGene = function() {
		for (var i = 0; i < this.traits.length; i++) {
			this.traits[i][0] = Math.round(Math.random());
			this.traits[i][1] = Math.round(Math.random());
		}
		this.setSurvive();
	}

	this.inheritGene = function() {
		var parents = this.getNeighbors();
		var parent1 = Math.floor(Math.random()*parents.length); //0 to 2
		var parent2;
		do {
			parent2 = Math.floor(Math.random()*parents.length);
		}
		while (parent1 == parent2); //get a different parent from the array

		//console.log("parent sample " + parents[parent1].traits[0][0] + " " + parents[parent2].traits[0][0]);
		//console.log("own " + this.traits[0][0] + " " + this.traits[0][1]);

		for (var i = 0; i < this.traits.length; i++) {
			this.traits[i][0] = parents[parent1].traits[i][randomNum(1)]; //randomly chooses one allele from each parent's pair
			this.traits[i][1] = parents[parent2].traits[i][randomNum(1)]; 
		}
		//console.log(this.traits[0][0] + " " + this.traits[0][1]);

		this.setSurvive();

	}

	//gets neighbors, returns array of objects- DO NOT MODIFY, ONLY READ
	this.getNeighbors = function() {
		//more direction variables
		var surround = [];
		surround[0] = world[left][up];
		surround[1] = world[this.x][up];
		surround[2] = world[right][up];
		surround[3] = world[left][this.y];
		surround[4] = world[right][this.y];
		surround[5] = world[left][down];
		surround[6] = world[this.x][down];
		surround[7] = world[right][down];

		var neighbors = [];
		for (var i = 0; i < surround.length; i++) {
			if (surround[i].state != 0) {
				neighbors.push(surround[i]);
			}
		}
		return neighbors;		
	}

	this.checkSurroundings = function() {
		return this.getNeighbors().length;
	}	

	this.liveOrDie = function(score) { //returns boolean to flip or not
		//console.log(score);
		if (this.state == 0 && (score >= this.birth[0] && score <= this.birth[1])) { //if not alive and within birth threshold, be born
			//console.log(score + " born");
			this.inheritGene();
			return true;
		}
		if (this.state == 1 && (score < this.survive[0] || score > this.survive[1])) { //if below or above survive threshold, die
			return true;
		}
		else {
			//console.log(score + " no change");
			return false;
		}
	}
}
