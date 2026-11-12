const {chromium}=require('playwright');
const [dir,out,from,to]=[process.argv[2],process.argv[3],+process.argv[4],+process.argv[5]];
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920}});
pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('file://'+dir+'/index.html');await pg.evaluate(()=>window.ready);
for(let f=from;f<to;f++){await pg.evaluate(t=>seek(t),f/30);await pg.screenshot({path:`${out}/f${String(f).padStart(5,'0')}.jpg`,type:'jpeg',quality:93});}
await b.close()})();
