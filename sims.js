/* Figuras interactivas de Expresión Gráfica. Vanilla JS + canvas. */
(function(){
const C = {};
function paleta(el){const cs=getComputedStyle(el);const v=n=>cs.getPropertyValue(n).trim();
  C.bg=v('--surface')||'#fff';C.grid=v('--line')||'#d5dcd9';C.text=v('--fg')||'#16211d';C.muted=v('--muted')||'#56635e';
  C.a=v('--tc')||v('--accent')||'#b4232f';C.b=v('--warn')||'#b8730c';C.c=v('--c6')||'#2c8a52';C.d=v('--c5')||'#c43d63';C.e=v('--c4')||'#b8730c';C.f=v('--c2')||'#3a63c4';}
const F=n=>Number.isInteger(n)?String(n):(Math.abs(n)<1e-9?'0':n.toFixed(2).replace('.',','));

function build(el, spec){
  el.classList.add('sim-box');paleta(el);
  const ctrls=document.createElement('div'); ctrls.className='ctrl sim-ctrls';
  const cv=document.createElement('canvas'); cv.width=spec.w||640; cv.height=spec.h||360; cv.className='sim-cv';
  const out=document.createElement('div'); out.className='readout sim-out';
  el.append(ctrls,cv,out);
  const st={};
  (spec.sliders||[]).forEach(s=>{st[s.k]=s.v;const lab=document.createElement('label');const sp=document.createElement('span');sp.textContent=`${s.l}: ${F(s.v)} ${s.u||''}`;
    const inp=document.createElement('input');inp.type='range';inp.min=s.min;inp.max=s.max;inp.step=s.step||0.01;inp.value=s.v;
    inp.oninput=()=>{st[s.k]=parseFloat(inp.value);sp.textContent=`${s.l}: ${F(st[s.k])} ${s.u||''}`;draw();};lab.append(sp,inp);ctrls.append(lab);});
  (spec.selects||[]).forEach(s=>{st[s.k]=s.v;const lab=document.createElement('label');const sp=document.createElement('span');sp.textContent=s.l;
    const sel=document.createElement('select');s.opts.forEach(o=>{const op=document.createElement('option');op.value=o[0];op.textContent=o[1];if(o[0]===s.v)op.selected=true;sel.append(op);});
    sel.onchange=()=>{st[s.k]=sel.value;draw();};lab.append(sp,sel);ctrls.append(lab);});
  const g=cv.getContext('2d');
  const api={st,cv,g,out,W:cv.width,H:cv.height,
    clear(){paleta(el);g.fillStyle=C.bg;g.fillRect(0,0,cv.width,cv.height);},
    txt(s,x,y,col,sz,al){g.fillStyle=col||C.text;g.font=(sz||13)+'px system-ui';g.textAlign=al||'left';g.fillText(s,x,y);},
    arrow(x1,y1,x2,y2,col,wd){g.strokeStyle=g.fillStyle=col;g.lineWidth=wd||2.5;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();const a=Math.atan2(y2-y1,x2-x1),L=10;g.beginPath();g.moveTo(x2,y2);g.lineTo(x2-L*Math.cos(a-0.4),y2-L*Math.sin(a-0.4));g.lineTo(x2-L*Math.cos(a+0.4),y2-L*Math.sin(a+0.4));g.closePath();g.fill();},
    line(x1,y1,x2,y2,col,wd,dash){g.strokeStyle=col;g.lineWidth=wd||1.5;g.setLineDash(dash||[]);g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.setLineDash([]);},
    circ(x,y,r,col,fill){g.beginPath();g.arc(x,y,r,0,Math.PI*2);if(fill){g.fillStyle=col;g.fill();}else{g.strokeStyle=col;g.lineWidth=2;g.stroke();}},
    html(h){out.innerHTML=h;},
    // sistema de ejes cartesiano
    axes(cx,cy,u,xmin,xmax,ymin,ymax){for(let i=Math.ceil(xmin);i<=xmax;i++)api.line(cx+i*u,cy-ymax*u,cx+i*u,cy-ymin*u,C.grid,1);for(let j=Math.ceil(ymin);j<=ymax;j++)api.line(cx+xmin*u,cy-j*u,cx+xmax*u,cy-j*u,C.grid,1);api.line(cx+xmin*u,cy,cx+xmax*u,cy,C.muted,1.5);api.line(cx,cy-ymax*u,cx,cy-ymin*u,C.muted,1.5);}
  };
  function draw(){spec.draw(api);}
  draw(); return api;
}
const SIMS={};

/* ---- Datos ISO embebidos (tablas UNE 4-040 / ISO 286 del curso) ---- */
const GRUPOS=[[0,3],[3,6],[6,10],[10,18],[18,30],[30,50],[50,65],[65,80],[80,100],[100,120]];
const IT={ // IT4..IT13 por grupo (µm)
 4:[3,4,4,5,6,7,8,8,10,10],5:[4,5,6,8,9,11,13,13,15,15],6:[6,8,9,11,13,16,19,19,22,22],7:[10,12,15,18,21,25,30,30,35,35],
 8:[14,18,22,27,33,39,46,46,54,54],9:[25,30,36,43,52,62,74,74,87,87],10:[40,48,58,70,84,100,120,120,140,140],
 11:[60,75,90,110,130,160,190,190,220,220],12:[100,120,150,180,210,250,300,300,350,350],13:[140,180,220,270,330,390,460,460,540,540]};
// Agujeros: Di (A-H) o Ds (J-U). J,K,M,N,P dependen de la calidad; R,S,U de 5,6,7,>=8.
const AGJ={
 D:{t:'Di',v:[20,30,40,50,65,80,100,100,120,120]},E:{t:'Di',v:[14,20,25,32,40,50,60,60,72,72]},
 F:{t:'Di',v:[6,10,13,16,20,25,30,30,36,36]},G:{t:'Di',v:[2,4,5,6,7,9,10,10,12,12]},H:{t:'Di',v:[0,0,0,0,0,0,0,0,0,0]},
 J:{t:'DsQ',q:{6:[2,5,5,6,8,10,13,13,16,16],7:[4,6,8,10,12,14,18,18,22,22],8:[6,10,12,15,20,24,28,28,34,34]}},
 K:{t:'DsQ',q:{6:[0,2,2,2,2,3,4,4,4,4],7:[0,3,5,6,6,7,9,9,10,10],8:[0,5,6,8,10,12,14,14,16,16]}},
 M:{t:'DsQ',q:{6:[-2,-1,-3,-4,-4,-4,-5,-5,-6,-6],7:[-2,0,0,0,0,0,0,0,0,0],8:[-2,2,1,2,4,5,5,5,6,6]}},
 N:{t:'DsQ',q:{6:[-4,-5,-7,-9,-11,-12,-14,-14,-16,-16],7:[-4,-4,-4,-5,-7,-8,-9,-9,-10,-10],8:[-4,-2,-3,-3,-3,-3,-4,-4,-4,-4]}},
 P:{t:'DsQ',q:{6:[-6,-9,-12,-15,-18,-21,-26,-26,-30,-30],7:[-6,-8,-9,-11,-14,-17,-21,-21,-24,-24]}},
 R:{t:'DsQ',q:{5:[-10,-14,-17,-20,-25,-30,-36,-38,-46,-49],6:[-10,-12,-16,-20,-24,-29,-35,-37,-44,-47],7:[-10,-11,-13,-16,-20,-25,-30,-32,-38,-41],8:[-10,-15,-19,-23,-28,-34,-41,-43,-51,-54]}},
 S:{t:'DsQ',q:{5:[-14,-18,-21,-25,-32,-39,-48,-54,-66,-74],6:[-14,-16,-20,-25,-31,-38,-47,-53,-64,-72],7:[-14,-15,-17,-21,-27,-34,-42,-48,-58,-66],8:[-14,-19,-23,-28,-35,-43,-53,-59,-71,-79]}},
 U:{t:'DsQ',q:{5:[-18,-22,-26,-30,-41.5,-61,-82,-97,-119,-139],6:[-18,-20,-25,-30,-40.5,-60,-81,-96,-117,-137],7:[-18,-19,-22,-26,-36.5,-56,-76,-91,-111,-131],8:[-18,-23,-28,-33,-44.5,-65,-87,-102,-124,-144],9:[-18,-23,-28,-33,-44.5,-65,-87,-102,-124,-144]}}};
// Ejes: ds (a-h, negativa) o di (j-u). j: di por calidad; k: +di (cal 4-7), 0 fuera.
const EJE={
 d:{t:'ds',v:[-20,-30,-40,-50,-65,-80,-100,-100,-120,-120]},e:{t:'ds',v:[-14,-20,-25,-32,-40,-50,-60,-60,-72,-72]},
 f:{t:'ds',v:[-6,-10,-13,-16,-20,-25,-30,-30,-36,-36]},g:{t:'ds',v:[-2,-4,-5,-6,-7,-9,-10,-10,-12,-12]},h:{t:'ds',v:[0,0,0,0,0,0,0,0,0,0]},
 j:{t:'diQ',q:{5:[-2,-2,-2,-3,-4,-5,-7,-7,-9,-9],6:[-2,-2,-2,-3,-4,-5,-7,-7,-9,-9],7:[-4,-4,-5,-6,-8,-10,-12,-12,-15,-15]}},
 k:{t:'diK',v:[0,1,1,1,2,2,2,2,3,3]},
 m:{t:'di',v:[2,4,6,7,8,9,11,11,13,13]},n:{t:'di',v:[4,8,10,12,15,17,20,20,23,23]},p:{t:'di',v:[6,12,15,18,22,26,32,32,37,37]},
 r:{t:'di',v:[10,15,19,23,28,34,41,43,51,54]},s:{t:'di',v:[14,19,23,28,35,43,53,59,71,79]},u:{t:'di',v:[18,23,28,33,44.5,65,87,102,124,144]}};
const NCLASS={N1:0.025,N2:0.05,N3:0.1,N4:0.2,N5:0.4,N6:0.8,N7:1.6,N8:3.2,N9:6.3,N10:12.5,N11:25,N12:50};

function grupoIdx(d){for(let i=0;i<GRUPOS.length;i++)if(d>GRUPOS[i][0]&&d<=GRUPOS[i][1])return i;return GRUPOS.length-1;}
function mm3(u){const v=u/1000;return (v<0?'−':'')+Math.abs(v).toFixed(3).replace('.',',');}

/* 1 Polígonos regulares y estrellados */
SIMS.poligonos=el=>build(el,{w:640,h:340,
 sliders:[{k:'n',l:'número de lados n',v:5,min:3,max:12,step:1}],
 selects:[{k:'modo',l:'trazado',v:'conv',opts:[['conv','convexo'],['est','estrellados']]}],
 draw(a){a.clear();const n=a.st.n,cx=180,cy=170,R=120;
  const P=[];for(let i=0;i<n;i++){const t=-Math.PI/2+i*2*Math.PI/n;P.push([cx+R*Math.cos(t),cy+R*Math.sin(t)]);}
  a.circ(cx,cy,R,C.grid,false);
  const ords=[];for(let k=2;k<n/2;k++){let x=n,y=k;while(y){[x,y]=[y,x%y];}if(x===1)ords.push(k);}
  const dib=(k,col)=>{a.g.strokeStyle=col;a.g.lineWidth=2.5;a.g.beginPath();let i=0,first=true;const seen=new Set();
    // puede haber varias componentes si mcd!=1, aquí mcd=1 siempre
    do{const p=P[i];first?a.g.moveTo(p[0],p[1]):a.g.lineTo(p[0],p[1]);first=false;seen.add(i);i=(i+k)%n;}while(i!==0);
    a.g.closePath();a.g.stroke();};
  if(a.st.modo==='conv'){dib(1,C.a);}
  else{if(!ords.length)a.txt('sin estrellados (no hay k<n/2 primo con n)',cx-115,cy,C.muted,12);
    const cols=[C.a,C.b,C.d];ords.forEach((k,j)=>dib(k,cols[j%3]));}
  P.forEach((p,i)=>{a.circ(p[0],p[1],3,C.text,true);});
  // apotema y ángulos
  const m=[(P[0][0]+P[1][0])/2,(P[0][1]+P[1][1])/2];a.line(cx,cy,m[0],m[1],C.c,1.5,[5,4]);a.txt('ap',(cx+m[0])/2+6,(cy+m[1])/2,C.c,11);
  const ac=360/n,ai=180-ac;
  a.html(`α<sub>central</sub> = 360/${n} = <b>${F(ac)}°</b> · α<sub>interior</sub> = 180 − ${F(ac)} = <b>${F(ai)}°</b> · estrellados de orden ${ords.length?ords.join(' y '):'— (ninguno)'}<br><span class="hint">Orden del estrellado: enteros k ≥ 2 menores que n/2 y primos con n. El hexágono no tiene; el pentágono tiene el de orden 2 (pentagrama); el eneágono, 2 y 4.</span>`);}});

/* 2 Cónicas */
SIMS.conicas=el=>build(el,{w:640,h:360,
 selects:[{k:'tipo',l:'cónica',v:'eli',opts:[['eli','elipse'],['par','parábola'],['hip','hipérbola']]}],
 sliders:[{k:'a',l:'a (semieje)',v:110,min:60,max:150,step:5},{k:'b',l:'b (o p en la parábola)',v:70,min:30,max:100,step:5},{k:'t',l:'punto P sobre la curva',v:40,min:0,max:100,step:1}],
 draw(a){a.clear();const cx=320,cy=185,s=a.st;
  if(s.tipo==='eli'){const A=s.a,B=Math.min(s.b,A-5),c=Math.sqrt(A*A-B*B);
   a.g.strokeStyle=C.a;a.g.lineWidth=2.5;a.g.beginPath();a.g.ellipse(cx,cy,A,B,0,0,Math.PI*2);a.g.stroke();
   a.line(cx-A,cy,cx+A,cy,C.grid,1);a.line(cx,cy-B,cx,cy+B,C.grid,1);
   a.circ(cx-c,cy,3.5,C.b,true);a.circ(cx+c,cy,3.5,C.b,true);a.txt("F'",cx-c-16,cy+16,C.b,12);a.txt('F',cx+c+6,cy+16,C.b,12);
   a.circ(cx,cy,A,C.grid,false);a.txt('c. principal (r = a)',cx+A*0.6,cy-A*0.82,C.muted,11);
   const th=s.t/100*2*Math.PI,px=cx+A*Math.cos(th),py=cy+B*Math.sin(th);
   a.line(cx-c,cy,px,py,C.c,1.5,[4,3]);a.line(cx+c,cy,px,py,C.c,1.5,[4,3]);a.circ(px,py,4,C.a,true);a.txt('P',px+7,py-7,C.a,12);
   const d1=Math.hypot(px-(cx-c),py-cy),d2=Math.hypot(px-(cx+c),py-cy);
   a.html(`PF' + PF = ${F(d1)} + ${F(d2)} = <b>${F(d1+d2)} = 2a = ${2*A}</b> · c = √(a²−b²) = ${F(c)} · e = c/a = ${F(c/A)}<br><span class="hint">Circunferencia focal: centro F, radio 2a (los simétricos del otro foco respecto de las tangentes). Principal: centro O, radio a (pies de las perpendiculares desde los focos a las tangentes). Son las herramientas de las tangencias del examen.</span>`);}
  else if(s.tipo==='par'){const p=s.b; // directriz x = -p/2, foco (p/2,0)
   a.line(cx-p/2-60,cy-160,cx-p/2-60,cy+160,C.b,2,[6,4]);a.txt('directriz',cx-p/2-58,cy-146,C.b,11);
   const f=[cx-60+p/2,cy];a.circ(f[0],f[1],3.5,C.b,true);a.txt('F',f[0]+6,f[1]+14,C.b,12);
   a.g.strokeStyle=C.a;a.g.lineWidth=2.5;a.g.beginPath();for(let y=-160;y<=160;y+=4){const x=cx-60+y*y/(2*p);if(y===-160)a.g.moveTo(x,cy+y);else a.g.lineTo(x,cy+y);}a.g.stroke();
   const Y=(s.t-50)*3,px=cx-60+Y*Y/(2*p),py=cy+Y;a.circ(px,py,4,C.a,true);
   a.line(f[0],f[1],px,py,C.c,1.5,[4,3]);a.line(cx-p/2-60,py,px,py,C.c,1.5,[4,3]);
   const d1=Math.hypot(px-f[0],py-f[1]),d2=px-(cx-p/2-60);
   a.html(`PF = ${F(d1)} · d(P, directriz) = ${F(d2)} ⇒ <b>iguales</b>: la parábola equidista de foco y directriz (e = 1).<br><span class="hint">La tangente en P es la bisectriz del ángulo que forman PF y la perpendicular a la directriz: en eso se basan sus tangencias.</span>`);}
  else{const A=Math.min(s.a,120)*0.6,B=s.b*0.6,c=Math.sqrt(A*A+B*B);
   a.line(cx-280,cy,cx+280,cy,C.grid,1);a.line(cx,cy-170,cx,cy+170,C.grid,1);
   a.line(cx-280,cy+280*B/A,cx+280,cy-280*B/A,C.muted,1,[6,4]);a.line(cx-280,cy-280*B/A,cx+280,cy+280*B/A,C.muted,1,[6,4]);a.txt('asíntotas',cx+150,cy-150*B/A-8,C.muted,11);
   a.g.strokeStyle=C.a;a.g.lineWidth=2.5;[1,-1].forEach(sg=>{a.g.beginPath();for(let t=-1.6;t<=1.6;t+=0.05){const x=sg*A*Math.cosh(t),y=B*Math.sinh(t);if(t===-1.6)a.g.moveTo(cx+x,cy+y);else a.g.lineTo(cx+x,cy+y);}a.g.stroke();});
   a.circ(cx-c,cy,3.5,C.b,true);a.circ(cx+c,cy,3.5,C.b,true);a.txt("F'",cx-c-16,cy+16,C.b,12);a.txt('F',cx+c+6,cy+16,C.b,12);
   const t=(s.t-50)/35,px=cx+A*Math.cosh(t),py=cy+B*Math.sinh(t);a.circ(px,py,4,C.a,true);
   a.line(cx-c,cy,px,py,C.c,1.5,[4,3]);a.line(cx+c,cy,px,py,C.c,1.5,[4,3]);
   const d1=Math.hypot(px-(cx-c),py-cy),d2=Math.hypot(px-(cx+c),py-cy);
   a.html(`|PF' − PF| = |${F(d1)} − ${F(d2)}| = <b>${F(Math.abs(d1-d2))} = 2a = ${F(2*A)}</b> · c² = a² + b² · e = c/a = ${F(c/A)} &gt; 1<br><span class="hint">Las asíntotas pasan por el centro con pendiente ±b/a; la circunferencia focal (radio 2a) también resuelve aquí las tangentes.</span>`);}
 }});

/* 3 Diédrico: el punto en los cuatro diedros */
SIMS.diedrico=el=>build(el,{w:640,h:360,
 sliders:[{k:'c',l:'cota (distancia al horizontal)',v:30,min:-50,max:50,step:5},{k:'al',l:'alejamiento (distancia al vertical)',v:20,min:-50,max:50,step:5}],
 draw(a){a.clear();const c=a.st.c,al=a.st.al;
  // izquierda: espacio (perspectiva simple)
  const ox=150,oy=190;
  a.line(ox-120,oy,ox+120,oy,C.text,2);a.txt('LT',ox+112,oy-8,C.text,11);
  a.line(ox-80,oy+80,ox+40,oy-40,C.muted,1.5,[4,3]);a.txt('PH',ox+44,oy-44,C.muted,11);
  a.line(ox,oy-120,ox,oy+120,C.muted,1.5,[4,3]);a.txt('PV',ox+4,oy-110,C.muted,11);
  const px=ox+al*0.7-((al<0)?0:0), py=oy-c; // esquemático
  a.circ(ox+al*0.7,oy+al*0.5-c*0,2.5,C.grid,true);
  // derecha: representación diédrica
  const dx=470,dy=190;a.line(dx-150,dy,dx+150,dy,C.text,2);a.txt('LT',dx+140,dy-8,C.text,11);
  const Av=dy-c, Ah=dy+al;
  a.line(dx,Math.min(Av,Ah)-10,dx,Math.max(Av,Ah)+10,C.grid,1,[3,3]);
  a.circ(dx,Av,4,C.a,true);a.txt("A'' (cota "+F(c)+')',dx+8,Av-6,C.a,12);
  a.circ(dx,Ah,4,C.f,true);a.txt("A' (alej. "+F(al)+')',dx+8,Ah+14,C.f,12);
  let diedro;if(c>=0&&al>=0)diedro='1.º diedro';else if(c>=0&&al<0)diedro='2.º diedro';else if(c<0&&al<0)diedro='3.º diedro';else diedro='4.º diedro';
  if(c===0&&al===0)diedro='sobre la línea de tierra';else if(c===0)diedro='en el plano horizontal';else if(al===0)diedro='en el plano vertical';
  let extra='';if(Math.abs(c)===Math.abs(al)&&c!==0){extra=(c===al)?' · en el 1.er bisector (cota = alejamiento)':' · en el 2.º bisector (proyecciones confundidas)';}
  a.txt('convenio: cota + hacia arriba de LT (A′′), alejamiento + hacia abajo (A′)',40,340,C.muted,11);
  a.html(`El punto A está en el <b>${diedro}</b>${extra}.<br><span class="hint">La cota se lee en la proyección vertical A′′ y el alejamiento en la horizontal A′; ambas proyecciones comparten la perpendicular a la LT. 2.º diedro: las dos encima de LT; 4.º: las dos debajo; 3.º: cruzadas (A′ arriba, A′′ abajo).</span>`);}});

/* 4 Axonométrico */
SIMS.axonometrico=el=>build(el,{w:640,h:360,
 selects:[{k:'m',l:'perspectiva',v:'iso',opts:[['iso','isométrica (120°)'],['cab','caballera (90° + 135°)']]}],
 sliders:[{k:'r',l:'coef. reducción eje Y (caballera)',v:0.5,min:0.3,max:1,step:0.05}],
 draw(a){a.clear();const m=a.st.m,r=a.st.r,cx=300,cy=250,s=55;
  const k=(m==='cab')?r:1;
  const ex=(m==='iso')?[Math.cos(Math.PI/6),Math.sin(Math.PI/6)]:[1,0];
  const ey=(m==='iso')?[-Math.cos(Math.PI/6),Math.sin(Math.PI/6)]:[-Math.SQRT1_2,Math.SQRT1_2];
  const ez=[0,-1];
  const pr=(x,y,z)=>[cx+x*s*ex[0]+y*s*k*ey[0]+z*s*ez[0], cy+x*s*ex[1]+y*s*k*ey[1]+z*s*ez[1]];
  // pieza en L: base 3x2x1 + bloque 1x2x1 encima a la izquierda
  const V={}; const edges=[];
  const box=(x0,y0,z0,dx,dy,dz)=>{const c8=[[x0,y0,z0],[x0+dx,y0,z0],[x0+dx,y0+dy,z0],[x0,y0+dy,z0],[x0,y0,z0+dz],[x0+dx,y0,z0+dz],[x0+dx,y0+dy,z0+dz],[x0,y0+dy,z0+dz]];
   const E=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
   E.forEach(e=>edges.push([c8[e[0]],c8[e[1]]]));};
  box(0,0,0,3,2,1);box(0,0,1,1,2,1);
  edges.forEach(e=>{const p1=pr(...e[0]),p2=pr(...e[1]);a.line(p1[0],p1[1],p2[0],p2[1],C.a,2);});
  // ejes
  const o=pr(0,0,0);a.arrow(o[0],o[1],...pr(3.8,0,0),C.b,2);a.txt('X',...pr(4,0,0),C.b,13);
  a.arrow(o[0],o[1],...pr(0,2.9,0),C.c,2);a.txt('Y',...pr(0,3.2,0),C.c,13);
  a.arrow(o[0],o[1],...pr(0,0,2.6),C.f,2);a.txt('Z',...pr(0,0,2.8),C.f,13);
  a.html(m==='iso'
   ?`Ejes a <b>120°</b>; coeficiente teórico 0,816 en los tres ejes (aquí se dibuja a 1, como en el examen): el dibujo es semejante, ampliado ×1,22.<br><span class="hint">Círculos de las caras → elipses (óvalo de 4 centros en el rombo). Rayado de cortes a 60°. Cambiar la dirección de los ejes cambia el punto de vista.</span>`
   :`Cara frontal XZ en <b>verdadera magnitud</b> (90°); eje Y a 135° con coeficiente r = ${F(r)}.<br><span class="hint">Con r = 1 la pieza parece demasiado profunda: por eso se usa r ≈ 0,5. Los círculos frontales siguen siendo círculos; los demás, elipses.</span>`);}});

/* 5 Formatos y escalas */
SIMS.formatos=el=>build(el,{w:640,h:360,
 selects:[{k:'f',l:'formato',v:'A3',opts:[['A0','A0'],['A1','A1'],['A2','A2'],['A3','A3'],['A4','A4']]},
  {k:'e',l:'escala',v:'1:5',opts:[['10:1','10:1'],['5:1','5:1'],['2:1','2:1'],['1:1','1:1'],['1:2','1:2'],['1:2.5','1:2,5'],['1:5','1:5'],['1:10','1:10'],['1:20','1:20'],['1:50','1:50']]}],
 sliders:[{k:'L',l:'medida real de la pieza',v:600,min:10,max:2000,step:10}],
 draw(a){a.clear();const dims={A0:[841,1189],A1:[594,841],A2:[420,594],A3:[297,420],A4:[210,297]};
  // dibujo del A0 con subdivisiones
  const k=0.24,x0=40,y0=40;
  a.g.strokeStyle=C.grid;a.g.lineWidth=1.5;a.g.strokeRect(x0,y0,1189*k,841*k);
  a.line(x0+594*k,y0,x0+594*k,y0+841*k,C.grid,1.5);
  a.line(x0+594*k,y0+420*k,x0+1189*k,y0+420*k,C.grid,1.5);
  a.line(x0+891*k,y0+420*k,x0+891*k,y0+841*k,C.grid,1.5);
  a.line(x0+891*k,y0+630*k,x0+1189*k,y0+630*k,C.grid,1.5);
  const zones={A0:[x0,y0,1189*k,841*k],A1:[x0,y0,594*k,841*k],A2:[x0+594*k,y0,595*k,420*k],A3:[x0+594*k,y0+420*k,297*k,421*k],A4:[x0+891*k,y0+420*k,298*k,210*k]};
  const z=zones[a.st.f];a.g.fillStyle=C.a;a.g.globalAlpha=0.18;a.g.fillRect(...z);a.g.globalAlpha=1;a.g.strokeStyle=C.a;a.g.lineWidth=2;a.g.strokeRect(...z);
  a.txt('A1',x0+594*k/2-8,y0+841*k/2,C.muted,13);a.txt('A2',x0+594*k+290*k,y0+210*k,C.muted,13);a.txt('A3',x0+594*k+140*k,y0+630*k,C.muted,13);a.txt('A4',x0+891*k+140*k,y0+530*k,C.muted,12);a.txt('A0 = 841×1189 (1 m²)',x0+6,y0+841*k+16,C.muted,11);
  const d=dims[a.st.f];const [num,den]=a.st.e.split(':').map(Number);const dib=a.st.L*num/den;
  const marg=(a.st.f==='A0'||a.st.f==='A1')?20:10;
  const cabe=dib<=Math.max(d[0],d[1])-2*marg-20;
  a.html(`<b>${a.st.f}</b> = ${d[0]}×${d[1]} mm (margen ${marg} mm) · pieza de ${a.st.L} mm a escala ${a.st.e.replace('.',',')} → <b>${F(dib)} mm en el papel</b>: ${cabe?'cabe ✓':'NO cabe ✗ (elige más reducción o formato mayor)'}<br><span class="hint">Serie A: cada formato es la mitad del anterior por el lado mayor (regla de doblado) y todos son semejantes (y = x·√2). La cota lleva SIEMPRE la medida real, no la del dibujo.</span>`);}});

/* 6 Vistas y cortes de una pieza */
SIMS.vistas=el=>build(el,{w:640,h:400,
 sliders:[{k:'w1',l:'anchura del rebaje',v:1.2,min:0.5,max:2.4,step:0.1},{k:'h1',l:'altura del rebaje',v:0.8,min:0.3,max:1.6,step:0.1},{k:'ta',l:'taladro Ø',v:0.6,min:0,max:1,step:0.1}],
 draw(a){a.clear();const W=3,H=2,D=1.6,w1=a.st.w1,h1=a.st.h1,td=a.st.ta;
  const s=42;
  // isométrica (arriba izquierda)
  const ex=[Math.cos(Math.PI/6),Math.sin(Math.PI/6)],ey=[-Math.cos(Math.PI/6),Math.sin(Math.PI/6)],ez=[0,-1];
  const cx=150,cy=150;const pr=(x,y,z)=>[cx+x*s*ex[0]+y*s*ey[0]+z*s*ez[0],cy+x*s*ex[1]+y*s*ey[1]+z*s*ez[1]];
  const L=(p,q,col,wd)=>{const p1=pr(...p),p2=pr(...q);a.line(p1[0],p1[1],p2[0],p2[1],col||C.a,wd||2);};
  // contorno de la pieza en L (rebaje arriba-derecha de anchura w1, altura h1, toda la profundidad)
  const xr=W-w1,zr=H-h1;
  const topPts=[[0,0,H],[xr,0,H],[xr,0,zr],[W,0,zr],[W,0,0],[0,0,0]];
  // cara frontal y=0 y trasera y=D
  for(let i=0;i<topPts.length;i++){const p=topPts[i],q=topPts[(i+1)%topPts.length];L(p,q);L([p[0],D,p[2]],[q[0],D,q[2]]);}
  topPts.forEach(p=>L(p,[p[0],D,p[2]]));
  a.txt('isométrica',70,52,C.muted,11);
  // vistas: alzado (dcha arriba), planta debajo, perfil a la derecha del alzado
  const ax=390,ay=60,u=34;
  const rect=(x,y,w,h,col,wd)=>{a.g.strokeStyle=col||C.text;a.g.lineWidth=wd||2;a.g.strokeRect(x,y,w,h);};
  // ALZADO (W x H con escalón)
  a.g.strokeStyle=C.text;a.g.lineWidth=2;a.g.beginPath();
  a.g.moveTo(ax,ay+H*u);a.g.lineTo(ax,ay);a.g.lineTo(ax+xr*u,ay);a.g.lineTo(ax+xr*u,ay+h1*u);a.g.lineTo(ax+W*u,ay+h1*u);a.g.lineTo(ax+W*u,ay+H*u);a.g.closePath();a.g.stroke();
  if(td>0){const r=td*u/2;a.line(ax+W/2*u,ay+h1*u+6,ax+W/2*u,ay+H*u-4,C.muted,1,[6,3]);
   a.line(ax+W/2*u-r,ay+h1*u+8,ax+W/2*u-r,ay+H*u,C.text,1.3,[4,3]);a.line(ax+W/2*u+r,ay+h1*u+8,ax+W/2*u+r,ay+H*u,C.text,1.3,[4,3]);}
  a.txt('ALZADO',ax+30,ay-8,C.muted,11);
  // PLANTA debajo (W x D), arista del escalón
  const py0=ay+H*u+26;rect(ax,py0,W*u,D*u);a.line(ax+xr*u,py0,ax+xr*u,py0+D*u,C.text,2);
  if(td>0){a.circ(ax+W/2*u,py0+D/2*u,td*u/2,C.text,false);a.line(ax+W/2*u,py0+4,ax+W/2*u,py0+D*u-4,C.muted,1,[6,3]);a.line(ax+(W/2-td/2-0.2)*u,py0+D/2*u,ax+(W/2+td/2+0.2)*u,py0+D/2*u,C.muted,1,[6,3]);}
  a.txt('PLANTA (debajo: 1.er diedro)',ax+10,py0+D*u+16,C.muted,11);
  // PERFIL a la derecha (D x H), arista del escalón
  const qx0=ax+W*u+26;rect(qx0,ay,D*u,H*u);a.line(qx0,ay+h1*u,qx0+D*u,ay+h1*u,C.text,2);
  if(td>0){const r=td*u/2;a.line(qx0+2,ay+h1*u+8,qx0+D*u-2,ay+h1*u+8,C.grid,0);
   a.line(qx0+D/2*u-r,ay+h1*u+8,qx0+D/2*u-r,ay+H*u,C.text,1.3,[4,3]);a.line(qx0+D/2*u+r,ay+h1*u+8,qx0+D/2*u+r,ay+H*u,C.text,1.3,[4,3]);a.line(qx0+D/2*u,ay+h1*u+6,qx0+D/2*u,ay+H*u-4,C.muted,1,[6,3]);}
  a.txt('PERFIL IZQ. (a la derecha)',qx0-24,py0+16,C.muted,11);
  a.html(`Método del 1.er diedro: planta <b>debajo</b> del alzado y perfil izquierdo <b>a la derecha</b>. El taladro aparece como circunferencia en la planta y como líneas de trazos (oculto) en alzado y perfil: un corte lo pasaría a línea continua con rayado.<br><span class="hint">Mueve el rebaje y el taladro y comprueba la correspondencia: anchuras alineadas alzado-planta, alturas alzado-perfil. Con economía de vistas, ¿sobraría alguna?</span>`);}});

/* 7 Acotación */
SIMS.acotacion=el=>build(el,{w:640,h:330,
 selects:[{k:'m',l:'disposición',v:'serie',opts:[['serie','en serie'],['par','en paralelo'],['comb','combinada (serie + total)']]}],
 sliders:[{k:'l1',l:'L1',v:30,min:10,max:60,step:5},{k:'l2',l:'L2',v:45,min:10,max:60,step:5},{k:'l3',l:'L3',v:25,min:10,max:60,step:5}],
 draw(a){a.clear();const l1=a.st.l1,l2=a.st.l2,l3=a.st.l3,tot=l1+l2+l3;
  const x0=70,y0=90,k=2.6;const d1=36,d2=56,d3=28; // diámetros de los tramos
  const seg=[[0,l1,d1],[l1,l1+l2,d2],[l1+l2,tot,d3]];
  seg.forEach(sg=>{const[xa,xb,d]=sg;a.g.strokeStyle=C.text;a.g.lineWidth=2;a.g.strokeRect(x0+xa*k,y0-d/2,(xb-xa)*k,d);});
  a.line(x0-10,y0,x0+tot*k+10,y0,C.muted,1,[8,3,2,3]);
  const cota=(xa,xb,y,txt)=>{a.line(x0+xa*k,y0+34,x0+xa*k,y+4,C.muted,1);a.line(x0+xb*k,y0+34,x0+xb*k,y+4,C.muted,1);
   a.arrow(x0+xa*k,y,x0+xa*k+8,y,C.a,1.5);a.arrow(x0+xb*k,y,x0+xb*k-8,y,C.a,1.5);a.line(x0+xa*k,y,x0+xb*k,y,C.a,1.5);
   a.txt(txt,x0+(xa+xb)/2*k,y-4,C.text,12,'center');};
  if(a.st.m==='serie'){cota(0,l1,y0+58,F(l1));cota(l1,l1+l2,y0+58,F(l2));cota(l1+l2,tot,y0+58,F(l3));}
  else if(a.st.m==='par'){cota(0,l1,y0+58,F(l1));cota(0,l1+l2,y0+80,F(l1+l2));cota(0,tot,y0+102,F(tot));}
  else{cota(0,l1,y0+58,F(l1));cota(l1,l1+l2,y0+58,F(l2));cota(0,tot,y0+84,F(tot));}
  a.txt('Ø'+d2,x0+(l1+l2/2)*k,y0-d2/2-8,C.text,12,'center');a.txt('Ø'+d1,x0+l1/2*k,y0-d1/2-8,C.text,12,'center');a.txt('Ø'+d3,x0+(l1+l2+l3/2)*k,y0-d3/2-8,C.text,12,'center');
  const msg={serie:'En serie: cotas encadenadas; el error de fabricación se ACUMULA tramo a tramo. No añadas la total: estaría repetida.',
   par:'En paralelo: todas desde la misma referencia (base de mecanizado); los errores no se acumulan. Útil cuando una cara es referencia funcional.',
   comb:'Combinada: parciales en serie + cota total. ¡Cuidado! con la total dada, una parcial debe omitirse (o quedaría sobredeterminada); aquí se omite L3 = total − L1 − L2.'};
  a.html(`${msg[a.st.m]}<br><span class="hint">Reglas: cifra legible desde abajo/derecha, Ø delante cuando la vista no muestra el círculo, primera línea de cota a ≈8 mm del contorno y 5 mm entre sí, nunca sobre líneas ocultas ni repetidas.</span>`);}});

/* 8 Roscas: designación */
SIMS.roscas=el=>build(el,{w:640,h:300,
 selects:[{k:'p',l:'perfil',v:'M',opts:[['M','métrica (M)'],['Mf','métrica fina (M×paso)'],['W','Whitworth (pulgadas)'],['Wf','Whitworth fina (W mm×paso″)'],['R','gas (R, pulgadas)'],['Tr','trapecial (Tr)'],['Rd','redonda (Rd ×paso″)'],['S','diente de sierra (S)']]},
  {k:'sent',l:'sentido',v:'RH',opts:[['RH','a derechas (no se indica)'],['LH','a izquierdas (LH)']]}],
 sliders:[{k:'d',l:'diámetro nominal',v:60,min:6,max:100,step:2},{k:'paso',l:'paso (mm o sextos de pulgada)',v:10,min:1,max:12,step:1},{k:'ent',l:'entradas',v:1,min:1,max:3,step:1}],
 draw(a){a.clear();const s=a.st;const d=s.d;
  // croquis del tornillo
  const x0=60,y0=150,len=300,r=40;
  a.g.strokeStyle=C.text;a.g.lineWidth=2.5;a.g.strokeRect(x0-40,y0-r-14,40,2*(r+14)); // cabeza
  a.g.strokeRect(x0,y0-r,len,2*r);
  a.line(x0,y0-r+9,x0+len,y0-r+9,C.muted,1.2);a.line(x0,y0+r-9,x0+len,y0+r-9,C.muted,1.2); // fondo de rosca (fina)
  a.line(x0+len*0.72,y0-r,x0+len*0.72,y0+r,C.text,2.5); // límite rosca útil
  a.line(x0-50,y0,x0+len+20,y0,C.muted,1,[8,3,2,3]);
  // cota del diámetro
  a.line(x0+len+6,y0-r,x0+len+26,y0-r,C.muted,1);a.line(x0+len+6,y0+r,x0+len+26,y0+r,C.muted,1);
  a.arrow(x0+len+18,y0-r,x0+len+18,y0-r+8,C.a,1.5);a.arrow(x0+len+18,y0+r,x0+len+18,y0+r-8,C.a,1.5);a.line(x0+len+18,y0-r,x0+len+18,y0+r,C.a,1.5);
  let des,expl;const pulg=['1/6″','1/3″','1/2″','2/3″','5/6″','1″','7/6″','4/3″','3/2″','5/3″','11/6″','2″'];
  const pp=pulg[Math.min(s.paso-1,11)];
  switch(s.p){
   case 'M':des='M'+d;expl='rosca métrica ISO (perfil triangular 60°), Ø exterior '+d+' mm, paso normal de la serie';break;
   case 'Mf':des='M'+d+'×'+s.paso;expl='métrica fina: Ø '+d+' mm y paso '+s.paso+' mm';break;
   case 'W':des=Math.round(d/25.4*2)/2+'″';expl='Whitworth (perfil 55°): el diámetro exterior se da en pulgadas';break;
   case 'Wf':des='W'+d+'×'+pp;expl='Whitworth fina: Ø exterior en mm ('+d+') y paso en PULGADAS ('+pp+') — la trampa clásica del examen';break;
   case 'R':des='R'+Math.max(1,Math.round(d/25.4))+'″';expl='rosca gas para tubos: diámetro del tubo en pulgadas';break;
   case 'Tr':des='Tr'+d+'×'+s.paso;expl='trapecial (husillos de máquinas): Ø '+d+' mm, paso '+s.paso+' mm';break;
   case 'Rd':des='Rd'+d+'×'+pp;expl='redonda (perfil de media caña): Ø en mm, paso en pulgadas';break;
   case 'S':des='S'+d+'×'+s.paso;expl='diente de sierra (grandes esfuerzos en un sentido): Ø '+d+' mm, paso '+s.paso+' mm';break;}
  if(s.sent==='LH')des+=' LH';
  if(s.ent>1)des+=' · '+s.ent+' entradas';
  a.txt(des,x0+len/2,y0-r-26,C.a,17,'center');
  a.txt('límite de rosca útil',x0+len*0.72-6,y0+r+18,C.muted,11,'center');
  a.html(`<b>${des}</b>: ${expl}${s.sent==='LH'?'; LH = hélice a izquierdas':''}${s.ent>1?'; '+s.ent+' entradas (avance = '+s.ent+'·paso)':''}.<br><span class="hint">Se acota SIEMPRE sobre el diámetro nominal (exterior): en el tornillo sobre la prolongación de las aristas, en la tuerca sobre la línea fina. Cresta = línea gruesa; fondo = fina; el rayado de un corte llega hasta la gruesa. La rosca exterior prevalece sobre la interior.</span>`);}});

/* 9 Acabado superficial */
SIMS.acabado=el=>build(el,{w:640,h:320,
 selects:[{k:'tipo',l:'símbolo',v:'viruta',opts:[['basico','básico (cualquier proceso)'],['viruta','con arranque de viruta'],['sin','sin arranque de viruta']]},
  {k:'n',l:'clase de rugosidad',v:'N7',opts:Object.keys(NCLASS).map(k=>[k,k+' ('+String(NCLASS[k]).replace('.',',')+' µm)'])},
  {k:'proc',l:'proceso (posición b)',v:'',opts:[['','—'],['Torneado','torneado'],['Fresado','fresado'],['Rectificado','rectificado'],['Cromado','cromado']]},
  {k:'hue',l:'dirección de huellas (d)',v:'',opts:[['','—'],['=','= paralelas'],['⊥','⊥ perpendiculares'],['X','X cruzadas'],['M','M multidireccionales'],['C','C circulares'],['R','R radiales']]}],
 sliders:[{k:'sob',l:'sobremedida e (mm)',v:0,min:0,max:6,step:1}],
 draw(a){a.clear();const cx=300,cy=190,s=a.st;
  // superficie
  a.line(140,cy+40,480,cy+40,C.text,2.5);
  // símbolo
  a.g.strokeStyle=C.a;a.g.lineWidth=2.5;a.g.beginPath();
  a.g.moveTo(cx-30,cy+40);a.g.lineTo(cx-12,cy+40);a.g.lineTo(cx+4,cy-8);a.g.stroke();
  a.g.beginPath();a.g.moveTo(cx-12,cy+40);a.g.lineTo(cx-26,cy-8);a.g.stroke();
  if(s.tipo==='sin'){a.circ(cx-13,cy+22,9,C.a,false);}
  if(s.tipo==='viruta'){a.line(cx-26,cy-8,cx+4,cy-8,C.a,2.5);}
  if(s.proc||s.sob>0||s.hue){a.line(cx+4,cy-8,cx+92,cy-8,C.a,2);}
  a.txt(s.n,cx-30,cy-16,C.text,15); // a
  if(s.proc)a.txt(s.proc,cx+10,cy-14,C.text,13); // b
  if(s.hue)a.txt(s.hue,cx+6,cy+34,C.text,15); // d
  if(s.sob>0)a.txt(String(s.sob),cx-52,cy+20,C.text,15); // e
  a.txt('a',cx-44,cy-30,C.muted,11);a.txt('b',cx+48,cy-30,C.muted,11);a.txt('d',cx+16,cy+52,C.muted,11);if(s.sob>0)a.txt('e',cx-66,cy+6,C.muted,11);
  const ra=NCLASS[s.n];
  const tt={basico:'símbolo básico: el proceso queda libre',viruta:'trazo horizontal: mecanizado CON arranque de viruta obligatorio',sin:'círculo: SIN arranque de viruta (fundida, laminada, forjada…)'};
  a.html(`<b>${s.n} = Ra ${String(ra).replace('.',',')} µm</b> · ${tt[s.tipo]}${s.proc?' · proceso: '+s.proc:''}${s.hue?' · huellas '+s.hue:''}${s.sob>0?' · sobremedida '+s.sob+' mm':''}.<br><span class="hint">Posiciones: a = Ra o clase N (encima); b = proceso/tratamiento (rabo); c = longitud básica; d = dirección de huellas; e = sobremedida (izquierda); f = otras rugosidades entre paréntesis. La escalera N: 50-25-12,5-6,3-3,2-1,6-0,8-0,4-0,2-0,1 µm (N12→N3). Mayoría + excepciones: símbolo general seguido de paréntesis.</span>`);}});

/* 10 Ajustes ISO: calculadora con las tablas */
SIMS.ajustes=el=>build(el,{w:640,h:400,
 sliders:[{k:'dn',l:'diámetro nominal (mm)',v:70,min:1,max:120,step:1}],
 selects:[{k:'A',l:'agujero: posición',v:'U',opts:Object.keys(AGJ).map(k=>[k,k])},
  {k:'Ac',l:'agujero: calidad IT',v:'9',opts:[['5','5'],['6','6'],['7','7'],['8','8'],['9','9'],['10','10'],['11','11'],['12','12'],['13','13']]},
  {k:'e',l:'eje: posición',v:'f',opts:Object.keys(EJE).map(k=>[k,k])},
  {k:'ec',l:'eje: calidad IT',v:'7',opts:[['4','4'],['5','5'],['6','6'],['7','7'],['8','8'],['9','9'],['10','10'],['11','11'],['12','12'],['13','13']]}],
 draw(a){a.clear();const dn=a.st.dn,gi=grupoIdx(dn);
  const qa=parseInt(a.st.Ac),qe=parseInt(a.st.ec);
  const Ta=IT[qa][gi],te=IT[qe][gi];
  // agujero
  const ag=AGJ[a.st.A];let Di,Ds,warnA='';
  if(ag.t==='Di'){Di=ag.v[gi];Ds=Di+Ta;}
  else{const tab=ag.q[Math.min(Math.max(qa,Math.min(...Object.keys(ag.q).map(Number))),Math.max(...Object.keys(ag.q).map(Number)))];
   if(!ag.q[qa])warnA=' (desviación tabulada para IT'+Object.keys(ag.q).join('/')+'; se usa la más próxima)';
   Ds=tab[gi];Di=Ds-Ta;}
  // eje
  const ej=EJE[a.st.e];let di,ds,warnE='';
  if(ej.t==='ds'){ds=ej.v[gi];di=ds-te;}
  else if(ej.t==='di'){di=ej.v[gi];ds=di+te;}
  else if(ej.t==='diK'){di=(qe>=4&&qe<=7)?ej.v[gi]:0;ds=di+te;}
  else{const ks=Object.keys(ej.q).map(Number);const qq=ej.q[qe]?qe:ks.reduce((p,c)=>Math.abs(c-qe)<Math.abs(p-qe)?c:p);
   if(!ej.q[qe])warnE=' (j tabulada para IT'+ks.join('/')+')';
   di=ej.q[qq][gi];ds=di+te;}
  const DM=dn*1000+Ds,Dm=dn*1000+Di,dM=dn*1000+ds,dm=dn*1000+di;
  // dibujo de zonas respecto a la línea cero
  const y0=210,x0=120,esc=Math.max(0.35,Math.min(2.2,120/Math.max(Math.abs(Ds),Math.abs(Di),Math.abs(ds),Math.abs(di),30)));
  a.line(60,y0,580,y0,C.text,2);a.txt('línea cero (DN = dN = '+dn+')',430,y0-8,C.muted,11);
  const zona=(x,lo,hi,col,lab)=>{const yT=y0-hi*esc,yB=y0-lo*esc;a.g.fillStyle=col;a.g.globalAlpha=0.3;a.g.fillRect(x,Math.min(yT,yB),90,Math.abs(yB-yT)||2);a.g.globalAlpha=1;a.g.strokeStyle=col;a.g.lineWidth=2;a.g.strokeRect(x,Math.min(yT,yB),90,Math.abs(yB-yT)||2);a.txt(lab,x+45,Math.min(yT,yB)-6,col,12,'center');};
  zona(170,Di,Ds,C.f,dn+a.st.A+qa);zona(330,di,ds,C.a,dn+a.st.e+qe);
  // clasificación
  const Jm=Dm-dM,JM=DM-dm;let tipo,mag;
  if(Jm>=0){tipo='JUEGO';mag=`J<sub>M</sub> = DM − dm = ${mm3(JM)} · J<sub>m</sub> = Dm − dM = ${mm3(Jm)} · T<sub>J</sub> = ${mm3(JM-Jm)}`;}
  else if(JM<=0){tipo='APRIETO';mag=`A<sub>M</sub> = dM − Dm = ${mm3(-Jm)} · A<sub>m</sub> = dm − DM = ${mm3(-JM)} · T<sub>A</sub> = ${mm3(Ta+te)}`;}
  else{tipo='INDETERMINADO';mag=`J<sub>M</sub> = ${mm3(JM)} · A<sub>M</sub> = ${mm3(-Jm)} · T<sub>I</sub> = J<sub>M</sub> + A<sub>M</sub> = ${mm3(Ta+te)}`;}
  a.txt('Ajuste '+dn+a.st.A+qa+'/'+a.st.e+qe+' → '+tipo,320,50,C.a,16,'center');
  a.html(`<b>Agujero ${dn}${a.st.A}${qa}</b>${warnA}: T = IT${qa}(${GRUPOS[gi][0]}-${GRUPOS[gi][1]}) = ${Ta} µm; Di = ${Di} µm, Ds = ${Ds} µm → DM = ${mm3(DM)}, Dm = ${mm3(Dm)} mm.<br>
<b>Eje ${dn}${a.st.e}${qe}</b>${warnE}: t = IT${qe} = ${te} µm; di = ${di} µm, ds = ${ds} µm → dM = ${mm3(dM)}, dm = ${mm3(dm)} mm.<br>
<b>${tipo}</b>: ${mag} mm.<br><span class="hint">Mismo procedimiento del examen: letra → desviación fundamental (tabla), calidad → IT, la otra desviación con T = Ds − Di. Prueba 70U9/f7 (aprieto, feb. 2005), 10G7/h7 y 10F9/h7 (juego), 46E11/f10, 24H7/h6 (deslizante) y 32J7/j6 (indeterminado).</span>`);}});

/* 11 Tolerancias geométricas: significado de cada símbolo */
SIMS.tolgeom=el=>build(el,{w:640,h:330,
 selects:[{k:'s',l:'tolerancia',v:'cil',opts:[['rect','rectitud'],['plan','planicidad'],['red','redondez'],['cil','cilindridad'],['lin','forma de una línea'],['sup','forma de una superficie'],['par','paralelismo'],['perp','perpendicularidad'],['incl','inclinación'],['pos','posición'],['coax','coaxialidad'],['sim','simetría'],['osc','oscilación circular']]}],
 sliders:[{k:'t',l:'valor t (mm ×100)',v:8,min:2,max:30,step:1}],
 draw(a){a.clear();const t=a.st.t/100;const DATA={
  rect:{cl:'forma',sym:'—',ref:false,zona:'dos rectas paralelas separadas t (o un cilindro Øt si el valor lleva Ø)',red:'Cualquier línea de la superficie señalada debe estar comprendida entre dos rectas paralelas equidistantes '+F(t)+' mm.'},
  plan:{cl:'forma',sym:'⏥',ref:false,zona:'dos planos paralelos separados t',red:'La superficie debe estar contenida entre dos planos paralelos separados '+F(t)+' mm.'},
  red:{cl:'forma',sym:'○',ref:false,zona:'dos círculos concéntricos separados t (cada sección)',red:'La circunferencia de cualquier sección ortogonal debe quedar entre dos círculos concéntricos coplanarios separados '+F(t)+' mm.'},
  cil:{cl:'forma',sym:'⌭',ref:false,zona:'dos cilindros coaxiales cuyos radios difieren t',red:'La superficie controlada debe estar comprendida entre dos cilindros coaxiales cuyos radios difieren '+F(t)+' mm.'},
  lin:{cl:'forma',sym:'⌒',ref:false,zona:'envolventes de círculos de Øt centrados en el perfil teórico',red:'En cada sección, el perfil controlado debe mantenerse dentro de la zona limitada por las envolventes de círculos de Ø'+F(t)+' mm con centros en el perfil geométricamente perfecto.'},
  sup:{cl:'forma',sym:'⌓',ref:false,zona:'envolventes de esferas de Øt centradas en la superficie teórica',red:'La superficie debe quedar entre las dos envolventes de esferas de Ø'+F(t)+' mm cuyos centros están sobre la superficie teóricamente exacta.'},
  par:{cl:'orientación',sym:'∥',ref:true,zona:'dos planos paralelos a la referencia separados t (o cilindro Øt paralelo)',red:'La superficie (o el eje) debe estar entre dos planos separados '+F(t)+' mm y paralelos a la referencia A.'},
  perp:{cl:'orientación',sym:'⊥',ref:true,zona:'dos planos perpendiculares a la referencia separados t',red:'El plano controlado debe estar contenido entre dos planos paralelos separados '+F(t)+' mm y perpendiculares a la referencia A.'},
  incl:{cl:'orientación',sym:'∠',ref:true,zona:'dos planos separados t con el ángulo teórico respecto a la referencia',red:'La superficie inclinada debe quedar entre dos planos paralelos separados '+F(t)+' mm que forman el ángulo especificado con la referencia A.'},
  pos:{cl:'situación',sym:'⌖',ref:true,zona:'cilindro de Øt centrado en la posición teórica',red:'El eje del taladro debe estar situado dentro de un cilindro de Ø'+F(t)+' mm centrado en la posición teóricamente exacta respecto a la referencia.'},
  coax:{cl:'situación',sym:'◎',ref:true,zona:'cilindro de Øt con eje la referencia',red:'El eje del elemento es coaxial con la referencia cuando está dentro de un cilindro de Ø'+F(t)+' mm cuyo eje es la referencia A(-B).'},
  sim:{cl:'situación',sym:'⌯',ref:true,zona:'dos planos simétricos respecto a la referencia separados t',red:'El plano medio del elemento debe quedar entre dos planos separados '+F(t)+' mm, simétricos respecto al plano de referencia.'},
  osc:{cl:'oscilación',sym:'↗',ref:true,zona:'variación máxima t al girar 360° sobre el eje de referencia',red:'En cualquier sección, al girar la pieza una vuelta completa sobre el eje de referencia, la oscilación no debe superar '+F(t)+' mm.'}};
  const d=DATA[a.st.s];
  // rectángulo de tolerancia
  const bx=180,by=70;a.g.strokeStyle=C.text;a.g.lineWidth=2;a.g.strokeRect(bx,by,56,34);a.g.strokeRect(bx+56,by,110,34);if(d.ref)a.g.strokeRect(bx+166,by,44,34);
  a.txt(d.sym,bx+28,by+24,C.a,20,'center');const vv=(a.st.s==='pos'||a.st.s==='coax'||a.st.s==='lin'||a.st.s==='sup')?'Ø'+F(t):F(t);
  a.txt(vv,bx+111,by+22,C.text,15,'center');if(d.ref)a.txt('A',bx+188,by+22,C.text,15,'center');
  a.arrow(bx+100,by+34,bx+40,by+110,C.a,2);
  // pieza esquemática
  a.g.strokeStyle=C.text;a.g.lineWidth=2;a.g.strokeRect(100,180,300,70);a.line(60,215,440,215,C.muted,1,[8,3,2,3]);
  if(d.ref){a.g.beginPath();a.g.moveTo(420,250);a.g.lineTo(412,266);a.g.lineTo(428,266);a.g.closePath();a.g.fillStyle=C.text;a.g.fill();a.txt('A',416,282,C.text,13);}
  a.txt('clase: '+d.cl+(d.ref?' (necesita referencia)':' (sin referencia)'),460,200,C.b,12,'center');
  a.html(`<b>${d.zona.charAt(0).toUpperCase()+d.zona.slice(1)}</b>.<br>Redacción de examen: «${d.red}»<br><span class="hint">Si el valor lleva Ø, la zona es cilíndrica. Flecha sobre la prolongación de la línea de cota → afecta al EJE; sobre el contorno → a la SUPERFICIE. Forma no lleva referencia; orientación, situación y oscilación sí.</span>`);}});

/* 12 Conjuntos: test de normas de representación */
SIMS.conjunto=el=>{
 el.classList.add('sim-box');
 const B=[
 ["En el corte de un conjunto, ¿qué elementos NO se rayan?",["Ejes, tornillos, chavetas, pasadores y nervios","Solo las piezas de fundición","Las piezas mayores de 100 mm","Ninguno: se raya todo lo atravesado"],0,"Los elementos macizos cortados longitudinalmente no se rayan (tampoco bolas ni brazos de ruedas)."],
 ["Dos piezas contiguas en un corte se rayan…",["con inclinaciones opuestas o distinta separación","exactamente igual, para unificar","una rayada y la otra en negro","solo si son del mismo material"],0,"Cada pieza conserva SU rayado en todas sus zonas; las contiguas se distinguen por inclinación o separación."],
 ["¿Qué recoge la lista de elementos?",["Marca, cantidad, designación, norma y material/medidas","Solo los precios","El orden de montaje","Las tolerancias geométricas"],0,"Va sobre el cajetín (o aparte), ordenada por marcas."],
 ["DIN 933 M12×20 – 8.8 es…",["un tornillo hexagonal M12, largo 20, calidad 8.8","una tuerca de 12 mm","un rodamiento rígido de bolas","una chaveta de 12×20"],0,"DIN 933 tornillo hexagonal; DIN 934 es la tuerca."],
 ["UNE 17012 20×10×80 designa…",["una chaveta plana de 20×10, longitud 80","un retén","una arandela biselada","un muelle de platillo"],0,"Chavetas UNE 17012; retenes UNE 26077; arandelas UNE 17066; muelles de platillo DIN 2093."],
 ["DIN 625 (6309) y DIN 628 (7311B) son…",["rodamientos: rígido de bolas y de contacto angular","engrasadores","casquillos de bronce","tornillos de engrase"],0,"Aparecen así en las listas de los exámenes (bomba de pistones, transmisión)."],
 ["En el plano de despiece de una marca se dibuja…",["solo esa pieza, con todas sus cotas y datos de fabricación","la pieza con sus vecinas","todo el conjunto en explosión","solo las vistas sin acotar"],0,"El despiece define la pieza aislada: vistas mínimas, cortes, acotación completa, acabados y tolerancias."],
 ["Los elementos comerciales (tornillería, rodamientos)…",["no se despiezan: se citan por su designación normalizada","se despiezan siempre","se dibujan solo en perspectiva","se sustituyen por un rectángulo"],0,"Basta su norma y designación en la lista de elementos."],
 ["Un semicorte se usa en piezas…",["simétricas: mitad exterior, mitad interior","muy largas","sin taladros","de chapa"],0,"Las cotas interiores se llevan al lado cortado."],
 ["La marcha del corte se indica con…",["trazo y punto (grueso en extremos), flechas y letras A-A","línea continua fina","una nota en el cajetín","rayado a 45°"],0,"Las flechas dan el sentido de observación; la vista cortada se rotula A-A."],
 ["FG-30 y F-1250 son…",["fundición gris y acero","aluminio y bronce","plástico y latón","designaciones de rosca"],0,"Materiales típicos de las listas: FG = fundición gris; F-11xx/F-12xx aceros."],
 ["En el conjunto, la rueda dentada se anota F-1520 M=5,5 Z=32: M y Z son…",["módulo y número de dientes","masa y zona","marca y zona de tolerancia","par y velocidad"],0,"Datos de engrane imprescindibles para fabricarla."]];
 let i=0,ok=0,mal=0;
 const q=document.createElement('div');q.style.cssText='font:15px/1.5 system-ui;margin:4px 0 10px';
 const hint=document.createElement('p');hint.className='hint';hint.style.margin='0 0 8px';
 const opts=document.createElement('div');opts.className='qopts';
 const fb=document.createElement('div');fb.className='readout sim-out';
 el.append(hint,q,opts,fb);
 function render(){const item=B[i%B.length];hint.textContent=`Pregunta ${i+1} · aciertos ${ok} · fallos ${mal}`;
  q.innerHTML='<b>'+item[0]+'</b>';opts.innerHTML='';fb.innerHTML='';
  const order=[0,1,2,3].sort(()=>Math.random()-0.5);
  order.forEach(j=>{const b=document.createElement('button');b.className='qo';b.innerHTML=item[1][j];
   b.onclick=()=>{[...opts.children].forEach(x=>x.disabled=true);
    [...opts.children].forEach((x,k2)=>{if(order[k2]===item[2])x.classList.add('ok');});
    if(j===item[2]){ok++;fb.innerHTML='✔ '+item[4];}else{mal++;b.classList.add('bad');fb.innerHTML='✘ '+item[4];}
    const nx=document.createElement('button');nx.className='qo';nx.style.maxWidth='160px';nx.textContent='Siguiente →';nx.onclick=()=>{i++;render();};fb.append(document.createElement('br'),nx);
    hint.textContent=`Pregunta ${i+1} · aciertos ${ok} · fallos ${mal}`;};
   opts.append(b);});}
 render();};

/* 13 Transformaciones geométricas 2D */
SIMS.transform=el=>build(el,{w:640,h:400,
 selects:[{k:'c',l:'centro de giro',v:'A',opts:[['A','vértice A (1,2)'],['B','vértice B (5,2)'],['O','origen (0,0)']]},
  {k:'paso',l:'mostrar hasta el paso',v:'3',opts:[['0','0 · triángulo inicial'],['1','1 · trasladado al origen'],['2','2 · girado θ'],['3','3 · traslación deshecha (final)']]}],
 sliders:[{k:'th',l:'ángulo θ (°)',v:90,min:0,max:180,step:15}],
 draw(a){a.clear();const P0=[[1,2],[5,2],[3,5]];const cent={A:[1,2],B:[5,2],O:[0,0]}[a.st.c];
  const th=a.st.th*Math.PI/180,co=Math.cos(th),si=Math.sin(th);
  const T1=P0.map(p=>[p[0]-cent[0],p[1]-cent[1]]);
  const T2=T1.map(p=>[p[0]*co-p[1]*si,p[0]*si+p[1]*co]);
  const T3=T2.map(p=>[p[0]+cent[0],p[1]+cent[1]]);
  const cx=240,cy=250,u=26;a.axes(cx,cy,u,-8,9,-4,5);
  a.txt('x',cx+9*u-10,cy+14,C.muted,11);a.txt('y',cx+6,cy-5*u+14,C.muted,11);
  const tri=(P,col,wd,dash)=>{a.g.strokeStyle=col;a.g.lineWidth=wd;a.g.setLineDash(dash||[]);a.g.beginPath();
   P.forEach((p,i)=>{const x=cx+p[0]*u,y=cy-p[1]*u;i?a.g.lineTo(x,y):a.g.moveTo(x,y);});a.g.closePath();a.g.stroke();a.g.setLineDash([]);};
  const paso=parseInt(a.st.paso);
  tri(P0,C.grid,2);a.txt('inicial',cx+P0[2][0]*u+6,cy-P0[2][1]*u-6,C.muted,11);
  if(paso>=1){tri(T1,C.b,2,[6,4]);}
  if(paso>=2){tri(T2,C.d,2,[2,3]);}
  if(paso>=3){tri(T3,C.a,3);a.txt('final',cx+T3[2][0]*u+6,cy-T3[2][1]*u-6,C.a,12);}
  a.circ(cx+cent[0]*u,cy-cent[1]*u,4,C.a,true);a.txt('centro',cx+cent[0]*u+7,cy-cent[1]*u+14,C.a,11);
  const f1=p=>'('+F(p[0])+', '+F(p[1])+')';
  a.html(`M = T₊<sub>${a.st.c}</sub> · R<sub>${a.st.th}°</sub> · T₋<sub>${a.st.c}</sub> (se aplica de derecha a izquierda)<br>
1) trasladar el centro al origen: A′${f1(T1[0])}, B′${f1(T1[1])}, C′${f1(T1[2])} ·
2) girar θ: A″${f1(T2[0])}, B″${f1(T2[1])}, C″${f1(T2[2])} ·
3) deshacer: <b>A‴${f1(T3[0])}, B‴${f1(T3[1])}, C‴${f1(T3[2])}</b><br>
<span class="hint">Con θ = 90° y centro A es el ejercicio de junio 2006: B‴(1,6), C‴(−2,4). La matriz de rotación «pura» solo gira respecto al origen: por eso el sándwich trasladar-girar-deshacer.</span>`);}});

/* 14 Contactor: marcha-paro de un motor */
SIMS.contactor=el=>build(el,{w:640,h:400,
 selects:[{k:'acc',l:'acción',v:'reposo',opts:[['reposo','— reposo (estado inicial)'],['marcha','pulsar SB2 (marcha) y soltar'],['paro','pulsar SB1 (paro)'],['sobre','sobreintensidad: dispara FR1'],['rearme','rearmar FR1']]}],
 draw(a){a.clear();
  const st=a.st;if(st._mot===undefined){st._mot=false;st._trip=false;}
  if(st.acc!==st._last){st._last=st.acc;
   if(st.acc==='marcha'&&!st._trip)st._mot=true;
   if(st.acc==='paro')st._mot=false;
   if(st.acc==='sobre'){st._trip=true;st._mot=false;}
   if(st.acc==='rearme')st._trip=false;}
  const on=st._mot,trip=st._trip;
  const col=on?C.c:C.muted;
  // FUERZA (izquierda)
  for(let i=0;i<3;i++){const x=90+i*40;a.line(x,30,x,70,on?C.c:C.muted,2);a.txt('L'+(i+1),x-8,24,C.muted,11);
   a.line(x,70,x,100,C.text,2); // QS
   a.line(x,100,x+12,80,C.text,2);
   a.line(x,120,x,150,on?C.c:C.text,2); // hacia KM
   a.line(x,150,x+12,130,on?C.c:C.b,2.5); // contactos KM1
   a.line(x,170,x,210,on?C.c:C.text,2);
   a.g.strokeStyle=C.text;a.g.strokeRect(x-8,210,16,26); // FR térmico
   a.line(x,236,x,266,on?C.c:C.text,2);}
  a.txt('QS1',38,92,C.text,12);a.txt('KM1',34,142,C.b,12);a.txt('FR1'+(trip?' ⚡':''),36,228,trip?C.d:C.text,12);
  a.circ(130,296,26,on?C.c:C.text,false);a.txt('M1',130,300,on?C.c:C.text,14,'center');a.txt('3~',130,316,C.muted,11,'center');
  a.line(90,266,170,266,C.text,1.5);a.line(130,266,130,270,C.text,2);
  a.txt(on?'MOTOR EN MARCHA':(trip?'PARADO (térmico disparado)':'MOTOR PARADO'),130,355,on?C.c:(trip?C.d:C.muted),13,'center');
  // MANDO (derecha)
  const mx=420;a.line(mx,30,mx,66,C.text,2);a.txt('L1',mx-24,40,C.muted,11);
  // FR contacto 95-96 (NC)
  a.line(mx,66,mx+14,48,trip?C.d:C.text,2);a.txt('FR1 95-96'+(trip?' (abierto)':''),mx+20,60,trip?C.d:C.muted,11);
  a.line(mx,84,mx,110,C.text,2);
  // SB1 NC
  a.line(mx,110,mx+14,92,C.text,2);a.txt('SB1 paro (NC)',mx+20,104,C.muted,11);
  a.line(mx,128,mx,150,C.text,2);
  // SB2 NA // KM1 13-14
  a.line(mx,150,mx+10,168,C.text,2);a.txt('SB2 marcha (NA)',mx+20,162,C.muted,11);
  a.line(mx-36,150,mx-36,186,on?C.c:C.grid,2);a.line(mx-36,150,mx,150,C.text,1.5);a.line(mx-36,186,mx,186,C.text,1.5);
  a.line(mx-36,160,mx-24,176,on?C.c:C.text,2);a.txt('KM1 13-14',mx-110,172,on?C.c:C.muted,11);
  a.line(mx,186,mx,210,on?C.c:C.text,2);
  // bobina
  a.g.strokeStyle=on?C.c:C.text;a.g.lineWidth=2;a.g.strokeRect(mx-14,210,28,34);a.txt('KM1',mx,232,on?C.c:C.text,12,'center');
  a.line(mx,244,mx,280,C.text,2);a.txt('N',mx-20,278,C.muted,11);
  // lámparas
  a.circ(mx+90,226,13,on?C.c:C.grid,false);a.txt('HL1',mx+90,260,on?C.c:C.muted,11,'center');if(on){a.txt('●',mx+90,231,C.c,14,'center');}
  a.circ(mx+150,226,13,trip?C.d:C.grid,false);a.txt('HL2',mx+150,260,trip?C.d:C.muted,11,'center');if(trip){a.txt('●',mx+150,231,C.d,14,'center');}
  const msg={reposo:'Estado inicial: bobina sin alimentar, contactos principales abiertos.',
   marcha:on?'SB2 alimenta la bobina KM1 → cierran 1-2/3-4/5-6 (el motor arranca) y el auxiliar 13-14 ENCLAVA: al soltar SB2 el motor sigue en marcha. HL1 luce.':'El térmico está disparado: rearma FR1 antes de arrancar.',
   paro:'SB1 (NC) corta la alimentación de la bobina: se abren los contactos y el motor se para.',
   sobre:'Sobreintensidad prolongada: FR1 dispara; su contacto 95-96 corta la bobina (motor parado) y el 97-98 enciende HL2 (avería).',
   rearme:'FR1 rearmado: el circuito queda listo; hace falta pulsar de nuevo SB2 (el enclavamiento se perdió).'};
  a.html(`${msg[st.acc]}<br><span class="hint">Circuito de fuerza a la izquierda (QS1 → KM1 → FR1 → M1) y de mando a la derecha. El examen pide identificar cada elemento y «explicar el funcionamiento general»: sigue siempre la corriente de la bobina.</span>`);}});

/* ---- Ajuste ø25 H7/g6 paso a paso (desviaciones en µm) ---- */
SIMS.ajustePaso=el=>build(el,{w:640,h:380,
 sliders:[{k:'paso',v:0,min:0,max:6,step:1,l:'paso del cálculo del ajuste (0 = datos)',u:''}],
 draw(a){a.clear();const p=a.st.paso;
  const K={H:'#3a63c4',g:'#2c8a52',J:'#c43d63',T:'#b8730c'};
  const Y=um=>250-um*4;
  const hx=160,hw=80,gx=270,gw=80;
  // línea cero (nominal)
  a.line(120,Y(0),420,Y(0),C.muted,1.2,[5,4]);
  a.txt('nominal ø25',120,Y(0)-6,C.muted,11,'left');
  // agujero H7: EI = 0, ES = +21
  if(p>=1){a.g.fillStyle=K.H;a.g.globalAlpha=0.35;a.g.fillRect(hx,Y(21),hw,Y(0)-Y(21));a.g.globalAlpha=1;
    a.g.strokeStyle=K.H;a.g.lineWidth=2;a.g.strokeRect(hx,Y(21),hw,Y(0)-Y(21));
    a.txt('agujero H7',hx+hw/2,Y(21)-10,K.H,12,'center');
    a.txt('+21',hx-6,Y(21)+4,K.H,11,'right');a.txt('0',hx-6,Y(0)+4,K.H,11,'right');}
  // eje g6: es = −7, ei = −20
  if(p>=2){a.g.fillStyle=K.g;a.g.globalAlpha=0.35;a.g.fillRect(gx,Y(-7),gw,Y(-20)-Y(-7));a.g.globalAlpha=1;
    a.g.strokeStyle=K.g;a.g.lineWidth=2;a.g.strokeRect(gx,Y(-7),gw,Y(-20)-Y(-7));
    a.txt('eje g6',gx+gw/2,Y(-20)+18,K.g,12,'center');
    a.txt('−7',gx+gw+6,Y(-7)+4,K.g,11,'left');a.txt('−20',gx+gw+6,Y(-20)+4,K.g,11,'left');}
  // juego máximo (ES − ei) y mínimo (EI − es)
  if(p>=3){const x=400;a.line(x,Y(21),x,Y(-20),K.J,2);a.line(x-5,Y(21),x+5,Y(21),K.J,2);a.line(x-5,Y(-20),x+5,Y(-20),K.J,2);
    a.txt('J_máx',x+8,(Y(21)+Y(-20))/2,K.J,11,'left');}
  if(p>=4){const x=440;a.line(x,Y(0),x,Y(-7),K.T,2.5);a.line(x-5,Y(0),x+5,Y(0),K.T,2);a.line(x-5,Y(-7),x+5,Y(-7),K.T,2);
    a.txt('J_mín',x+8,(Y(0)+Y(-7))/2+4,K.T,11,'left');}
  // paneles
  const items=[[60,1,'Agujero H7: EI = 0, ES = +21 µm',K.H],[82,2,'Eje g6: ei = −20, es = −7 µm',K.g],
    [104,3,'J_máx = ES − ei = 21 − (−20) = 41 µm',K.J],[126,4,'J_mín = EI − es = 0 − (−7) = 7 µm',K.T],
    [148,5,'J_mín > 0 ⇒ ajuste con juego',C.text],[170,6,'T_aj = 41 − 7 = 34 µm = 21 + 13 ✓',C.text]];
  a.txt('Ajuste ø25 H7/g6',480,36,C.text,13,'left');
  items.forEach(([y,k,s,c])=>{if(p>=k)a.txt(s,480,y+14,c,10,'left');});
  const T=[
   'Ajuste ø25 H7/g6 (norma ISO): agujero H7 y eje g6, nominal 25 mm. Las desviaciones se leen en tablas y se dan en micras respecto a la línea cero.',
   'Agujero H7: su desviación inferior es EI = 0 y la superior ES = +21 µm. Va de ø25,000 a ø25,021 mm.',
   'Eje g6: desviaciones es = −7 µm y ei = −20 µm. Va de ø24,980 a ø24,993 mm.',
   'Juego máximo: el agujero más grande con el eje más pequeño: J_máx = ES − ei = 21 − (−20) = 41 µm.',
   'Juego mínimo: el agujero más pequeño con el eje más grande: J_mín = EI − es = 0 − (−7) = 7 µm.',
   'Como J_mín > 0, el ajuste tiene juego en todos los casos: es un ajuste con holgura, nunca apriete.',
   'Comprobación: la tolerancia del ajuste es J_máx − J_mín = 41 − 7 = 34 µm, que debe ser la suma de las tolerancias 21 (H7) + 13 (g6) = 34 µm ✓.'
  ];
  a.html(`<div>${T[p]}</div>`);
 }});

document.querySelectorAll('[data-sim]').forEach(el=>{const f=SIMS[el.dataset.sim];if(f)f(el);});
})();
