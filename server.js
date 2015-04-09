var ws281x = require('rpi-ws281x-native');

var NUM_LEDS = parseInt(process.argv[2], 10) || 8,
    pixelData = new Uint32Array(NUM_LEDS);

var brightness = 128;

ws281x.init(NUM_LEDS);


var lightsOff = function () {
  for (var i = 0; i < NUM_LEDS; i++) {
    pixelData[i] = rgb2Int(0, 0, 0);
  }
  ws281x.render(pixelData);
  ws281x.reset();
}

// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function () {
  lightsOff();
  console.log('got SIGINT');
  process.nextTick(function () { process.exit(0); });
});

process.on('SIGTERM', function () {
  console.log('got SIGTERM');
  lightsOff();
  process.nextTick(function () { process.exit(0); });
});


// ---- animation-loop
var offset = 0;
setInterval(function () {
  for (var i = 0; i < NUM_LEDS; i++) {
    pixelData[i] = colorwheel((offset + i) % 256);
  }

  offset = (offset + 1) % 256;
  ws281x.render(pixelData);
}, 1000 / 30);

console.log('Press <ctrl>+C to exit.');


// rainbow-colors, taken from http://goo.gl/Cs3H0v
function colorwheel(pos) {
  pos = 255 - pos;
  if (pos < 85) { return rgb2Int(255 - pos * 3, 0, pos * 3); }
  else if (pos < 170) { pos -= 85; return rgb2Int(0, pos * 3, 255 - pos * 3); }
  else { pos -= 170; return rgb2Int(pos * 3, 255 - pos * 3, 0); }
}

function rgb2Int(r, g, b) {
  r = r * brightness / 255;
  g = g * brightness / 255;
  b = b * brightness / 255;
  return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}
