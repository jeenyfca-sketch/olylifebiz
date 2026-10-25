const PROJECT='https://seljcdjixvlguyumifjf.supabase.co';
export const isNativeSubtitle=data=>!!data&&(['Telegram','Bitchute'].includes(data.platform)||data.requiresNativeMedia===true);
export function validateSubtitle(input) {
  if(!input||!/^OLY-\d{3}$/.test(input.caseId)||!['YouTube','Vimeo','Telegram','Bitchute','Substack','Rutube'].includes(input.platform))throw new Error('Invalid subtitle identity');
  if(typeof input.title!=='string'||input.title.length>300||!Number.isFinite(input.start)||!Number.isFinite(input.end)||input.start<0||input.end<=input.start||input.end>86400)throw new Error('Invalid subtitle bounds');
  if(input.mediaStart!==undefined&&(!Number.isFinite(input.mediaStart)||input.mediaStart<0||input.mediaStart>input.start))throw new Error('Invalid private media source offset');
  if(input.requiresNativeMedia!==undefined&&typeof input.requiresNativeMedia!=='boolean')throw new Error('Invalid required private media flag');
  if(input.sourceStart!==undefined&&(!Number.isFinite(input.sourceStart)||input.sourceStart<0||input.sourceStart>86400))throw new Error('Invalid original source reference');
  if(!Array.isArray(input.cues)||!input.cues.length||input.cues.length>2500)throw new Error('Invalid subtitle cues');
  let previous=-1;
  for(const cue of input.cues){
    if(!Number.isFinite(cue.start)||!Number.isFinite(cue.end)||cue.start<previous||cue.start<input.start-.01||cue.end>input.end+.01||cue.start>=cue.end)throw new Error('Invalid subtitle timing');
    if(typeof cue.ko!=='string'||!cue.ko.trim()||cue.ko.length>4000||typeof cue.original!=='string'||cue.original.length>6000)throw new Error('Invalid subtitle text');
    previous=cue.end;
  }
  if(!['Telegram','Bitchute'].includes(input.platform))embedSource(input,'https://example.test');
  const watch=new URL(input.watchUrl);
  if(watch.protocol!=='https:'||watch.username||watch.password||watch.port||!(['www.youtube.com','youtube.com','youtu.be','vimeo.com','www.vimeo.com','t.me','www.bitchute.com','bitchute.com'].includes(watch.hostname)||(input.platform==='Substack'&&/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.substack\.com$/.test(watch.hostname))||(input.platform==='Rutube'&&watch.hostname==='rutube.ru')))throw new Error('Invalid original link');
  if(input.platform==='Bitchute'){
    const id=watch.pathname.match(/^\/video\/([a-zA-Z0-9]{8,24})\/?$/)?.[1],embed=new URL(input.embedUrl);
    if(!id||!['bitchute.com','www.bitchute.com'].includes(watch.hostname)||embed.protocol!=='https:'||embed.username||embed.password||embed.port||!['bitchute.com','www.bitchute.com'].includes(embed.hostname)||embed.pathname.replace(/\/$/,'')!=='/embed/'+id)throw new Error('Invalid BitChute source');
  }
  return input;
}
export function sourceWatchUrl(raw, start) {
  const original=typeof raw==='string'?raw:'';
  let url;try{url=new URL(original);}catch{return '';}
  if(url.protocol!=='https:'||url.username||url.password)return '';
  if(!Number.isFinite(start)||start<0||url.port)return original;
  const id=/^[a-zA-Z0-9_-]{11}$/;
  const youtube=['www.youtube.com','youtube.com','m.youtube.com'].includes(url.hostname)&&
    ((url.pathname==='/watch'&&id.test(url.searchParams.get('v')||''))||/^\/(?:shorts|live)\/[a-zA-Z0-9_-]{11}\/?$/.test(url.pathname));
  const short=url.hostname==='youtu.be'&&/^\/[a-zA-Z0-9_-]{11}\/?$/.test(url.pathname);
  if(youtube||short){
    url.searchParams.delete('start');url.searchParams.delete('time_continue');
    url.searchParams.set('t',Math.floor(start)+'s');url.hash='';return url.href;
  }
  if(['vimeo.com','www.vimeo.com'].includes(url.hostname)&&/^\/\d{5,12}(?:\/[a-zA-Z0-9]{5,24})?\/?$/.test(url.pathname)){
    url.hash='t='+Math.floor(start)+'s';return url.href;
  }
  return original;
}
export function selectSubtitleExcerpt(input, excerpt) {
  const source=validateSubtitle(input);
  if(!excerpt)return source;
  const {start,end}=excerpt;
  if(!Number.isFinite(start)||!Number.isFinite(end)||start<source.start||end>source.end||end<=start)throw new Error('Invalid excerpt bounds');
  const cues=source.cues.filter(c=>c.end>start&&c.start<end).map(c=>({...c,start:Math.max(start,c.start),end:Math.min(end,c.end)}));
  const ids=new Set(cues.map(c=>c.id));
  const method=['source-reviewed-visual-summary','source-visible-caption-translation','source-reviewed-summary','provided-korean-caption-edited'].includes(source.method)?source.method:'source-segment-translation';
  return validateSubtitle({...source,start,end,scope:'case-segment',method,coverage:'selected-source-cues',
    excerptOf:{start:source.start,end:source.end,scope:source.scope,method:source.method},
    cautions:(source.cautions||[]).filter(c=>c.cue===undefined||ids.has(c.cue)).map(c=>({...c})),cues});
}
export function embedSource(data,origin) {
  const raw=new URL(data.embedUrl);
  if(raw.protocol!=='https:'||raw.username||raw.password||raw.port)throw new Error('Invalid embed URL');
  if(data.platform==='Rutube'){
    const watch=new URL(data.watchUrl),id=watch.pathname.match(/^\/video\/([a-f0-9]{32})\/?$/)?.[1];
    if(watch.protocol!=='https:'||watch.username||watch.password||watch.port||watch.hostname!=='rutube.ru'||watch.search||watch.hash||!id||raw.hostname!=='rutube.ru'||raw.pathname.replace(/\/$/,'')!=='/play/embed/'+id||raw.search||raw.hash)throw new Error('Invalid Rutube source');
    const url=new URL('https://rutube.ru/play/embed/'+id);url.searchParams.set('t',String(Math.floor(data.start)));url.searchParams.set('stopTime',String(Math.ceil(data.end)));return url.href;
  }
  if(data.platform==='Substack'){
    const watch=new URL(data.watchUrl);
    if(watch.protocol!=='https:'||watch.username||watch.password||watch.port||!/^https:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.substack\.com\/p\/[a-z0-9-]+$/.test(watch.href)||raw.origin!==watch.origin||!/^\/api\/v1\/video\/upload\/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\/src$/.test(raw.pathname)||raw.search!=='?type=mp4'||raw.hash)throw new Error('Invalid Substack source');
    return raw.href;
  }
  if(data.platform==='Vimeo'){
    if(raw.hostname!=='player.vimeo.com'||!/^\/video\/\d{5,12}$/.test(raw.pathname))throw new Error('Invalid Vimeo source');
    const url=new URL('https://player.vimeo.com'+raw.pathname);
    const hash=raw.searchParams.get('h');if(hash){if(!/^[a-zA-Z0-9]{5,24}$/.test(hash))throw new Error('Invalid Vimeo hash');url.searchParams.set('h',hash);}
    url.searchParams.set('dnt','1');url.searchParams.set('playsinline','1');
    if(data.start)url.hash='t='+data.start+'s';return url.href;
  }
  if(data.platform==='YouTube'){
    if(!['www.youtube.com','youtube.com','www.youtube-nocookie.com'].includes(raw.hostname)||!/^\/embed\/[a-zA-Z0-9_-]{11}$/.test(raw.pathname))throw new Error('Invalid YouTube source');
    const url=new URL('https://www.youtube-nocookie.com'+raw.pathname);
    for(const [key,value]of Object.entries({enablejsapi:'1',origin,playsinline:'1',start:Math.floor(data.start),end:Math.ceil(data.end),rel:'0'}))url.searchParams.set(key,String(value));
    return url.href;
  }
  throw new Error('Unsupported embed');
}
export function checkedMediaUrl(value,caseId,origin) {
  const url=new URL(value,origin);
  if(url.username||url.password||url.port&&url.origin!==origin)throw new Error('Invalid media URL');
  if(url.origin===origin&&new RegExp('^/(?:api/subtitles/)?media/'+caseId+'\\.mp4$').test(url.pathname))return url.href;
  if(url.origin===PROJECT&&url.protocol==='https:'&&url.pathname==='/storage/v1/object/sign/experience-videos/'+caseId+'.mp4'&&url.searchParams.get('token'))return url.href;
  throw new Error('Private media URL not allowed');
}
export function activeSubtitle(cues,seconds){
  if(!Number.isFinite(seconds))return null;let low=0,high=cues.length-1;
  while(low<=high){const middle=(low+high)>>1,cue=cues[middle];if(seconds<cue.start)high=middle-1;else if(seconds>=cue.end)low=middle+1;else return cue;}return null;
}
export function subtitleClock(seconds){const time=Math.max(0,Math.floor(seconds||0));return `${String(Math.floor(time/60)).padStart(2,'0')}:${String(time%60).padStart(2,'0')}`;}
