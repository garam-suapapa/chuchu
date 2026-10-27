const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const port = Number(process.env.CHUCHU_PORT || 4173);
const publicFiles = new Set(['/index.html','/styles.css','/wardrobe.css','/app.js','/game-state.js','/doll-renderer.js','/decor-catalog.js','/expansion-assets.js','/preset-ui.js','/play-scene.js','/voice-repeat.js']);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.wasm':'application/wasm','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  let pathname;
  try { pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch {res.writeHead(400).end();return;}
  if(pathname==='/')pathname='/index.html';
  if(pathname==='/feeding'||pathname==='/feeding/')pathname='/feeding/index.html';
  if(pathname==='/health'){res.writeHead(200,{'Content-Type':'application/json'}).end('{"app":"chuchu","ok":true}');return;}
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405).end();return;}
  const asset=pathname==='/assets/runtime/game-assets.json'||pathname.startsWith('/assets/runtime/')&&/\.(png|jpg|webp|svg|json)$/.test(pathname);
  const feeding=pathname.startsWith('/feeding/')&&/\.(html|css|js|mjs|wasm|task)$/.test(pathname);
  if(!publicFiles.has(pathname)&&!asset&&!feeding){res.writeHead(404).end('Not found');return;}
  const file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)||(asset&&!file.startsWith(path.join(root,'assets','runtime')+path.sep))){res.writeHead(403).end();return;}
  fs.stat(file,(error,stat)=>{
    if(error||!stat.isFile()){res.writeHead(404).end('Not found');return;}
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; media-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'self'",'Permissions-Policy':'camera=(self), geolocation=(), microphone=(self)'});
    if(req.method==='HEAD'){res.end();return;}
    fs.createReadStream(file).pipe(res);
  });
});
server.listen(port,'127.0.0.1',()=>console.log(`CHUCHU_READY http://127.0.0.1:${port}`));
server.on('error',error=>{console.error(error.message);process.exitCode=1;});
