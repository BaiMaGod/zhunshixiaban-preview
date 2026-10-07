(() => {
"use strict";
const canvas=document.getElementById("game"),ctx=canvas.getContext("2d"),loading=document.getElementById("loading");
const W=1280,H=720,PREP=45;
let last=performance.now(),elapsed=0,state="playing",elevator=false,shake=0,now=0;
const keys=new Set(),effects=[],fogs=[],upgrades=new Set(),usedZones=new Set();
let knockdowns=0,interactions=0,nearMisses=0,maxDetect=0,nearReady=true,upgradeOpen=false,choiceCards=[];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const rectHit=(x,y,r,o)=>{const nx=clamp(x,o.x,o.x+o.w),ny=clamp(y,o.y,o.y+o.h);return (x-nx)**2+(y-ny)**2<r*r};
const lineBlocked=(a,b)=>{const n=Math.max(8,Math.ceil(dist(a,b)/18));for(let i=1;i<n;i++){const t=i/n,p={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};if(obstacles.some(o=>p.x>=o.x&&p.x<=o.x+o.w&&p.y>=o.y&&p.y<=o.y+o.h))return true}return false};
const colors={folder:"#5ba6ff",stapler:"#ffc857",keyboard:"#be7cff",extinguisher:"#ff6b6b"};
const weaponName={folder:"加厚文件夹",stapler:"订书机",keyboard:"机械键盘",extinguisher:"灭火器"};
const specs={folder:{range:72,cd:.38,k:1,noise:90},stapler:{range:290,cd:.34,k:1,noise:130,ranged:true},keyboard:{range:96,cd:.52,k:1,noise:150},extinguisher:{range:140,cd:.75,k:2,noise:240}};
const obstacles=[
 {x:70,y:160,w:180,h:40,t:"desk"},{x:70,y:250,w:180,h:40,t:"desk"},{x:70,y:440,w:180,h:40,t:"desk"},{x:70,y:530,w:180,h:40,t:"desk"},
 {x:330,y:160,w:170,h:42,t:"desk"},{x:330,y:270,w:170,h:42,t:"desk"},{x:330,y:455,w:170,h:42,t:"desk"},{x:330,y:565,w:170,h:42,t:"desk"},
 {x:560,y:210,w:36,h:320,t:"div"},{x:635,y:170,w:150,h:74,t:"cab"},{x:650,y:500,w:120,h:90,t:"cab"},
 {x:820,y:250,w:34,h:315,t:"div"},{x:900,y:175,w:125,h:58,t:"cab"},{x:900,y:505,w:125,h:58,t:"cab"},
 {x:1065,y:300,w:35,h:250,t:"div"},{x:1020,y:355,w:42,h:70,t:"gate"}
];
const props=[
 {id:"printer",name:"制造打印机卡纸",x:680,y:186,cd:0},
 {id:"water",name:"推倒饮水机",x:705,y:545,cd:0},
 {id:"phone",name:"拨打办公电话",x:950,y:205,cd:0}
];
const player={x:160,y:360,r:15,fx:1,fy:0,weapon:null,attackCd:0,speedMul:1,noiseMul:1,detectMul:1,bossBonus:0,weaponBonus:0,rangeMul:1,weaponNoiseMul:1,whiteFog:false,doubleStaple:false,penetrate:false,silentAfter:false,silentUntil:0,officeInstinct:false,panicRun:false,crouch:false,sprint:false,moving:false,alert:false};

function enemy(kind,x,y,patrol){
 const P={coworker:["同事","#7ec8ff",76,175,68,1.2,1],hr:["HR","#ff9ec8",68,195,72,1,1],supervisor:["主管","#cf88ff",82,235,86,.75,2],boss:["老板","#ff5f5f",72,260,92,.65,3]}[kind];
 return{kind,name:P[0],color:P[1],speed:P[2],vision:P[3],fov:P[4]*Math.PI/180,detectTime:P[5],end:P[6],maxEnd:P[6],x,y,patrol,wp:0,dir:0,detect:0,state:"patrol",invest:null,investUntil:0,stun:0,down:false};
}
const enemies=[
 enemy("coworker",380,225,[{x:380,y:225},{x:480,y:225},{x:480,y:360},{x:380,y:360}]),
 enemy("coworker",440,515,[{x:440,y:515},{x:520,y:610},{x:360,y:610}]),
 enemy("coworker",710,330,[{x:710,y:330},{x:785,y:330},{x:785,y:430},{x:690,y:430}]),
 enemy("coworker",910,430,[{x:910,y:430},{x:1010,y:430},{x:1010,y:600},{x:900,y:600}]),
 enemy("hr",995,315,[{x:995,y:315},{x:995,y:470}]),
 enemy("supervisor",765,615,[{x:765,y:615},{x:880,y:615},{x:880,y:130},{x:720,y:130}]),
 enemy("boss",1120,225,[{x:1120,y:225},{x:1190,y:225},{x:1190,y:590},{x:1115,y:590}])
];

const wp=["folder","stapler","keyboard","extinguisher"].sort(()=>Math.random()-.5).slice(0,3);
const pickups=[{id:wp[0],x:235,y:330,a:1},{id:wp[1],x:155,y:580,a:1},{id:wp[2],x:735,y:640,a:1}];

const upgradePool=[
 ["fast","健步如飞","移动速度 +15%","all"],
 ["cat","猫步","脚步噪音 -45%","all"],
 ["boss","老板克星","对主管/老板击倒 +1","all"],
 ["quick","我赶时间","攻击冷却 -20%","all"],
 ["instinct","下班本能","朝电梯移动更快","all"],
 ["silent","工伤保险","击倒后 2.2 秒静音","all"],
 ["panic","开会迟到","警觉时移动更快","all"],
 ["old","职场老油条","被发现积累速度 -12%","all"],
 ["heavy","板砖文件","文件夹击倒 +1","folder"],
 ["double","双持订书机","订书机每次连射两枚","stapler"],
 ["pierce","穿透装订","订书机可命中两个目标","stapler"],
 ["rgb","RGB 狂怒","键盘范围 +28%，冷却 -15%","keyboard"],
 ["fog","白雾掩护","灭火器生成遮挡白雾","extinguisher"],
 ["quietExt","静音灭火器","灭火器噪音 -45%","extinguisher"]
];

function applyUpgrade(id){
 upgrades.add(id);
 if(id==="fast")player.speedMul*=1.15;
 if(id==="cat")player.noiseMul*=.55;
 if(id==="boss")player.bossBonus++;
 if(id==="quick")player.attackCd*=0,player.quick=(player.quick||1)*.8;
 if(id==="instinct")player.officeInstinct=true;
 if(id==="silent")player.silentAfter=true;
 if(id==="panic")player.panicRun=true;
 if(id==="old")player.detectMul*=.88;
 if(id==="heavy"){player.weaponBonus++;player.weaponNoiseMul*=1.35}
 if(id==="double")player.doubleStaple=true;
 if(id==="pierce")player.penetrate=true;
 if(id==="rgb"){player.rangeMul*=1.28;player.quick=(player.quick||1)*.85}
 if(id==="fog")player.whiteFog=true;
 if(id==="quietExt")player.weaponNoiseMul*=.55;
}

function openUpgrade(){
 if(upgradeOpen||state!=="playing")return;
 upgradeOpen=true;
 const eligible=upgradePool.filter(u=>(u[3]==="all"||u[3]===player.weapon)&&(!upgrades.has(u[0])||["fast","quick"].includes(u[0])));
 const wep=eligible.filter(u=>u[3]===player.weapon),gen=eligible.filter(u=>u[3]==="all"),res=[];
 if(wep.length)res.push(wep[Math.floor(Math.random()*wep.length)]);
 while(res.length<3&&gen.length){const i=Math.floor(Math.random()*gen.length);res.push(gen.splice(i,1)[0])}
 while(res.length<3&&wep.length){const i=Math.floor(Math.random()*wep.length);res.push(wep.splice(i,1)[0])}
 choiceCards=res;
}
function chooseUpgrade(i){if(!upgradeOpen||!choiceCards[i])return;applyUpgrade(choiceCards[i][0]);upgradeOpen=false;choiceCards=[];fxText("获得："+choiceCards?.[i]?.[1]||"",640,115,"#ffc857");}

function hearNoise(src,r){for(const e of enemies){if(e.down||now<e.stun)continue;if(dist(e,src)<=r){e.invest={x:src.x,y:src.y};e.investUntil=now+2.7;if(e.state!=="alert")e.state="investigate"}}}
function sees(e){
 const d=dist(e,player);if(d>e.vision)return false;
 let a=Math.atan2(player.y-e.y,player.x-e.x)-e.dir;while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;
 if(Math.abs(a)>e.fov/2)return false;if(lineBlocked(e,player))return false;
 for(const f of fogs){if(now<f.until&&dist({x:(e.x+player.x)/2,y:(e.y+player.y)/2},f)<f.r)return false}
 return true;
}
function moveEnemy(e,dt){
 let t=null,spd=e.speed;if(e.invest&&now<e.investUntil){t=e.invest;spd*=e.state==="alert"?1.32:1.15}else t=e.patrol[e.wp];
 if(!t)return;let dx=t.x-e.x,dy=t.y-e.y,d=Math.hypot(dx,dy);
 if(d<8){if(e.invest&&now<e.investUntil){if(e.state!=="alert"){e.invest=null;e.state="patrol"}}else e.wp=(e.wp+1)%e.patrol.length;return}
 dx/=d;dy/=d;const nx=e.x+dx*spd*dt,ny=e.y+dy*spd*dt,r=e.kind==="boss"?18:15;
 if(!obstacles.some(o=>rectHit(nx,e.y,r,o)))e.x=nx;if(!obstacles.some(o=>rectHit(e.x,ny,r,o)))e.y=ny;e.dir=Math.atan2(dy,dx);
}
function updateEnemies(dt){
 let cur=0,alert=false;
 for(const e of enemies){
  if(e.down)continue;
  if(now<e.stun){e.state="stunned";e.detect=Math.max(0,e.detect-dt*2.8);continue}
  if(sees(e)){e.invest={x:player.x,y:player.y};e.investUntil=now+2.6;e.state="alert";e.detect+=dt/e.detectTime*player.detectMul*(player.crouch?.82:1)}
  else{e.detect=Math.max(0,e.detect-dt*2.7);e.state=e.invest&&now<e.investUntil?"investigate":"patrol";if(e.state==="patrol")e.invest=null}
  moveEnemy(e,dt);cur=Math.max(cur,e.detect);alert=alert||e.detect>.01;
  if(e.detect>=1||(!e.down&&dist(e,player)<24&&e.detect>.12)){maxDetect=1;fail(e.name+"发现并抓住了你");return}
 }
 player.alert=alert;maxDetect=Math.max(maxDetect,cur);
 if(cur>=.78&&nearReady){nearMisses++;nearReady=false}else if(cur<.18)nearReady=true;
}

function attack(){
 if(state!=="playing"||upgradeOpen||!player.weapon||player.attackCd>0)return;
 const sp=specs[player.weapon],quick=player.quick||1;player.attackCd=sp.cd*quick;
 let noise=sp.noise*player.noiseMul*player.weaponNoiseMul;if(now>=player.silentUntil){hearNoise(player,noise);if(noise>110)ring(player.x,player.y,colors[player.weapon])}
 const range=sp.range*player.rangeMul,arr=enemies.filter(e=>!e.down).map(e=>{const dx=e.x-player.x,dy=e.y-player.y,d=Math.hypot(dx,dy),f=d?dx/d*player.fx+dy/d*player.fy:1;return{e,d,f}}).filter(o=>o.d<=range&&o.f>=(sp.ranged?.87:.3)).sort((a,b)=>a.d-b.d);
 let targets=1,shots=1;if(player.weapon==="stapler"){targets=player.penetrate?2:1;shots=player.doubleStaple?2:1}else if(player.weapon==="keyboard")targets=3;else if(player.weapon==="extinguisher")targets=4;
 for(let s=0;s<shots;s++)for(const o of arr.slice(0,targets))hit(o.e,sp);
 lineFx(player.x,player.y,player.x+player.fx*range,player.y+player.fy*range,colors[player.weapon],player.weapon==="extinguisher"?16:sp.ranged?4:9);
 if(player.weapon==="extinguisher"&&player.whiteFog)fogs.push({x:player.x+player.fx*88,y:player.y+player.fy*88,r:94,until:now+1.8});
}
function hit(e,sp){if(e.down)return;let v=sp.k;if(player.weapon==="folder")v+=player.weaponBonus;if(["boss","supervisor"].includes(e.kind))v+=player.bossBonus;e.end-=v;e.stun=now+.5;e.detect=Math.max(0,e.detect-.72);burst(e.x,e.y,colors[player.weapon]);if(e.end<=0){e.down=true;knockdowns++;if(player.silentAfter)player.silentUntil=now+2.2;fxText("击倒 "+e.name,e.x,e.y-34,"#5bf0a5")}}
function interact(){
 if(state!=="playing"||upgradeOpen)return;
 const p=pickups.find(p=>p.a&&dist(p,player)<48);if(p){player.weapon=p.id;p.a=0;fxText("拿到 "+weaponName[p.id],player.x,player.y-34,colors[p.id]);if(!usedZones.has("first")){usedZones.add("first");setTimeout(openUpgrade,150)}return}
 const pr=props.find(p=>dist(p,player)<62&&now>=p.cd);if(pr){pr.cd=now+6;interactions++;const r=pr.id==="water"?340:pr.id==="printer"?280:250;hearNoise(pr,r);ring(pr.x,pr.y,pr.id==="water"?"#79c8ff":"#ffc857");return}
 if(dist(player,{x:1188,y:425})<90){if(!elevator){fxText("还没到 18:00",640,110,"#ffc857");return}win()}
}
function fail(msg){if(state!=="playing")return;state="failed";endTitle="下班失败";endSub=msg}
function win(){if(state!=="playing")return;state="won";endTitle="叮——下班成功！";const post=Math.max(0,Math.floor(elapsed-PREP));endSub=`18:${String(Math.floor(post/60)).padStart(2,"0")}:${String(post%60).padStart(2,"0")}`}

function update(dt){
 now=performance.now()/1000;if(state!=="playing"||upgradeOpen)return;
 elapsed+=dt;if(!elevator&&elapsed>=PREP){elevator=true;fxText("18:00！下班！！！",640,105,"#5bf0a5")}
 player.attackCd=Math.max(0,player.attackCd-dt);
 let dx=(keys.has("KeyD")||keys.has("ArrowRight")?1:0)-(keys.has("KeyA")||keys.has("ArrowLeft")?1:0),dy=(keys.has("KeyS")||keys.has("ArrowDown")?1:0)-(keys.has("KeyW")||keys.has("ArrowUp")?1:0);
 if(touch.active){dx+=touch.mx;dy+=touch.my}let d=Math.hypot(dx,dy);if(d){dx/=d;dy/=d;player.fx=dx;player.fy=dy}
 player.crouch=keys.has("KeyC")||keys.has("ControlLeft")||touch.crouch;player.sprint=!player.crouch&&(keys.has("ShiftLeft")||touch.sprint);player.moving=d>0;
 let spd=220*player.speedMul*(player.sprint?1.5:player.crouch?.72:1);if(player.officeInstinct&&dx>.35)spd*=1.12;if(player.panicRun&&player.alert)spd*=1.18;
 const nx=player.x+dx*spd*dt,ny=player.y+dy*spd*dt;if(!obstacles.some(o=>rectHit(nx,player.y,player.r,o)))player.x=nx;if(!obstacles.some(o=>rectHit(player.x,ny,player.r,o)))player.y=ny;player.x=clamp(player.x,42,1238);player.y=clamp(player.y,84,678);
 foot-=dt;if(player.moving&&now>=player.silentUntil&&foot<=0){let r=44,c=.62;if(player.crouch){r=0;c=.8}else if(player.sprint){r=125;c=.3}foot=c;if(r)hearNoise(player,r*player.noiseMul)}
 for(const z of [430,700,930,1075])if(!usedZones.has(z)&&player.x>=z){usedZones.add(z);openUpgrade();break}
 updateEnemies(dt);for(let i=fogs.length-1;i>=0;i--)if(now>fogs[i].until)fogs.splice(i,1);
}
let foot=0,endTitle="",endSub="";
function lineFx(x1,y1,x2,y2,c,w){effects.push({type:"line",x1,y1,x2,y2,c,w,until:now+.1})}
function ring(x,y,c){effects.push({type:"ring",x,y,c,born:now,until:now+.38})}
function burst(x,y,c){effects.push({type:"burst",x,y,c,born:now,until:now+.25})}
function fxText(text,x,y,c){effects.push({type:"text",text,x,y,c,born:now,until:now+1})}

function draw(){
 ctx.save();ctx.clearRect(0,0,W,H);ctx.translate(shake?Math.random()*shake-shake/2:0,shake?Math.random()*shake-shake/2:0);if(shake)shake*=.7;
 ctx.fillStyle="#111820";ctx.fillRect(0,0,W,H);ctx.fillStyle="#26343f";ctx.fillRect(34,76,1212,608);
 [["你的工位",90],["开放办公区",360],["打印 / 茶水区",655],["前台 / 打卡区",890],["电梯厅",1120]].forEach(z=>{ctx.fillStyle="#8396a6";ctx.font="bold 15px sans-serif";ctx.fillText(z[0],z[1],105)});
 for(const o of obstacles)drawObstacle(o);for(const p of props)drawProp(p);drawPlants();drawElevator();
 for(const p of pickups)if(p.a)drawPickup(p);for(const f of fogs){ctx.globalAlpha=.35;ctx.fillStyle="#dfe9ee";ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
 for(const e of enemies)drawEnemy(e);drawPlayer();drawEffects();ctx.restore();drawHud();drawTouch();if(upgradeOpen)drawUpgrade();if(state==="failed"||state==="won")drawEnd();
 requestAnimationFrame(loop);
}
function rr(x,y,w,h,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function drawObstacle(o){if(o.t==="desk"){rr(o.x,o.y,o.w,o.h,6,"#526774");rr(o.x+5,o.y+4,o.w-10,o.h-9,5,"#738996");rr(o.x+20,o.y+7,34,20,4,"#16222b");ctx.fillStyle="#4bc0ff";ctx.fillRect(o.x+25,o.y+10,24,13);rr(o.x+65,o.y+20,45,10,3,"#d4dce2");rr(o.x+o.w-30,o.y+8,14,17,5,"#f1c45c")}else if(o.t==="div")rr(o.x,o.y,o.w,o.h,5,"#607783");else if(o.t==="cab")rr(o.x,o.y,o.w,o.h,6,"#506471");else rr(o.x,o.y,o.w,o.h,8,"#273741")}
function drawProp(p){ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle="#162029";ctx.beginPath();ctx.ellipse(0,22,30,8,0,0,Math.PI*2);ctx.fill();if(p.id==="printer"){rr(-26,-18,52,40,7,"#c7d2d9");rr(-18,-11,36,16,4,"#25343e")}else if(p.id==="water"){rr(-18,-5,36,32,7,"#dfe9ee");rr(-15,-32,30,32,13,"#78ccff")}else{rr(-24,-13,48,26,8,"#efc25b");rr(-14,-23,28,13,7,"#ffe69b")}ctx.fillStyle="#dbe5ec";ctx.font="12px sans-serif";ctx.textAlign="center";ctx.fillText(p.id==="printer"?"打印机":p.id==="water"?"饮水机":"电话",0,42);ctx.restore()}
function drawPlants(){for(const [x,y] of [[610,610],[875,132],[1090,610]]){ctx.fillStyle="#9b6a49";rr(x-12,y+4,24,24,5,"#9b6a49");for(const [dx,dy,r,c] of [[-12,-8,16,"#4fa66d"],[0,-18,18,"#5fbf78"],[13,-8,15,"#43985e"],[-2,-5,17,"#67c782"]]){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x+dx,y+dy,r,0,Math.PI*2);ctx.fill()}}}
function drawElevator(){rr(1134,300,114,250,12,elevator?"#4ecf8a":"#465763");rr(1141,307,100,236,10,elevator?"#264d3e":"#283640");ctx.globalAlpha=elevator?.3:1;ctx.fillStyle="#17212a";ctx.fillRect(1139,307,104,236);ctx.fillStyle="#657681";ctx.fillRect(1190,307,2,236);ctx.globalAlpha=1;ctx.fillStyle=elevator?"#5bf0a5":"#6f7b83";ctx.beginPath();ctx.arc(1191,286,elevator?5:4,0,Math.PI*2);ctx.fill()}
function drawPickup(p){ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle=colors[p.id];ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.fill();ctx.fillStyle="#17212a";ctx.beginPath();ctx.arc(0,0,15,0,Math.PI*2);ctx.fill();ctx.fillStyle="#fff";ctx.font="bold 12px sans-serif";ctx.textAlign="center";ctx.fillText("E",0,4);ctx.fillStyle="#f5f7fa";ctx.font="bold 13px sans-serif";ctx.fillText(weaponName[p.id],0,42);ctx.restore()}
function drawEnemy(e){ctx.save();ctx.translate(e.x,e.y);if(!e.down){ctx.rotate(e.dir);ctx.globalAlpha=e.state==="alert"?.35:e.state==="investigate"?.23:.14;ctx.fillStyle=e.color;ctx.beginPath();ctx.moveTo(0,0);const h=Math.tan(e.fov/2)*e.vision;ctx.lineTo(e.vision,-h);ctx.lineTo(e.vision,h);ctx.closePath();ctx.fill();ctx.rotate(-e.dir);ctx.globalAlpha=1}
 ctx.fillStyle="#0005";ctx.beginPath();ctx.ellipse(0,15,19,7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=e.down?"#46515a":e.color;ctx.beginPath();ctx.arc(0,0,e.kind==="boss"?19:16,0,Math.PI*2);ctx.fill();ctx.fillStyle="#1a2029";ctx.beginPath();ctx.arc(0,0,e.kind==="boss"?11:9,0,Math.PI*2);ctx.fill();ctx.fillStyle="#fff";ctx.font="bold 10px sans-serif";ctx.textAlign="center";ctx.fillText(e.kind==="boss"?"B":e.kind==="supervisor"?"管":e.kind==="hr"?"HR":"同",0,4);
 if(e.detect>0&&!e.down){ctx.fillStyle="#ff4747";ctx.font="bold 30px sans-serif";ctx.fillText("!",0,-43);ctx.fillStyle="#351a1e";ctx.fillRect(-30,-32,60,6);ctx.fillStyle="#ff4747";ctx.fillRect(-30,-32,60*clamp(e.detect,0,1),6)}
 if(e.maxEnd>1&&!e.down)for(let i=0;i<e.maxEnd;i++){ctx.fillStyle=i<e.end?"#fff":"#394550";rr(-((e.maxEnd*9+(e.maxEnd-1)*3)/2)+i*12,-43,9,5,2,ctx.fillStyle)}
 ctx.fillStyle=e.state==="alert"?"#ff8a8a":"#e8edf2";ctx.font="14px sans-serif";ctx.fillText(e.down?e.name+" · 倒地":e.name,0,34);ctx.restore()}
function drawPlayer(){ctx.save();ctx.translate(player.x,player.y);ctx.fillStyle="#0006";ctx.beginPath();ctx.ellipse(0,15,18,7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#59e391";ctx.beginPath();ctx.arc(0,0,15,0,Math.PI*2);ctx.fill();ctx.fillStyle="#17232c";ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.fill();ctx.fillStyle="#d9fff0";ctx.font="bold 11px sans-serif";ctx.textAlign="center";ctx.fillText("我",0,4);ctx.strokeStyle="#fff";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(player.fx*10,player.fy*10);ctx.lineTo(player.fx*25,player.fy*25);ctx.stroke();ctx.restore()}
function drawEffects(){for(let i=effects.length-1;i>=0;i--){const e=effects[i];if(now>e.until){effects.splice(i,1);continue}const t=e.born?(now-e.born)/(e.until-e.born):0;if(e.type==="line"){ctx.strokeStyle=e.c;ctx.lineWidth=e.w;ctx.beginPath();ctx.moveTo(e.x1,e.y1);ctx.lineTo(e.x2,e.y2);ctx.stroke()}else if(e.type==="ring"){ctx.strokeStyle=e.c;ctx.globalAlpha=(1-t)*.6;ctx.lineWidth=6;ctx.beginPath();ctx.arc(e.x,e.y,30+t*100,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}else if(e.type==="burst"){ctx.fillStyle=e.c;ctx.globalAlpha=1-t;ctx.beginPath();ctx.arc(e.x,e.y,16+t*25,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}else{ctx.fillStyle=e.c;ctx.globalAlpha=1-t;ctx.font="bold 22px sans-serif";ctx.textAlign="center";ctx.fillText(e.text,e.x,e.y-t*35);ctx.globalAlpha=1}}}
function drawHud(){ctx.save();ctx.fillStyle="#0b1117ee";ctx.fillRect(0,0,W,68);ctx.fillRect(0,646,W,74);const post=Math.max(0,Math.floor(elapsed-PREP));let time;if(!elevator){const ts=Math.floor(Math.min(1,elapsed/PREP)*300),m=55+Math.floor(ts/60),s=ts%60;time=`17:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`}else time=`18:${String(Math.floor(post/60)).padStart(2,"0")}:${String(post%60).padStart(2,"0")}`;ctx.fillStyle="#fff";ctx.font="bold 32px sans-serif";ctx.textAlign="left";ctx.fillText(time,36,45);ctx.font="19px sans-serif";ctx.fillStyle="#dbe6ef";ctx.fillText(elevator?"目标：进入电梯，下班！":"目标：准备下班，18:00 后进入电梯",210,43);const danger=Math.max(0,...enemies.map(e=>e.detect));ctx.fillStyle=danger>.75?"#ff6868":danger>.01?"#ffc857":"#5bf0a5";ctx.font="bold 18px sans-serif";ctx.textAlign="center";ctx.fillText(danger>.01?`警觉 ${Math.round(danger*100)}%`:"安全",830,42);ctx.textAlign="right";ctx.fillStyle="#ffc857";ctx.fillText("武器："+(player.weapon?weaponName[player.weapon]:"无"),1235,42);ctx.textAlign="left";ctx.fillStyle="#b8c5d0";ctx.font="bold 16px sans-serif";ctx.fillText(`秘籍 ${upgrades.size} · 击倒 ${knockdowns} · 机关 ${interactions}`,28,672);ctx.textAlign="right";ctx.fillStyle=player.sprint?"#ffc857":player.crouch?"#79c8ff":"#a9d9bf";ctx.fillText("行动："+(player.sprint?"冲刺 · 高噪音":player.crouch?"蹲伏 · 低噪音":"步行"),1240,672);ctx.fillStyle="#9fb0bf";ctx.font="14px sans-serif";ctx.textAlign="center";ctx.fillText("WASD/方向键移动 · Shift冲刺 · C蹲伏 · E互动 · 空格/点击攻击 · T快进18:00 · R重开",640,705);if(danger>.05){ctx.globalAlpha=Math.min(.25,danger*.25*(.4+.6*Math.abs(Math.sin(now*10))));ctx.strokeStyle="#ff4d5a";ctx.lineWidth=18;ctx.strokeRect(7,7,W-14,H-14);ctx.globalAlpha=1}ctx.restore()}
function drawUpgrade(){ctx.save();ctx.fillStyle="#000d";ctx.fillRect(0,0,W,H);ctx.fillStyle="#fff";ctx.font="bold 36px sans-serif";ctx.textAlign="center";ctx.fillText("下班秘籍 · 三选一",640,160);choiceCards.forEach((u,i)=>{const x=175+i*330;rr(x,230,270,250,16,"#192531");rr(x+8,238,254,234,13,u[3]==="all"?"#243544":"#304252");ctx.fillStyle="#ffc857";ctx.font="bold 28px sans-serif";ctx.textAlign="left";ctx.fillText(String(i+1),x+20,274);ctx.fillStyle="#fff";ctx.font="bold 27px sans-serif";ctx.textAlign="center";ctx.fillText(u[1],x+135,330);ctx.fillStyle="#cbd5df";ctx.font="19px sans-serif";wrap(u[2],x+135,385,220,26);ctx.fillStyle="#7f93a5";ctx.font="14px sans-serif";ctx.fillText("点击选择",x+135,448)});ctx.restore()}
function wrap(t,x,y,w,lh){const words=t.split("");let line="",yy=y;for(const ch of words){if(ctx.measureText(line+ch).width>w){ctx.fillText(line,x,yy);line=ch;yy+=lh}else line+=ch}ctx.fillText(line,x,yy)}
function drawEnd(){ctx.save();ctx.fillStyle="#000e";ctx.fillRect(0,0,W,H);ctx.fillStyle=state==="won"?"#5bf0a5":"#ff6464";ctx.font="bold 54px sans-serif";ctx.textAlign="center";ctx.fillText(endTitle,640,260);ctx.fillStyle="#dde6ee";ctx.font="24px sans-serif";ctx.fillText(endSub,640,330);ctx.fillStyle="#a8b6c2";ctx.font="18px sans-serif";ctx.fillText(`击倒 ${knockdowns} · 机关 ${interactions} · 最高警觉 ${Math.round(maxDetect*100)}% · 极限脱险 ${nearMisses}`,640,395);ctx.fillStyle="#9fb0bf";ctx.font="20px sans-serif";ctx.fillText("按 R 或点击屏幕重新开始",640,460);ctx.restore()}

const touch={active:false,id:null,mx:0,my:0,crouch:false,sprint:false},joy={x:125,y:575,r:72};
function drawTouch(){if(!("ontouchstart" in window))return;ctx.save();ctx.globalAlpha=.78;ctx.fillStyle="#263640";ctx.beginPath();ctx.arc(joy.x,joy.y,joy.r,0,Math.PI*2);ctx.fill();ctx.fillStyle="#d8e4ea";ctx.beginPath();ctx.arc(joy.x+touch.mx*52,joy.y+touch.my*52,34,0,Math.PI*2);ctx.fill();for(const b of buttons){ctx.fillStyle=b.c;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();ctx.fillStyle="#fff";ctx.font="bold 16px sans-serif";ctx.textAlign="center";ctx.fillText(b.t,b.x,b.y+5)}ctx.restore()}
const buttons=[{id:"attack",t:"攻击",x:1145,y:540,r:52,c:"#ff6b6b"},{id:"interact",t:"互动",x:1028,y:600,r:43,c:"#ffc857"},{id:"crouch",t:"蹲伏",x:1125,y:654,r:37,c:"#79c8ff"},{id:"sprint",t:"冲刺",x:1218,y:640,r:37,c:"#5bf0a5"}];
function pos(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
canvas.addEventListener("pointerdown",e=>{const p=pos(e);if(state!=="playing"){location.reload();return}if(upgradeOpen){choiceCards.forEach((_,i)=>{const x=175+i*330;if(p.x>=x&&p.x<=x+270&&p.y>=230&&p.y<=480){applyUpgrade(choiceCards[i][0]);upgradeOpen=false;choiceCards=[]}});return}if("ontouchstart" in window){for(const b of buttons)if(dist(p,b)<b.r){if(b.id==="attack")attack();if(b.id==="interact")interact();if(b.id==="crouch"){touch.crouch=!touch.crouch;if(touch.crouch)touch.sprint=false}if(b.id==="sprint"){touch.sprint=!touch.sprint;if(touch.sprint)touch.crouch=false}return}if(dist(p,joy)<joy.r+30){touch.active=true;touch.id=e.pointerId;setJoy(p);return}}attack()});
canvas.addEventListener("pointermove",e=>{if(touch.active&&e.pointerId===touch.id)setJoy(pos(e))});
canvas.addEventListener("pointerup",e=>{if(touch.active&&e.pointerId===touch.id){touch.active=false;touch.id=null;touch.mx=touch.my=0}});
function setJoy(p){let dx=p.x-joy.x,dy=p.y-joy.y,d=Math.hypot(dx,dy);if(d>52){dx=dx/d*52;dy=dy/d*52}touch.mx=Math.abs(dx/52)<.1?0:dx/52;touch.my=Math.abs(dy/52)<.1?0:dy/52}
addEventListener("keydown",e=>{keys.add(e.code);if(e.code==="Space"){e.preventDefault();attack()}if(e.code==="KeyE")interact();if(e.code==="KeyT")elapsed=Math.max(elapsed,PREP);if(e.code==="Digit1"&&upgradeOpen){applyUpgrade(choiceCards[0][0]);upgradeOpen=false;choiceCards=[]}if(e.code==="Digit2"&&upgradeOpen){applyUpgrade(choiceCards[1][0]);upgradeOpen=false;choiceCards=[]}if(e.code==="Digit3"&&upgradeOpen){applyUpgrade(choiceCards[2][0]);upgradeOpen=false;choiceCards=[]}if(e.code==="KeyR")location.reload()});
addEventListener("keyup",e=>keys.delete(e.code));

function loop(t){const dt=Math.min(.033,(t-last)/1000);last=t;update(dt);draw()}
loading.remove();requestAnimationFrame(loop);
})();