/* Canvas test - (c) Sarah 2019 */
var ctx; // canvas context
var raf; // the requestAnimationFrame's thing, i got no idea what this actually does

// the bouncing ball, slightly stolen from mozilla's canvas reference
var ball = {
	x: 160,
	y: 42,
	vx: 2,
	vy: 0,
	radius: 24,
	color: '#FFBF00',

	// how we should draw this object
	draw: function()
	{
		ctx.strokeStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.closePath();
		ctx.stroke();

		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius * 0.8, Math.PI, Math.PI * 1.5);
		ctx.closePath();
		ctx.stroke();
	},

	// how this object moves
	phys: function()
	{
		// change our position based on our velocity
		this.x += this.vx;
		this.y += this.vy;

		// gravity
		if (this.vy > 0.0)
			this.vy += .03;
		else
			this.vy += .05;

		// friction
		if (this.y + this.vy > (200 - this.radius))
			this.vx *= .8;

		// don't go outside the boundaries
		if (this.y + this.vy > (200 - this.radius) || this.y + this.vy < (this.radius + 18))
		{
			this.vy = -this.vy;
		}

		if (this.x + this.vx > (320 - this.radius) || this.x + this.vx < this.radius)
		{
			this.vx = -this.vx;;
		}
	}

};

// what <body> calls on load
function drawCanvas()
{
	// find our canvas object
	var canvas = document.getElementById('themfcanvas');

	// if the canvas doesn't work don't use it
	if (canvas.getContext)
	{
		// set ctx to the canvas's context and disable alpha for performace
		ctx = canvas.getContext('2d',
		{
			alpha: false
		});

		// handle a click
		canvas.addEventListener('click', canvasClicked, false);

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
window.requestAnimFrame = function(callback)
{
	window.setTimeout(callback, 16);
};

// where everything is drawn
function drawLoop()
{
	ctx.clearRect(0, 0, 320, 200);

	drawStatic();

	ball.phys();
	ball.draw();

	raf = window.requestAnimationFrame(drawLoop);
}

// draws static things like the caption bar thingy
function drawStatic()
{
	ctx.fillText("Canvas Test - Click to kick ball", 2, 12);

	ctx.beginPath();
	ctx.moveTo(-1, 18);
	ctx.lineTo(321, 18);
	ctx.stroke();

	ctx.strokeRect(303, 1, 15, 15);

	ctx.beginPath();
	ctx.moveTo(305, 3);
	ctx.lineTo(316, 14);
	ctx.moveTo(305, 14);
	ctx.lineTo(316, 3);
	ctx.stroke();
}

// this adds a little bit of functionality and makes it less boring
function canvasClicked(e)
{
	ball.vx += 1;
	ball.vy += -2;
}
