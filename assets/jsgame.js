/* Javascript Game 1 - (c) Sarah 2019 */
var canvas; // the canvas itself
var ctx; // canvas context

// enables certain rendering things to make debugging easier
var debugmode = false;

var bgimg = new Image();

// is the game in the "somebody won" state?
var gameover = false;

// when a key is pressed down
function procInputDown(event)
{
	// Do nothing if the event was already processed
	if (event.defaultPrevented)
		return;

	switch (event.key)
	{
		case 'w':
			players[0].inUp = true;
			break;

		case 'a':
			players[0].inLeft = true;
			players[0].direction = -1;
			break;

		case 'd':
			players[0].inRight = true;
			players[0].direction = 1;
			break;

		case 's':
			if (players[0].canAttack == true)
			{
				players[0].inAttack = true;
				players[0].canAttack = false;
				setTimeout(function () { players[0].canAttack = true; }, 250);
			}
			break;

		case "ArrowUp":
			players[1].inUp = true;
			break;

		case "ArrowLeft":
			players[1].inLeft = true;
			players[1].direction = -1;
			break;

		case "ArrowRight":
			players[1].inRight = true;
			players[1].direction = 1;
			break;

		case "ArrowDown":
			if (players[1].canAttack == true)
			{
				players[1].inAttack = true;
				players[1].canAttack = false;
				setTimeout(function () { players[1].canAttack = true; }, 250);
			}
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
		case 'w':
			players[0].inUp = false;
			break;

		case 'a':
			players[0].inLeft = false;
			break;

		case 'd':
			players[0].inRight = false;
			break;

		case "ArrowUp":
			players[1].inUp = false;
			break;

		case "ArrowLeft":
			players[1].inLeft = false;
			break;

		case "ArrowRight":
			players[1].inRight = false;
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
	// click coordinates relative to canvas
	var rect = canvas.getBoundingClientRect();
	var mx = event.clientX - rect.left;
	var my = event.clientY - rect.top;

	if (gameover == true)
		location.reload();
}

// what <body> calls on load
function initCanvas()
{
	// find our canvas object
	canvas = document.getElementById('canvas');

	// if the canvas doesn't work don't use it
	if (canvas.getContext)
	{
		// set ctx to the canvas's context
		ctx = canvas.getContext('2d');

		// handle key presses
		window.addEventListener("keydown", procInputDown, true);
		window.addEventListener("keyup", procInputUp, true);
		canvas.addEventListener('click', procInputClick, true);

		bgimg.src = "../assets/jsgame/bgimg.png";

		players[0].x = -256;
		players[1].x = 256;

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

	bg.draw();

	for (var i = 0; i < players.length; i++)
	{
		players[i].input();
		players[i].phys();
		players[i].draw();
	}

	avgx = -((players[0].x + players[1].x)) / 2;
	avgy = -(((players[0].y + players[1].y)) / 2) - 96;

	resetDrawAttr();

	window.requestAnimationFrame(drawLoop);
}

function resetDrawAttr()
{
	// reset everything
	ctx.shadowColor = 'black';
	ctx.fillStyle = "black";
	ctx.shadowBlur = 0;
}

// the average position of both players
var avgx;
var avgy;

var fx;
var fy;

// because that mess is too long
function randomRange(low, high)
{
	return ((Math.random() % high) - low) + high;
}

// the jumping noise
function playJumpSound()
{
	new Audio("../assets/jsgame/swoosh.ogg").play();
}

// the jumping noise
function playDeathSound()
{
	// reusing sound file from canvas test 3
	new Audio("../assets/canvastest3/shot.ogg").play();
}

// the punching noises
function playPunchSound()
{
	var num = Math.round(Math.random() * 3);
	switch (num)
	{
		case 0:
			new Audio("../assets/jsgame/punch1.ogg").play();
			break;
		case 1:
			new Audio("../assets/jsgame/punch2.ogg").play();
			break;
		case 2:
			new Audio("../assets/jsgame/punch3.ogg").play();
			break;
		default:
			new Audio("../assets/jsgame/punch4.ogg").play();
			break;
	}
}

// player class, a class because this is multiplayer and why should i write all of this twice
class Player
{
	constructor(id)
	{
		this.x = 0;
		this.y = 0;
		this.vx = 0;
		this.vy = 0;
		this.id = id;
		this.damage = 0;
		this.lastdamage = 0;
		this.lives = 3;

		this.hudshakex = 0;

		this.direction = -1;

		this.grounded = true;
		this.inUp = false;
		this.inLeft = false;
		this.inRight = false;
		this.inAttack = false;
		this.canAttack = true;

		if (this.id == 0)
			this.color = '#f44242';
		else if (this.id == 1)
			this.color = '#41b5f4';
		else
			this.color = 'black';
	}

	// how the player is painted
	draw()
	{
		var xoffset = ((canvas.width / 2) + this.x) + fx;
		var yoffset = (this.y + (canvas.height - 96)) + fy;

		ctx.strokeStyle = "black";
		ctx.lineWidth = 1;

		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(xoffset, yoffset - 40, 8, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(xoffset - 8, yoffset);
		ctx.lineTo(xoffset, yoffset - 31);
		ctx.lineTo(xoffset + 8, yoffset);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.lineWidth = 2;
		ctx.font = "12pt sans-serif";
		ctx.textAlign = "center";

		ctx.shadowBlur = 8;
		ctx.fillText("Player " + (this.id + 1), xoffset, yoffset - 64);

		// debug text
		if (debugmode == true)
		{
			ctx.fillText("X " + Math.round(this.x) + ": Y " + Math.round(this.y), xoffset, yoffset - 128);
			ctx.fillText("VX " + Math.round(this.vx) + ": VY " + Math.round(this.vy), xoffset, yoffset - 96);
		}

		ctx.font = "italic 24pt sans-serif";

		var shakex = Math.random() * this.hudshakex;
		var shakey = Math.random() * this.hudshakex;

		// health text
		if (this.id == 0)
		{
			ctx.textAlign = "left";
			ctx.fillText("Player 1: " + Math.round(this.damage) + "%", 48 + shakex, (canvas.height - 48) + shakey);
			ctx.font = "italic 16pt sans-serif";
			ctx.fillText("Lives: " + this.lives, 48 + shakey, (canvas.height - 24) + shakex);

			if (this.lives <= 0)
			{
				ctx.fillStyle = "#FFBF00";
				ctx.textAlign = "center";

				ctx.font = "italic 24pt sans-serif";
				ctx.fillText("Player 2 wins!", (canvas.width / 2), (canvas.height / 2) - 64);

				ctx.font = "italic 16pt sans-serif";
				ctx.fillText("Click to replay", (canvas.width / 2), (canvas.height / 2) - 32);
			}
		}

		// health text
		if (this.id == 1)
		{
			ctx.textAlign = "right";
			ctx.fillText("Player 2: " + Math.round(this.damage) + "%", (canvas.width - 48) + shakex, (canvas.height - 48) + shakey);
			ctx.font = "italic 16pt sans-serif";
			ctx.fillText("Lives: " + this.lives, (canvas.width - 48) + shakey, (canvas.height - 24) + shakex);

			if (this.lives <= 0)
			{
				ctx.fillStyle = "#FFBF00";
				ctx.textAlign = "center";

				ctx.font = "italic 24pt sans-serif";
				ctx.fillText("Player 1 wins!", (canvas.width / 2), (canvas.height / 2) - 64);

				ctx.font = "italic 16pt sans-serif";
				ctx.fillText("Click to replay", (canvas.width / 2), (canvas.height / 2) - 32);
			}
		}

		resetDrawAttr();
	}

	// how the player handles input
	input()
	{
		if (this.inUp == true && this.grounded == true)
		{
			this.grounded = false;
			this.vy += 12;

			playJumpSound();
		}

		if (this.inLeft == true && this.vx > -8)
			this.vx -= 1;

		if (this.inRight == true && this.vx < 8)
			this.vx += 1;

		// if we can attack
		if (this.inAttack == true)
		{
			// if we're player 1, check for player 2
			if (this.id == 0)
			{
				if ((this.x > players[1].x - 16) && (this.x < players[1].x + 16) &&
					(this.y > players[1].y - 24) && (this.y < players[1].y + 24) )
				{
					// damage them and damage them more as they get weaker
					players[1].damage += randomRange(5, 15) + (players[1].damage / 16);

					// knockback
					players[1].vx = (this.vx * (players[1].damage / 100)) + (4 * this.direction);
					players[1].vy = (this.vy * (players[1].damage / 100)) + (players[1].damage / 32);
					players[1].grounded = false;

					// play a hit sound
					playPunchSound();
				}
			}

			// if we're player 2, check for player 1
			if (this.id == 1)
			{
				if ((this.x > players[0].x - 16) && (this.x < players[0].x + 16) &&
					(this.y > players[0].y - 24) && (this.y < players[0].y + 24))
				{
					// damage them and damage them more as they get weaker
					players[0].damage += randomRange(5, 15) + (players[0].damage / 16);

					// knockback
					players[0].vx = (this.vx * (players[0].damage / 100)) + (4 * this.direction);
					players[0].vy = (this.vy * (players[0].damage / 100)) + (players[0].damage / 32);
					players[0].grounded = false;

					// play a hit sound
					playPunchSound();
				}
			}

			this.inAttack = false;
		}
	}

	// how this player handles physics
	phys()
	{
		this.x += this.vx;

		// if the game's over, don't let anybody leave the arena
		// if the game's not over, kill players that leave the arena
		if (!gameover)
		{
			if ((this.x < -648) || (this.x > 648))
			{
				this.lives--;
				playDeathSound();
				this.x = 0;
				this.y = -256;
				this.vx = 0;
				this.vy = 0;
				this.grounded = false;
				this.damage = 0;
				this.lastdamage = 0;
			}
		}
		else
		{
			if (this.x < -632)
				this.x = -632;

			if (this.x > 632)
				this.x = 632;
		}

		if (this.lives <= 0)
			gameover = true;

		if (this.grounded == false)
		{
			this.y -= this.vy;
			this.vy -= 0.25;
		}
		else
			this.vy = 0;

		if (this.y >= 0)
		{
			this.grounded = true;
			this.y = 0;
		}

		// ground friction and air friction
		if (this.grounded == true)
			this.vx *= .9;
		else
			this.vx *= .99;

		// handling for the platform in the middle
		// NOTE: there is 2 units of tolerance because just one seems to be too small to check for
		if (this.vy < 0 && (this.y < -142 && this.y > -146))
		{
			if (this.x < 72 && this.x > -72)
			{
				this.grounded = true;
				this.y = -144;
			}
		}

		// if we're no longer on the platform, fall off it
		if ((this.y < -142 && this.y > -146) && !(this.x < 72 && this.x > -72))
			this.grounded = false;

		// hud shake handler
		if (this.damage > this.lastdamage)
		{
			this.hudshakex = ((this.damage - this.lastdamage) / 2) + (this.damage / 16);
			this.lastdamage = this.damage;
		}

		// gradually decrease the shake amount
		if (this.hudshakex > 0)
		{
			this.hudshakex -= (this.hudshakex / 8);
		}
	}
}

// the players
var players = [new Player(0), new Player(1)];

// the background image
var bg = {
	x: 0,
	y: 0,

	draw: function ()
	{
		this.x = avgx;
		this.y = avgy;

		if (this.x < -128)
			this.x = -128;

		if (this.x > 128)
			this.x = 128;

		if (this.y < 0)
			this.y = 0;

		if (this.y > 256)
			this.y = 256;

		fx = this.x;
		fy = this.y;

		ctx.drawImage(bgimg, Math.round(this.x) - 128, Math.round(this.y) - 256);
	}
};


