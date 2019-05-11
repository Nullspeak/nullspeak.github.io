/* Canvas test 2 - (c) Sarah 2019 */
var ctx; // canvas context

// player 1
var player1 = {
	x: 128,
	y: 128,
	vx: 0,
	vy: 0,
	grounded: false,
	inUp: false,
	inLeft: false,
	inRight: false,
	color: '#F00',

	// how we should draw this object
	draw: function ()
	{
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x, this.y - 40, 8, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();

		ctx.beginPath();
		ctx.moveTo(this.x - 8, this.y);
		ctx.lineTo(this.x, this.y - 31);
		ctx.lineTo(this.x + 8, this.y);
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle = "#FFBF00";
	},

	// how this will handle input
	input: function ()
	{
		if (this.inUp == true && this.grounded)
		{
			this.grounded = false;
			this.vy -= 8;
		}

		if (this.inLeft == true && this.vx > -6)
			this.vx -= 1;

		if (this.inRight == true && this.vx < 6)
			this.vx += 1;
	},

	// how this object moves
	phys: function ()
	{
		// change our position based on our velocity
		if (this.x > 0 || this.x < 640)
			this.x += this.vx;

		// bounce off walls
		if (this.x <= 0 || this.x >= 640)
			this.vx = -this.vx;

		// if we're at or below the arbitrary ground point, stop and say we're grounded
		if (this.y >= 352 && this.vy > 0)
		{
			this.vy = 0;
			this.grounded = true;
		}

		// to stop that weird "slightly-bouncing-through-the-floor" bug
		this.y = Math.min(this.y + this.vy, 352);

		// gravity
		if (this.grounded == false)
		{
			if (this.vy > 0.0)
				this.vy += .2;
			else
				this.vy += .3;
		}

		// ground friction and air friction
		if (this.grounded == true)
			this.vx *= .9;
		else
			this.vx *= .99;
	},
};

// player 2
var player2 = {
	x: 512,
	y: 128,
	vx: 0,
	vy: 0,
	grounded: false,
	inUp: false,
	inLeft: false,
	inRight: false,
	color: '#0F0',

	// how we should draw this object
	draw: function ()
	{
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x, this.y - 40, 8, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();

		ctx.beginPath();
		ctx.moveTo(this.x - 8, this.y);
		ctx.lineTo(this.x, this.y - 31);
		ctx.lineTo(this.x + 8, this.y);
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle = "#FFBF00";
	},

	// how this will handle input
	input: function ()
	{
		if (this.inUp == true && this.grounded)
		{
			this.grounded = false;
			this.vy -= 8;
		}

		if (this.inLeft == true && this.vx > -6)
			this.vx -= 1;

		if (this.inRight == true && this.vx < 6)
			this.vx += 1;
	},

	// how this object moves
	phys: function ()
	{
		// change our position based on our velocity
		if (this.x > 0 || this.x < 640)
			this.x += this.vx;

		// bounce off walls
		if (this.x <= 0 || this.x >= 640)
			this.vx = -this.vx;

		// if we're at or below the arbitrary ground point, stop and say we're grounded
		if (this.y >= 352 && this.vy > 0)
		{
			this.vy = 0;
			this.grounded = true;
		}

		// to stop that weird "slightly-bouncing-through-the-floor" bug
		this.y = Math.min(this.y + this.vy, 352);

		// gravity
		if (this.grounded == false)
		{
			if (this.vy > 0.0)
				this.vy += .2;
			else
				this.vy += .3;
		}

		// ground friction and air friction
		if (this.grounded == true)
			this.vx *= .9;
		else
			this.vx *= .99;
	},
};

// when a key is pressed down
function procInputDown(event)
{
	// Do nothing if the event was already processed
	if (event.defaultPrevented)
		return;

	switch (event.key)
	{
		case "w":
			player1.inUp = true;
			break;

		case "a":
			player1.inLeft = true;
			break;

		case "d":
			player1.inRight = true;
			break;

		case "ArrowUp":
			player2.inUp = true;
			break;

		case "ArrowLeft":
			player2.inLeft = true;
			break;

		case "ArrowRight":
			player2.inRight = true;
			break;

		default:
			return;
	}

	// Cancel the default action to avoid it being handled twice
	event.preventDefault();
}

// when a key is released
function procInputUp(event)
{
	// Do nothing if the event was already processed
	if (event.defaultPrevented)
		return;

	switch (event.key)
	{
		case "w":
			player1.inUp = false;
			break;

		case "a":
			player1.inLeft = false;
			break;

		case "d":
			player1.inRight = false;
			break;

		case "ArrowUp":
			player2.inUp = false;
			break;

		case "ArrowLeft":
			player2.inLeft = false;
			break;

		case "ArrowRight":
			player2.inRight = false;
			break;

		default:
			return;
	}

	// Cancel the default action to avoid it being handled twice
	event.preventDefault();
}

// what <body> calls on load
function drawCanvas()
{
	// find our canvas object
	var canvas = document.getElementById('themfcanvas');

	// if the canvas doesn't work don't use it
	if (canvas.getContext)
	{
		// set ctx to the canvas's context
		ctx = canvas.getContext('2d');

		// handle key presses
		window.addEventListener("keydown", procInputDown, true);
		window.addEventListener("keyup", procInputUp, true);

		// because lines go through the half of a pixel for some reason
		ctx.translate(0.5, 0.5);

		// the global style stuff
		ctx.font = '12px monospace';
		ctx.strokeStyle = '#FFBF00';
		ctx.fillStyle = '#FFBF00';

		// the actual loop
		drawLoop();
	}
}

// i dont know why but this helps with screen tearing issues
window.requestAnimFrame = function (callback)
{
	window.setTimeout(callback, 16);
};

// where everything is drawn
function drawLoop()
{
	ctx.clearRect(0, 0, 640, 480);

	drawStatic();

	player1.input();
	player2.input();

	player1.phys();
	player2.phys();

	player1.draw();
	player2.draw();

	window.requestAnimationFrame(drawLoop);
}

// draws static things like the caption bar thingy
function drawStatic()
{
	ctx.textAlign = "left";
	ctx.fillText("Canvas Test 2 - Controls: Player 1 (A W D), Player 2 (Arrow keys)", 2, 12);

	// the caption bar
	ctx.beginPath();
	ctx.moveTo(-1, 18);
	ctx.lineTo(641, 18);
	ctx.stroke();

	// the floor
	ctx.beginPath();
	ctx.moveTo(-1, 352);
	ctx.lineTo(641, 352);
	ctx.stroke();

	// the sun
	ctx.beginPath();
	ctx.arc(560, 96, 64, 0, Math.PI * 2);
	ctx.closePath();
	ctx.stroke();
}
