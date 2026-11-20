// ================= drawing engine =================
const DRAW={};
function prep(id){const g=$(id);const els=[...g.querySelectorAll('.s,.hz')];const lens=els.map(e=>e.getTotalLength());const tot=lens.reduce((a,b)=>a+b,0);
  els.forEach((e,i)=>{e.style.strokeDasharray=lens[i]+' '+(lens[i]+1)});DRAW[id]={els,lens,tot,fo:[...g.querySelectorAll('.fo')]};}
function drawAt(id,p){const D=DRAW[id];let rem=p*D.tot;let tip=null;
  D.els.forEach((e,i)=>{const L=D.lens[i];const seg=clamp(rem/L);rem-=L;e.style.strokeDashoffset=L*(1-seg);
    if(e.classList.contains('f'))e.style.fillOpacity=clamp((p-.6)/.35);
    if(seg>0&&seg<1&&!tip){const q=e.getPointAtLength(L*seg);tip=new DOMPoint(q.x,q.y).matrixTransform(e.getScreenCTM());}});
  D.fo.forEach(e=>e.style.fillOpacity=clamp((p-.6)/.35)*(e.dataset.op?+e.dataset.op:1));return tip;}
function pointAt(id,p){const D=DRAW[id];let rem=clamp(p,.0005,.9995)*D.tot;
  for(let i=0;i<D.els.length;i++){const L=D.lens[i];if(rem<=L){const q=D.els[i].getPointAtLength(rem);return new DOMPoint(q.x,q.y).matrixTransform(D.els[i].getScreenCTM());}rem-=L;}}
