import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const groups=[['backgrounds',4],['accessories',6],['props',6],...['hachuping','soraping','challangping','bangulping'].map(id=>[`outfits/${id}`,4])];
const ids=new Set(),results=[];
const sourceOnly=process.argv.includes('--sources'),runtimeIssues=[];
for(const [group,expected] of groups){
  const catalog=path.join(root,'assets/runtime/expansion',group,'catalog.json');
  const entries=JSON.parse(fs.readFileSync(catalog,'utf8'));
  assert.equal(entries.length,expected,`${group}: unexpected asset count`);
  for(const item of entries){
    assert.ok(item.id&&item.name,`${group}: missing id/name`);
    assert.ok(!ids.has(item.id),`Duplicate ID: ${item.id}`);ids.add(item.id);
    if(group.startsWith('outfits/'))assert.equal(item.characterId,group.split('/')[1]);
    if(group==='accessories')assert.ok(['head','bag'].includes(item.slot));
    const sources=group==='backgrounds'?[item.image]:group.startsWith('outfits/')?[item.sprite,item.wornSprite]:[item.sprite];
    for(const source of sources){
      assert.equal(typeof source,'string',`${item.id}: missing image path`);
      const absolute=path.resolve(root,source);
      assert.ok(absolute.startsWith(root+path.sep),`${item.id}: image outside repository`);
      const data=fs.readFileSync(absolute);assert.ok(data.length>100,`${source}: empty image`);
      if(source.endsWith('.png')){
        assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a',`${source}: invalid PNG`);
        const width=data.readUInt32BE(16),height=data.readUInt32BE(20),type=data[25];
        assert.ok(width>0&&height>0);
        if(group!=='backgrounds'&&![4,6].includes(type))runtimeIssues.push(`${source}: PNG has no alpha channel`);
        if(source===item.wornSprite&&(width!==600||height!==700))runtimeIssues.push(`${source}: expected 600x700, got ${width}x${height}`);
      }
    }
  }
  results.push({group,count:entries.length});
}
console.log(JSON.stringify({status:runtimeIssues.length?'sources-complete-runtime-pending':'passed',total:ids.size,groups:results,runtimeIssues,note:'Checks catalog counts, IDs, local paths, PNG headers and alpha capability. Visual quality and actual transparent pixels require image review.'},null,2));
if(runtimeIssues.length&&!sourceOnly)process.exitCode=1;
