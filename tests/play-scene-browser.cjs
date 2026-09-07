const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const modules=process.env.CHUCHU_NODE_MODULES||path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {chromium}=require(path.join(modules,'playwright'));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname.replace(/\/$/,'/index.html')));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(error,data)=>{if(error){res.writeHead(404).end();return;}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(data);});});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true});const errors=[];
  try{
    const context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce',acceptDownloads:true});
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    const ready=()=>page.locator('#app[data-ready="true"]').waitFor({timeout:60000});
    await page.goto(`http://127.0.0.1:${server.address().port}`);await ready();
    await page.locator('.outfit-card').first().click();await page.locator('#presets-button').click();await page.locator('#preset-name').fill('파티 코디');await page.locator('#preset-create').click();await page.locator('#presets-close').click();
    await page.locator('[data-step="play"]').click();assert.equal(await page.locator('.play-doll').count(),1);assert.equal(await page.locator('#doll-position').isVisible(),false);
    for(let i=0;i<4;i++){await page.locator('#add-friend').click();await page.locator('.friend-preset').filter({hasText:'파티 코디'}).click();}
    assert.equal(await page.locator('.play-doll').count(),5);assert.equal(await page.locator('#add-friend').isDisabled(),true);
    const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('chuchu.wardrobe.v1')));
    const first=(await state()).scene[0];await page.locator('#scene-roster button').first().click();await page.keyboard.press('ArrowLeft');
    let saved=await state();assert.equal(saved.scene.at(-1).id,first.id);assert.ok(saved.scene.at(-1).x<first.x);
    const doll=page.locator('.play-doll[aria-pressed="true"]');await doll.evaluate(el=>el.classList.remove('twirl','equipped'));
    const box=await doll.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+35,box.y+box.height/2+25,{steps:5});await page.mouse.up();
    saved=await state();assert.ok(saved.scene.at(-1).x>first.x-.05);const snapshot=saved.scene;
    const downloadEvent=page.waitForEvent('download');await page.locator('#photo-button').click();const download=await downloadEvent;
    assert.equal(download.suggestedFilename(),'chuchu-friends.png');const image=fs.readFileSync(await download.path());assert.equal(image.toString('ascii',1,4),'PNG');assert.ok(image.length>10000);
    await page.reload();await ready();await page.locator('[data-step="play"]').click();assert.deepEqual((await state()).scene,snapshot);
    await page.locator('[data-step="dress"]').click();assert.equal(await page.locator('#play-dolls').isVisible(),false);assert.equal(await page.locator('#doll-position').isVisible(),true);
    await page.locator('#undress-button').click();await page.locator('[data-step="play"]').click();assert.deepEqual((await state()).scene,snapshot);
    fs.mkdirSync(path.join(root,'artifacts/play-scene'),{recursive:true});
    for(const viewport of [{width:1280,height:800},{width:800,height:1100},{width:390,height:844}]){
      await page.setViewportSize(viewport);await page.locator('#stage').scrollIntoViewIfNeeded();
      const geometry=await page.evaluate(()=>{const stage=document.querySelector('#stage').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,inside:[...document.querySelectorAll('.play-doll-position')].every(el=>{const r=el.getBoundingClientRect();return r.left>=stage.left-1&&r.right<=stage.right+1&&r.top>=stage.top-1&&r.bottom<=stage.bottom+1;})};});
      assert.equal(geometry.overflow,false);assert.equal(geometry.inside,true);await page.screenshot({path:path.join(root,`artifacts/play-scene/${viewport.width}.png`),fullPage:true});
    }
    for(let i=0;i<5;i++)await page.locator('#remove-friend').click();assert.equal(await page.locator('.play-doll').count(),0);
    await page.reload();await ready();await page.locator('[data-step="play"]').click();assert.equal(await page.locator('.play-doll').count(),0);assert.equal((await state()).presets.hachuping.length,1);
    await page.locator('#add-friend').click();await page.locator('.friend-preset').filter({hasText:'파티 코디'}).click();assert.equal(await page.locator('.play-doll').count(),1);
    await page.locator('.character-card[data-character="soraping"]').click();await page.locator('#presets-button').click();await page.locator('#preset-name').fill('소라 친구');await page.locator('#preset-create').click();await page.locator('#presets-close').click();
    await page.locator('[data-step="play"]').click();await page.locator('#add-friend').click();await page.locator('.friend-preset').filter({hasText:'소라 친구'}).click();await page.locator('[data-talk="안녕"]').click();assert.match(await page.locator('#speech').textContent(),/소라핑/);
    await page.locator('#scene-roster button').first().click();await page.locator('[data-talk="안녕"]').click();assert.match(await page.locator('#speech').textContent(),/하츄핑/);
    await page.locator('#pose-button').click();assert.equal(await page.locator('.play-doll[aria-pressed="true"]').evaluate(el=>el.classList.contains('twirl')),true);
    const touchContext=await browser.newContext({viewport:{width:800,height:1100},hasTouch:true,reducedMotion:'reduce',storageState:await context.storageState()});const touch=await touchContext.newPage();touch.on('pageerror',e=>errors.push(e.message));
    await touch.goto(page.url());await touch.locator('#app[data-ready="true"]').waitFor({timeout:60000});await touch.locator('[data-step="play"]').tap();
    await touch.locator('#stage').scrollIntoViewIfNeeded();const touchDoll=touch.locator('.play-doll[aria-pressed="true"]');const rect=await touchDoll.boundingBox();const client=await touchContext.newCDPSession(touch);
    const point={x:rect.x+rect.width/2,y:rect.y+rect.height/2};
    const touchState=()=>touch.evaluate(()=>JSON.parse(localStorage.getItem('chuchu.wardrobe.v1')).scene.at(-1));const beforeTouch=await touchState();
    await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:point.x+40,y:point.y+25}]});await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    assert.ok((await touchState()).x>beforeTouch.x);assert.ok((await touchState()).y>beforeTouch.y);
    const cancelRect=await touchDoll.boundingBox(),cancelPoint={x:cancelRect.x+cancelRect.width/2,y:cancelRect.y+cancelRect.height/2},beforeCancel=await touchState();
    await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[cancelPoint]});await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cancelPoint.x-30,y:cancelPoint.y-20}]});await client.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});assert.deepEqual(await touchState(),beforeCancel);
    await touchContext.close();assert.deepEqual(errors,[]);console.log('PASS: five friends, preset snapshots, selection, keyboard/mouse/touch drag, cancellation, persistence, photo, responsive bounds, empty restore, re-add and selected-character dialogue/pose.');
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
