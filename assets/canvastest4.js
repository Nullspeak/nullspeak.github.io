/* Canvas test 4 - (c) Sarah 2019 */
var canvas; // the canvas itself
var ctx; // canvas context

// when a key is pressed down
function procInputDown(event) {
	// Do nothing if the event was already processed
	if (event.defaultPrevented)
		return;

	switch (event.key) {
		case 'w':
			player.inUp = true;
			break;

		case 'a':
			player.inLeft = true;
			break;

		case 'd':
			player.inRight = true;
			break;

		default:
			break;
	}

	// Cancel the default action to avoid it being handled twice
	event.preventDefault();
}

// when a key is released
function procInputUp(event) {
	// Do nothing if the event was already processed
	if (event.defaultPrevented)
		return;

	switch (event.key) {
		case 'w':
			player.inUp = false;
			break;

		case 'a':
			player.inLeft = false;
			break;

		case 'd':
			player.inRight = false;
			break;

		default:
			break;
	}

	// Cancel the default action to avoid it being handled twice
	event.preventDefault();
}

// when a key is released
function procInputClick(event) {
	// click coordinates relative to canvas
	var rect = canvas.getBoundingClientRect();
	var mx = event.clientX - rect.left;
	var my = event.clientY - rect.top;
}

// what <body> calls on load
function initCanvas() {
	// find our canvas object
	canvas = document.getElementById('canvas');

	// if the canvas doesn't work don't use it
	if (canvas.getContext) {
		// set ctx to the canvas's context
		ctx = canvas.getContext('2d');

		// handle key presses
		window.addEventListener("keydown", procInputDown, true);
		window.addEventListener("keyup", procInputUp, true);
		canvas.addEventListener('click', procInputClick, true);

		// the actual loop
		drawLoop();
	}
}

// i dont know why but this helps with screen tearing issues
window.requestAnimFrame = function (callback) {
	window.setTimeout(callback, 16);
};

// where everything is drawn
function drawLoop() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	drawStatic();

	player.input();
	player.phys();
	player.draw();

	window.requestAnimationFrame(drawLoop);
}

// draws static things like the scenery
function drawStatic() {
	// the sky gradient
	var height = (canvas.height / 2) - floor.y;
	var skygradient = ctx.createLinearGradient(0, -floor.y, 0, height);
	skygradient.addColorStop(0, '#0f51c6');
	skygradient.addColorStop(1, '#4d85ea');
	ctx.fillStyle = skygradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	floor.draw();

	// the fog gradient
	var height = (canvas.height / 2) - floor.y;
	var foggradient = ctx.createLinearGradient(0, height, 0, canvas.height - floor.y);
	foggradient.addColorStop(0, '#4d85ea');
	foggradient.addColorStop(0.0625, 'rgba(77, 133, 234, 0)');
	ctx.fillStyle = foggradient;
	ctx.fillRect(0, height, canvas.width, canvas.height);

	resetDrawAttr();
}

function resetDrawAttr() {
	// reset everything
	ctx.shadowColor = 'black';
	ctx.shadowBlur = 0;
	ctx.fillStyle = "black";
}

// player class, a class because i might add multiplayer to this demo
class Player {
	constructor() {
		this.x = 0;
		this.y = 0;
		this.vx = 0;
		this.vy = 0;
		this.grounded = true;
		this.inUp = false;
		this.inLeft = false;
		this.inRight = false;
		this.color = 'black';
	}

	// how the player is painted
	draw() {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(canvas.width / 2, (this.y + canvas.height * (2 / 3)) + 32, 16, 0, 2 * Math.PI);
		ctx.closePath();
		ctx.fill();

		resetDrawAttr();
	}

	// how the player handles input
	input() {
		if (this.inUp == true && this.grounded == true) {
			this.grounded = false;
			this.vy += 8;
		}

		if (this.inLeft == true && this.vx > -8)
			this.vx -= 1;

		if (this.inRight == true && this.vx < 8)
			this.vx += 1;
	}

	// how this player handles physics
	phys() {
		this.x += this.vx;

		if (this.x > 7900)
			this.x = 7900;

		if (this.x < -7900)
			this.x = -7900;

		if (this.grounded == false) {
			this.y -= this.vy;
			this.vy -= 0.25;
		}

		if (this.y >= 0)
			this.grounded = true;

		// ground friction and air friction
		if (this.grounded == true)
			this.vx *= .9;
		else
			this.vx *= .99;

		// get the floor to move as well
		floor.x = this.x;

		// TODO: fix the weird perspective bug
		floor.y = this.y * 0.25;
	}
}

// the players
var player = new Player();

// the floor object, a var because there is only ever going to be one
// TODO: clean this mess up and add some other scenery
var floor = {
	x: 0,
	y: 0,

	draw: function () {
		// the floor gradient
		var height = (canvas.height / 2) - this.y;
		var gradient = ctx.createLinearGradient(0, height, 0, canvas.height);
		gradient.addColorStop(0, '#336b33');
		gradient.addColorStop(1, '#1f421f');

		// the floor rectangle
		ctx.fillStyle = gradient;
		ctx.fillRect(0, height, canvas.width, canvas.height);

		// some depth lines
		for (var i = -31; i < 32; i++) {
			ctx.strokeStyle = '#336b33';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(canvas.width / 2, height + 1);
			ctx.lineTo((canvas.width / 2) + (-this.x + (i * 256)), canvas.height);
			ctx.closePath();
			ctx.stroke();
		}

		// some horizontal lines
		for (var i = 32; i > 0; i--) {
			// i hate this thing with every essence of my being
			var y = (canvas.height / 2) - (this.y - Math.exp(i * 0.33));

			ctx.strokeStyle = '#336b33';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(canvas.width, y);
			ctx.closePath();
			ctx.stroke();
		}
	},
};

