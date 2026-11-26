const { chromium } = require('playwright');
const path=require('path');
(async()=>{
  const mode=process.argv[2]; const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1080,height:1920}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto('file://'+path.resolve((process.env.PAGE||'reel.html'))); await p.waitForFunction('window.READY===true');
  if(mode==='preview'){
    const ts=process.argv[3].split(',').map(Number);
    for(const t of ts){ await p.evaluate(t=>seek(t),t); await p.screenshot({path:`prev_${t}.jpg`,quality:80,type:'jpeg'}); }
  } else {
    const fps=+(process.env.FPS||30), N=+(process.env.DUR||30)*fps; const out=process.stdout;
    const S0=Math.round((+(process.env.START||0))*fps);for(let i=S0;i<N;i++){ await p.evaluate(t=>seek(t),i/fps); const buf=await p.screenshot({type:'jpeg',quality:95});
      await new Promise(r=>out.write(buf,r)); if(i%90===0) process.stderr.write('frame '+i+'\n'); }
  }
  if(errs.length) process.stderr.write('ERRORS: '+errs.join('\n')+'\n');
  await b.close();
})();
