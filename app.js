'use strict';
(() => {
const $=id=>document.getElementById(id), R=GameRules;
const extra=[
 {lat:38.7134,lng:-9.1335,place:'Castelo district',symbol:'⚔',question:'The seal carries a cipher: III · I · IV. Read the Roman numerals to unlock it.',choices:['3 · 1 · 4','2 · 1 · 5','3 · 2 · 4'],answer:0},
 {lat:38.7116,lng:-9.1300,place:'Portas do Sol',symbol:'▱',question:'A note on the scroll reads: “I rise over the river and wake the city.” Which direction does it describe?',choices:['West','East','North'],answer:1},
 {lat:38.7075,lng:-9.1364,place:'Ribeira / riverside',symbol:'✥',question:'The navigator faces north, then makes a quarter-turn clockwise. Where does the compass point?',choices:['South','West','East'],answer:2},
 {lat:38.7102,lng:-9.1354,place:'Old city lanes',symbol:'✡',question:'Two overlapping triangles form the hidden symbol. How many outer points does the star have?',choices:['Five','Six','Eight'],answer:1}
];
const quests=ORIGINAL_QUESTS.map((q,i)=>({...q,...extra[i],radius:40}));
let mode=null, state={found:[]}, active=0, position=null, watch=null, epoch=0, stream=null, cameraEpoch=0;
let storageOK=true, status='Your adventure, at your own pace.', heading=null, orientationListening=false, puzzleQuest=null, walkTimer=null;
const start={lat:38.7117,lng:-9.1385};
let toastTimer;
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),4000);}
function key(){return 'lendas-beta-v2-'+mode;}
function read(){try{state=R.restore(localStorage.getItem(key()),quests);}catch{storageOK=false;state={found:[]};}}
function save(){try{localStorage.setItem(key(),JSON.stringify(state));}catch{storageOK=false;toast('Progress could not be saved. Keep this page open to continue.');}}
function distanceText(q){if(!position)return '—';const d=R.distance(position,q);return d>=1000?(d/1000).toFixed(1)+' km':Math.round(d)+' m';}
function ready(q=quests[active]){return !!mode&&R.eligible(mode,position,q);}
function text(id,value){$(id).textContent=value;}
function setStatus(value){status=value;text('gps-status',value);}
function mapPoint(p){return {x:120+(p.lng+9.1400)/.012*720,y:70+(38.715-p.lat)/.009*430};}
function renderMap(){
 const points=quests.map(mapPoint);
 $('quest-path').setAttribute('d',points.map((p,i)=>(i?'L':'M')+p.x+','+p.y).join(' '));
 $('markers').innerHTML=quests.map((q,i)=>{const p=points[i],done=state.found.includes(q.id),selected=active===i;return `<g transform="translate(${p.x},${p.y})"><circle r="${selected?34:27}" fill="${selected?'#24523f':'#f7f5ee'}" stroke="${selected?'#24523f':'#c6ceb8'}" stroke-width="2" filter="url(#shadow)"/><text text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="26" fill="${selected?'#ead3a0':'#9f7d40'}">${done?'✓':q.symbol}</text><rect x="14" y="-32" width="19" height="19" rx="9.5" fill="#faf8ef" stroke="#d3d8c5"/><text x="23.5" y="-19" text-anchor="middle" font-family="system-ui" font-size="8" fill="#50654b">0${i+1}</text></g>`;}).join('');
 if(position){const p=mapPoint(position),on=p.x>=20&&p.x<=980&&p.y>=20&&p.y<=560;$('player').style.display=on?'':'none';$('player').setAttribute('transform',`translate(${p.x},${p.y}) rotate(${heading||0})`);text('map-help',!on?'You are outside the illustrated Lisbon area':mode==='demo'?'Demo · arrow keys or “Walk toward relic”':'Live GPS · north-up illustration');}else{$('player').style.display='none';text('map-help',mode==='live'?'Waiting for your location…':'Choose demo or live GPS to begin');}
}
function render(){
 const q=quests[active],total=R.tokens(state,quests),done=state.found.includes(q.id),all=state.found.length===quests.length;
 text('mode-label',mode==='demo'?'Demo adventure':mode==='live'?'Live GPS':'Choose a mode');
 text('journal-count',`${state.found.length}/4`);text('nav-points',total);text('reward-total',total);
 $('progress').style.width=(state.found.length/4*100)+'%';text('progress-label',all?'Collection complete!':`${state.found.length} of 4 relics discovered`);
 $('quest-list').innerHTML=quests.map((q,i)=>`<button class="quest-card ${i===active?'selected':''}" data-quest="${i}" aria-pressed="${i===active}"><span class="number">0${i+1}</span><span class="relic-icon">${state.found.includes(q.id)?'✓':q.symbol}</span><h4>${q.name}</h4><span class="card-bottom"><span>${state.found.includes(q.id)?'DISCOVERED':distanceText(q)+' away'}</span><span>✧ ${q.tokens} pts</span></span></button>`).join('');
 text('active-symbol',q.symbol);text('quest-name',all?'The old city knows your name.':q.name);text('quest-desc',all?'All four relics are in your journal. Your Old City Explorer badge is waiting in rewards.':q.desc.replace(/^"|"$/g,''));text('quest-kicker',done?'RELIC DISCOVERED':ready()?'YOU ARE IN DISCOVERY RANGE':'YOUR NEXT DISCOVERY');text('distance',distanceText(q)+' away');text('quest-reward','✧ '+q.tokens+' explorer points');
 text('discover',all?'See your rewards →':done?'Read the story →':ready()?'Solve the clue →':mode?'Get within 40 m':'Begin adventure →');
 $('discover').disabled=!!mode&&!done&&!ready();$('walk-button').hidden=mode!=='demo'||done;
 text('walk-button',walkTimer?'Pause walking':'Walk toward relic →');
 $('compass-button').hidden=mode!=='live'||heading!==null;
 $('camera-button').disabled=!mode;$('retry-gps').hidden=mode!=='live';
 $('journal-list').innerHTML=quests.map((q,i)=>{const found=state.found.includes(q.id);return `<article class="journal-card ${found?'':'locked'}"><span class="eyebrow">${found?'DISCOVERED · +'+q.tokens+' POINTS':'UNDISCOVERED · CHAPTER 0'+(i+1)}</span><h3>${found?q.symbol:'◇'} ${q.name}</h3><p>${found?q.lore:'A story still waiting to be found. Follow the clue and solve its mystery to add this relic to your journal.'}</p><button class="text-btn" data-follow="${i}">${found?'Revisit on map':'Follow this mystery'} →</button></article>`;}).join('');
 $('badge').classList.toggle('earned',all);$('badge').innerHTML=`♜ &nbsp; Old City Explorer <span>${all?'UNLOCKED ✓':state.found.length+' / 4 relics'}</span>`;
 text('storage-status',storageOK?'Progress is saved locally. Clearing browser data removes it.':'Device storage is unavailable; progress lasts only for this session.');
 renderMap();renderCamera();
}
function changeView(view){document.querySelectorAll('.view').forEach(el=>el.hidden=el.id!==view);document.querySelectorAll('.nav').forEach(el=>{el.classList.toggle('active',el.dataset.view===view);el.setAttribute('aria-current',el.dataset.view===view?'page':'false');});text('view-title',view==='journal'?'Keep a little wonder.':view==='rewards'?'Curiosity has its rewards.':'The adventure starts here.');}
function stopWalk(){clearInterval(walkTimer);walkTimer=null;}
async function stopGPS(){const ticket=++epoch;const old=watch;watch=null;if(old){try{if(old.native)await old.plugin.clearWatch({id:old.id});else navigator.geolocation.clearWatch(old.id);}catch{}}return ticket;}
function gpsError(err){const denied=err?.code===1||/denied|permission/i.test(err?.message||'');setStatus(denied?'Location permission denied. Enable it in device/browser settings, then retry.':'Location unavailable. Move outdoors and retry GPS. Demo is available in the mode menu.');render();}
function onFix(raw,ticket){if(ticket!==epoch||mode!=='live'||!raw)return;const c=raw.coords,p={lat:c.latitude,lng:c.longitude,accuracy:c.accuracy,time:raw.timestamp};if(!R.validFix(p)){setStatus('Waiting for a fresh GPS fix…');return;}if(position&&p.time<position.time)return;position=p;if(Number.isFinite(c.heading)&&c.speed>.5)heading=c.heading;setStatus(p.accuracy>35?`GPS ±${Math.round(p.accuracy)} m · too imprecise to collect. Wait in an open area.`:`GPS ±${Math.round(p.accuracy)} m · live position updated`);render();}
async function startGPS(){
 const ticket=await stopGPS();if(ticket!==epoch||mode!=='live'||document.hidden)return;position=null;setStatus('Requesting location… your position stays on this device.');render();
 try{
 const cap=window.Capacitor;
 if(cap?.isNativePlatform?.()){
 const plugin=cap.Plugins?.Geolocation||cap.registerPlugin?.('Geolocation');
 if(!plugin)throw new Error('Native geolocation plugin unavailable');
 const perm=await plugin.requestPermissions();if(ticket!==epoch)return;if(perm.location!=='granted'){gpsError({code:1});return;}
 const id=await plugin.watchPosition({enableHighAccuracy:true,timeout:15000,maximumAge:0},(p,e)=>{if(ticket!==epoch)return;if(e)gpsError(e);else onFix(p,ticket);});
 if(ticket!==epoch){await plugin.clearWatch({id});return;}watch={native:true,id,plugin};
 }else{
 if(!window.isSecureContext||!navigator.geolocation)throw new Error('GPS requires HTTPS or localhost');
 const id=navigator.geolocation.watchPosition(p=>onFix(p,ticket),e=>{if(ticket===epoch)gpsError(e);},{enableHighAccuracy:true,timeout:15000,maximumAge:0});watch={native:false,id};
 }
 }catch(e){if(ticket===epoch){setStatus(e.message==='GPS requires HTTPS or localhost'?e.message:'Could not start GPS. Check location permission, then retry.');render();}}
}
async function chooseMode(next){stopWalk();closeCamera();mode=next;position=null;heading=null;read();active=Math.max(0,quests.findIndex(q=>!state.found.includes(q.id)));$('welcome').close();changeView('explore');if(next==='demo'){await stopGPS();position={...start,accuracy:0,time:Date.now()};setStatus('Demo adventure · simulated movement · progress saved separately');render();}else{render();await startGPS();}}
function openPuzzle(){if(!mode){$('welcome').showModal();return;}const q=quests[active];if(state.found.length===4){changeView('rewards');return;}if(state.found.includes(q.id)){changeView('journal');return;}if(!ready()){toast('Get within 40 m with a fresh, accurate GPS fix first.');return;}stopWalk();puzzleQuest=q;text('puzzle-icon',q.symbol);text('puzzle-title',q.name);text('puzzle-question',q.question);text('puzzle-feedback','');$('puzzle-feedback').className='';$('answers').innerHTML=q.choices.map((answer,i)=>`<button class="secondary" data-answer="${i}">${answer}</button>`).join('');$('puzzle').showModal();render();}
function answer(index){const q=puzzleQuest;if(!q)return;if(!ready(q)){text('puzzle-feedback','Location is no longer in range or is too old. Close this clue and retry GPS.');return;}if(index!==q.answer){text('puzzle-feedback','Not quite. Read the clue once more—you can try again.');return;}if(!R.award(state,q,index,ready(q)))return;save();text('puzzle-question',q.lore);text('puzzle-feedback',`+${q.tokens} explorer points · saved to your journal`);$('puzzle-feedback').className='success';$('answers').innerHTML='<button class="primary wide" id="continue-quest">Continue the adventure →</button>';$('continue-quest').onclick=()=>{$('puzzle').close();const next=quests.findIndex(q=>!state.found.includes(q.id));if(next>=0)active=next;else{changeView('rewards');toast('Collection complete. Old City Explorer unlocked!');}render();};render();}
function move(east,north){if(mode!=='demo'||!position)return;position={...position,lat:position.lat+north/111320,lng:position.lng+east/(111320*Math.cos(position.lat*Math.PI/180)),time:Date.now()};render();}
function walk(){if(walkTimer){stopWalk();render();return;}walkTimer=setInterval(()=>{if(mode!=='demo'||document.hidden){stopWalk();return;}const q=quests[active];if(ready(q)){stopWalk();render();toast('You found the spot. Solve the clue to uncover the relic.');return;}const angle=R.bearing(position,q)*Math.PI/180;move(Math.sin(angle)*6,Math.cos(angle)*6);},100);render();}
function orientation(e){if(mode!=='live')return;if(Number.isFinite(e.webkitCompassHeading))heading=e.webkitCompassHeading;else if(e.absolute&&Number.isFinite(e.alpha))heading=(360-e.alpha)%360;renderMap();renderCamera();$('compass-button').hidden=heading!==null;}
async function enableCompass(){try{if(typeof DeviceOrientationEvent==='undefined'){toast('Compass is unavailable on this device.');return;}if(typeof DeviceOrientationEvent.requestPermission==='function'&&await DeviceOrientationEvent.requestPermission()!=='granted'){toast('Compass permission was not granted.');return;}if(!orientationListening){window.addEventListener('deviceorientation',orientation);window.addEventListener('deviceorientationabsolute',orientation);orientationListening=true;}toast('Compass enabled when the device provides an absolute heading.');}catch{toast('Compass is unavailable. GPS exploration still works.');}}
function renderCamera(){if(!$('camera').open)return;const q=quests[active];text('camera-title',q.name);text('camera-relic',q.symbol);text('camera-status',state.found.includes(q.id)?'Already discovered—find the story in your journal.':`${distanceText(q)} away · ${heading===null?'compass not enabled':Math.round((R.bearing(position||start,q)-heading+360)%360)+'° clockwise from your heading'} · ${ready()?'ready to solve':'get within 40 m to unlock'}`);$('camera-discover').disabled=!ready()||state.found.includes(q.id);}
async function openCamera(){if(!mode)return;stopWalk();$('camera').showModal();renderCamera();const ticket=++cameraEpoch;try{if(!navigator.mediaDevices?.getUserMedia)throw new Error();const media=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});if(ticket!==cameraEpoch||!$('camera').open){media.getTracks().forEach(t=>t.stop());return;}stream=media;$('camera-video').srcObject=media;await $('camera-video').play();}catch{if(ticket===cameraEpoch){text('camera-status','Camera unavailable or permission denied. Close the lens and solve clues from the map.');$('camera-discover').disabled=true;}}}
function closeCamera(){cameraEpoch++;stream?.getTracks().forEach(t=>t.stop());stream=null;$('camera-video').srcObject=null;if($('camera').open)$('camera').close();}
$('camera').addEventListener('close',()=>{cameraEpoch++;stream?.getTracks().forEach(t=>t.stop());stream=null;$('camera-video').srcObject=null;});
$('start-demo').onclick=()=>chooseMode('demo');$('start-live').onclick=()=>chooseMode('live');$('mode-button').onclick=()=>$('welcome').showModal();$('discover').onclick=openPuzzle;$('walk-button').onclick=walk;$('retry-gps').onclick=startGPS;$('compass-button').onclick=enableCompass;$('camera-button').onclick=openCamera;$('camera-discover').onclick=()=>{closeCamera();openPuzzle();};$('center-btn').onclick=()=>toast(position?`Explorer: ${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}. The illustration stays north-up.`:'Choose a mode and wait for a location fix.');
$('quest-list').onclick=e=>{const b=e.target.closest('[data-quest]');if(b){stopWalk();active=+b.dataset.quest;render();}};
$('journal-list').onclick=e=>{const b=e.target.closest('[data-follow]');if(b){active=+b.dataset.follow;changeView('explore');render();}};
$('answers').onclick=e=>{const b=e.target.closest('[data-answer]');if(b)answer(+b.dataset.answer);};
$('settings-button').onclick=()=>{$('settings').showModal();render();};$('change-mode').onclick=()=>{$('settings').close();$('welcome').showModal();};
let resetArmed=false;$('reset-progress').onclick=()=>{if(!mode){toast('Choose a mode first.');return;}if(!resetArmed){resetArmed=true;text('reset-progress','Tap again to erase this mode’s saved relics');setTimeout(()=>{resetArmed=false;text('reset-progress','Reset this mode’s progress');},5000);return;}resetArmed=false;state={found:[]};save();active=0;render();text('reset-progress','Reset this mode’s progress');toast('This mode’s progress has been reset.');};
 document.querySelectorAll('dialog .close').forEach(b=>b.onclick=()=>b.closest('dialog').close());document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>{stopWalk();changeView(b.dataset.view);});document.querySelector('.brand').onclick=e=>{e.preventDefault();changeView('explore');};
 document.addEventListener('keydown',e=>{if(mode!=='demo'||document.querySelector('dialog[open]')||e.ctrlKey||e.metaKey||e.altKey)return;const steps={ArrowUp:[0,5],w:[0,5],ArrowDown:[0,-5],s:[0,-5],ArrowLeft:[-5,0],a:[-5,0],ArrowRight:[5,0],d:[5,0]};if(steps[e.key]){e.preventDefault();stopWalk();move(...steps[e.key]);}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stopWalk();closeCamera();stopGPS();}else if(mode==='live')startGPS();});
 window.addEventListener('pagehide',()=>{stopWalk();closeCamera();stopGPS();});
 setInterval(()=>{if(mode==='live'&&position&&!R.validFix(position)){setStatus('GPS fix is stale. Collection paused until your location updates.');render();}},3000);
 render();$('welcome').showModal();
})();
