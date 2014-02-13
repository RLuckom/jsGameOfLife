function GameOfLife (world_map) {
	this.mapArray = world_map.worldMap;
}

function GameOfLife(screenWidth, screenHeight, unitWidth, unitHeight) {
	//Clockwise from 12 o'clock
	this.dx = [0, 1, 1, 1, 0, -1, -1, -1];
	this.dy = [-1, -1, 0, 1, 1, 1, 0, -1];
	this.screenWidth = screenWidth;
	this.screenHeight = screenHeight;
	this.unitWidth = unitWidth;
	this.unitHeight = unitHeight;
	this.squareWidth = screenWidth / unitWidth;
	this.squareHeight = screenHeight / unitHeight;
	this.liveColor = 'black';
	this.deadColor = 'white';
	this.svgns = "http://www.w3.org/2000/svg";
	this.svg = document.createElementNS(this.svgns, "svg:svg");
	this.svg.setAttribute('height', screenHeight);
	this.svg.setAttribute('width', screenWidth);
	this.svg.setAttribute('stroke-width', '2px');
	this.svg.setAttribute('stroke', 'black');
	this.alive = 1;
	this.dead = 0;
	this.running = true;
	var s ="0 0 " + screenWidth + " " + screenHeight;
	this.svg.setAttribute('viewBox', s);
	this.svg.addEventListener("mouseleave", this.makeOnMouseLeave());
	this.svg.addEventListener("mouseenter", this.makeOnMouseEnter());
	this.worldMap = this.createSquares();
	this.worldHeight = this.worldMap.length;
	this.worldWidth = this.worldMap[0].length;
}

GameOfLife.prototype = {
	
	createSquares: function() {
		var grid = [];
		var lastY = this.screenHeight + this.squareHeight;
		for (n = this.squareHeight; n < lastY; n += this.squareHeight) {
			var newRow = [];
			for (m = 0; m < this.screenWidth; m += this.squareWidth) {
				var x = m;
				var y = this.screenHeight - n; 
				var newSquare = new GridSquare(x, y, this);
				newRow.push(newSquare);
			}
			grid.push(newRow);
		}
		return grid;
	},
	
	colorSquare: function(x, y, color) {
		this.worldMap[y][x].setColor(color);
	},
	
	toggleSquareColor: function(x, y) {
		this.worldMap[y][x].toggleColor();
	},
	
	getNeighborPoints: function(x, y) {
		var neighbors = [];
		for (n = 0; n < this.dx.length; n ++) {
			var new_x = x + this.dx[n],
			    new_y = y + this.dy[n],
			    within_x = (0 <= new_x) && (new_x < this.worldWidth),
			    within_y = (0 <= new_y) && (new_y < this.worldHeight);
			if (within_x && within_y) {
				neighbors.push([new_x, new_y]);
			}
		}
		return neighbors;
	},
	
	getNeighborValues: function(x, y) {
		var neighborPoints = this.getNeighborPoints(x, y),
		    neighborValues = [];
		for (n = 0; n < neighborPoints.length; n++) {
			p = neighborPoints[n];
			neighborValues.push(this.worldMap[p[1]][p[0]]);
		}
		return neighborValues;
	},

	getSumOfLiveNeighbors: function(x, y) {
		return this.getNeighborValues(x, y).reduce(
			function (n, m) {return n + m.getAliveOrDead();}, 0);
	},
	
	runGameOfLife: function () {
		if (!this.running) {
			return;
		}
		var toggleSquares = [];
		for (y = 0; y < this.unitHeight; y++) {
			for (x = 0; x < this.unitWidth; x++) {
				var cellState = this.worldMap[y][x].getAliveOrDead();
				//console.log(cellState);
				var numLivingNeighbors = this.getSumOfLiveNeighbors(x, y);
				var newState = this.GoLRules(cellState, numLivingNeighbors);
				if (cellState != newState) {
					toggleSquares.push([x, y]);
				}
			}
		}
		for (n = 0; n < toggleSquares.length; n++) {
			var point = toggleSquares[n];
			this.worldMap[point[1]][point[0]].toggleColor();
		}
		var worldMap = this;
		window.setTimeout(function() {worldMap.runGameOfLife();}, 75);
	},
	
	makeOnMouseLeave: function() {
		worldMap = this;
		return function() {
			//console.log(worldMap.running);
			worldMap.running = true;
			worldMap.runGameOfLife();
		};
	},
	
	makeOnMouseEnter: function() {
		worldMap = this;
		return function() {
			worldMap.running = false;
		};
	},
	
	GoLRules: function(cellState, numLivingNeighbors) {
		//console.log(cellState, numLivingNeighbors, this.alive, this.dead);
		if (cellState == this.alive && numLivingNeighbors < 2) {
			return this.dead;
		}
		if (cellState == this.alive && numLivingNeighbors <= 3) {
			return this.alive;
		}
		if (cellState == this.alive && numLivingNeighbors > 3) {
			return this.dead;
		}
		if (cellState == this.dead && numLivingNeighbors == 3) {
			return this.alive;
		}
		return this.dead;
	}
};

function GridSquare(x, y, parent) {
	this.x = x;
	this.y = y;
	this.alive = parent.alive;
	this.dead = parent.dead;
	this.liveColor = parent.liveColor;
	this.deadColor = parent.deadColor;
	this.svg = document.createElementNS(parent.svgns, 'rect');
	this.svg.setAttribute('x', x);
	this.svg.setAttribute('y', y);
	this.svg.setAttribute('width', parent.squareWidth);
	this.svg.setAttribute('height', parent.squareHeight);
	this.svg.setAttribute('fill', this.deadColor);
	this.svg.onclick = this.svgOnClick();
	parent.svg.appendChild(this.svg);
}

GridSquare.prototype = {
	
	getColor: function() {return this.svg.getAttribute('fill');},
	
	setColor: function(color) {this.svg.setAttribute('fill', color);},
	
	getAliveOrDead: function() {
		if (this.getColor() == this.liveColor) {
			//console.log(this.alive)
			return this.alive;
		}
		return this.dead;
	},
	
	svgOnClick: function() {
		deadColor = this.deadColor;
		liveColor = this.liveColor;
		return function() {
			if (this.getAttribute('fill') == deadColor) {
				this.setAttribute('fill', liveColor);
				return;
			}
			this.setAttribute('fill', deadColor);
			};
	},

	toggleColor: function() {
		if (this.getColor() == this.deadColor) {
			this.setColor(this.liveColor);
			return;
		}
		this.setColor(this.deadColor);
	}
};

function runGOL() {
	var sGrid = new GameOfLife(800, 800, 80, 80);
	document.body.appendChild(sGrid.svg);
}