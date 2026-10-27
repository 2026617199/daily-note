/**
 * 生成应用所需的原创占位图标（不依赖第三方库）。
 * 设计：蓝色背景 + 白色「便签」图形（圆角矩形 + 三条横线）。
 * 运行：node scripts/generate-icons.js
 */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const BLUE = [32, 138, 239, 255]; // #208AEF
const WHITE = [255, 255, 255, 255];
const TRANSPARENT = [0, 0, 0, 0];

// ---------- PNG 编码 ----------
const CRC_TABLE = (() => {
    const t = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        t[n] = c;
    }
    return t;
})();

function crc32(buf) {
    let c = -1;
    for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
}

function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(size, rgba) {
    const raw = Buffer.alloc((size * 4 + 1) * size);
    for (let y = 0; y < size; y++) {
        raw[y * (size * 4 + 1)] = 0; // filter: none
        rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
    }
    const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(size, 0);
    ihdr.writeUInt32BE(size, 4);
    ihdr[8] = 8; // bit depth
    ihdr[9] = 6; // color type RGBA
    const idat = zlib.deflateSync(raw, { level: 9 });
    return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// ---------- 绘图 ----------
function createImage(size) {
    return { size, data: Buffer.alloc(size * size * 4) };
}

function setPixel(img, x, y, color) {
    const i = (y * img.size + x) * 4;
    img.data[i] = color[0];
    img.data[i + 1] = color[1];
    img.data[i + 2] = color[2];
    img.data[i + 3] = color[3];
}

function inRoundedRect(px, py, x0, y0, x1, y1, r) {
    if (px < x0 || px > x1 || py < y0 || py > y1) return false;
    const dx = Math.max(x0 + r - px, 0, px - (x1 - r));
    const dy = Math.max(y0 + r - py, 0, py - (y1 - r));
    return dx * dx + dy * dy <= r * r;
}

function fillRoundedRect(img, x0, y0, x1, y1, r, color) {
    for (let y = 0; y < img.size; y++) {
        for (let x = 0; x < img.size; x++) {
            if (inRoundedRect(x + 0.5, y + 0.5, x0, y0, x1, y1, r)) setPixel(img, x, y, color);
        }
    }
}

function fillRect(img, x0, y0, x1, y1, color) {
    fillRoundedRect(img, x0, y0, x1, y1, 0, color);
}

/** 绘制便签图形：纸张圆角矩形 + 三条横线。 */
function drawNote(img, scale, paperColor, lineColor) {
    const s = img.size;
    const w = s * scale;
    const h = w * 0.8;
    const x0 = (s - w) / 2;
    const y0 = (s - h) / 2;
    const x1 = x0 + w;
    const y1 = y0 + h;
    const r = w * 0.16;
    fillRoundedRect(img, x0, y0, x1, y1, r, paperColor);

    const lineH = w * 0.09;
    const lineR = lineH / 2;
    const lx0 = x0 + w * 0.22;
    fillRoundedRect(img, lx0, y0 + h * 0.28, x1 - w * 0.22, y0 + h * 0.28 + lineH, lineR, lineColor);
    fillRoundedRect(img, lx0, y0 + h * 0.48, x0 + w * 0.72, y0 + h * 0.48 + lineH, lineR, lineColor);
    fillRoundedRect(img, lx0, y0 + h * 0.68, x0 + w * 0.56, y0 + h * 0.68 + lineH, lineR, lineColor);
}

function save(file, size, draw) {
    const img = createImage(size);
    draw(img);
    const out = path.join(__dirname, '..', 'assets', 'images', file);
    fs.writeFileSync(out, encodePNG(size, img.data));
    console.log('生成', out);
}

// 主图标：蓝色背景 + 白色便签（蓝线）
save('icon.png', 1024, (img) => {
    fillRect(img, 0, 0, img.size, img.size, BLUE);
    drawNote(img, 0.56, WHITE, BLUE);
});

// Android 自适应前景：透明背景 + 白色便签（透明线，露出背景色）
save('android-icon-foreground.png', 1024, (img) => {
    drawNote(img, 0.5, WHITE, TRANSPARENT);
});

// Android 单色图标：白色便签（透明线）
save('android-icon-monochrome.png', 1024, (img) => {
    drawNote(img, 0.5, WHITE, TRANSPARENT);
});

// Android 自适应背景：纯蓝
save('android-icon-background.png', 1024, (img) => {
    fillRect(img, 0, 0, img.size, img.size, BLUE);
});

// 启动页图标：透明背景 + 白色便签
save('splash-icon.png', 512, (img) => {
    drawNote(img, 0.62, WHITE, TRANSPARENT);
});

// 网页 favicon
save('favicon.png', 48, (img) => {
    fillRect(img, 0, 0, img.size, img.size, BLUE);
    drawNote(img, 0.56, WHITE, BLUE);
});
