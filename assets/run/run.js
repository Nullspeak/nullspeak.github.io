/* run - (c) sarah 2020 */
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('2d', {alpha: false});
const fps = 60;

/* tileset image */
const tiles = new Image();
tiles.onLoad = () => {tiles.loaded = true;};
tiles.src = '/assets/run/tiles.png';

/* frametime calculator */
const time = {
	start: 0,
	frames: 0,
	frametime_begin: 0,
	frametime_end: 0,
	delta: 0,
};

/* camera object */
const camera = {
	x: 0,
	y: 0,
};

/* sprite uvs */
const sprites = {
	player: {
		idle: {uvx: 0, uvy: 6, width: 2, height: 2}
	},
	grass: {
		top_middle: {uvx: 1, uvy: 0, width: 1, height: 1}
	}
};

/* the player object */
const player = {
	x: 0, y: 0,
	xvel: 0, yvel: 0,
	facing_left: false,
	input: {left: false, right: false, jump: false, attack: false, handler: () => {
		if(player.input.left) {
			player.facing_left = true;
		}
		
		if(player.input.right)
			player.facing_left = false;
	}},
	animtime: 0,
	sprite: sprites.player.idle
};

function player_phys() {
	player.input.handler();
	
	if(player.input.left)
		player.xvel -= 1;
	if(player.input.right)
		player.xvel += 1;
	
	if(player.y > 0)
		player.yvel -= 0.1;
	else {
		player.yvel = 0;
		player.y = 0;
	}
	
	if(player.input.up && player.y <= 0)
		player.yvel = 4;
	
	if(!player.input.left && !player.input.right)
		player.xvel *= 0.8;
	
	player.xvel = clamp(player.xvel, -8, 8);
	
	player.x += (player.xvel * time.delta * 30);
	player.y += (player.yvel * time.delta * 30);
}

function clamp(num, min, max) {
	return num <= min ? min : num >= max ? max : num;
}

function remap(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

/* when the page loads */
function run_init() {
	if(gl == null || gl == undefined) {
		alert('couldn\'t grab canvas context');
		return;
	}
	gl.width = canvas.clientWidth;
	gl.height = canvas.clientHeight;
	
	time.start = performance.now();
	
	setInterval(run_tick, (1/60) * 1000);
}

/* every frame rendered */
function run_tick() {
	time.frametime_begin = performance.now();
	
	gl.clearRect(0, 0, gl.width, gl.height);
	
	player_phys();
	camera.x = -player.x + remap(player.xvel, -8, 8, 16+4,16-4);
	camera.y = clamp(-player.y + remap(player.yvel, 0, 8, 8, 4), -65536, 8);
	
	/* the player */
	draw_sprite(player.sprite, player.x, player.y, player.facing_left);
	
	/* some debug ground */
	for(let x = -32; x < 32; x++) {
		draw_sprite(sprites.grass.top_middle, x, -2);
	}
	
	gl.fillStyle = 'white';
	gl.font = '8pt sans-serif';
	gl.fillText('FPS: ' + Math.round(time.frames / ((performance.now() - time.start) / 1000)), 4, 12);
	
	time.frametime_end = performance.now();
	time.delta = (time.frametime_end - time.frametime_begin) / 1000;
	time.frames++;
}

/* draws a sprite bc this is too long for just part of a func body */
function draw_sprite(sprite, sx, sy, mirrored = false) {
	gl.save();
	let w = sprite.width * 8;
	let h = sprite.height * 8;
	let rawx = (sx + camera.x);
	let rawy = ((gl.height/8) - (sy + camera.y));
	let x = Math.round(rawx * 8);
	let y = Math.round(rawy * 8);
	gl.translate(x, y);
	
	if(!mirrored)
		gl.drawImage(tiles, sprite.uvx * 8, sprite.uvy * 8, w, h, 0, 0, w, h);
	else {
		gl.translate(w, 0);
		gl.scale(-1, 1);
		gl.drawImage(tiles, sprite.uvx * 8, sprite.uvy * 8, w, h, 0, 0, w, h);
	}
	gl.restore();
}

function run_input(e, released) {
	if(e.isComposing || e.keyCode === 229 || e.repeat)
		return;
	
	switch(e.code) {
		case 'ArrowLeft':
		player.input.right = false;
		player.input.left = !released;
		break;
		
		case 'ArrowRight':
		player.input.left = false;
		player.input.right = !released;
		break;
		
		case 'KeyX':
		player.input.up = !released;
		break;
	}
}

window.addEventListener('keydown', e => {run_input(e, false);}, true);
window.addEventListener('keyup', e => {run_input(e, true);}, true);

/* init the engine */
run_init();
