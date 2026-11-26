// Usage (from this folder): node render.js
// Renders the story variants below to 1080x1920 PNGs next to this file.
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const dir=__dirname;const tpl=fs.readFileSync(path.join(dir,'story.html'),'utf8');
const variants=[
 {out:'story-1-reminder-tonight.png',BADGE:'الليلة الساعة 8',TITLE:'الحلقة <span>التانية</span><br>نازلة الليلة',SUB:'سلسلة «لسه في رجوع» · معادلة الحلال والحرام',CTA:'فعّل التذكير عشان ما تفوتكش'},
 {out:'story-2-out-now.png',BADGE:'نزلت دلوقتي',TITLE:'الحلقة <span>كاملة</span><br>على يوتيوب',SUB:'ليه بتصلي ولسه تايه؟ ومعادلة الحلال والحرام',CTA:'اضغط على اللينك وشوفها'},
];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
for(const v of variants){let h=tpl;for(const k of ['BADGE','TITLE','SUB','CTA'])h=h.replace(k,v[k]);
 const f=path.join(dir,'_tmp.html');fs.writeFileSync(f,h);
 await p.goto('file://'+f);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
 await p.screenshot({path:path.join(dir,v.out)});console.log(v.out);}
fs.unlinkSync(path.join(dir,'_tmp.html'));await b.close();})();
