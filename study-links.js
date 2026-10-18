import {validEntry,selectEntries,categoryCounts,shareUrl} from './study-links-core.js?v=1';
const $=s=>document.querySelector(s);let entries=[],category='',query='',collection='',timer;
const pool=()=>collection?entries.filter(x=>x.collection===collection):entries;
let backend,loadVersion=0;
const node=(tag,text,cls)=>{const el=document.createElement(tag);if(text)el.textContent=text;if(cls)el.className=cls;return el;};
function notify(message){$('#notice').textContent=message;clearTimeout(timer);timer=setTimeout(()=>$('#notice').textContent='',3200);}
async function copy(value){try{await navigator.clipboard.writeText(value);notify('주소를 복사했습니다.');}catch{const a=node('textarea');a.value=value;document.body.append(a);a.select();const ok=document.execCommand('copy');a.remove();notify(ok?'주소를 복사했습니다.':'주소창의 링크를 복사해주세요.');}}
function readLocation(){const p=new URL(location.href).searchParams;collection=p.get('collection')||'';if(collection&&!entries.some(x=>x.collection===collection))collection='';category=p.get('category')||'';query=p.get('q')||'';if(category&&!categoryCounts(pool()).some(([c])=>c===category))category='';$('#search').value=query;}
function render(){
 const counts=categoryCounts(pool()),nav=$('#categories');nav.replaceChildren();
 for(const [c,n] of [['',pool().length],...counts]){const b=node('button',c||'전체');b.type='button';b.setAttribute('aria-pressed',String(c===category));b.append(node('span',String(n),'number'));b.onclick=()=>{category=c;update()};nav.append(b);}
 const list=selectEntries(pool(),category,query);$('#selected-title').textContent=category||(collection?'보내주신 영상':'전체 영상');$('#count').textContent=list.length+'개 영상';$('#clear').hidden=!query;
 $('#list').replaceChildren();for(const x of list){const article=node('article',null,'card'),tags=node('div',null,'tags');for(const c of x.categories)tags.append(node('span',c,'tag'));article.append(tags,node('p','원 게시자 제목','title-label'),node('h3',x.title),node('p',x.channel,'channel'),node('p','한국어 번역 자막 항목 확인','caption'));
 if(x.titleKo){const translation=node('section',null,'translation');translation.append(node('p','한국어 제목 번역','translation-label'),node('h4',x.titleKo),node('p',x.descriptionSummaryKo,'translation-summary'),node('p','게시자 설명을 바탕으로 정리한 요약입니다. 영상 전체의 발언 번역은 아닙니다.','translation-source'));article.append(translation);}
 const actions=node('div',null,'card-actions'),a=node('a','원본 영상 보기 ↗','open');a.href=x.url;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label',x.title+' 원본 영상 보기');const b=node('button','링크 복사','copy');b.type='button';b.onclick=()=>copy(x.url);actions.append(a,b);article.append(actions);$('#list').append(article);}
 if(!list.length){const empty=node('div',null,'empty');empty.append(node('p','조건에 맞는 영상이 없습니다.'));const reset=node('button','전체 영상 보기','reset');reset.onclick=()=>{category='';query='';$('#search').value='';update()};empty.append(reset);$('#list').append(empty);}
}
function update(){history.replaceState(null,'',shareUrl(location.href,category,query,collection));render();}
$('#search').addEventListener('input',e=>{query=e.target.value;update()});$('#clear').onclick=()=>{query='';$('#search').value='';update();$('#search').focus()};
$('#share').onclick=async()=>{const url=shareUrl(location.href,category,query,collection);if(navigator.share){try{await navigator.share({title:'원본영상 자료실'+(category?' · '+category:''),url});return;}catch(e){if(e.name==='AbortError')return;}}await copy(url)};
window.addEventListener('popstate',()=>{if(entries.length){readLocation();render()}});
function clearPrivateContent(){entries=[];$('#list').replaceChildren();$('#categories').replaceChildren();$('#study-members').replaceChildren();$('#study-content').hidden=true;$('#study-admin').hidden=true;$('#share').hidden=true;}
async function renderMembers(version=loadVersion){const members=await backend.members();if(version!==loadVersion)return;const list=$('#study-members');list.replaceChildren();for(const member of members.filter(x=>x.active)){const li=node('li'),email=node('span',member.email),remove=node('button','초대 해제');remove.type='button';remove.onclick=async()=>{remove.disabled=true;try{await backend.revoke(member.email);if(version!==loadVersion)return;await renderMembers(version);$('#invite-notice').textContent='초대를 해제했습니다.';}catch{$('#invite-notice').textContent='초대를 해제하지 못했습니다.';}finally{remove.disabled=false}};li.append(email,remove);list.append(li);}if(!list.childElementCount)list.append(node('li','등록된 초대 계정이 없습니다.'));}
async function load(){const version=++loadVersion;clearPrivateContent();try{
 backend??=await window.olyStudyReady;if(!backend)throw Error('연결 설정을 확인해주세요.');const status=await backend.status();if(version!==loadVersion)return;
 $('#study-logout').hidden=!status.signedIn;$('#auth-panel').hidden=status.signedIn;$('#study-denied').hidden=!status.signedIn||status.allowed;
 if(!status.allowed)return;
 const rows=await backend.list();if(version!==loadVersion)return;
 entries=[...new Map(rows.filter(validEntry).map(x=>[x.id,x])).values()];$('#checked').textContent=rows.map(x=>x.checkedDate).sort().at(-1)||'—';readLocation();render();$('#study-content').hidden=false;$('#share').hidden=false;$('#study-admin').hidden=!status.admin;if(status.admin)await renderMembers(version);
 }catch{if(version!==loadVersion)return;clearPrivateContent();$('#auth-panel').hidden=false;$('#auth-message').textContent='접속 상태를 확인하지 못했습니다. 잠시 후 다시 로그인해주세요.';}}
$('#study-login').onsubmit=async e=>{e.preventDefault();const button=e.target.querySelector('button');button.disabled=true;$('#auth-message').textContent='';try{backend??=await window.olyStudyReady;await backend.signIn(e.target.elements.email.value,e.target.elements.password.value);e.target.reset();await load();}catch{$('#auth-message').textContent='로그인하지 못했습니다. 계정과 비밀번호를 확인해주세요.';}finally{button.disabled=false}};
$('#study-google').onclick=async()=>{const b=$('#study-google');b.disabled=true;try{backend??=await window.olyStudyReady;await backend.googleSignIn();}catch{$('#auth-message').textContent='Google 로그인을 시작하지 못했습니다. 다시 시도해주세요.';b.disabled=false}};
$('#study-logout').onclick=async()=>{++loadVersion;clearPrivateContent();try{await backend.signOut();}finally{await load();}};
$('#study-invite').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('button');b.disabled=true;try{await backend.invite($('#invite-email').value);$('#invite-email').value='';await renderMembers();$('#invite-notice').textContent='초대를 등록했습니다. 자료실 주소를 해당 사용자에게 전달해주세요.';}catch{$('#invite-notice').textContent='초대를 등록하지 못했습니다. 이메일과 관리자 권한을 확인해주세요.';}finally{b.disabled=false}};
const loginError=sessionStorage.getItem('olylink-study-error');if(loginError){sessionStorage.removeItem('olylink-study-error');$('#auth-message').textContent=loginError;}
await load();if(backend)backend.onSignedOut(()=>{++loadVersion;clearPrivateContent();$('#auth-panel').hidden=false;$('#study-denied').hidden=true;$('#study-logout').hidden=true;});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)load();});
