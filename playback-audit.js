import {mountSubtitlePlayer} from './subtitle-player.js?v=20261022-click-connect-v2';
export function installPlaybackAudit(container,{api,getCases,isAdmin}){
 const box=document.createElement('section');box.id='oly-playback-audit';
 box.innerHTML='<h3>유튜브 재생 점검</h3><p>각 영상의 불러오기 버튼을 눌러주세요. 실제 재생 시간과 한국어 자막, 장면 이동을 확인합니다. 검사 중에는 소리가 꺼집니다.</p><label>사례 ID (비우면 전체)<input id="oly-audit-ids" placeholder="OLY-067"></label><button id="oly-audit-start">점검 시작</button><button id="oly-audit-stop" disabled>중지</button><button id="oly-audit-save" disabled>결과 저장</button><p id="oly-audit-status" role="status">준비</p><div id="oly-audit-player"></div><pre id="oly-audit-results" style="white-space:pre-wrap;font-size:12px"></pre>';
 container.prepend(box);const $=s=>box.querySelector(s);let stopped=false,results=[],instance;
 $('#oly-audit-stop').onclick=()=>{stopped=true;$('#oly-audit-status').textContent='현재 검사 후 중지합니다.';};
 $('#oly-audit-save').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({checkedAt:new Date().toISOString(),results},null,2)],{type:'application/json'}));a.download='olylink-youtube-playback-audit.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
 $('#oly-audit-start').onclick=async()=>{
  if(!isAdmin())return;stopped=false;results=[];$('#oly-audit-start').disabled=true;$('#oly-audit-stop').disabled=false;
  const catalog=container.querySelector('#ul-experience-list');if(catalog)catalog.hidden=true;
  const filter=new Set($('#oly-audit-ids').value.split(/[\s,]+/).filter(Boolean));
  try{for(const row of getCases()){
   if(stopped||!isAdmin())break;if(filter.size&&!filter.has(row.id))continue;
   if(!/(?:youtube\.com|youtu\.be)/.test(row.video_url||''))continue;
   $('#oly-audit-status').textContent=row.id+' 검사 중 · 완료 '+results.length+'건';
   let result;try{const data=await api('/api/experiences/'+row.id+'/subtitles');result=await check(data);}catch(error){result={id:row.id,passed:false,error:error.message};}
   results.push(result);$('#oly-audit-results').textContent=results.map(x=>JSON.stringify(x)).join('\n');$('#oly-audit-save').disabled=false;
  }}finally{instance?.destroy();if(catalog)catalog.hidden=false;$('#oly-audit-start').disabled=false;$('#oly-audit-stop').disabled=true;$('#oly-audit-status').textContent=(stopped?'중지':'완료')+' · '+results.length+'건 · 통과 '+results.filter(x=>x.passed).length+'건 · 확인 필요 '+results.filter(x=>!x.passed).length+'건';}
 };
 function check(data){return new Promise(resolve=>{
  const host=$('#oly-audit-player');host.replaceChildren();host.scrollIntoView({block:'start'});let timer,phase=0,anchor,played=false,initialCue,samples=[],finished=false,handler;
  const cues=data.cues.filter(c=>c.end-c.start>1),first=cues[0]||data.cues[0],second=cues.find(c=>c.id!==first.id)||first;
  const finish=(passed,error)=>{if(finished)return;finished=true;clearTimeout(timer);if(handler)removeEventListener('message',handler);instance?.destroy();resolve({id:data.caseId,passed,source:data.mediaUrl?'private-media':'youtube',phases:phase,samples,error});};
  const timeout=()=>{clearTimeout(timer);timer=setTimeout(()=>finish(false,'재생 시간/자막 응답 없음'),45000);};
  const progress=p=>{
   if(finished)return;if(p.state==='playing')played=true;
   if(!played||!/[가-힣]/.test(p.caption||''))return;
   if(anchor===undefined){anchor=p.seconds;initialCue=p.cueId;}
   if(p.seconds-anchor<.7)return;
   samples.push({seconds:p.seconds,cue:p.cueId,caption:p.caption,state:p.state});
   if(phase===0){phase=1;anchor=undefined;played=false;instance.seek(second.start+.1);instance.play();timeout();}
   else finish(true);
  };
  const ready=()=>{setTimeout(async()=>{if(finished)return;await instance.seek(first.start+.1);await instance.play();timeout();},750);};
  instance=mountSubtitlePlayer(host,data,{muted:true,onReady:()=>queueMicrotask(ready),onError:e=>finish(false,e.message),onProgress:progress});
  const connect=instance.element.querySelector('.os-connect');if(connect)connect.addEventListener('click',timeout,{once:true});else timeout();
 });}
}
