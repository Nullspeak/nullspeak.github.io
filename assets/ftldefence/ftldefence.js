/* use font.onload instead of window.onload or the timing freaks js out */
var c;

const RAD2DEG = Math.PI / 180;

var oldTime = (new Date()).getTime(), curTime = (new Date()).getTime(), deltaTime = 0;

const playerBulletSpeed = 500;
var playerBullet = { x: 0, y: 0 };

/* the player object */
var playerSprite = new Image();
playerSprite.src = '../assets/ftldefence/player.png';
playerSprite.onload = function () { playerSprite.loaded = true; }
var player = { x: 0, y: -128, vx: 0, vy: 0, rot: 0, score: 0, health: 1000, inUp: false, inDown: false, inLeft: false, inRight: false, inFire: false, bullets: [], lastShotTime: 0, heat: 0 };
var playerEngineAudio = new Audio('../assets/ftldefence/playerengine.ogg');
new Audio('../assets/ftldefence/playershoot.ogg').load();
new Audio('../assets/ftldefence/hitwall.ogg').load();
playerEngineAudio.preload = true;

var hudSprite = new Image();
hudSprite.src = '../assets/ftldefence/hud.png';
hudSprite.onload = function () { hudSprite.loaded = true; }

var playerBulletSprite = new Image();
playerBulletSprite.src = '../assets/ftldefence/playerbullet.png';
playerBulletSprite.onload = function () { playerBulletSprite.loaded = true; }

function player_Draw() {
	/* bullet processing */
	player.bullets.forEach(function (b) {
		if (b == null || b == undefined)
			return;
		let x = (c.canvas.width / 2) + Math.round(b.x) - (playerBulletSprite.width / 2);
		let y = (c.canvas.height / 2) - Math.round(b.y) - (playerBulletSprite.height / 2);
		c.drawImage(playerBulletSprite, x, y);
	});

	c.save();
	let x = (c.canvas.width / 2) + Math.round(player.x);
	let y = (c.canvas.height / 2) - Math.round(player.y);
	c.translate(x, y);
	c.rotate(player.rot * RAD2DEG);
	c.drawImage(playerSprite, -(playerSprite.width / 2), -(playerSprite.height / 2));
	/* c.drawImage(playerSprite, ((c.canvas.width/2) - playerSprite.width/2) + player.x, ((c.canvas.height/2) - playerSprite.height/2) - player.y); */
	c.restore();
}

function clamp(num, min, max) {
	return num <= min ? min : num >= max ? max : num;
}

const friction = 0.95;

function player_Physics() {
	if (player.inUp)
		player.vy += 1000 * deltaTime;

	if (player.inDown)
		player.vy -= 1000 * deltaTime;

	if (player.inRight)
		player.vx += 1000 * deltaTime;

	if (player.inLeft)
		player.vx -= 1000 * deltaTime;

	player.lastShotTime += deltaTime;
	if (player.inFire && player.lastShotTime > 0.25) {
		if (player.heat < 900) {
			let bullet1 = Object.create(playerBullet);
			bullet1.x = player.x - 20;
			bullet1.y = player.y + 8;

			let bullet2 = Object.create(playerBullet);
			bullet2.x = player.x + 20;
			bullet2.y = player.y + 8;

			player.bullets.push(bullet1);
			player.bullets.push(bullet2);

			new Audio('../assets/ftldefence/playershoot.ogg').play();
			player.lastShotTime = 0;
			player.heat += 50;
		} else {
			player.lastShotTime = -0.5;
		}
	}

	player.heat -= 50 * deltaTime;
	player.heat = clamp(player.heat, 0, 1000);

	player.vx = clamp(player.vx, -350, 350);
	player.vy = clamp(player.vy, -350, 350);

	player.vx *= friction;
	player.vy *= friction;

	player.x += player.vx * deltaTime;
	player.y += player.vy * deltaTime;

	// player.x = clamp(player.x, -152, 152);
	player.y = clamp(player.y, -256 + 96, 256 - 32);

	if (player.x < -152) {
		new Audio('../assets/ftldefence/hitwall.ogg').play();
		player.x = -152;
		player.vx *= -1;
		player.vx += 50;
		player.health -= 50;
	}

	if (player.x > 152) {
		new Audio('../assets/ftldefence/hitwall.ogg').play();
		player.x = 152;
		player.vx *= -1;
		player.vx += -50;
		player.health -= 50;
	}

	player.rot = player.vx / 15;

	/* bullet processing */
	player.bullets.forEach(function (b, i) {
		if (b == null || b == undefined)
			return;
		b.y += playerBulletSpeed * deltaTime;
		if (b.y > 256)
			delete player.bullets[i];
	});
}

const objmsg = 'Reach the enemy mothership!';

function gRender() {
	/* calc the deltatime */
	curTime = (new Date()).getTime();
	deltaTime = (curTime - oldTime) / 1000;

	if (playerSprite.loaded && hudSprite.loaded && playerBulletSprite.loaded) {
		c.clearRect(0, 0, c.canvas.width, c.canvas.height);
		playerEngineAudio.volume = clamp(Math.sqrt((player.vx * player.vx) + (player.vy * player.vy)) / 500, 0, 1);

		player_Physics();
		player_Draw();

		c.drawImage(hudSprite, 0, c.canvas.height - hudSprite.height);

		var healthGradient = c.createLinearGradient(0, c.canvas.height - 24, 0, c.canvas.height - 8);
		healthGradient.addColorStop(0, "#f00");
		healthGradient.addColorStop(1, "#700");

		c.fillStyle = healthGradient;
		c.fillRect(247, c.canvas.height - 24, 129 * (player.health / 1000), 16);

		var heatGradient = c.createLinearGradient(0, c.canvas.height - 24 - 32, 0, c.canvas.height - 8 - 32);
		heatGradient.addColorStop(0, "#f00");
		heatGradient.addColorStop(1, "#700");

		c.fillStyle = heatGradient;
		c.fillRect(247, c.canvas.height - 24 - 32, 129 * (player.heat / 1000), 16);

		/* setTimeout(function () { requestAnimationFrame(gRender) }, 1000/60); */
	}

	oldTime = curTime;
	requestAnimationFrame(gRender);
}

function gKeyDown(e) {
	if (e.isComposing || e.keyCode === 229 || e.defaultPrevented || e.repeat)
		return;

	if (e.key == ' ') {
		player.inFire = true;
		e.preventDefault();
	} else if (e.key == 'ArrowUp') {
		player.inUp = true;
		player.inDown = false;
		e.preventDefault();
	} else if (e.key == 'ArrowDown') {
		player.inDown = true;
		player.inUp = false;
		e.preventDefault();
	} else if (e.key == 'ArrowLeft') {
		player.inLeft = true;
		player.inRight = false;
		e.preventDefault();
	} else if (e.key == 'ArrowRight') {
		player.inRight = true;
		player.inLeft = false;
		e.preventDefault();
	}
}

function gKeyUp(e) {
	if (e.isComposing || e.keyCode === 229 || e.defaultPrevented || e.repeat)
		return;

	if (e.key == ' ') {
		player.inFire = false;
		e.preventDefault();
	} else if (e.key == 'ArrowUp') {
		player.inUp = false;
		e.preventDefault();
	} else if (e.key == 'ArrowDown') {
		player.inDown = false;
		e.preventDefault();
	} else if (e.key == 'ArrowLeft') {
		player.inLeft = false;
		e.preventDefault();
	} else if (e.key == 'ArrowRight') {
		player.inRight = false;
		e.preventDefault();
	}
}

function gInit() {
	c = document.getElementById('canvas').getContext('2d');
	window.addEventListener("keydown", gKeyDown);
	window.addEventListener("keyup", gKeyUp);
	playerEngineAudio.loop = true;
	playerEngineAudio.play();
	playerEngineAudio.volume = 0;
	gRender();
}
