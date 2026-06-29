const fs = require('fs');
const zlib = require('zlib');

const path = 'C:/Users/bios/Downloads/Note API.pdf';
const buf = fs.readFileSync(path);

let decoded = '';
let pos = 0;
while ((pos = buf.indexOf('stream', pos)) !== -1) {
  let st = pos + 6;
  while (buf[st] === 0x0d || buf[st] === 0x0a) st++;
  const end = buf.indexOf('endstream', st);
  if (end === -1) break;
  const chunk = buf.slice(st, end);
  try {
    decoded += zlib.inflateSync(chunk).toString('latin1') + '\n';
  } catch (e) {
    decoded += chunk.toString('latin1') + '\n';
  }
  pos = end + 9;
}

// Extract text strings shown by Tj / TJ operators
const lines = [];
const tjRe = /\((?:[^()\\]|\\.)*\)\s*Tj/g;
const tjArrRe = /\[((?:[^\[\]])*)\]\s*TJ/g;

function unescape(s) {
  return s
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\t/g, '\t');
}

// Split decoded into text-show tokens preserving order
const tokenRe = /(\((?:[^()\\]|\\.)*\))\s*Tj|\[((?:[^\[\]]|\\.)*)\]\s*TJ|(Td|TD|T\*|Tm)/g;
let m;
let current = '';
const output = [];
while ((m = tokenRe.exec(decoded)) !== null) {
  if (m[1]) {
    current += unescape(m[1].slice(1, -1));
  } else if (m[2]) {
    const inner = m[2];
    const partRe = /\((?:[^()\\]|\\.)*\)/g;
    let pm;
    while ((pm = partRe.exec(inner)) !== null) {
      current += unescape(pm[0].slice(1, -1));
    }
  } else if (m[3]) {
    if (current.trim()) output.push(current);
    current = '';
  }
}
if (current.trim()) output.push(current);

console.log(output.join('\n'));
