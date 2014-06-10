/**
 * Constructor.
 *
 * GridScale translates between the indices of cells in the Game Of Life
 * matrix and the coordinates of the squares and lines representing cells
 * on the board.
 *
 * @param screenWidth {number} : width, pixels
 * @param screenHeight {number} : height, pixels
 * @param unitWidth {number} : number of squares across
 * @param unitHeight {number} : number of squares high
 * @returns GridScale
 */
function GridScale(screenWidth, screenHeight, unitWidth, unitHeight) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.unitWidth = unitWidth;
    this.unitHeight = unitHeight;
}

GridScale.prototype = {

    /**
     * Finds the cell an x, y point on the canvas is in.
     *
     * @param point {object} : {x: x, y: y}
     * @returns {cell} : {x: x, y: y}
     */
    cellFromPoint: function(point) {
        var squareWidth = this.screenWidth / this.unitWidth,
            squareHeight = this.screenHeight / this.unitHeight,
            unitX = Math.floor(point.x / squareWidth),
            unitY = Math.ceil(this.unitHeight - (point.y / squareHeight));
        return {x: unitX, y: unitY};
    },

    /**
     * Converts a cell into its shape and position on the board.
     *
     * @param cell {object} : {x: x, y: y} optionally also alive: alive
     * @returns square : {x: x, y: y, width: width, height: height}
     */
    cellToSquare: function(cell) {
        var squareWidth = this.screenWidth / this.unitWidth,
            squareHeight = this.screenHeight / this.unitHeight,
            pixelX = Math.floor(squareWidth * cell.x),
            pixelY = Math.ceil(this.screenHeight - (squareHeight * cell.y));
        cell.x = pixelX;
        cell.y = pixelY;
        cell.width = squareWidth;
        cell.height = squareHeight;
        return cell;
    },

    /**
     * Indicates where to draw the grid lines.
     *
     * @returns {object} : {horizontals: [y1, y2...], verticals:[x1, x2...]}
     */
    gridLinePositions: function() {
        var squareWidth = this.screenWidth / this.unitWidth,
            squareHeight = this.screenHeight / this.unitHeight,
            verticals = [],
            horizontals = [];
        for (var x = squareWidth; x < this.screenWidth; x += squareWidth) {
            verticals.push(x);
        }
        for (var y = squareHeight; y < this.screenHeight; y += squareHeight) {
            horizontals.push(y);
        }
        return {horizontals: horizontals, verticals: verticals};
    },

    /**
     *
     * @param cells {array} : array of {x: x, y: y, [alive: alive]}
     * @returns {array} : Same array, but with cellToSquare mapped over it.
     */
    cellsToSquares: function(cells) {
        for (var n = 0; n < cells.length; n++) {
            cells[n] = this.cellToSquare(cells[n]);
        }
        return cells;
    }


};

/**
 * Constructor.
 *
 * GameOfLifeCanvas owns the canvas and draws squares and lines on it.
 *
 * @param width {number} : pixels
 * @param height {number} : pixels
 * @param lines {object} : {horizontals: [y1, y2...], verticals:[x1, x2...]}
 * @returns GameOfLifeCanvas
 */
function GameOfLifeCanvas(width, height, lines) {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext('2d');
    this.ctx.canvas.width = width;
    this.ctx.canvas.height = height;
    this.black = [0, 0, 0, 255];
    this.white = [255, 255, 255, 0];
    this.alive = this.black;
    this.dead = this.white;
    this.lines = lines;
    this.drawLines(lines);
}

GameOfLifeCanvas.prototype = {

    /**
     * Clears the canvas.
     */
    clear: function() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    /**
     * Returns an ImageData of the specified width, height, and color.
     *
     * @param width {number} : pixels
     * @param height {number} : pixels
     * @param rgbaArray {array} : [r, g, b, a] each out of 255
     * @returns {ImageData}
     */
    makePixels: function(width, height, rgbaArray) {
        var pixels = this.ctx.createImageData(width, height),
            r = rgbaArray[0],
            g = rgbaArray[1],
            b = rgbaArray[2],
            a = rgbaArray[3];
        for (var n = 0; n < pixels.data.length; n +=4 ) {
            pixels.data[n] = r;
            pixels.data[n + 1] = g;
            pixels.data[n + 2] = b;
            pixels.data[n + 3] = a;
        }
        return pixels;
    },

    /**
     * Draws horizontal lines at the yCoords given
     *
     * @param yCoords {array}
     */
    drawHorizontalLines: function(yCoords) {
        var pixels = this.makePixels(this.ctx.canvas.width, 1, this.black);
        for (var n = 0; n < yCoords.length; n++) {
            this.ctx.putImageData(pixels, 0, yCoords[n]);
        }
    },

    /**
     * Draws horizontal lines at the xCoords given.
     *
     * @param xCoords {array}
     */
    drawVerticalLines: function(xCoords) {
        var pixels = this.makePixels(1, this.ctx.canvas.height, this.black);
        for (var n = 0; n < xCoords.length; n++) {
            this.ctx.putImageData(pixels, xCoords[n], 0);
        }
    },

    /**
     * Draws all the grid lines.
     *
     * @param lines {object} : {horizontals: [y1, y2...], verticals:[x1, x2...]}
     */
    drawLines: function(lines) {
        this.drawHorizontalLines(lines.horizontals);
        this.drawVerticalLines(lines.verticals);
    },

    /**
     * Draws a square on the canvas.
     *
     * @param square {object} : {x:, y:, width:, height:, color:}
     */
    drawSquare: function(square) {
        var pixels = this.makePixels(
                square.width - 2,
                square.height - 2,
                square.color
                );
        this.ctx.putImageData(pixels, square.x + 1, square.y + 1);
    },

    /**
     * Draws an array of squares on the canvas.
     *
     * @param squares {array} : array of square objects--see drawSquare
     */
    updateStep: function(squares) {
        for (var n = 0; n < squares.length; n++) {
            square = squares[n];
            square.color = square.alive ? this.alive : this.dead;
            this.drawSquare(square);
            //this.drawLines(this.lines);
        }
    }
};


/**
 * Constructor.
 *
 * GOL runs the game logic.
 *
 * @param unitWidth {number} : squares across.
 * @param unitHeight {number} : squares high.
 * @returns GOL
 */
function GOL(unitWidth, unitHeight) {

    //Clockwise from 12 o'clock
    this.dx = [0, 1, 1, 1, 0, -1, -1, -1];
    this.dy = [-1, -1, 0, 1, 1, 1, 0, -1];

    this.survival = [2, 3];
    this.birth = [3];

    this.dead = 0;
    this.alive = 1;
    this.world = this.makeWorld(unitWidth, unitHeight);

}

GOL.prototype = {

    /**
     * Assembles a board unitWidth by unitHeight. All cells initialized
     * to dead.
     *
     * @param unitWidth {number}
     * @param unitHeight {number}
     * @returns {Array}
     */
    makeWorld: function(unitWidth, unitHeight) {
        var world = [];
        for (var y = 0; y < unitHeight; y++) {
            var row = [];
            for (var x = 0; x < unitWidth; x++) {
                row.push(this.dead);
            }
            world.push(row);
        }
        return world;
    },

    /**Returns a list of x, y coordinates of the neighbors of point x, y.
     *
     * @param {int} x
     * @param {int} y
     * @return {array} - array of [x, y] arrays.
    */
    getNeighborPoints: function(cell) {
        var width = this.world[0].length,
            height = this.world.length,
            neighbors = [];
        for (var n = 0; n < this.dx.length; n ++) {
            var new_x = cell.x + this.dx[n],
                new_y = cell.y + this.dy[n],
                within_x = (0 <= new_x) && (new_x < width),
                within_y = (0 <= new_y) && (new_y < height);
            if (within_x && within_y) {
                neighbors.push({x: new_x, y: new_y});
            }
        }
        return neighbors;
    },

    /**
     * Returns the number of living neighbors cell x, y has.
     *
     * @param {int} x
     * @param {int} y
     * @return {int} - number of living neighbors
     */
    getNumLivingNeighbors: function(cell) {
        var neighbors = this.getNeighborPoints(cell),
            livingNeighbors = 0;

        // for edge cells, always 0.
        if (neighbors.length < this.dx.length) {
            return livingNeighbors;
        }
        for (var n = 0; n < neighbors.length; n++) {
            livingNeighbors += this.world[neighbors[n].y][neighbors[n].x];
        }
        return livingNeighbors;
    },

    /**
     * Determines whether cell is alive or dead this turn.
     *
     * @param cell {object} : {x: x, y: y}
     * @returns {Number} : this.alive or this.dead.
     */
    decideFate: function(cell) {
        var livingNeighbors = this.getNumLivingNeighbors(cell);
        if (this.world[cell.y][cell.x] == this.alive) {
            for (var n = 0; n < this.survival.length; n++) {
                if (livingNeighbors == this.survival[n]) {
                    return this.alive;
                }
            }
        }
        else if (this.world[cell.y][cell.x] == this.dead) {
            for (var n = 0; n < this.birth.length; n++) {
                if (livingNeighbors == this.birth[n]) {
                    return this.alive;
                }
            }
        }
        return this.dead;
    },

    /**
     * Advances the state of the board one turn.
     *
     * @returns {Array} : objects {x: y: alive} x and y in matrix context.
     */
    nextStep: function() {
        var toggledCells = [];
        for (var y = 0; y < this.world.length; y++) {
            for (var x = 0; x < this.world[0].length; x++) {
                if (this.decideFate({x: x, y: y}) != this.world[y][x]) {
                    toggledCells.push({
                        x: x,
                        y: y,
                        alive: this.world[y][x] ? this.dead : this.alive
                    });
                }
            }
        }
        for (var n = 0; n < toggledCells.length; n++) {
            var cell = toggledCells[n];
            this.world[cell.y][cell.x] = cell.alive;
        }
        return toggledCells;
    },

    /**
     * Switches the state of cell between dead and alive
     *
     * @param cell {object} : {x:x, y: y}
     * @returns
     */
    toggle: function(cell) {
        var y = cell.y, x = cell.x;
        this.world[y][x] = this.world[y][x] ? this.dead : this.alive;
        cell.alive = this.world[y][x];
        return cell;
    }
};

/**
 * Constructor.
 * Runs the show, sets up callbacks, etc. Note that currently one must still
 * append CanvasGameOfLife.div to the DOM somewhere.
 *
 * @param screenWidth {number} : pixels
 * @param screenHeight {number} : pixels
 * @param unitWidth {number} : squares
 * @param unitHeight : {number} squares.
 * @returns
 */
function CanvasGameOfLife(screenWidth, screenHeight, unitWidth, unitHeight) {
    this.scale = new GridScale(
            screenWidth,
            screenHeight,
            unitWidth,
            unitHeight
            );
    var lines = this.scale.gridLinePositions();

    this.canvas = new GameOfLifeCanvas(screenWidth, screenHeight, lines);
    this.engine = new GOL(unitWidth, unitHeight);
    this.waitTime = 50;

    this.mouseIn = false;
    this.pauseButtonChecked = true;

    var this_ = this;
    this.canvas.canvas.addEventListener('click',
            function (evt) {
                var rect = this_.canvas.canvas.getBoundingClientRect(),
                    point = {x: evt.clientX - rect.left,
                             y: evt.clientY - rect.top};
                this_.toggleSquare(point);
            });
    this.canvas.canvas.addEventListener("mouseleave", this.makeOnMouseLeave());
    this.canvas.canvas.addEventListener("mouseenter", this.makeOnMouseEnter());
    this.div = document.createElement('div');
    var style = "display: block;";
    this.canvas.canvas.setAttribute('style', style);
    this.div.setAttribute('style', 'position: relative; display: block;');
    this.div.appendChild(this.canvas.canvas);
    this.div.appendChild(this.createSlider());
    this.div.appendChild(this.createPauseButton());
    this.runGameOfLife();
}

CanvasGameOfLife.prototype = {

    /**
     * @return {function} - no-argument function that executes
     *                      this.runGameOfLife.
     */
    makeRunCallback: function () {
        canvasGOL = this;
        return function () {
            canvasGOL.runGameOfLife();
        };
    },

    /**
     * @return {function} - no-argument function that sets this.running
     *                      to true and runs this.runGameOfLife.
     */
    makeOnMouseLeave: function () {
        canvasGOL = this;
        return function () {
            canvasGOL.mouseIn = false;
            canvasGOL.runGameOfLife();
        };
    },

    /**
     * @return {function} - no-argument function that sets this.running
     *                      to false.
     */
    makeOnMouseEnter: function () {
        canvasGOL = this;
        return function () {
            canvasGOL.mouseIn = true;
        };
    },

    /**
     * Runs one step of the GameOfLife if this.running, and sets a timeout
     * to run another step.
     */
    runGameOfLife: function () {
        if (this.mouseIn || this.pauseButtonChecked) {
            return;
        }
        var dirtyCells = this.scale.cellsToSquares(this.engine.nextStep());
        this.canvas.updateStep(dirtyCells);
        window.setTimeout(this.makeRunCallback(), this.waitTime);
    },

    /**
     * Flips the square / cell at canvas x, y, point alive / dead.
     *
     * @param point {object} :{x:x, y:y}
     */
    toggleSquare: function (point) {
        var cell = this.engine.toggle(this.scale.cellFromPoint(point));
        this.canvas.updateStep([this.scale.cellToSquare(cell)]);
    },

    /** creates slider element. */
    createSlider: function () {
        var this_ = this;
	var sliderID = "slider" + $('input').length;
        var sliderInput = document.createElement('input');
        sliderInput.setAttribute('type', 'text');
        var sliderLabel = document.createElement('label');
        sliderLabel.setAttribute('for', sliderID);
        var speedText = "Speed: " + this.waitTime / 1000 + " seconds / step";
        sliderLabel.textContent = speedText;
        var sliderSpec =  {
            value: this_.waitTime,
            min: 0,
            max: 2000,
            step: 25,
            slide: function (event, ui) {
                this_.waitTime = ui.value;
                var speed = ui.value / 1000 + " seconds / step";
                sliderLabel.textContent = "Speed: " + speed;
            }
        };
        var sliderDiv = document.createElement('div');
        var labelPara = document.createElement('p');
        var slider = document.createElement('div');
        $(slider).slider(sliderSpec);
        var style = 'position: static; display: inline-block; width: 200px;';
        sliderDiv.setAttribute('style', style);
        slider.setAttribute('id', sliderID);
        labelPara.appendChild(sliderLabel);
        sliderDiv.appendChild(labelPara);
        sliderDiv.appendChild(slider);
        return sliderDiv;
    },

    createPauseButton: function () {
        var button = document.createElement("input");
        var label = document.createElement("label");
        var pauseButtonDiv = document.createElement('div');
        var style = 'position: relative; display: inline-block; width: 200px; margin: 20px;';

        button.setAttribute("type", "checkbox");
        pauseButtonDiv.setAttribute('style', style);
	var pauseID = "pauseButton" + $('input').length;
        button.setAttribute("id", pauseID);
        label.setAttribute('for', pauseID);
        label.textContent = "Play";
        var this_ = this;
        $(button).change(function () {
            if (this.checked) {
                this_.pauseButtonChecked = false;
                $(button).button("option", "label", 'Pause');
                this_.runGameOfLife();
            }
            else {
                this_.pauseButtonChecked = true;
                $(button).button("option", "label", 'Play');
            }
        });
        pauseButtonDiv.appendChild(button);
        pauseButtonDiv.appendChild(label);
        //pauseButtonDiv.setAttribute('style', style);
        $(button).button();
        return pauseButtonDiv;
    }
};

/**
 * Convenience for testing. Appends directly to document.body
 */
function testCanvasGOL() {
    var GOL = new CanvasGameOfLife(800, 800, 100, 100);
    document.body.appendChild(GOL.div);
}
