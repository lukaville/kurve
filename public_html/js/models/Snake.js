

define([
    "app",
    "konva",
    "models/SnakePartLine",
    "models/SnakePartArc"
], function(app, Konva, SnakePartLine, SnakePartArc){
	function Snake(){this.initialize();}
    Snake.prototype = {
		defaultSpeed: 100,
		defaultAngleSpeed: 87,
		defaultPartLength: 100,
		defaultHoleLength: 20,
		defaultRadius: 4,
		init: function(x, y, angle, color, FPS, backCtx, foreCtx) {
			this.backCtx = backCtx;
			this.foreCtx = foreCtx;
			this.color = color;
			this.FPS=FPS;
			this.angleV = this.defaultAngleSpeed*2*Math.PI/180/FPS;
			this.v = this.defaultSpeed / FPS;
			this.angle = angle;
			this.vx = this.v * Math.cos(this.angle);
			this.vy = this.v * Math.sin(this.angle);
			this.arcRadius = this.v / this.angleV;
			this.partStopper = (this.defaultPartLength / this.v);			
			this.holeStopper = ((this.defaultPartLength + this.defaultHoleLength) / this.v);
			this.x = x;	this.y = y;
			
			this.cosV = Math.cos(this.angleV);
			this.sinV = Math.sin(this.angleV);
			this.arcsInBack = 0;
			this.linesInBack = 0;			
            this.doLine();
		},
		setDrawing: function(){
			this.drawing = (this.stepCounter <= this.partStopper);			
		},
		update: function(snake){			
			if(game_log) console.log('got '+snake.arcs.length+' arcs and '+snake.lines.length+' lines');
			this.x = snake.x; this.y = snake.y;
			
			this.angle = snake.angle;
			this.vx = this.v*Math.cos(this.angle);
			this.vy = this.v*Math.sin(this.angle);
			//this.teleport(snake.x, snake.y);
			this.radius = snake.radius;
			this.stepCounter= (snake.steps);
						
			if(game_log) if(this.nlines < snake.nlines) console.log('this.nlines < snake.nlines');
			if(game_log) if(this.narcs < snake.narcs) console.log('this.narcs < snake.narcs');
			for(var i = this.nlines; i < snake.nlines; i++) this.snakeLines[i] = new SnakePartLine();
			for(var i = this.narcs; i < snake.narcs; i++) this.snakeArcs[i] = new SnakePartArc();
			
			for(var i = 0; i < snake.arcs.length; i++){
				var arc = snake.arcs[i];
				this.snakeArcs[arc.id].clear(this.foreCtx);
				this.snakeArcs[arc.id].applyUpdate(arc);
			}
			for(var i = 0; i < snake.lines.length; i++){
				var line = snake.lines[i];
				this.snakeLines[line.id].clear(this.foreCtx);
				this.snakeLines[line.id].applyUpdate(line);
			}
			this.nlines = snake.nlines;
			this.narcs = snake.narcs;
			
			if(this.narcs > 0){
			//	this.arcCenterX = this.lastArc().x;	this.arcCenterY = this.lastArc().y;
			}
			this.isAlive = snake.alive;
			
			this.setDrawing();
			this.teleport(snake.x, snake.y);
			this.moveToBack();
		},
		moveToBack: function(b){
			for(var i = this.linesInBack; i < this.nlines-1; i++){						
				this.snakeLines[i].clear(this.foreCtx);
				this.snakeLines[i].draw(this.backCtx,  this.color);						
			}	
			this.linesInBack = Math.max(0,this.nlines-1);				
		
			for(var i = this.arcsInBack; i < this.narcs-1; i++){						
				this.snakeArcs[i].clear(this.foreCtx);
				this.snakeArcs[i].draw(this.backCtx,  this.color);						
			}
			this.arcsInBack = Math.max(0,this.narcs-1);
		},
		clear: function(){					
			this.foreCtx.clearRect(this.prevX - this.prevRadius-2, this.prevY - this.prevRadius-2
				, this.prevRadius*2+4, this.prevRadius*2+4);
			for(var i = this.arcsInBack; i < this.narcs; i++) {
				this.snakeArcs[i].clear(this.foreCtx);			
			}
			for(var i = this.linesInBack; i < this.nlines; i++) {
				this.snakeLines[i].clear(this.foreCtx);
			}
		},
		draw: function(){			
			for(var i = this.arcsInBack; i < this.narcs; i++) {
				this.snakeArcs[i].draw(this.foreCtx, this.color);
			}
			for(var i = this.linesInBack; i < this.nlines; i++) {
				this.snakeLines[i].draw(this.foreCtx, this.color);
			}
			if(game_log) console.log('qqq');
			this.foreCtx.beginPath();
			this.foreCtx.fillStyle = this.color;
			this.foreCtx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
			this.foreCtx.fill();
			this.prevX = this.x; this.prevY = this.y; this.prevRadius = this.radius;
		},
		kill: function() {
			this.isAlive = false;
			console.log(this.color + ' x_x');
		},
        initialize: function (){			
			this.linesInBack = 0;
			this.arcsInBack = 0;
			this.drawing = true;
			this.isAlive = true;
			this.TURNING_LEFT = 0;
			this.TURNING_RIGHT = 1;
			this.NOT_TURNING = 2;			
			this.turning = this.NOT_TURNING;			
			this.snakeArcs = [];
			this.snakeLines = [];
			this.narcs = 0;
			this.nlines = 0;			
			this.radius = this.defaultRadius;
			this.stepCounter = 0;
		},
		startTurning: function(where) {
			if((this.angleV > 0) != (where === this.TURNING_RIGHT)) {
				this.angleV = -this.angleV;
				this.sinV = -this.sinV;
			}
	        this.turning = where;  
	        
			this.doArc();
		},
		stopTurning: function(where) {
			if(this.turning===where) {
				this.turning = this.NOT_TURNING;
				this.vx = this.v*Math.cos(this.angle);
				this.vy = this.v*Math.sin(this.angle);
				this.doLine();
			}
		},
		doArc: function() {
			if(this.turning === this.TURNING_LEFT){
				this.arcStartAngle = this.angle + Math.PI/2;
				var clockwise = true;
				this.arcCenterX = this.x + this.arcRadius*Math.sin(this.angle);
				this.arcCenterY = this.y - this.arcRadius*Math.cos(this.angle);
			} else {
				this.arcStartAngle = this.angle - Math.PI/2;
				var clockwise = false;
				this.arcCenterX = this.x - this.arcRadius*Math.sin(this.angle);
				this.arcCenterY = this.y + this.arcRadius*Math.cos(this.angle);
			}
			this.arcAngle = this.arcStartAngle;
						
			if(!this.drawing) return;
			
			var newArc = new SnakePartArc();
			newArc.init(this.arcCenterX, this.arcCenterY
			  , this.arcRadius, this.arcStartAngle, this.color
			  , this.radius, clockwise, this.layer);
			
			this.snakeArcs[this.narcs] = newArc;
			this.narcs++;
		},
		doLine: function() {			
	        if(!this.drawing) return;
			var newLine = new SnakePartLine();
			newLine.init(this.x, this.y, this.vx, this.vy, this.radius, this.color, this.layer);
			this.snakeLines[this.nlines] = newLine;
			this.nlines++;
		},
		changeRadius: function(radius) {
			this.radius = radius;
			if(this.drawing) {
				if(this.turning === this.NOT_TURNING) {
					this.doLine();
				} else {
					this.doArc();
				}
			}
		},
		step: function() {
			this.makeHoles();
			if(this.turning === this.NOT_TURNING) {
				this.x += this.vx;
				this.y += this.vy;
				if(this.drawing) this.lastLine().updateHead(this.x, this.y, this.v);
			} else {
				var dx = (this.x-this.arcCenterX);
				var dy = (this.y-this.arcCenterY);
				this.angle += this.angleV;
				this.y = this.arcCenterY + dy*this.cosV + dx*this.sinV;
				this.x = this.arcCenterX - dy*this.sinV + dx*this.cosV;
				if(this.drawing) this.lastArc().updateHead(this.angleV);
			}
		},																																					
		makeHoles: function() {
			this.stepCounter++;
			if(this.stepCounter > this.partStopper){
				this.drawing = false;
				if(this.stepCounter >= this.holeStopper) {
					this.stepCounter = 0;
					this.drawing = true;
					if(this.turning === this.NOT_TURNING) {
						this.doLine();
					} else {
						this.doArc();
					}
				}
			} else drawing = true;
			
		},
		lastLine: function() {
			return this.snakeLines[this.nlines-1];
		},
		lastArc: function() {
			return this.snakeArcs[this.narcs-1];
		},
		
		teleport: function(newX, newY) {
			this.x = newX;	this.y = newY;
			if(this.turning === this.NOT_TURNING) {
				this.doLine();
			} else {
				this.doArc();
			}
		}
		
    };
    
    return Snake;
});



