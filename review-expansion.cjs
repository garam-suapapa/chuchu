// Run against the local app after all expansion catalogs are runtimeReady.
// CHUCHU_BASE_URL overrides localhost:4173; CHUCHU_NODE_MODULES supplies Playwright.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
function browserTools(){
  const roots=[process.env.CHUCHU_NODE_MODULES,path.join(__dirname,'node_modules'),process.env.USERPROFILE&&path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules')].filter(Boolean);
  for(const root of roots){try{return require(path.join(root,'playwright'));}catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error;}}
  throw new Error('Playwright not found. Set CHUCHU_NODE_MODULES to its node_modules directory.');
}
const output=path.join(__dirname,'artifacts','expansion-final-review');
const report={date:new Date().toISOString(),status:'running',outfits:[],accessories:[],backgrounds:[],props:[],errors:[],failedRequests:[]};
async function main(){
  fs.mkdirSync(output,{recursive:true});
  const {SAVE_KEY}=await import(pathToFileURL(path.join(__dirname,'game-state.js')).href);
  const {chromium}=browserTools();
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});
  page.setDefaultTimeout(15000);
  page.on('pageerror',error=>report.errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')report.errors.push(message.text());});
  page.on('response',response=>{if(response.status()>=400)report.failedRequests.push({url:response.url(),status:response.status()});});
  const save=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY);
  const ready=()=>page.locator('#app[data-ready="true"]').waitFor({timeout:60000});
  const step=id=>page.locator(`[data-step="${id}"]`).click();
  const stable=()=>page.waitForFunction(()=>!document.querySelector('#doll').matches('.twirl,.equipped'));
  async function catalog(relative){
    const response=await page.request.get(new URL('assets/runtime/expansion/'+relative,page.url()).href);
    assert.equal(response.status(),200,relative);const entries=await response.json();
    assert.ok(entries.every(entry=>entry.runtimeReady===true),`${relative}: finish processing before this review`);
    return entries;
  }
  try{
    const response=await page.goto(process.env.CHUCHU_BASE_URL||'http://127.0.0.1:4173');
    assert.equal(response.status(),200);await ready();
    const characters=['hachuping','soraping','challangping','bangulping'];
    const accessories=await catalog('accessories/catalog.json');assert.equal(accessories.length,6);
    const props=await catalog('props/catalog.json');assert.equal(props.length,6);
    assert.equal(await page.locator('.accessory-card').count(),12);
    assert.equal(await page.locator('.background-card').count(),8);
    assert.equal(await page.locator('.play-prop-card').count(),6);
    await page.locator('#next-button').click();
    for(const characterId of characters){
      await page.locator(`.character-card[data-character="${characterId}"]`).click();await step('dress');
      const outfits=await catalog(`outfits/${characterId}/catalog.json`);assert.equal(outfits.length,4);
      assert.equal(await page.locator('.outfit-card').count(),10,`${characterId} wardrobe count`);
      assert.equal(await page.locator('#dress-panel .count-badge').textContent(),'10벌');
      for(const outfit of outfits){
        await page.locator(`.outfit-card[data-outfit="${outfit.id}"]`).click();
        assert.equal(await page.locator('#doll').getAttribute('data-outfit'),outfit.id);
        assert.equal((await save()).outfits[characterId],outfit.id);
        await stable();await page.locator('#stage').screenshot({path:path.join(output,outfit.id+'.png')});
        report.outfits.push({characterId,id:outfit.id});
      }
      await step('accessory');
      for(const accessory of accessories){
        await page.locator(`.accessory-card[data-accessory="${accessory.id}"]`).click();
        const equipped=(await page.locator('#doll').getAttribute('data-accessories')).split(',');assert.ok(equipped.includes(accessory.id));
        assert.equal((await save()).accessories[characterId][accessory.slot],accessory.id);
        report.accessories.push({characterId,id:accessory.id});
      }
    }
    // A keyboard move is a real UI change and must survive reload with the new outfit.
    const movable=accessories.find(entry=>entry.slot==='bag')||accessories[0];
    const movableCard=page.locator(`.accessory-card[data-accessory="${movable.id}"]`);
    if(await movableCard.getAttribute('aria-pressed')!=='true')await movableCard.click();
    await movableCard.focus();await movableCard.press('ArrowRight');await movableCard.press('ArrowDown');
    const before=await save(),characterId=before.characterId,outfitId=before.outfits[characterId];
    assert.ok(before.accessoryPositions[characterId][outfitId][movable.id]);
    assert.ok(Object.values(before.accessoryPositions[characterId][outfitId][movable.id]).some(value=>value!==0));
    await page.reload();await ready();
    const after=await save();assert.equal(after.outfits[characterId],outfitId);
    assert.equal(await page.locator('#doll').getAttribute('data-outfit'),outfitId);
    assert.deepEqual(after.accessories,before.accessories);assert.deepEqual(after.accessoryPositions,before.accessoryPositions);
    report.saveRestore={characterId,outfitId,accessoryId:movable.id,offset:after.accessoryPositions[characterId][outfitId][movable.id]};
    await page.locator('#next-button').click();await step('background');
    for(const id of await page.locator('.background-card').evaluateAll(cards=>cards.map(card=>card.dataset.background))){
      await page.locator(`.background-card[data-background="${id}"]`).click();assert.equal(await page.locator('#stage').getAttribute('data-background'),id);
      const image=await page.locator('#stage').evaluate(element=>getComputedStyle(element).backgroundImage);
      assert.ok(image!=='none');report.backgrounds.push(id);
    }
    await step('play');
    for(const prop of props){
      await page.locator(`.play-prop-card[data-prop="${prop.id}"]`).click();
      assert.equal(await page.locator('#featured-prop').getAttribute('data-prop'),prop.id);
      assert.equal(await page.locator('#speech').textContent(),prop.line);
      assert.ok(await page.locator('#featured-prop').isVisible());
      assert.ok(await page.locator('#featured-prop img').evaluate(image=>image.complete&&image.naturalWidth>0));report.props.push(prop.id);
    }
    assert.equal(await page.locator('#scene-props .prop').count(),3);
    await page.locator('#bubble-toy').click();assert.match(await page.locator('#speech').textContent(),/비눗방울/);
    await page.locator('#mirror').click();assert.match(await page.locator('#speech').textContent(),/빙그르르/);
    await page.locator('#chest').click();assert.equal(await page.locator('#chest').getAttribute('aria-expanded'),'true');
    await page.locator('#chest').click();assert.equal(await page.locator('#chest').getAttribute('aria-expanded'),'false');report.legacyProps=3;
    await stable();await page.screenshot({path:path.join(output,'landscape-1280x800.png'),fullPage:true});
    const downloadPromise=page.waitForEvent('download');await page.locator('#photo-button').click();
    const download=await downloadPromise;assert.equal(await download.failure(),null);const photo=path.join(output,'outfit-photo.png');await download.saveAs(photo);
    const bytes=fs.readFileSync(photo);assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(bytes.readUInt32BE(16),1200);assert.equal(bytes.readUInt32BE(20),900);report.photo={name:download.suggestedFilename(),width:1200,height:900};
    await page.setViewportSize({width:800,height:1280});await page.locator('#stage').scrollIntoViewIfNeeded();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'portrait horizontal overflow');
    await page.screenshot({path:path.join(output,'portrait-800x1280.png'),fullPage:true});
    assert.equal(report.outfits.length,16);assert.equal(report.accessories.length,24);assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedRequests,[]);report.status='passed';
  }catch(error){report.status='failed';report.failure=error.stack;await page.screenshot({path:path.join(output,'failure.png'),fullPage:true}).catch(()=>{});throw error;}
  finally{fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));await browser.close();}
  console.log(JSON.stringify(report,null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
