/* Local static preview with this project's query rewrites. Not deployed. */
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..'), dist = path.join(root, 'dist');
const config = JSON.parse(fs.readFileSync(path.join(root,'vercel.json')));
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.xml':'application/xml','.txt':'text/plain; charset=utf-8','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};
if(!fs.existsSync(path.join(dist,'index.html'))) throw Error('Run npm run build first.');
http.createServer((req,res)=>{
 try {
  const u=new URL(req.url,'http://127.0.0.1');
  if(u.pathname==='/index.html'){res.writeHead(308,{Location:'/'+u.search});res.end();return;}
  let pathname=u.pathname==='/'?'/index.html':u.pathname;
  for(const r of config.rewrites){if(r.source!==u.pathname)continue;let params={};const matches=(r.has||[]).every(h=>{const value=u.searchParams.get(h.key);if(value===null)return false;const m=new RegExp('^(?:'+h.value+')$').exec(value);if(!m)return false;Object.assign(params,m.groups||{});return true;});if(matches){pathname=r.destination.replace(/:([a-zA-Z]+)/g,(_,key)=>params[key]);break;}}
  const file=path.resolve(dist,'.'+decodeURIComponent(pathname));
  if(!file.startsWith(dist+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Page not found.');return;}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
 } catch {res.writeHead(400,{'Content-Type':'text/plain; charset=utf-8'});res.end('Invalid request.');}
}).listen(4173,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:4173/ — Ctrl+C to stop.'));
