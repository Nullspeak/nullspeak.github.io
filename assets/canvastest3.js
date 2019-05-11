/* Canvas test 3 - (c) Sarah 2019 */
var canvas; // the canvas itself
var ctx; // canvas context

// the taunt noise the player makes
var sndTaunt = new Audio("../assets/canvastest3/taunt.ogg");
var sndBullet = new Audio("../assets/canvastest3/shot.ogg");

// the music, currently disabled
// var sndMusic = new Audio();

// an enemy
class Enemy
{
	constructor()
	{
		this.x = 0; // x position
		this.y = 0; // y position
		this.vx = 0; // x velocity
		this.vy = 0; // y velocity;
	}

	// how this thing's drawn
	// TODO: maybe this should be some sorta bat or something
	draw()
	{
		ctx.strokeStyle = "white";
		ctx.fillStyle = "purple";
		ctx.lineWidth = 2;

		// head
		ctx.beginPath();
		ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}

	// this checks if we've been clicked on
	input(x, y)
	{
		if ((x > this.x - 8 && x < this.x + 8) && (y > this.y - 8 && y < this.y + 8))
		{
			this.x = canvas.width * Math.random();
			this.y = 0;
			player.score++;

			sndBullet.pause();
			sndBullet.currentTime = 0;
			sndBullet.play();
		}
	}

	// the really crappy AI
	phys()
	{
		// move us by our velocity
		this.x += this.vx;
		this.y += this.vy;

		// if we're to the right of the player
		if (this.x > player.x && this.vx > -1)
			this.vx -= 0.0325;

		// if we're to the left of the player
		if (this.x < player.x && this.vx < 1)
			this.vx += 0.0325;

		// if we're above the player
		if (this.y > player.y && this.vy > -1)
			this.vy -= 0.0325;

		// if we're below the player
		if (this.y < player.y && this.vy < 1)
			this.vy += 0.0325;

		// if we're touching the player
		if ((this.x > player.x - 8 && this.x < player.x + 8) &&
			(this.y > player.y - 32 && this.y < player.y + 8))
			location.reload(false); // restart the game by reloading the page, might be inefficient but it works
	}
}

// the enemies
var arrEnemies = [new Enemy()];

// the player, not a class because there's only ever one of them
var player = {
	x: 128,
	y: 351,
	vx: 0,
	vy: 0,
	grounded: false,
	inUp: false,
	inLeft: false,
	inRight: false,
	inAction: false,
	score: 0,
	shouldSpawnEnemy: false,

	// how we should draw this object
	draw: function ()
	{
		ctx.strokeStyle = "white";
		ctx.fillStyle = "black";
		ctx.lineWidth = 2;

		// body
		ctx.beginPath();
		ctx.moveTo(this.x - 8, this.y);
		ctx.lineTo(this.x, this.y - 31);
		ctx.lineTo(this.x + 8, this.y);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// head
		ctx.beginPath();
		ctx.arc(this.x, this.y - 40, 8, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// taunt text
		if (this.inAction == true)
		{
			ctx.fillStyle = "white";
			ctx.strokeStyle = "black";
			ctx.font = "16px sans-serif";
			ctx.textAlign = "center";
			ctx.shadowColor = "black";
			ctx.shadowBlur = 8;
			ctx.fillText("Raaah!", this.x, this.y - 64);
			ctx.textAlign = "left";
			ctx.shadowColor = "black";
			ctx.shadowBlur = 0;
		}
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
		if (this.x > 8 || this.x < canvas.width - 8)
			this.x += this.vx;

		// lets see if this works as a clamp
		this.x = Math.min(this.x, canvas.width - 8);
		this.x = Math.max(this.x, 8);

		// bounce off walls
		if (this.x <= 9) this.vx += 8;
		if (this.x >= canvas.width - 9) this.vx -= 8;

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
			player.inUp = true;
			break;

		// taunt for a little bit
		case "s":
			if (player.inAction == false)
			{
				sndTaunt.play();
				player.inAction = true;
				setTimeout(function ()
				{
					player.inAction = false;
				}
					, 1500);
			}
			break;

		case "a":
			player.inLeft = true;
			break;

		case "d":
			player.inRight = true;
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
			player.inUp = false;
			break;

		// inAction should be false anyway
		case "s":
			// player.inAction = false;
			break;

		case "a":
			player.inLeft = false;
			break;

		case "d":
			player.inRight = false;
			break;

		default:
			return;
	}

	// Cancel the default action to avoid it being handled twice
	event.preventDefault();
}

// when a key is released
function procInputClick(event)
{
	var rect = canvas.getBoundingClientRect();
	var mx = event.clientX - rect.left;
	var my = event.clientY - rect.top;

	// check if any enemies were clicked
	for (var i = 0; i < arrEnemies.length; i++)
	{
		arrEnemies[i].input(mx, my);
	}

	if (player.score % 10 === 0 && player.score != 0)
	{
		if (shouldSpawnEnemy == false)
		{
			shouldSpawnEnemy = true;
			arrEnemies.push(new Enemy());
		}
	}
	else
		shouldSpawnEnemy = false;
}

// what <body> calls on load
function drawCanvas()
{
	// find our canvas object
	canvas = document.getElementById('themfcanvas');

	// if the canvas doesn't work don't use it
	if (canvas.getContext)
	{
		// set ctx to the canvas's context
		ctx = canvas.getContext('2d');

		// handle key presses
		window.addEventListener("keydown", procInputDown, true);
		window.addEventListener("keyup", procInputUp, true);
		canvas.addEventListener('click', procInputClick, true);

		// sndMusic.volume = 0.25;
		// sndMusic.loop = true;
		// sndMusic.play(); // disabled for the moment

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
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	drawStatic();

	player.input();
	player.phys();
	player.draw();

	for (var i = 0; i < arrEnemies.length; i++)
	{
		arrEnemies[i].input();
		arrEnemies[i].phys();
		arrEnemies[i].draw();
	}

	window.requestAnimationFrame(drawLoop);
}

// draws static things like the scenery
function drawStatic()
{
	// player score counter
	ctx.fillStyle = "black";
	ctx.font = "bold 16px sans-serif";
	ctx.fillText("Score: " + player.score, 4, 16);

	// the floor
	ctx.fillStyle = "#397535";
	ctx.fillRect(0, 352, canvas.width, 32);
	ctx.fillStyle = "#30632c";
	ctx.fillRect(0, 288, canvas.width, 64);

	// back wall
	ctx.fillStyle = "#333";
	ctx.fillRect(0, 272, canvas.width, 16);

	// left wall
	ctx.fillStyle = "#444";
	ctx.beginPath();
	ctx.moveTo(0, 128);
	ctx.lineTo(96, 272);
	ctx.lineTo(96, 288);
	ctx.lineTo(0, 352);
	ctx.closePath();
	ctx.fill();

	// right wall
	ctx.fillStyle = "#444";
	ctx.beginPath();
	ctx.moveTo(canvas.width, 128);
	ctx.lineTo(canvas.width - 96, 272);
	ctx.lineTo(canvas.width - 96, 288);
	ctx.lineTo(canvas.width, 352);
	ctx.closePath();
	ctx.fill();

	// the house
	ctx.fillStyle = "#775c3b";
	ctx.fillRect(canvas.width - 144, 280, 32, 24);

	// house wall
	ctx.fillStyle = "#664f33";
	ctx.beginPath();
	ctx.moveTo(canvas.width - 144, 280);
	ctx.lineTo(canvas.width - 152, 280);
	ctx.lineTo(canvas.width - 152, 295);
	ctx.lineTo(canvas.width - 144, 304);
	ctx.closePath();
	ctx.fill();

	// roof front
	ctx.fillStyle = "#800";
	ctx.beginPath();
	ctx.moveTo(canvas.width - 144, 280);
	ctx.lineTo(canvas.width - 112, 280);
	ctx.lineTo(canvas.width - 128, 270);
	ctx.closePath();
	ctx.fill();

	// roof side
	ctx.fillStyle = "#600";
	ctx.beginPath();
	ctx.moveTo(canvas.width - 144, 280);
	ctx.lineTo(canvas.width - 152, 280);
	ctx.lineTo(canvas.width - 144, 275);
	ctx.lineTo(canvas.width - 128, 270);
	ctx.closePath();
	ctx.fill();

	// the sun
	ctx.shadowColor = '#FFDF00';
	ctx.shadowBlur = 64;
	ctx.fillStyle = "#FFDF00";
	ctx.beginPath();
	ctx.arc(690, 72, 32, 0, Math.PI * 2);
	ctx.closePath();
	ctx.fill();

	// reset everything
	ctx.shadowColor = 'black';
	ctx.shadowBlur = 0;
	ctx.fillStyle = "black";
}
