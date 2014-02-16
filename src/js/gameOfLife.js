/**
 * Creates a game of life svg.
 * 
 * @param {int} pixelWidth - width of svg on page.
 * @param {int} pixelHeight - height of svg on page.
 * @param {int} unitWidth - number of squares across.
 * @param {int} unitHeight - number of squares high.
 */

function GameOfLife(pixelWidth, pixelHeight, unitWidth, unitHeight) {
	//Clockwise from 12 o'clock
	this.dx = [0, 1, 1, 1, 0, -1, -1, -1];
	this.dy = [-1, -1, 0, 1, 1, 1, 0, -1];
	this.pixelWidth = pixelWidth;
	this.pixelHeight = pixelHeight;
	this.unitWidth = unitWidth;
	this.unitHeight = unitHeight;
	this.squareWidth = pixelWidth / unitWidth;
	this.squareHeight = pixelHeight / unitHeight;
	this.liveColor = 'black';
	this.deadColor = 'white';
	this.svgns = "http://www.w3.org/2000/svg";
	this.svg = document.createElementNS(this.svgns, "svg:svg");
	this.svg.setAttribute('height', pixelHeight);
	this.svg.setAttribute('width', pixelWidth);
	this.svg.setAttribute('stroke-width', '2px');
	this.svg.setAttribute('stroke', 'black');
	this.alive = 1;
	this.dead = 0;
	this.running = true;
	var s ="0 0 " + pixelWidth + " " + pixelHeight;
	this.svg.setAttribute('viewBox', s);
	this.svg.addEventListener("mouseleave", this.makeOnMouseLeave());
	this.svg.addEventListener("mouseenter", this.makeOnMouseEnter());
	this.worldMap = this.createSquares();
	this.worldHeight = this.worldMap.length;
	this.worldWidth = this.worldMap[0].length;
}

GameOfLife.prototype = {
	
	/** Makes the individual GridSquare objects representing the board.*/
	createSquares: function() {
		var grid = [];
		var lastY = this.pixelHeight + this.squareHeight;
		for (n = this.squareHeight; n < lastY; n += this.squareHeight) {
			var newRow = [];
			for (m = 0; m < this.pixelWidth; m += this.squareWidth) {
				var x = m;
				var y = this.pixelHeight - n; 
				var newSquare = new GridSquare(x, y, this);
				newRow.push(newSquare);
			}
			grid.push(newRow);
		}
		return grid;
	},
	
	/**Sets the square at position x, y to the color color. 
	 *
	 * @param {int} x
	 * @param {int} y
	 * @param {string} color 
	*/
	colorSquare: function(x, y, color) {
		this.worldMap[y][x].setColor(color);
	},
	
	/**Toggles the color of square x, y between deadcolor and alivecolor.
	 * 
	 * @param {int} x
	 * @param {int} y
	 * */
	toggleSquareColor: function(x, y) {
		this.worldMap[y][x].toggleColor();
	},
	
	/**Returns a list of x, y coordinates of the neighbors of point x, y.
	 * 
	 * @param {int} x
	 * @param {int} y
	 * @return {array} - array of [x, y] arrays.
	*/
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
	
	/**
	 * Returns the contents of the cells neighboring point x, y.
	 * 
     * @param {int} x
     * @param {int} y
     * @return {array} - array of the contents of the cells 
     *                   neighboring point x, y
	 */
	getNeighborValues: function(x, y) {
		var neighborPoints = this.getNeighborPoints(x, y),
		    neighborValues = [];
		for (n = 0; n < neighborPoints.length; n++) {
			p = neighborPoints[n];
			neighborValues.push(this.worldMap[p[1]][p[0]]);
		}
		return neighborValues;
	},

    /**
     * Returns the number of living neighbors cell x, y has.
     * 
     * @param {int} x
     * @param {int} y
     * @return {int} - number of living neighbors
     */
	getSumOfLiveNeighbors: function(x, y) {
		return this.getNeighborValues(x, y).reduce(
			function (n, m) {return n + m.getAliveOrDead();}, 0);
	},
	
	/**
	 * Runs one step of the GameOfLife if this.running, and sets a timeout
	 * to run another step.
	 */
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
		window.setTimeout(worldMap.makeRunCallback(), 75);
	},
	
	/**
	 * @return {function} - no-argument function that executes 
	 *                      this.runGameOfLife. 
	 */
	makeRunCallback: function () {
		worldMap = this;
		return function() {
			worldMap.runGameOfLife();
		};
	},
	
	/**
	 * @return {function} - no-argument function that sets this.running
	 *                      to true and runs this.runGameOfLife.
	 */
	makeOnMouseLeave: function() {
		worldMap = this;
		return function() {
			//console.log(worldMap.running);
			worldMap.running = true;
			worldMap.runGameOfLife();
		};
	},
	
	/**
	 * @return {function} - no-argument function that sets this.running
	 *                      to false.
	 */
	makeOnMouseEnter: function() {
		worldMap = this;
		return function() {
			worldMap.running = false;
		};
	},
	
	/**
	 * Given the cellState and numLivingNeighbors, returns this.alive 
	 * or this.dead.
	 *  
     * @param {int} cellState
     * @param {int} numLivingNeighbors
     * @return {int} - this.alive or this.dead
	 */
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


/**
 * 
 * @constructor
 * @param {int} x - number of squares from left.
 * @param {int} y - number of squares from bottom.
 * @param {GameOfLife} parent - Game containing square.
 */
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
	
	/** @return {string} - fill color */
	getColor: function() {return this.svg.getAttribute('fill');},
	
	
	/**
	 * Sets fill attribute of square to color.
	 * 
	 * @param {string} color - color to set fill attribute. 
	*/
	setColor: function(color) {this.svg.setAttribute('fill', color);},
	
	/** @return {int} - this.alive or this.dead, depending on cell state. */
	getAliveOrDead: function() {
		if (this.getColor() == this.liveColor) {
			//console.log(this.alive)
			return this.alive;
		}
		return this.dead;
	},
	
	/**
	 * @return {function} - toggles color between this.deadColor 
	 *                       and this.liveColor. 
	 */
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
	
	/** Toggles color between this.deadColor and this.liveColor. */
	toggleColor: function() {
		if (this.getColor() == this.deadColor) {
			this.setColor(this.liveColor);
			return;
		}
		this.setColor(this.deadColor);
	}
};

/**
 * Sets up a GOL and appends it to the DOM. For testing only.
 */
function runGOL() {
	var sGrid = new GameOfLife(800, 800, 80, 80);
	document.body.appendChild(sGrid.svg);
}