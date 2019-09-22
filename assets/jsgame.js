/* Javascript Game 1 - (c) Sarah 2019 */
var canvas; // the canvas itself
var ctx; // canvas context

// enables certain rendering things to make debugging easier
var debugmode = false;

var bgimg = new Image();

// is the game in the 'somebody won' state?
var gameover = false;

// if for some reason you want more than 2 jumps, set it here
var maxJumps = 2;

var sfxenabled = true;
function checkboxSfx_clicked() {
	if (document.getElementById('checkboxSfx').checked)
		sfxenabled = true;
	else
		sfxenabled = false;
}

// when a key is pressed down
function procInputDown(event) {
	// Do nothing if the event was already processed
	if (event.defaultPrevented || event.repeat)
		return;

	switch (event.key) {
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
			if (players[0].canAttack == true) {
				players[0].inAttack = true;
				players[0].canAttack = false;
				setTimeout(function () { players[0].canAttack = true; }, 250);
			}
			break;

		case 'ArrowUp':
			players[1].inUp = true;
			break;

		case 'ArrowLeft':
			players[1].inLeft = true;
			players[1].direction = -1;
			break;

		case 'ArrowRight':
			players[1].inRight = true;
			players[1].direction = 1;
			break;

		case 'ArrowDown':
			if (players[1].canAttack == true) {
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
function procInputUp(event) {
	// Do nothing if the event was already processed
	if (event.defaultPrevented)
		return;

	switch (event.key) {
		case 'w':
			players[0].inUp = false;
			break;

		case 'a':
			players[0].inLeft = false;
			break;

		case 'd':
			players[0].inRight = false;
			break;

		case 'ArrowUp':
			players[1].inUp = false;
			break;

		case 'ArrowLeft':
			players[1].inLeft = false;
			break;

		case 'ArrowRight':
			players[1].inRight = false;
			break;

		default:
			return;
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

	if (gameover == true)
		location.reload();
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
		window.addEventListener('keydown', procInputDown, true);
		window.addEventListener('keyup', procInputUp, true);
		canvas.addEventListener('click', procInputClick, true);

		bgimg.src = '../assets/jsgame/bgimg.png';

		// make sure we get the value
		checkboxSfx_clicked();

		// force the sound assets to load before we continue
		new Audio('../assets/jsgame/swoosh.ogg').load();
		new Audio('../assets/canvastest3/shot.ogg').load();
		new Audio('../assets/jsgame/punch1.ogg').load();
		new Audio('../assets/jsgame/punch2.ogg').load();
		new Audio('../assets/jsgame/punch3.ogg').load();
		new Audio('../assets/jsgame/punch4.ogg').load();

		players[0].x = -256;
		players[1].x = 256;

		// set the averages
		avgx = -((players[0].x + players[1].x)) / 2;
		avgy = -(((players[0].y + players[1].y)) / 2) - 96;

		// the actual loop
		drawLoop();
	}
}

// quick and dirty lerp function for smoothing out the camera
function lerp(start, end, amt) {
	return (1 - amt) * start + amt * end
}

// where everything is drawn
function drawLoop() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	bg.draw();

	var g = ctx.createLinearGradient(0, 0, canvas.width, 0);

    g.addColorStop(0, players[0].attr.color);
    g.addColorStop(.25, 'rgba(0,0,0,0)');
    g.addColorStop(.75, 'rgba(0,0,0,0)');
    g.addColorStop(1, players[1].attr.color, 0.25);

	ctx.fillStyle = g;
	ctx.fillRect(0, (canvas.height - 64), canvas.width, 64);

	for (var i = 0; i < players.length; i++) {
		players[i].input();
		players[i].phys();
		players[i].draw();
	}

	avgx = lerp(avgx, -((players[0].x + players[1].x)) / 2, 0.1);
	avgy = lerp(avgy, -(((players[0].y + players[1].y)) / 2) - 96, 0.1);

	resetDrawAttr();

	// window.requestAnimationFrame(drawLoop);
    setTimeout(function() { requestAnimationFrame(drawLoop); }, 10);
}

function resetDrawAttr() {
	// reset everything
	ctx.shadowColor = 'black';
	ctx.fillStyle = 'black';
}

// the average position of both players
var avgx;
var avgy;

var fx;
var fy;

// because that mess is too long
function randomRange(low, high) {
	return ((Math.random() % high) - low) + high;
}

// the jumping noise
function playJumpSound() {
	if (sfxenabled)
		new Audio('../assets/jsgame/swoosh.ogg').play();
}

// the jumping noise
function playDeathSound() {
	// reusing sound file from canvas test 3
	if (sfxenabled)
		new Audio('../assets/canvastest3/shot.ogg').play();
}

// the punching noises
function playPunchSound() {
	if (sfxenabled) {
		var num = Math.round(Math.random() * 3);
		switch (num) {
			case 0:
				var a = new Audio('../assets/jsgame/punch1.ogg');
				a.volume = 0.25;
				a.play();
				break;
			case 1:
				var a = new Audio('../assets/jsgame/punch2.ogg');
				a.volume = 0.25;
				a.play();
				break;
			case 2:
				var a = new Audio('../assets/jsgame/punch3.ogg');
				a.volume = 0.25;
				a.play();
				break;
			default:
				var a = new Audio('../assets/jsgame/punch4.ogg');
				a.volume = 0.25;
				a.play();
				break;
		}
	}
}

function clamp(v, min, max) {
	return Math.max(min, Math.min(v, max));
}

// a little bit of player customization
class PlayerAttr {
	// set up some defaults
	constructor(id) {
		this.name = 'Player ' + (id + 1);

		if (id == 0)
			this.color = '#f44242';
		else if (id == 1)
			this.color = '#41b5f4';
		else
			this.color = 'white';
	}
}

var playerAttrs = [new PlayerAttr(0), new PlayerAttr(1)];

// get a file and parse it into the player's style thing
function importPlayerAttr(id) {
	var i = document.getElementById('player1Import');

	if (id > 0)
		i = document.getElementById('player2Import');

	if (i.files.length == 1) {
		var fr = new FileReader();
		var file = i.files[0];
		fr.readAsText(file);

		fr.onloadend = function () {
			playerAttrs[id] = JSON.parse(fr.result);
			players[id].attr = playerAttrs[id];
		};
	}
}

// export a blank template player style
function exportPlayerAttrTemplate() {
	var str = JSON.stringify(new PlayerAttr(2));
	var blob = new Blob([str], { type: 'application/json' });
	var url = window.URL.createObjectURL(blob);

	var a = document.getElementById('playerExportLink');
	a.download = 'PlayerTemplate.json';

	// this is a bit cheaty but it makes it less clunky
	a.href = url;
	a.click();

	window.URL.revokeObjectURL(url);
}

function textShadow(str, x, y) {
	var col = ctx.fillStyle;

	ctx.fillStyle = 'black';
	ctx.fillText(str, x - 1, y - 1);
	ctx.fillText(str, x + 1, y + 1);
	ctx.fillText(str, x - 1, y + 1);
	ctx.fillText(str, x + 1, y - 1);

	ctx.fillStyle = col;
	ctx.fillText(str, x, y);
}

// player class, a class because this is multiplayer and why should i write all of this twice
class Player {
	constructor(id) {
		this.x = 0;
		this.y = 0;
		this.vx = 0;
		this.vy = 0;
		this.id = id;
		this.damage = 0;
		this.lastdamage = 0;
		this.lives = 3;
		this.jumps = maxJumps;

		this.hudshakex = 0;

		this.direction = -1;

		this.grounded = true;
		this.inUp = false;
		this.inLeft = false;
		this.inRight = false;
		this.inAttack = false;
		this.canAttack = true;

		this.attr = playerAttrs[id];
	}

	// how the player is painted
	draw() {
		var xoffset = ((canvas.width / 2) + this.x) + fx;
		var yoffset = (this.y + (canvas.height - 96)) + fy;

		ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		var shadowpos = (canvas.height - 96) + fy;
		ctx.beginPath();
		ctx.ellipse(xoffset, shadowpos, 16, 3, 0, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();

		ctx.strokeStyle = 'black';
		ctx.lineWidth = 2;

		ctx.fillStyle = this.attr.color;

		if (this.vx < 1 && this.vx > -1) {
			ctx.beginPath();
			ctx.arc(xoffset, yoffset - 40, 8, 0, Math.PI * 2);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(xoffset - 8, yoffset);
			ctx.lineTo(xoffset, yoffset - 30);
			ctx.lineTo(xoffset + 8, yoffset);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}
		else if (this.vx > 1) {
			ctx.beginPath();
			ctx.arc(xoffset + 4, yoffset - 40, 8, 0, Math.PI * 2);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(xoffset - 8, yoffset);
			ctx.lineTo(xoffset + 4, yoffset - 30);
			ctx.lineTo(xoffset + 8, yoffset);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}
		else if (this.vx < -1) {
			ctx.beginPath();
			ctx.arc(xoffset - 4, yoffset - 40, 8, 0, Math.PI * 2);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(xoffset + 8, yoffset);
			ctx.lineTo(xoffset - 4, yoffset - 30);
			ctx.lineTo(xoffset - 8, yoffset);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}

		ctx.lineWidth = 4;
		ctx.font = 'bold 12pt sans-serif';
		ctx.textAlign = 'center';

		var nameofx = clamp(xoffset, 32, 992);
		var nameofy = clamp(yoffset, 88, 496) - 64;
		textShadow(this.attr.name, nameofx, nameofy);

		// debug text
		if (debugmode == true) {
			var vx = this.vx;
			var vy = this.vy;
			textShadow('X ' + this.x + ': Y ' + this.y, xoffset, yoffset - 128);
			textShadow('VX ' + Math.round(vx) + ': VY ' + Math.round(vy), xoffset, yoffset - 96);
		}

		ctx.font = 'italic 24pt sans-serif';

		var shakex = Math.random() * this.hudshakex;
		var shakey = Math.random() * this.hudshakex;

		// health text
		if (this.id == 0) {
			ctx.fillStyle = this.attr.color;
			ctx.textAlign = 'left';
			textShadow(players[0].attr.name + ': ' + Math.round(this.damage) + '%', 16 + shakex, (canvas.height - 32) + shakey);
			ctx.font = 'italic 16pt sans-serif';
			textShadow('Lives: ' + this.lives, 16 + shakey, (canvas.height - 8) + shakex, this.color);

			if (this.lives <= 0) {
				ctx.fillStyle = '#FFBF00';
				ctx.textAlign = 'center';

				ctx.font = 'italic 24pt sans-serif';
				textShadow(players[1].attr.name + ' wins!', (canvas.width / 2), (canvas.height / 2) - 64);

				ctx.font = 'italic 16pt sans-serif';
				textShadow('Click to replay', (canvas.width / 2), (canvas.height / 2) - 32);
			}
		}

		// health text
		if (this.id == 1) {
			ctx.fillStyle = this.attr.color;
			ctx.textAlign = 'right';
			textShadow(players[1].attr.name + ': ' + Math.round(this.damage) + '%', (canvas.width - 16) + shakex, (canvas.height - 32) + shakey);
			ctx.font = 'italic 16pt sans-serif';
			textShadow('Lives: ' + this.lives, (canvas.width - 16) + shakey, (canvas.height - 8) + shakex);

			if (this.lives <= 0) {
				ctx.fillStyle = '#FFBF00';
				ctx.textAlign = 'center';

				ctx.font = 'italic 24pt sans-serif';
				textShadow(players[0].attr.name + ' wins!', (canvas.width / 2), (canvas.height / 2) - 64);

				ctx.font = 'italic 16pt sans-serif';
				textShadow('Click to replay', (canvas.width / 2), (canvas.height / 2) - 32);
			}
		}

		resetDrawAttr();
	}

	// how the player handles input
	input() {
		if (this.inUp == true && this.jumps > 0) {
			this.inUp = false;
			this.grounded = false;
			this.jumps--;
			this.vy = 10;

			playJumpSound();
		}

		if (this.inLeft == true && this.vx > -8)
			this.vx -= 1.5;

		if (this.inRight == true && this.vx < 8)
			this.vx += 1.5;

		// if we can attack
		if (this.inAttack == true) {
			// if we're player 1, check for player 2
			if (this.id == 0) {
				if ((this.x > players[1].x - 24) && (this.x < players[1].x + 24) &&
					(this.y > players[1].y - 24) && (this.y < players[1].y + 24)) {
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
			if (this.id == 1) {
				if ((this.x > players[0].x - 24) && (this.x < players[0].x + 24) &&
					(this.y > players[0].y - 24) && (this.y < players[0].y + 24)) {
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
	phys() {
		this.vy = clamp(this.vy, -8, 16);

		this.x += this.vx;

		// if the game's over, don't let anybody leave the arena
		// if the game's not over, kill players that leave the arena
		if (!gameover) {
			if ((this.x < -648) || (this.x > 648)) {
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
		else {
			// if the game's over, let players bounce off walls
			if (this.x < -631)
				this.vx *= -1;

			if (this.x > 631)
				this.vx *= -1;

			this.x = clamp(this.x, -631, 631);
		}

		if (this.lives <= 0)
			gameover = true;

		if (this.grounded == false) {
			this.y -= this.vy;
			this.vy -= 0.25;
		}
		else
			this.vy = 0;

		if (this.y >= 0) {
			this.grounded = true;
			this.y = 0;
			this.jumps = 2;
		}

		// ground friction and air friction
		if (this.grounded == true)
			this.vx *= .8;
		else
			this.vx *= .99;

		// handling for the platform in the middle
		// NOTE: there is 3 units of tolerance because just 1 and 2 seem to be too small to check for
		if (this.vy < 0 && (this.y < -141 && this.y > -147)) {
			if (this.x < 72 && this.x > -72) {
				this.grounded = true;
				this.y = -144;
				this.jumps = 2;
			}
		}

		// if we're no longer on the platform, fall off it
		if ((this.y < -141 && this.y > -147) && !(this.x < 72 && this.x > -72))
			this.grounded = false;

		// hud shake handler
		if (this.damage > this.lastdamage) {
			this.hudshakex = ((this.damage - this.lastdamage) / 2) + (this.damage / 16);
			this.lastdamage = this.damage;
		}

		// gradually decrease the shake amount
		if (this.hudshakex > 0) {
			this.hudshakex -= (this.hudshakex / 8);
		}

		// this fixes shimmering and weird pixel issues
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
	}
}

// the players
var players = [new Player(0), new Player(1)];

// the background image
var bg = {
	x: 0,
	y: 0,

	draw: function () {
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


