/* bitmap font renderer - (c) sarah 7e3 */
const LfImplicitCr = true; /* unixlike LF handling where LFs also have an implicit CR */
var c; /* the canvas context */

var CharSize = 8; /* this is set automatically to the height of the font image */

var font = new Image(); /* the font image */
// font.src = '../assets/ascii8x8.png';
font.src = 'https://raw.githubusercontent.com/Nullspeak/sarafonts/master/saramono-zero/ascii16x16.png';
font.crossOrigin = ''; /* this keeps the function below from coughing up security errors */

var fontShadow = new Image(); /* the font inverted */

/* dynamically create a shadow for the selected font */
function r_CreateFontShadowImage(r = 0, g = 0, b = 0) {
    var tcanvas = document.createElement('canvas');
    tcanvas.width = font.width;
    tcanvas.height = font.height;
    var tctx = tcanvas.getContext("2d");
    var timg = font;
    tctx.drawImage(timg, 0, 0);

    var imgData = tctx.getImageData(0, 0, tcanvas.width, tcanvas.height);
    var data = imgData.data;

    /* invert the colors */
    /*
    for(var i = 0, len = data.length; i < len; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
    }*/

    /* darken everything by 3/4 */ /*
    for(var i = 0, len = data.length; i < len; i += 4) {
        data[i] -= 191;
        data[i + 1] -= 191;
        data[i + 2] -= 191;
    }*/

    /* set all non-transparent pixels to a certain color */
    for(var i = 0, len = data.length; i < len; i += 4) {
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
    }

    tctx.putImageData(imgData, 0, 0);
    fontShadow.src = tcanvas.toDataURL('image/png');
    tcanvas.remove();
}

/* x, y: the x and y position of the character in pixels
 * ch: the character to render
 * effect: the dynamic effect to apply to the character
 * bold: makes the font slightly bolder
 * shadowdepth: how many pixels deep the shadow should be, can also be zero for none
 * floorfx: round effect offsets to integer pixels, for small fonts or pixel art,
 *          off can be slightly glitchy with fonts that reach to the edges of character cells */
function r_Char(x, y, ch, effect = 'none', bold = false, shadowdepth = 0, floorfx = false) {
    var effx = 0;
    var effy = 0;
    if(effect == 'float') {
        effy = (Math.sin((Date.now() + x) / 96) + 1) * 2;
    }
    else if(effect == 'shake') {
        effx = Math.random() * 2;
        effy = Math.random() * 2;
    }
    else if(effect == 'circle') {
        effx = (Math.cos((Date.now() + x) / 96) + 1) * 2;
        effy = (Math.sin((Date.now() + x) / 96) + 1) * 2;
    }
    else if(effect == 'hbounce') {
        effx = (Math.sin((Date.now() + x) / 128) + 1) * 2;
    }
    else if(effect == 'vbounce') {
        effy = (Math.sin((Date.now() + y) / 128) + 1) * 2;
    }

    if(floorfx == true) {
        effx = Math.floor(effx);
        effy = Math.floor(effy);
    }

    if(shadowdepth > 0) {
        for(var i = 0; i < shadowdepth; i++) {
            c.drawImage(fontShadow, ch * CharSize, 0, CharSize, CharSize, x + effx + 1 + i, y + effy + 1 + i, CharSize, CharSize);

            if(bold)
                c.drawImage(fontShadow, ch * CharSize, 0, CharSize, CharSize, x + effx + 2 + i, y + effy + 1 + i, CharSize, CharSize);
        }
    }

    c.drawImage(font, ch * CharSize, 0, CharSize, CharSize, x + effx, y + effy, CharSize, CharSize);

    if(bold)
        c.drawImage(font, ch * CharSize, 0, CharSize, CharSize, x + effx + 1, y + effy, CharSize, CharSize);
}

/* render out a string of chars */
function r_Str(x, y, str, effect = 'none', bold = false, shadowdepth = 0, floorfx = false) {
    var cx = 0;
    var cy = 0;
    for(var i = 0; i < str.length; i++) {
        switch(str.charAt(i)) {
            case '\n':
                /* unixlike LF handling where LFs also have an implicit CR */
                if(LfImplicitCr)
                    cx = 0;
                cy++;
                break;

            case '\r':
                cx = 0;
                break;

            default:
                r_Char((cx * CharSize) + x, (cy * CharSize) + y, str.charCodeAt(i) - 32, effect, bold, shadowdepth, floorfx);
                cx++;
                break;
        }
    }
}

/* canvasTarget is the canvas HTML element ID
 * renderFunc is the function that will render the text
 * shadowr, shadowg, and shadowb are the colors that text shadows will have */
function c_Init(canvasTarget, renderFunc, shadowr = 0, shadowg = 0, shadowb = 0) {
    var target = document.getElementById(canvasTarget);

    if(target != null && target != undefined) {
        c = target.getContext('2d');
        c.setTransform(1, 0, 0, 1, 0, 0);
        CharSize = font.height;
        r_CreateFontShadowImage(shadowr, shadowg, shadowb);

        renderFunc();
    } else {
        console.log('[TextRender.js] No canvas target, trying again..');
        setTimeout(c_Init, 500, canvasTarget, renderFunc);
    }
}
