// Simple placeholder PNG generator using pure Node.js
// Creates minimal valid PNG files with solid colors

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(width, height, r, g, b) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = createChunk('IHDR', ihdrData);

  // IDAT chunk (image data)
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter byte
    for (let x = 0; x < width; x++) {
      rawData.push(r, g, b);
    }
  }
  const compressed = zlib.deflateSync(Buffer.from(rawData));
  const idat = createChunk('IDAT', compressed);

  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type);
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);

  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(data) {
  let crc = 0xFFFFFFFF;
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Create directories
const signsDir = path.join(__dirname, '..', 'assets', 'signs');
const uiDir = path.join(__dirname, '..', 'assets', 'ui');

// Sign placeholders (64x64)
const signs = [
  { name: 'priority-road.png', r: 240, g: 192, b: 0 },      // Yellow
  { name: 'end-priority.png', r: 180, g: 144, b: 0 },       // Dark yellow
  { name: 'town-entry.png', r: 255, g: 220, b: 100 },       // Light yellow
  { name: 'autobahn.png', r: 0, g: 100, b: 180 }            // Blue
];

signs.forEach(sign => {
  const png = createPNG(64, 64, sign.r, sign.g, sign.b);
  fs.writeFileSync(path.join(signsDir, sign.name), png);
  console.log(`Created ${sign.name}`);
});

// App icons (solid dark blue with lighter center)
[192, 512].forEach(size => {
  const png = createPNG(size, size, 26, 26, 46); // Dark blue matching theme
  fs.writeFileSync(path.join(uiDir, `icon-${size}.png`), png);
  console.log(`Created icon-${size}.png`);
});

console.log('All placeholders created!');
