const ADMIN=document.body.dataset.mode==='admin';
const KEY='pdk-cup-admin-v2';
const colors=[['#edf0e2','#7b8a4b'],['#e7edf9','#738cb6'],['#f5e9df','#bd8d63'],['#eee8f5','#a187b3']];
const fresh=()=>({teams:Array.from({length:4},(_,i)=>({name:`${'ABCD'[i]}队`,members:Array(6).fill('')})),draw:[0,1,2,3],wins:[null,null],finals:[null,null],input:''});
let state=fresh();
function validate(v){
 if(!v||!Array.isArray(v.teams)||v.teams.length!==4)throw Error('需要四支队伍');
 const names=[],players=[];
 for(const t of v.teams){if(typeof t.name!=='string'||!t.name.trim()||t.name.length>24||!Array.isArray(t.members)||t.members.length!==6)throw Error('队伍格式不正确');names.push(t.name.trim());for(const m of t.members){if(typeof m!=='string'||m.length>30)throw Error('选手格式不正确');if(m.trim())players.push(m.trim());}}
 if(new Set(names).size!==4||new Set(players).size!==players.length)throw Error('队名或选手重复');
 if(!Array.isArray(v.draw)||v.draw.length!==4||new Set(v.draw).size!==4||!v.draw.every(x=>Number.isInteger(x)&&x>=0&&x<4))throw Error('抽签顺序无效');
 if(!Array.isArray(v.wins)||v.wins.length!==2||!Array.isArray(v.finals)||v.finals.length!==2)throw Error('比赛结果格式不正确');
 v.wins.forEach((w,i)=>{if(w!==null&&!v.draw.slice(i*2,i*2+2).includes(w))throw Error('首轮胜者无效')});
 const ready=v.wins.every(w=>w!==null),losers=v.draw.filter(n=>!v.wins.includes(n));
 v.finals.forEach((w,i)=>{if(w!==null&&(!ready||!(i?losers:v.wins).includes(w)))throw Error('决赛胜者无效')});
 return {teams:v.teams.map(t=>({name:t.name.trim(),members:t.members.map(m=>m.trim())})),draw:[...v.draw],wins:[...v.wins],finals:[...v.finals],input:typeof v.input==='string'?v.input.slice(0,2000):'',updatedAt:typeof v.updatedAt==='string'&&!isNaN(Date.parse(v.updatedAt))?v.updatedAt:null};
}
if(ADMIN)try{const stored=localStorage.getItem(KEY);if(stored)state=validate(JSON.parse(stored))}catch{}
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let toastTimer,editing=0;function toast(s){$('#toast').textContent=s;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2800)}
function save(){if(!ADMIN)return;try{localStorage.setItem(KEY,JSON.stringify(state));$('#saved').textContent='已保存到当前浏览器';}catch{$('#saved').textContent='无法自动保存，请勿关闭页面';toast('浏览器存储不可用，当前修改仅保留在此页面');}}
function parse(s){return s.split(/[\n,，;；]+/).map(x=>x.trim()).filter(Boolean)}
function duplicate(names){return names.find((n,i)=>names.indexOf(n)!==i)}
function randomInt(n){let a=new Uint32Array(1),limit=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=limit);return a[0]%n}
function shuffle(list){let a=[...list];for(let i=a.length-1;i>0;i--){let j=randomInt(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function resetResults(){state.wins=[null,null];state.finals=[null,null]}
function badge(i,mini=false){return `<span class="${mini?'mini':'team-badge'}" style="--tint:${colors[i][0]};--tone:${colors[i][1]}">${'ABCD'[i]}</span>`}
function render(){let count=state.teams.reduce((s,t)=>s+t.members.filter(Boolean).length,0);$('#total').textContent=String(count).padStart(2,'0');$('#teams').innerHTML=state.teams.map((t,i)=>`<button class="team-card" data-team="${i}" aria-label="编辑${esc(t.name)}"><div class="team-top">${badge(i)}<div><div class="team-title">${esc(t.name)}</div><div class="team-meta">TEAM ${'ABCD'[i]} · ${t.members.filter(Boolean).length} / 6 人</div></div><span class="edit-icon">↗</span></div><div class="roster">${t.members.map((n,j)=>`<div class="slot ${n?'':'empty'}"><i>${j+1}</i><span>${esc(n||'等待加入')}</span></div>`).join('')}</div></button>`).join('');renderBracket();if(!ADMIN)readonly()}
function finalistPairs(){return [state.wins.map((w,i)=>state.draw.slice(i*2,i*2+2).includes(w)?w:null),state.wins.map((w,i)=>state.draw.slice(i*2,i*2+2).includes(w)?state.draw.slice(i*2,i*2+2).find(t=>t!==w):null)]}
function match(ids,title,kind,index,hints){let selected=kind==='semi'?state.wins[index]:state.finals[index];return `<div class="match"><div class="match-heading"><span>${title}</span><span>${kind==='semi'?'首轮':'决赛'}</span></div>${ids.map((id,j)=>`<div class="match-row">${id===null?`<span class="mini">—</span><span class="pending">${hints[j]}</span>`:`${badge(id,true)}<button class="match-team" data-team="${id}">${esc(state.teams[id].name)}</button>`}</div>`).join('')}<select aria-label="${title}胜者" data-result="${kind}" data-index="${index}" ${ids.includes(null)?'disabled':''}><option value="">选择本场胜者</option>${ids.filter(id=>id!==null).map(id=>`<option value="${id}" ${selected===id?'selected':''}>${esc(state.teams[id].name)} 获胜</option>`).join('')}</select></div>`}
function renderBracket(){for(let i=0;i<2;i++)$('#semi'+i).innerHTML=match(state.draw.slice(i*2,i*2+2),`首轮 · 第 ${i+1} 场`,'semi',i,[]);const p=finalistPairs();p.forEach((ids,i)=>$('#final'+i).innerHTML=match(ids,i===0?'冠亚军决赛':'季军决赛','final',i,[`首轮第 1 场${i?'败':'胜'}者`,`首轮第 2 场${i?'败':'胜'}者`]));let c=state.finals[0],b=state.finals[1];$('#champ-name').textContent=c!==null?'冠军 · '+state.teams[c].name:'冠军 · 待决出';$('#runner-name').textContent=c!==null?'亚军 · '+state.teams[p[0].find(x=>x!==c)].name:'亚军 · 待决出';$('#bronze-name').textContent=b!==null?'季军 · '+state.teams[b].name:'季军 · 待决出'}
function page(name){name=name==='rules'?'rules':'registration';document.querySelectorAll('.page').forEach(p=>p.hidden=p.id!==name);document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===name));$('#breadcrumb').textContent=name==='rules'?'赛事介绍':'报名与赛程';if(location.hash!=='#'+name)history.replaceState(null,'','#'+name)}
document.addEventListener('click',e=>{const nav=e.target.closest('[data-page]');if(nav)page(nav.dataset.page);const team=e.target.closest('[data-team]');if(team)openTeam(Number(team.dataset.team))});window.addEventListener('hashchange',()=>page(location.hash.slice(1)));
function openTeam(i){if(!ADMIN)return;editing=i;let t=state.teams[i];$('#team-name').value=t.name;$('#team-error').textContent='';$('#member-inputs').innerHTML=t.members.map((m,j)=>`<label>选手 ${String(j+1).padStart(2,'0')}<input name="member${j}" value="${esc(m)}" maxlength="30" placeholder="等待加入" aria-label="选手${j+1}"></label>`).join('');$('#team-dialog').showModal()}
$('#close-dialog').onclick=()=>$('#team-dialog').close();$('#team-dialog').addEventListener('click',e=>{if(e.target===$('#team-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}});
$('#team-form').onsubmit=e=>{e.preventDefault();if(!ADMIN)return;let name=$('#team-name').value.trim(),members=[...document.querySelectorAll('#member-inputs input')].map(x=>x.value.trim());let others=state.teams.flatMap((t,i)=>i===editing?[]:t.members).filter(Boolean),dup=duplicate([...others,...members.filter(Boolean)]);if(!name){$('#team-error').textContent='请输入队伍名称';return}if(state.teams.some((t,i)=>i!==editing&&t.name===name)){$('#team-error').textContent='队伍名称已存在，请换一个名称';return}if(dup){$('#team-error').textContent=`选手「${dup}」重复，请使用不同昵称`;return}if(members.some((m,i)=>m!==state.teams[editing].members[i])){if(state.wins.some(x=>x!==null)&&!confirm('更改队员会清除已记录的比赛结果，是否继续？'))return;resetResults()}state.teams[editing]={name,members};save();render();$('#team-dialog').close();toast('队伍已保存')};
$('#players').value=state.input||'';function updateCount(){$('#input-count').textContent=parse($('#players').value).length+' / 24'}updateCount();$('#players').addEventListener('input',()=>{state.input=$('#players').value;updateCount();$('#form-error').textContent='';save()});
$('#distribute').onclick=()=>{if(!ADMIN)return;const names=parse($('#players').value),err=$('#form-error');err.textContent='';if(!names.length){err.textContent='请先输入参赛选手';return}if(names.length>24){err.textContent=`当前有 ${names.length} 人，最多支持 24 人`;return}if(names.some(x=>x.length>30)){err.textContent='每位选手的昵称请控制在 30 个字符以内';return}let dup=duplicate(names);if(dup){err.textContent=`选手「${dup}」重复，请修改后重试`;return}if(state.teams.some(t=>t.members.some(Boolean))&&!confirm('随机分队会替换当前四队的队员并清除比赛结果，是否继续？'))return;state.teams.forEach(t=>t.members=Array(6).fill(''));const teamOrder=shuffle([0,1,2,3]);shuffle(names).forEach((n,i)=>state.teams[teamOrder[i%4]].members[Math.floor(i/4)]=n);resetResults();save();render();toast(`已将 ${names.length} 位选手随机分入四队`)};
$('#draw').onclick=()=>{if(!ADMIN)return;if(state.wins.some(x=>x!==null)&&!confirm('重新抽签将清除比赛结果，是否继续？'))return;state.draw=shuffle([0,1,2,3]);resetResults();save();render();toast('对阵抽签完成')};
document.addEventListener('change',e=>{if(!ADMIN||!e.target.matches('[data-result]'))return;const index=Number(e.target.dataset.index),value=e.target.value===''?null:Number(e.target.value);if(e.target.dataset.result==='semi'){state.wins[index]=value;state.finals=[null,null]}else state.finals[index]=value;save();renderBracket();if(!ADMIN)readonly()});
function readonly(){
 document.querySelectorAll('[data-team]').forEach(b=>{b.removeAttribute('data-team');b.removeAttribute('aria-label');b.tabIndex=-1;b.style.cursor='default'});
 document.querySelectorAll('[data-result]').forEach(s=>{const p=document.createElement('p');p.className='result-text';p.textContent=s.value?s.options[s.selectedIndex].textContent:'等待比赛结果';s.replaceWith(p)});
}
function showState(){render();if(ADMIN){$('#players').value=state.input;updateCount()}}
function updatedLabel(){return state.updatedAt?'名单更新于 '+new Date(state.updatedAt).toLocaleString('zh-CN',{hour12:false}):'名单待公布'}
async function refreshPublic(){
 const button=$('#refresh-data');button.disabled=true;
 try{const r=await fetch('tournament.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);const next=validate(await r.json());state=next;showState();$('#saved').textContent=updatedLabel();$('#load-status').textContent='已加载主办方发布的名单';}
 catch(e){$('#load-status').textContent='名单加载失败，请稍后点击刷新。'+(state.updatedAt?' 当前保留上次成功读取的名单。':'');}
 finally{button.disabled=false}
}
showState();page(location.hash.slice(1));
if(!ADMIN){
 $('#saved').textContent='正在读取已发布名单';$('#refresh-data').onclick=refreshPublic;refreshPublic();
 setInterval(()=>{if(!document.hidden)refreshPublic()},60000);
}else{
 $('#export-data').onclick=()=>{try{
  state=validate(state);state.updatedAt=new Date().toISOString();save();
  const data={schemaVersion:1,updatedAt:state.updatedAt,teams:state.teams,draw:state.draw,wins:state.wins,finals:state.finals};
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='tournament.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('已导出，请上传到 GitHub 仓库根目录覆盖同名文件');
 }catch(e){toast('导出失败：'+e.message)}};
 $('#import-data').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>100000)throw Error('文件过大');const next=validate(JSON.parse(await file.text()));if(!confirm('导入将替换当前管理器草稿，是否继续？'))return;state=next;save();showState();toast('名单已导入')}catch(err){toast('导入失败：'+err.message)}finally{e.target.value=''}};
}

