import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Read-only PNG checks; only the metadata report is written.
const dir=path.dirname(fileURLToPath(import.meta.url));
const rows=[];
for(const name of fs.readdirSync(dir).filter(n=>n.endsWith('.png')).sort()){
  const data=fs.readFileSync(path.join(dir,name));
  if(data.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw new Error(`Not PNG: ${name}`);
  const chunks=[];
  for(let p=8;p<data.length;){const size=data.readUInt32BE(p);chunks.push(data.toString('ascii',p+4,p+8));p+=size+12;}
  const colorType=data[25];
  rows.push({file:name,width:data.readUInt32BE(16),height:data.readUInt32BE(20),colorType,hasAlphaChannel:colorType===4||colorType===6,hasTransparencyChunk:chunks.includes('tRNS'),bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex')});
}
fs.writeFileSync(path.join(dir,'inspection.json'),JSON.stringify(rows,null,2)+'\n');
console.log(JSON.stringify(rows,null,2));
