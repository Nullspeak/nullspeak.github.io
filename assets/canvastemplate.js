/* Canvas template - (c) Sarah 2019 */
var canvas; // the canvas itself
var ctx; // canvas context

// when a key is pressed down
function procInputDown(event)
{
	// Do nothing if the event was already processed
	if (event.defaultPrevented)
		return;

	switch (event.key)
	{
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

	window.requestAnimationFrame(drawLoop);
}

// draws static things like the scenery
function drawStatic()
{
	// actual drawing code here at some point

	resetDrawAttr();
}

function resetDrawAttr()
{
	// reset everything
	ctx.shadowColor = 'black';
	ctx.shadowBlur = 0;
	ctx.fillStyle = "black";
}

