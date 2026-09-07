// Read-only PNG verification. Does not alter image pixels.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = __dirname;
const rows = [];
for (const id of ['07','08','09','10']) {
  for (const suffix of ['', '-worn']) {
    const name = `bangulping_outfit_${id}${suffix}.png`;
    const buf = fs.readFileSync(path.join(root, name));
    if (buf.subarray(0,8).toString('hex') !== '89504e470d0a1a0a') throw Error(`Not PNG: ${name}`);
    const width = buf.readUInt32BE(16), height = buf.readUInt32BE(20), colorType = buf[25];
    let hasTRNS = false;
    for (let pos=8; pos+12<=buf.length;) {
      const len=buf.readUInt32BE(pos), type=buf.toString('ascii',pos+4,pos+8);
      if (type==='tRNS') hasTRNS=true;
      pos += len+12;
    }
    const alphaCapable = colorType===4 || colorType===6 || hasTRNS;
    rows.push({file:name,width,height,colorType,hasTRNS,alphaCapable,
      transparentPixels:alphaCapable?null:0,
      runtimeFramePass:suffix==='-worn'?width===600&&height===700:null,
      sha256:crypto.createHash('sha256').update(buf).digest('hex')});
  }
}
console.log(JSON.stringify({checkedAt:new Date().toISOString(),files:rows,
  status:rows.every(r=>r.alphaCapable&&r.runtimeFramePass!==false)?'needs-pixel-alpha-check':'blocked',
  notes:'PNG header/chunk verification only. Full visual inspection is recorded in prompts.md and per-outfit notes.'},null,2));
