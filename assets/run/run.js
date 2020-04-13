/* run - (c) sarah 2020 */
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('2d', {alpha: false});
const fps = 30;

/* tileset image */
const tiles = new Image();
tiles.onLoad = () => {tiles.loaded = true;};
tiles.src = '/assets/run/tiles.png';

/* frametime calculator */
const time = {
	frametime_begin: 0,
	frametime_end: 0,
	delta: 0,
};

/* camera object */
const camera = {
	x: 0,
	y: 0,
	target_x: 0,
	target_y: 0,
	offset_x: 0,
	offset_y: 0,
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
	x: 16, y: 16,
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

/* when the page loads */
function run_init() {
	if(gl == null || gl == undefined) {
		alert('couldn\'t grab canvas context');
		return;
	}
	gl.width = canvas.clientWidth;
	gl.height = canvas.clientHeight;
	
	setInterval(run_tick, (1/fps));
}

/* every frame rendered */
function run_tick() {
	time.frametime_begin = performance.now();
	
	gl.clearRect(0, 0, gl.width, gl.height);
	
	/* the player */
	draw_sprite(player.sprite, player.x - 0.5, player.y + 0.5, player.facing_left);
	player.input.handler();
	
	/* some debug ground */
	for(let i = 0; i < 32; i++) {
		draw_sprite(sprites.grass.top_middle, i, 0);
	}
	
	time.frametime_end = performance.now();
	time.delta = (time.frametime_end - time.frametime_begin) / 1000;
}

/* draws a sprite bc this is too long for just part of a func body */
function draw_sprite(sprite, sx, sy, mirrored = false) {
	gl.save();
	let w = sprite.width * 8;
	let h = sprite.height * 8;
	let rawx = Math.round(sx + camera.x);
	let rawy = Math.round(gl.height - (sy + camera.y + 8));
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
	
	console.log(e.code);
	
	switch(e.code) {
		case 'ArrowLeft':
		player.input.right = false;
		player.input.left = !released;
		break;
		
		case 'ArrowRight':
		player.input.left = false;
		player.input.right = !released;
		break;
	}
}

canvas.addEventListener('keydown', e => {run_input(e, false);}, true);
canvas.addEventListener('keyup', e => {run_input(e, true);}, true);

/* init the engine */
run_init();
