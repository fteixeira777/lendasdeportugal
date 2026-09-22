/* Shared, testable game rules. No device APIs or UI dependencies. */
(function(root){
  const radians=n=>n*Math.PI/180;
  function distance(a,b){const p=radians(b.lat-a.lat),l=radians(b.lng-a.lng),h=Math.sin(p/2)**2+Math.cos(radians(a.lat))*Math.cos(radians(b.lat))*Math.sin(l/2)**2;return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));}
  function bearing(a,b){const l=radians(b.lng-a.lng),x=Math.sin(l)*Math.cos(radians(b.lat)),y=Math.cos(radians(a.lat))*Math.sin(radians(b.lat))-Math.sin(radians(a.lat))*Math.cos(radians(b.lat))*Math.cos(l);return (Math.atan2(x,y)*180/Math.PI+360)%360;}
  function validFix(p,now=Date.now()){return !!p&&Number.isFinite(p.lat)&&Math.abs(p.lat)<=90&&Number.isFinite(p.lng)&&Math.abs(p.lng)<=180&&Number.isFinite(p.accuracy)&&p.accuracy>=0&&Number.isFinite(p.time)&&now-p.time>=-5000&&now-p.time<=15000;}
  function eligible(mode,p,q,now=Date.now()){return !!p&&(mode==='demo'||(validFix(p,now)&&p.accuracy<=35))&&distance(p,q)<=q.radius;}
  function restore(raw,quests){try{const s=JSON.parse(raw),ids=new Set(quests.map(q=>q.id));return {found:[...new Set(Array.isArray(s.found)?s.found:[])].filter(x=>ids.has(x))};}catch{return {found:[]};}}
  function award(state,q,answer,canCollect){if(!canCollect||answer!==q.answer||state.found.includes(q.id))return false;state.found.push(q.id);return true;}
  function tokens(state,quests){return quests.filter(q=>state.found.includes(q.id)).reduce((n,q)=>n+q.tokens,0);}
  const api={distance,bearing,validFix,eligible,restore,award,tokens};
  if(typeof module!=='undefined')module.exports=api;else root.GameRules=api;
})(typeof window==='undefined'?globalThis:window);
