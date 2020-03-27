/* OS Concept thing - (c) Sarah 2019 */
var canvas; // the canvas itself
var ctx; // canvas context

var mousePosX, mousePosY;

// frame counter
var frameCount = 0;

var focusedWindowHandle = 1;

// when a key is pressed down
function procInputDown(event) {
	// Do nothing if the event was already processed
	if (event.defaultPrevented)
		return;

	switch (event.key) {
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
		default:
			return;
	}

	// Cancel the default action to avoid it being handled twice
	event.preventDefault();
}

function procInputClick(event) {
	// click coordinates relative to canvas
	var rect = canvas.getBoundingClientRect();
	var mx = event.clientX - rect.left;
	var my = event.clientY - rect.top;
}

function procInputMouseDown(event) {
	// click coordinates relative to canvas
	var rect = canvas.getBoundingClientRect();
	var mx = event.clientX - rect.left;
	var my = event.clientY - rect.top;

	if (event.button == 0) {
		for (var i = 0; i < frames.length; i++) {
			if (i > 0)
				frames[i].frameClicked(mx, my);
		}
	}
}

function procInputMouseUp(event) {
	// click coordinates relative to canvas
	var rect = canvas.getBoundingClientRect();
	var mx = event.clientX - rect.left;
	var my = event.clientY - rect.top;

	if (event.button == 0) {
		for (var i = 0; i < frames.length; i++) {
			if (i > 0) {
				frames[i].dragging = false;
				frames[i].contentClicked(mx, my);
			}
		}
	}
}

function procInputMouseMove(event) {
	// click coordinates relative to canvas
	var rect = canvas.getBoundingClientRect();
	var mx = event.clientX - rect.left;
	var my = event.clientY - rect.top;

	for (var i = 0; i < frames.length; i++) {
		if (i > 0)
			if (frames[i].dragging) {
				frames[i].frameDrag(mx - mousePosX, my - mousePosY);
			}
	}

	mousePosX = mx;
	mousePosY = my;

	mouseCursor.x = mx;
	mouseCursor.y = my;
}

function procContextMenu(event) {
	event.preventDefault();
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
		canvas.addEventListener('mousedown', procInputMouseDown, true);
		canvas.addEventListener('mouseup', procInputMouseUp, true);
		canvas.addEventListener('mousemove', procInputMouseMove, true);
		canvas.addEventListener('contextmenu', procContextMenu, true);

		// to give us nice sharp pixels with strokes but not fills for some reason
		ctx.translate(0.5, 0.5);

		ctx.font = '8pt monospace';

		frames[1].drawContent = function () {
			ctx.strokeStyle = '#ffbf00';
			ctx.fillStyle = '#ffbf00';
			ctx.fillText('This is a basic proof-of-concept', frames[1].x + 4, frames[1].y + 12);
			ctx.fillText('of a possible future operating', frames[1].x + 4, frames[1].y + 24);
			ctx.fillText('system. If you have need or want of', frames[1].x + 4, frames[1].y + 36);
			ctx.fillText('this basic windowing system, check', frames[1].x + 4, frames[1].y + 48);
			ctx.fillText('out this page\'s source by going to', frames[1].x + 4, frames[1].y + 60);
			ctx.fillText('the [Projects] page, then clicking', frames[1].x + 4, frames[1].y + 72);
			ctx.fillText('\'Sarah\'s Domain\' to see the source.', frames[1].x + 4, frames[1].y + 84);
			ctx.fillText('I don\'t recommend using it for any', frames[1].x + 4, frames[1].y + 96);
			ctx.fillText('serious projects, however.', frames[1].x + 4, frames[1].y + 108);
			ctx.strokeRect(frames[1].x + frames[1].width - 70, frames[1].y + frames[1].height - 23, 64, 17);
			ctx.fillText('Close', frames[1].x + frames[1].width - 64, frames[1].y + frames[1].height - 12);
			ctx.strokeRect(frames[1].x + 6, frames[1].y + frames[1].height - 23, 96, 17);
			ctx.fillText('View Source', frames[1].x + 8, frames[1].y + frames[1].height - 12);
			resetDrawAttr();
		};

		frames[1].contentClicked = function (x, y) {
			if (y > frames[1].y + frames[1].height - 23 && y < frames[1].y + frames[1].height - 4) {
				// the 'view source' button
				if (x > frames[1].x + 6 && x < frames[1].x + 102) {
					window.location.href = 'https://github.com/Nullspeak/nullspeak.github.io';
				}

				// the 'close' button
				if (x < frames[1].x + frames[1].width - 6 && x > frames[1].x + frames[1].width - 68) {
					frames[1].closing = true;
				}
			}
		};

		frames[1].x = (canvas.width / 2) - (frames[1].width / 2);
		frames[1].y = ((canvas.height + 16) / 2) - (frames[1].height / 2);
		frames[0].message = 'Desktop';
		frames[1].message = 'Welcome to the proof-of-concept OS thing';

		// the actual loop
		drawLoop();
	}
}

// where everything is drawn
function drawLoop() {
	resetDrawAttr();
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	drawMenuBar();

	for (var i = 0; i < frames.length; i++) {
		if (i != 0)
			frames[i].drawFrame();
	}

	mouseCursor.draw();

	frameCount++;

	// setTimeout(function () { window.requestAnimationFrame(drawLoop); }, 8);
	window.requestAnimationFrame(drawLoop);
}

function resetDrawAttr() {
	// reset everything
	ctx.shadowColor = 'black';
	ctx.shadowBlur = 0;
	ctx.fillStyle = 'black';
}

function drawMenuBar() {
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, 14);

	ctx.strokeStyle = '#ffbf00';
	ctx.fillStyle = '#ffbf00';
	ctx.lineWidth = 1;

	var timestr = new Date().toLocaleTimeString()
	ctx.fillText(timestr, 1, 9);
	ctx.strokeRect(-1, -1, ctx.measureText(timestr).width + 7, 14);
	ctx.strokeRect(-1, -1, canvas.width + 1, 14);

	ctx.strokeRect(canvas.width - 32, -1, 32, 14);
	ctx.strokeRect(canvas.width - 30, 1, 27, 10);
	ctx.strokeRect(canvas.width - 3, 3, 1, 6);
	// for some reason fillRect gives sharp lines by default but strokes don't
	ctx.fillRect(canvas.width - 28.5, 2.5, 24, 7);

	if (typeof frames[focusedWindowHandle] != 'undefined')
		ctx.fillText(frames[focusedWindowHandle].message, ctx.measureText(timestr).width + 10, 8, (ctx.measureText(timestr).width + 7) + (canvas.width - 32));

	resetDrawAttr();
}

// the base "window" class
// i think javascript's functions-are-technically-variables thing comes in handy here
class AFrame {
	constructor(handle, caption, width, height) {
		this.handle = handle;
		this.caption = caption;
		this.message = '';
		this.width = width;
		this.height = height;
		this.x = 0;
		this.y = 0;
		this.dragging = false;
		this.closing = false;
		this.closeAnimTime = 0;
	}

	drawFrame() {
		ctx.strokeStyle = '#ffbf00';
		ctx.fillStyle = 'black';

		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.fillRect(this.x, this.y - 14, this.width, 14);
		ctx.fillRect(this.x + (this.width - 12), this.y - 12, 10, 10);

		ctx.strokeRect(this.x, this.y, this.width, this.height);
		ctx.strokeRect(this.x, this.y - 14, this.width, 14);
		ctx.strokeRect(this.x + (this.width - 12), this.y - 12, 10, 10);

		ctx.beginPath();
		ctx.moveTo(this.x + (this.width - 12), this.y - 12);
		ctx.lineTo(this.x + (this.width - 2), this.y - 2);
		ctx.moveTo(this.x + (this.width - 2), this.y - 12);
		ctx.lineTo(this.x + (this.width - 12), this.y - 2);
		ctx.closePath();
		ctx.stroke();

		ctx.fillStyle = '#ffbf00';
		ctx.fillText(this.caption, this.x + 2, this.y - 5);

		resetDrawAttr();

		this.drawContent();

		this.closeFrame();
	}

	drawContent() { /* stub for overriding */ }

	frameClicked(x, y) {
		if ((x > this.x && x < this.x + this.width) && (y > this.y - 14 && y < this.y)) {
			if ((x > this.x + this.width - 12 && x < this.x + this.width) && (y > this.y - 14 && y < this.y))
				this.closing = true;
			else {
				this.dragging = true;
				focusedWindowHandle = this.handle;
			}
		}
		else {
			if ((x > this.x && x < this.x + this.width) && (y > this.y && y < this.y + this.height)) {
				this.contentClicked(x, y);
				focusedWindowHandle = this.handle;
			}
		}
	}

	frameDrag(dx, dy) {
		this.x += dx;
		this.y += dy;
	}

	closeFrame() {
		if (this.closing) {
			this.caption = '';
			this.drawContent = function () { };

			if (this.closeAnimTime == 0)
				this.closeAnimTime = frameCount + (this.height / 8);

			if (frameCount > this.closeAnimTime) {
				focusedWindowHandle = 0;
				frames.splice(this.handle, 1);
			}
			else {
				this.height -= 8;
			}
		}
	}

	contentClicked(x, y) { /* stub for overriding */ }
}

var frames = [new AFrame(0, 'Root Window', 640, 480), new AFrame(1, 'Welcome', 256, 140)];

var mouseCursor = {
	x: 320,
	y: 240,
	draw: function () {
		let cur = new Image();
		cur.src = '/assets/cursor.png';
		ctx.drawImage(cur, this.x - 0.5, this.y - 0.5);
	}
};
