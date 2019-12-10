/*
 *	if you're reading this, i'm really, *really* sorry about this utter mess of code
 */
var c;

const RAD2DEG = Math.PI / 180;

var oldTime = (new Date()).getTime(), curTime = (new Date()).getTime(), deltaTime = 0;

var gameOver = false;
function setGameOver() {
	if (!gameOver) {
		gameOver = true;
		playerEngineAudio.pause();
		let gameovervid = document.getElementById('video-gameover');
		document.getElementById('gameover-div').style = 'display: inline-block';
		document.getElementById('gamescore-lose').innerText = 'Score: ' + player.score;
		c.canvas.style = 'display: none';
		gameovervid.style = 'display: initial';
		gameovervid.volume = 0.5;
		gameovervid.play();
	}
}

function setGameWin() {
	if (!gameOver) {
		gameOver = true;
		playerEngineAudio.pause();
		let gamewinvid = document.getElementById('video-gamewin');
		document.getElementById('gamewin-div').style = 'display: inline-block';
		document.getElementById('gamescore-win').innerText = 'Score: ' + player.score;
		c.canvas.style = 'display: none';
		gamewinvid.style = 'display: initial';
		gamewinvid.volume = 0.5;
		gamewinvid.play();
	}
}

const playerBulletSpeed = 500;
var playerBullet = { x: 0, y: 0 };

const enemyBulletSpeed = 300;
var enemyBullet = { x: 0, y: 256 };
var enemyBulletSprite = new Image();
enemyBulletSprite.src = '../assets/ftldefense/enemybullet.png';
enemyBulletSprite.onload = function () { enemyBulletSprite.loaded = true; }

var enemyBossSwirlerSprite = new Image();
enemyBossSwirlerSprite.src = '../assets/ftldefense/enemyboss_swirler.png';
enemyBossSwirlerSprite.onload = function () { enemyBossSwirlerSprite.loaded = true; }

var enemyBossSwirler = {
	x: 0, y: 0, rot: 0, health: 500, shootTime: 0, alive: true, tick: () => {
		if (!enemyBossSwirler.alive)
			return;

		enemyBossSwirler.x = Math.sin(curTime / 512) * 128;
		enemyBossSwirler.y = 192 + Math.cos(curTime / 768) * 64;
		enemyBossSwirler.rot = enemyBossSwirler.x * 5 * deltaTime;

		c.save();
		let x = (c.canvas.width / 2) + Math.round(enemyBossSwirler.x);
		let y = (c.canvas.height / 2) - Math.round(enemyBossSwirler.y);
		c.translate(x, y);
		c.rotate(enemyBossSwirler.rot * RAD2DEG);
		c.drawImage(enemyBossSwirlerSprite, -(enemyBossSwirlerSprite.width / 2), -(enemyBossSwirlerSprite.height / 2));
		c.restore();

		enemyBossSwirler.shootTime += deltaTime;
		if (enemyBossSwirler.shootTime > 0.5) {
			let bullet1 = Object.create(enemyBullet);
			bullet1.x = enemyBossSwirler.x - 20;
			bullet1.y = enemyBossSwirler.y + 8;

			let bullet2 = Object.create(enemyBullet);
			bullet2.x = enemyBossSwirler.x + 20;
			bullet2.y = enemyBossSwirler.y + 8;

			enemyBullets.push(bullet1);
			enemyBullets.push(bullet2);

			new Audio('../assets/ftldefense/playershoot.ogg').play();
			enemyBossSwirler.shootTime = 0;
		}

		if (enemyBossSwirler.health <= 0)
			enemyBossSwirler.alive = 0;
	}
};

var enemyBullets = [];

/* the player object */
var playerSprite = new Image();
playerSprite.src = '../assets/ftldefense/player.png';
playerSprite.onload = function () { playerSprite.loaded = true; }
var player = { x: 0, y: -128, vx: 0, vy: 0, rot: 0, score: 0, health: 1000, inUp: false, inDown: false, inLeft: false, inRight: false, inFire: false, bullets: [], lastShotTime: 0, heat: 0, progress: 0 };
var playerEngineAudio = new Audio('../assets/ftldefense/playerengine.ogg');
new Audio('../assets/ftldefense/playershoot.ogg').load();
new Audio('../assets/ftldefense/hitwall.ogg').load();
new Audio('../assets/ftldefense/playerhithull.ogg').load();
playerEngineAudio.preload = true;

var hudSprite = new Image();
hudSprite.src = '../assets/ftldefense/hud.png';
hudSprite.onload = function () { hudSprite.loaded = true; }

var hudSpriteWeaponWarn = new Image();
hudSpriteWeaponWarn.src = '../assets/ftldefense/hudwarning_weapons.png';
hudSpriteWeaponWarn.onload = function () { hudSpriteWeaponWarn.loaded = true; }

var hudSpriteProgress = new Image();
hudSpriteProgress.src = '../assets/ftldefense/hudprogress.png';
hudSpriteProgress.onload = function () { hudSpriteProgress.loaded = true; }

var playerBulletSprite = new Image();
playerBulletSprite.src = '../assets/ftldefense/playerbullet.png';
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

const friction = 0.9;

function player_Physics() {
	if (player.inUp)
		player.vy += 3500 * deltaTime;

	if (player.inDown)
		player.vy -= 3500 * deltaTime;

	if (player.inRight)
		player.vx += 3500 * deltaTime;

	if (player.inLeft)
		player.vx -= 3500 * deltaTime;

	player.lastShotTime += deltaTime;
	if (player.inFire && player.lastShotTime > 0.125) {
		if (player.heat < 1000) {
			let bullet1 = Object.create(playerBullet);
			bullet1.x = player.x - 20;
			bullet1.y = player.y + 8;

			let bullet2 = Object.create(playerBullet);
			bullet2.x = player.x + 20;
			bullet2.y = player.y + 8;

			player.bullets.push(bullet1);
			player.bullets.push(bullet2);

			new Audio('../assets/ftldefense/playershoot.ogg').play();
			player.lastShotTime = 0;
			player.heat += 35;
		} else {
			let bullet1 = Object.create(playerBullet);
			bullet1.x = player.x - 20;
			bullet1.y = player.y + 8;

			let bullet2 = Object.create(playerBullet);
			bullet2.x = player.x + 20;
			bullet2.y = player.y + 8;

			player.bullets.push(bullet1);
			player.bullets.push(bullet2);

			new Audio('../assets/ftldefense/playershoot.ogg').play();
			player.lastShotTime = -0.25;
			player.heat += 100;
		}
	}

	player.heat -= 200 * deltaTime;
	player.heat = clamp(player.heat, 0, 1250);

	player.vx = clamp(player.vx, -400 / friction, 400 / friction);
	player.vy = clamp(player.vy, -400 / friction, 400 / friction);

	player.vx *= friction;
	player.vy *= friction;

	player.x += player.vx * deltaTime;
	player.y += player.vy * deltaTime;

	player.x = clamp(player.x, -160, 160);
	player.y = clamp(player.y, -256 + 96, 256 - 32);

	/*
	if (player.x < -152) {
		new Audio('../assets/ftldefense/hitwall.ogg').play();
		player.x = -152;
		player.vx *= -1;
		player.vx += 500;
		player.health -= 50;
	}

	if (player.x > 152) {
		new Audio('../assets/ftldefense/hitwall.ogg').play();
		player.x = 152;
		player.vx *= -1;
		player.vx += -500;
		player.health -= 50;
	}*/

	player.rot = player.vx / 15;

	/* bullet processing */
	player.bullets.forEach(function (b, i) {
		if (b == null || b == undefined)
			return;
		b.y += playerBulletSpeed * deltaTime;
		if (b.y > 256)
			delete player.bullets[i];
		if (enemyBossSwirler.alive) {
			if (b.x > enemyBossSwirler.x - 24 && b.x < enemyBossSwirler.x + 24 && b.y > enemyBossSwirler.y - 24 && b.y < enemyBossSwirler.y + 24) {
				enemyBossSwirler.health -= 10;
				new Audio('../assets/ftldefense/playerhithull.ogg').play();
				delete player.bullets[i];
			}
		}
	});

	player.progress += deltaTime;
}

function loaded() {
	if (playerSprite.loaded && hudSprite.loaded && playerBulletSprite.loaded && enemyBulletSprite.loaded && hudSpriteWeaponWarn.loaded && hudSpriteProgress.loaded &&
		enemyBossSwirlerSprite.loaded) {
		return true;
	} else {
		return false;
	}
}

var randomJunkTime = 0;

function gRender() {
	if (!gameOver) {
		/* calc the deltatime */
		curTime = (new Date()).getTime();
		deltaTime = (curTime - oldTime) / 1000;

		if (loaded()) {
			c.clearRect(0, 0, c.canvas.width, c.canvas.height);
			playerEngineAudio.volume = clamp(Math.sqrt((player.vx * player.vx) + (player.vy * player.vy)) / 500, 0, 1);

			/* boolyet physics */
			enemyBullets.forEach(function (b, i) {
				if (b == null || b == undefined)
					return;
				b.y -= enemyBulletSpeed * deltaTime;
				if (b.y < -256)
					delete enemyBullets[i];
				if (b.x > player.x - 24 && b.x < player.x + 24 && b.y > player.y - 24 && b.y < player.y + 24) {
					new Audio('../assets/ftldefense/playerhithull.ogg').play();
					player.health -= 25;
					delete enemyBullets[i];
				}

				/* see if the bullet got shot */
				player.bullets.forEach(function (pb, pi) {
					if (pb == null || pb == undefined)
						return;
					if (b.x > pb.x - 8 && b.x < pb.x + 8 && b.y > pb.y - 16 && b.y < pb.y + 16) {
						delete enemyBullets[i];
						delete player.bullets[pi];
						player.score += 100;
					}
				});
			});

			/* boolyet draws */
			enemyBullets.forEach(function (b) {
				if (b == null || b == undefined)
					return;
				let x = (c.canvas.width / 2) + Math.round(b.x) - (enemyBulletSprite.width / 2);
				let y = (c.canvas.height / 2) - Math.round(b.y) - (enemyBulletSprite.height / 2);
				c.drawImage(enemyBulletSprite, x, y);
			});

			//if (enemyBossSwirler.alive)
			enemyBossSwirler.tick();

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
			c.fillRect(247, c.canvas.height - 24 - 32, 129 * (clamp(player.heat, 0, 1000) / 1000), 16);

			if (player.heat > 1000)
				c.drawImage(hudSpriteWeaponWarn, 0, c.canvas.height - hudSprite.height - hudSpriteWeaponWarn.height);

			c.drawImage(hudSpriteProgress, 9 + ((player.progress / 100) * 208) - 7, c.canvas.height - 47 - 8);

			/* setTimeout(function () { requestAnimationFrame(gRender) }, 1000/60); */

			/* random junk strewn around */
			randomJunkTime += deltaTime;
			if (randomJunkTime > 0.75) {
				let junk = Object.create(enemyBullet);
				junk.x = (Math.random() - 0.5) * 192;
				enemyBullets.push(junk);
				randomJunkTime = 0;
			}

			if (player.health <= 0)
				setGameOver();

			if (player.progress >= 100)
				setGameWin();
		}

		oldTime = curTime;
		requestAnimationFrame(gRender);
	}
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
	} else if (e.key == 'Escape') {
		setGameOver();
		e.preventDefault();
	} else if (e.key == 'Enter') {
		let bullet = Object.create(enemyBullet);
		bullet.x = (Math.random() - 0.5) * 256;
		enemyBullets.push(bullet);
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
	/* debug bullet */
	// enemyBullets.push(Object.create(enemyBullet));
	gRender();
}
