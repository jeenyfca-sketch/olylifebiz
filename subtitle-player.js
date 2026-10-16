import {validateSubtitle,embedSource,checkedMediaUrl,activeSubtitle,subtitleClock} from './subtitle-data.js';

const loaders=new Map();
function script(url,ready){
  if(ready())return Promise.resolve();
  if(loaders.has(url))return loaders.get(url);
  const promise=new Promise((resolve,reject)=>{
    const element=document.createElement('script');element.src=url;element.async=true;
    let attempts=0;
    const timer=setInterval(()=>{if(ready()){clearInterval(timer);resolve();}else if(++attempts>=100){clearInterval(timer);reject(new Error('Video provider did not respond'));}},100);
    element.onerror=()=>{clearInterval(timer);reject(new Error('Video provider unavailable'));};
    document.head.append(element);
  }).catch(error=>{loaders.delete(url);throw error;});
  loaders.set(url,promise);return promise;
}
function node(tag,className,text){const result=document.createElement(tag);if(className)result.className=className;if(text!==undefined)result.textContent=text;return result;}

export function mountSubtitlePlayer(container,input,options={}){
  const data=validateSubtitle(input);
  if(!document.querySelector('link[data-oly-subtitle-style]')){const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('./subtitle-player.css',import.meta.url).href;style.dataset.olySubtitleStyle='';document.head.append(style);}
  let disposed=false,adapter=null,poll=null,played=false,current=data.start,active=null;
  const wrapper=node('section','oly-subtitles');wrapper.setAttribute('aria-label','한국어 자막 영상');
  const heading=node('h2','os-title',data.title);
  const viewer=node('div','os-viewer');
  const bar=node('div','os-bar'),badge=node('span','','한국어 자막'),expand=node('button','','크게 보기');expand.type='button';expand.setAttribute('aria-expanded','false');bar.append(badge,expand);
  const frame=node('div','os-frame');
  const captions=node('div','os-captions'),ko=node('p','os-ko','재생 버튼을 누르면 한국어 자막이 나옵니다.'),original=node('p','os-original'),uncertain=node('small','os-uncertain');
  original.hidden=true;uncertain.hidden=true;captions.setAttribute('role','region');captions.setAttribute('aria-label','한국어 자막');captions.append(ko,original,uncertain);
  const controls=node('div','os-controls'),label=node('label','','자막 '),mode=node('select');mode.setAttribute('aria-label','자막 표시 언어');
  for(const[value,text]of [['ko','한국어'],['both','한국어 + 원문'],['off','끄기']]){const option=node('option','',text);option.value=value;mode.append(option);}label.append(mode);
  const clock=node('output','os-clock',subtitleClock(data.start));clock.setAttribute('aria-label','영상 재생 시간');controls.append(label,clock);
  viewer.append(bar,frame,captions,controls);
  const status=node('p','os-status','영상을 불러오고 있습니다.');status.setAttribute('role','status');
  const scope=node('p','os-scope',data.scope==='case-segment'?`해당 사례 구간 · ${subtitleClock(data.start)}–${subtitleClock(data.end)}`:'');scope.hidden=data.scope!=='case-segment';
  const details=node('details','os-transcript'),summary=node('summary','','한국어 전체 대본 · 문장을 누르면 장면 이동'),list=node('ol');details.append(summary,list);
  const rows=new Map();
  for(const cue of data.cues){const li=node('li'),button=node('button'),time=node('time','',subtitleClock(cue.start)),text=node('span','',cue.ko.replaceAll('\n',' '));button.type='button';button.disabled=true;button.append(time,text);button.addEventListener('click',async()=>{if(!adapter||disposed)return;try{await adapter.seek(cue.start+.01);if(disposed)return;await adapter.play();}catch{message('영상 재생 버튼을 누른 뒤 다시 선택해주세요.',true);}});li.append(button);list.append(li);rows.set(cue.id,{li,button});}
  const note=node('p','os-note',data.method==='provided-korean-caption-edited'?'제공된 한국어 자동자막을 다듬었습니다.':'원문 자막·음성전사에 기반한 번역입니다. 영상 속 개인의 발언을 옮겼으며 내용의 독립 검증은 아닙니다.');
  const sourceLink=node('a','os-source','원본 영상 보기 ↗');sourceLink.href=data.watchUrl;sourceLink.target='_blank';sourceLink.rel='noopener noreferrer';
  wrapper.append(heading,viewer,status,scope,details,sourceLink,note);container.replaceChildren(wrapper);
  function message(text,error=false){if(disposed)return;status.textContent=text;status.dataset.error=String(error);}
  function expanded(value){viewer.classList.toggle('os-expanded',value);expand.textContent=value?'작게 보기':'크게 보기';expand.setAttribute('aria-expanded',String(value));}
  const key=event=>{if(event.key==='Escape')expanded(false);};document.addEventListener('keydown',key);
  expand.addEventListener('click',()=>expanded(!viewer.classList.contains('os-expanded')));
  function render(seconds){
    if(disposed)return;current=seconds;const cue=activeSubtitle(data.cues,seconds),selected=mode.value;
    ko.textContent=selected==='off'?'자막 꺼짐':cue?.ko||(played?'\u00a0':'재생 버튼을 누르면 한국어 자막이 나옵니다.');
    original.textContent=cue?.original||'';original.hidden=selected!=='both'||!cue;
    const caution=data.cautions?.find(item=>item.cue===cue?.id&&item.reason!=='fast-caption');
    uncertain.hidden=!caution||selected==='off';uncertain.textContent=caution?'원문 일부 인식 불명확':'';uncertain.title=caution?.reason||'';
    clock.textContent=subtitleClock(seconds);ko.dataset.cue=String(cue?.id||'');
    if(active!==(cue?.id??null)){rows.get(active)?.li.removeAttribute('aria-current');active=cue?.id??null;if(active!==null)rows.get(active)?.li.setAttribute('aria-current','true');}
    if(played&&seconds>=data.end-.02){adapter?.pause();message('해당 사례 구간이 끝났습니다. 대본을 눌러 다시 볼 수 있습니다.');}
  }
  mode.addEventListener('change',()=>render(current));
  function ready(){if(disposed)return;for(const row of rows.values())row.button.disabled=false;message('재생 버튼을 누르면 영상 아래에 한국어 자막이 나옵니다.');options.onReady?.(data.caseId);}
  function error(text){message(text,true);details.open=true;options.onError?.({caseId:data.caseId,message:text});}
  const promise=(async()=>{
    try{
      if(data.platform==='Telegram'){
        const video=node('video');video.controls=true;video.playsInline=true;video.preload='metadata';video.setAttribute('controlslist','nofullscreen noremoteplayback');video.disablePictureInPicture=true;
        video.src=checkedMediaUrl(options.mediaUrl||data.mediaUrl,data.caseId,location.origin);frame.append(video);
        adapter={seek:async seconds=>{video.currentTime=seconds;},play:()=>video.play(),pause:()=>video.pause(),destroy:()=>{video.pause();video.removeAttribute('src');video.load();}};
        video.addEventListener('loadedmetadata',()=>{if(disposed)return;video.currentTime=Math.min(data.start,video.duration);ready();});
        video.addEventListener('timeupdate',()=>render(video.currentTime));video.addEventListener('seeking',()=>render(video.currentTime));
        video.addEventListener('play',()=>{played=true;});video.addEventListener('error',()=>error('영상을 불러오지 못했습니다. 잠시 후 다시 열어주세요.'));
        return;
      }
      const iframe=node('iframe');iframe.title=data.title+' 원본 영상';iframe.allow='autoplay; encrypted-media; picture-in-picture';iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.src=embedSource(data,location.origin);frame.append(iframe);
      if(data.platform==='Vimeo'){
        await script('https://player.vimeo.com/api/player.js',()=>!!window.Vimeo?.Player);if(disposed)return;
        const player=new window.Vimeo.Player(iframe);adapter={seek:async seconds=>{const actual=await player.setCurrentTime(seconds);render(actual);},play:()=>player.play(),pause:()=>{player.pause().catch(()=>{});},destroy:()=>{player.destroy().catch(()=>{});}};
        player.on('timeupdate',event=>render(event.seconds));player.on('seeked',event=>render(event.seconds));player.on('play',()=>{played=true;});player.on('error',()=>error('원본 영상이 재생되지 않습니다. 원본 링크와 대본을 확인해주세요.'));
        await Promise.race([player.ready(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Vimeo timeout')),15000))]);if(!disposed){ready();let reading=false;poll=setInterval(async()=>{if(disposed||reading)return;reading=true;try{render(await player.getCurrentTime());}catch{}finally{reading=false;}},350);}
      }else{
        if(!window.onYouTubeIframeAPIReady)window.onYouTubeIframeAPIReady=()=>{};
        await script('https://www.youtube.com/iframe_api',()=>!!window.YT?.Player);if(disposed)return;
        const player=new window.YT.Player(iframe,{events:{onReady:()=>{if(disposed)return;ready();poll=setInterval(()=>{if(!disposed&&typeof player.getCurrentTime==='function')render(player.getCurrentTime());},250);},onStateChange:event=>{if(event.data===1)played=true;},onError:event=>error('유튜브에서 재생을 허용하지 않았습니다 ('+event.data+'). 원본 링크와 대본을 확인해주세요.')}});
        adapter={seek:async seconds=>{player.seekTo(seconds,true);},play:async()=>{player.playVideo();},pause:()=>player.pauseVideo?.(),destroy:()=>player.destroy()};
      }
    }catch{if(!disposed)error('영상 연결을 확인하지 못했습니다. 원본 링크와 전체 대본을 이용해주세요.');}
  })();
  return {ready:promise,destroy(){if(disposed)return;disposed=true;if(poll)clearInterval(poll);document.removeEventListener('keydown',key);try{adapter?.destroy();}finally{container.replaceChildren();}},element:wrapper};
}
