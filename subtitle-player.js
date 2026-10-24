import {validateSubtitle,selectSubtitleExcerpt,isNativeSubtitle,embedSource,checkedMediaUrl,activeSubtitle,subtitleClock,sourceWatchUrl} from './subtitle-data.js?v=20261025-private-clip-time';
import {createRutubeAdapter} from './rutube-player.js?v=20261025-rutube-interview';
import {createNativeSubtitleAdapter} from './native-subtitle-adapter.js?v=20261025-private-clip-time';

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
function styles(){if(!document.querySelector('link[data-oly-subtitle-style]')){const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('./subtitle-player.css',import.meta.url).href;style.dataset.olySubtitleStyle='';document.head.append(style);}}
function youtubeApi(){if(!window.onYouTubeIframeAPIReady)window.onYouTubeIframeAPIReady=()=>{};return script('https://www.youtube.com/iframe_api',()=>!!window.YT?.Player);}
function youtubeFrame(frame,source,title){
  const iframe=node('iframe');iframe.title=title+' 원본 영상';iframe.allow='autoplay; encrypted-media; picture-in-picture';iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.loading='eager';iframe.style.width='100%';iframe.style.height='100%';iframe.style.minHeight='200px';
  let finish,timer,settled=false;
  const loaded=new Promise(resolve=>{finish=success=>{if(settled)return;settled=true;clearTimeout(timer);iframe.removeEventListener('load',onload);iframe.removeEventListener('error',onerror);resolve(success);};const onload=()=>finish(true),onerror=()=>finish(false);iframe.addEventListener('load',onload);iframe.addEventListener('error',onerror);timer=setTimeout(()=>finish(false),15000);});
  const initial=new URL(source);initial.searchParams.delete('start');initial.searchParams.delete('end');iframe.src=initial.href;frame.append(iframe);
  return {iframe,source,loaded,cancel:()=>finish(false)};
}
const preparations=new WeakSet();
export function prepareSubtitlePlayer(container,record){
  let watch,id;try{watch=new URL(record.video_url);if(watch.protocol!=='https:'||watch.username||watch.password||watch.port)return null;if(['www.youtube.com','youtube.com','m.youtube.com'].includes(watch.hostname))id=watch.pathname==='/watch'?watch.searchParams.get('v'):watch.pathname.match(/^\/(?:shorts|live)\/([\w-]{11})\/?$/)?.[1];else if(watch.hostname==='youtu.be')id=watch.pathname.slice(1);}catch{return null;}
  const youtube=/^[-\w]{11}$/.test(id||'');
  if(!/^OLY-\d{3}$/.test(record.id)||(!youtube&&!['vimeo.com','www.vimeo.com','t.me','bitchute.com','www.bitchute.com','rutube.ru'].includes(watch.hostname)&&!/^\w[\w-]*\.substack\.com$/.test(watch.hostname)))return null;
  styles();const wrapper=node('section','oly-subtitles'),heading=node('h2','os-title',record.title||'영상'),viewer=node('div','os-viewer'),frame=node('div','os-frame'),notice=node('p','os-status');wrapper.setAttribute('aria-label','한국어 자막 영상');wrapper.setAttribute('aria-busy','true');wrapper.dataset.playbackState='loading';notice.setAttribute('role','status');notice.hidden=true;frame.style.minHeight='200px';viewer.append(frame);wrapper.append(heading,viewer,notice);container.replaceChildren(wrapper);
  let video,api;
  if(youtube){const source=new URL(embedSource({platform:'YouTube',embedUrl:'https://www.youtube.com/embed/'+id,start:0,end:86400},location.origin));video=youtubeFrame(frame,source,record.title||'영상');api=youtubeApi();video.iframe.style.pointerEvents='none';api.catch(()=>{});}
  const result={caseId:record.id,wrapper,heading,viewer,frame,notice,video,api,destroy(){video?.cancel();wrapper.remove();}};preparations.add(result);return result;
}

export function mountSubtitlePlayer(container,input,options={}){
  const data=selectSubtitleExcerpt(input,options.excerpt),isVisual=data.method==='source-reviewed-visual-summary',isCaptionTranslation=data.method==='source-visible-caption-translation',isTranslation=data.method==='source-segment-translation'||isCaptionTranslation,isSummary=data.method==='source-reviewed-summary'||isVisual;
  styles();
  let prepared=options.prepared;if(prepared&&(!preparations.has(prepared)||prepared.caseId!==data.caseId||!prepared.video||data.platform!=='YouTube'||isNativeSubtitle(data)||options.mediaUrl||data.mediaUrl||!prepared.wrapper.isConnected||prepared.wrapper.parentElement!==container||prepared.video.source.pathname!==new URL(embedSource(data,location.origin)).pathname)){if(preparations.has(prepared))prepared.destroy();prepared=null;}
  let disposed=false,adapter=null,poll=null,providerTimer=null,cancelFrameLoad=null,played=false,current=data.start,active=null;
  const wrapper=prepared?.wrapper||node('section','oly-subtitles');wrapper.setAttribute('aria-label','한국어 자막 영상');wrapper.setAttribute('aria-busy','true');wrapper.dataset.playbackState='loading';
  const heading=node('h2','os-title',data.title);
  const viewer=prepared?.viewer||node('div','os-viewer');
  const bar=node('div','os-bar'),badge=node('span','',isVisual?'한국어 화면 설명':isCaptionTranslation?'한국어 화면자막 번역':isSummary?'한국어 요약 자막':isTranslation?'한국어 구간 번역':'한국어 자막'),expand=node('button','','크게 보기');expand.type='button';expand.setAttribute('aria-expanded','false');bar.append(badge,expand);
  const frame=prepared?.frame||node('div','os-frame');frame.style.minHeight='200px';
  const captions=node('div','os-captions'),ko=node('p','os-ko','재생 버튼을 누르면 한국어 자막이 나옵니다.'),original=node('p','os-original'),uncertain=node('small','os-uncertain');
  original.hidden=true;uncertain.hidden=true;captions.setAttribute('role','region');captions.setAttribute('aria-label','한국어 자막');captions.append(ko,original,uncertain);
  const controls=node('div','os-controls'),label=node('label','','자막 '),mode=node('select');mode.setAttribute('aria-label','자막 표시 언어');
  const modes=isSummary||data.originalAvailable===false?[['ko','한국어'],['off','끄기']]:[['ko','한국어'],['both','한국어 + 원문'],['off','끄기']];
  for(const[value,text]of modes){const option=node('option','',text);option.value=value;mode.append(option);}label.append(mode);
  const clock=node('output','os-clock',subtitleClock(data.start));clock.setAttribute('aria-label','영상 재생 시간');controls.append(label,clock);
  if(prepared){viewer.prepend(bar);viewer.append(captions,controls);}else viewer.append(bar,frame,captions,controls);
  const status=node('p','os-status');status.setAttribute('role','status');status.hidden=true;
  const scope=node('p','os-scope',data.scope==='case-segment'?`${data.excerptOf?'대표 선정 구간':'해당 사례 구간'} · ${subtitleClock(data.start)}–${subtitleClock(data.end)}${data.excerptOf?' · '+subtitleClock(data.end-data.start):''}`:'');scope.hidden=data.scope!=='case-segment';
  if(options.selectionLabel&&data.excerptOf)scope.textContent+=' · '+options.selectionLabel;
  const details=node('details','os-transcript'),summary=node('summary','',isSummary?'한국어 내용 정리 · 문장을 누르면 장면 이동':isTranslation?'한국어 구간 대본 · 문장을 누르면 장면 이동':'한국어 전체 대본 · 문장을 누르면 장면 이동'),list=node('ol');details.append(summary,list);
  const rows=new Map();
  for(const cue of data.cues){const li=node('li'),button=node('button'),time=node('time','',subtitleClock(cue.start)),text=node('span','',cue.ko.replaceAll('\n',' '));button.type='button';button.disabled=true;button.append(time,text);button.addEventListener('click',async()=>{if(!adapter||disposed)return;try{await adapter.seek(cue.start+.01);if(disposed)return;await adapter.play();}catch{message('영상 재생 버튼을 누른 뒤 다시 선택해주세요.',true);}});li.append(button);list.append(li);rows.set(cue.id,{li,button});}
  const note=node('p','os-note',isCaptionTranslation?'영상에 이미 표시된 원문 화면 자막의 선택 구간을 한국어로 옮겼습니다. 장면을 초 단위로 대조한 번역 초안이며, 원음 전체 청취 검수나 영상 전체의 완역은 아닙니다.':isVisual?'영상의 화면 문구를 번역하고 확인한 장면을 한국어로 설명한 자료입니다. 음성 번역이 아니며, 전후 표시나 동작만으로 제품 효과를 검증한 것은 아닙니다.':isSummary?'원문 발언의 선택 구간을 정리한 한국어 요약 자막입니다. 발언 전체의 직역은 아니며, 체험자의 주장이나 신원을 독립 검증한 자료가 아닙니다.':isTranslation?'표시된 선택 구간의 음성전사에 기반한 한국어 번역 초안입니다. 원문 인식이 불명확한 부분은 별도 표시했습니다. 영상 전체의 번역이나 발언 내용의 독립 검증은 아닙니다.':data.method==='provided-korean-caption-edited'?'제공된 한국어 자동자막을 다듬었습니다.':'원문 자막·음성전사에 기반한 번역입니다. 영상 속 개인의 발언을 옮겼으며 내용의 독립 검증은 아닙니다.');
  const sourceLink=node('a','os-source','원본 영상 보기 ↗');sourceLink.href=sourceWatchUrl(data.watchUrl,data.start);sourceLink.target='_blank';sourceLink.rel='noopener noreferrer';
  if(prepared){prepared.notice.remove();prepared.heading.remove();wrapper.prepend(heading);wrapper.append(status,scope,details,sourceLink,note);}else{wrapper.append(heading,viewer,status,scope,details,sourceLink,note);container.replaceChildren(wrapper);}
  function message(text,error=false){if(disposed)return;status.textContent=text;status.hidden=!text;status.dataset.error=String(error);}
  function expanded(value){viewer.classList.toggle('os-expanded',value);expand.textContent=value?'작게 보기':'크게 보기';expand.setAttribute('aria-expanded',String(value));}
  const key=event=>{if(event.key==='Escape')expanded(false);};document.addEventListener('keydown',key);
  expand.addEventListener('click',()=>expanded(!viewer.classList.contains('os-expanded')));
  function render(seconds){
    if(disposed)return;current=seconds;const cue=activeSubtitle(data.cues,seconds),selected=mode.value;
    ko.textContent=selected==='off'?'자막 꺼짐':cue?.ko||(played?'\u00a0':'재생 버튼을 누르면 한국어 자막이 나옵니다.');
    original.textContent=cue?.original||'';original.hidden=selected!=='both'||!cue;
    const caution=cue?data.cautions?.find(item=>item.cue===cue.id&&item.reason!=='fast-caption'):undefined;
    uncertain.hidden=!caution||selected==='off';uncertain.textContent=caution?'원문 일부 인식 불명확':'';uncertain.title=caution?.reason||'';
    clock.textContent=subtitleClock(seconds);ko.dataset.cue=String(cue?.id||'');
    options.onProgress?.({seconds,cueId:cue?.id??null,caption:ko.textContent,state:wrapper.dataset.playbackState});
    if(active!==(cue?.id??null)){rows.get(active)?.li.removeAttribute('aria-current');active=cue?.id??null;if(active!==null)rows.get(active)?.li.setAttribute('aria-current','true');}
    if(played&&seconds>=data.end-.02){adapter?.pause();message('해당 사례 구간이 끝났습니다. 대본을 눌러 다시 볼 수 있습니다.');}
  }
  render(data.start);
  mode.addEventListener('change',()=>render(current));
  function ready(){if(disposed)return;clearTimeout(providerTimer);wrapper.setAttribute('aria-busy','false');wrapper.dataset.playbackState='ready';for(const row of rows.values())row.button.disabled=false;message('재생 버튼을 누르면 영상 아래에 한국어 자막이 나옵니다.');options.onReady?.(data.caseId);}
  function error(text){if(disposed)return;clearTimeout(providerTimer);wrapper.setAttribute('aria-busy','false');wrapper.dataset.playbackState='error';message(text,true);details.open=true;options.onError?.({caseId:data.caseId,message:text});}
  const promise=(async()=>{
    try{
      if(isNativeSubtitle(data)||data.platform==='Substack'||options.mediaUrl||data.mediaUrl){
        wrapper.dataset.playbackKind='private-media';
        const video=node('video');video.controls=true;video.playsInline=true;video.preload='metadata';video.setAttribute('controlslist','nofullscreen noremoteplayback');video.disablePictureInPicture=true;
        video.muted=options.muted===true;video.src=data.platform==='Substack'?embedSource(data,location.origin):checkedMediaUrl(options.mediaUrl||data.mediaUrl,data.caseId,location.origin);frame.append(video);
        adapter=createNativeSubtitleAdapter(video,data,{onReady:()=>{if(!disposed)ready();},onTime:seconds=>render(seconds),
          onPlay:()=>{if(disposed)return;played=true;wrapper.dataset.playbackState='playing';message('영상이 재생 중입니다. 영상 아래에서 한국어 자막을 확인하세요.');},
          onPause:()=>{if(!disposed&&played)wrapper.dataset.playbackState='paused';},onEnd:()=>{if(!disposed)wrapper.dataset.playbackState='ended';},
          onError:()=>error('영상을 불러오지 못했습니다. 잠시 후 다시 열어주세요.')});
        return;
      }
      if(data.platform==='Rutube'){
        const iframe=node('iframe');iframe.title=data.title+' 원본 영상';iframe.allow='autoplay; encrypted-media';iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.style.width='100%';iframe.style.height='100%';iframe.style.minHeight='200px';
        providerTimer=setTimeout(()=>error('영상 연결에 응답이 없습니다. 잠시 후 다시 열어주세요.'),20000);
        adapter=createRutubeAdapter(iframe,{start:data.start,muted:options.muted,
          onReady:()=>ready(),onTime:seconds=>{if(!disposed)render(played?seconds:Math.max(data.start,seconds));},
          onState:state=>{if(disposed)return;if(state==='playing'){played=true;wrapper.dataset.playbackState='playing';message('영상이 재생 중입니다. 영상 아래에서 한국어 자막을 확인하세요.');}else if(state==='paused')wrapper.dataset.playbackState='paused';else wrapper.dataset.playbackState='ended';},
          onError:()=>error('원본 영상이 재생되지 않습니다. 원본 링크와 대본을 확인해주세요.')});
        iframe.src=embedSource(data,location.origin);frame.append(iframe);
      }else if(data.platform==='Vimeo'){
        const iframe=node('iframe');iframe.title=data.title+' 원본 영상';iframe.allow='autoplay; encrypted-media; picture-in-picture';iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.src=embedSource(data,location.origin);frame.append(iframe);
        await script('https://player.vimeo.com/api/player.js',()=>!!window.Vimeo?.Player);if(disposed)return;
        const player=new window.Vimeo.Player(iframe);adapter={seek:async seconds=>{const actual=await player.setCurrentTime(seconds);render(actual);},play:()=>player.play(),pause:()=>{player.pause().catch(()=>{});},destroy:()=>{player.destroy().catch(()=>{});}};
        player.on('timeupdate',event=>render(event.seconds));player.on('seeked',event=>render(event.seconds));player.on('play',()=>{played=true;});player.on('error',()=>error('원본 영상이 재생되지 않습니다. 원본 링크와 대본을 확인해주세요.'));
        await Promise.race([player.ready(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Vimeo timeout')),15000))]);if(!disposed){ready();let reading=false;poll=setInterval(async()=>{if(disposed||reading)return;reading=true;try{render(await player.getCurrentTime());}catch{}finally{reading=false;}},350);}
      }else{
        const source=new URL(embedSource(data,location.origin));
        const video=prepared?.video||youtubeFrame(frame,source,data.title),iframe=video.iframe;iframe.title=data.title+' 원본 영상';cancelFrameLoad=video.cancel;
        const [loaded]=await Promise.all([video.loaded,prepared?.api||youtubeApi()]);if(disposed)return;if(!loaded)throw new Error('YouTube iframe unavailable');cancelFrameLoad=null;
        providerTimer=setTimeout(()=>error('유튜브 연결에 응답이 없습니다. 원본 링크와 한국어 대본을 이용해주세요.'),15000);
        let pendingStart=data.start;
        const videoId=source.pathname.split('/').pop();
        const player=new window.YT.Player(iframe,{host:source.origin,events:{onReady:()=>{if(disposed)return;if(options.muted)player.mute();player.cueVideoById({videoId,startSeconds:data.start,endSeconds:data.end});iframe.style.pointerEvents='';ready();poll=setInterval(()=>{if(!disposed&&typeof player.getCurrentTime==='function'){const seconds=player.getCurrentTime();render(played?seconds:Math.max(data.start,seconds));}},250);},onStateChange:event=>{if(disposed)return;if(event.data===1){played=true;wrapper.dataset.playbackState='playing';message('영상이 재생 중입니다. 영상 아래에서 한국어 자막을 확인하세요.');}else if(event.data===2)wrapper.dataset.playbackState='paused';else if(event.data===0)wrapper.dataset.playbackState='ended';},onError:event=>error([101,150].includes(event.data)?'게시자가 이 영상의 앱 내부 재생을 허용하지 않았습니다 ('+event.data+'). 한국어 대본은 아래에 보존되어 있습니다.':'유튜브 영상을 불러오지 못했습니다 ('+event.data+'). 잠시 후 다시 열어주세요.')}});
        adapter={seek:async seconds=>{pendingStart=seconds;if(played)player.seekTo(seconds,true);},play:async()=>{if(played)player.playVideo();else player.loadVideoById({videoId,startSeconds:pendingStart,endSeconds:data.end});},pause:()=>player.pauseVideo?.(),destroy:()=>player.destroy()};
      }
    }catch{if(!disposed)error('영상 연결을 확인하지 못했습니다. 원본 링크와 전체 대본을 이용해주세요.');}
  })();
  return {ready:promise,play:()=>adapter?.play(),seek:seconds=>adapter?.seek(seconds),pause:()=>adapter?.pause(),destroy(){if(disposed)return;disposed=true;if(poll)clearInterval(poll);clearTimeout(providerTimer);cancelFrameLoad?.();document.removeEventListener('keydown',key);try{adapter?.destroy();}finally{container.replaceChildren();}},element:wrapper};
}
