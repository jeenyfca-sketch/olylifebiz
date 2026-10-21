const PROJECT='https://seljcdjixvlguyumifjf.supabase.co';
export const isNativeSubtitle=data=>!!data&&['Telegram','Bitchute'].includes(data.platform);
export function validateSubtitle(input) {
  if(!input||!/^OLY-\d{3}$/.test(input.caseId)||!['YouTube','Vimeo','Telegram','Bitchute'].includes(input.platform))throw new Error('Invalid subtitle identity');
  if(typeof input.title!=='string'||input.title.length>300||!Number.isFinite(input.start)||!Number.isFinite(input.end)||input.start<0||input.end<=input.start||input.end>86400)throw new Error('Invalid subtitle bounds');
  if(!Array.isArray(input.cues)||!input.cues.length||input.cues.length>2500)throw new Error('Invalid subtitle cues');
  let previous=-1;
  for(const cue of input.cues){
    if(!Number.isFinite(cue.start)||!Number.isFinite(cue.end)||cue.start<previous||cue.start<input.start-.01||cue.end>input.end+.01||cue.start>=cue.end)throw new Error('Invalid subtitle timing');
    if(typeof cue.ko!=='string'||!cue.ko.trim()||cue.ko.length>4000||typeof cue.original!=='string'||cue.original.length>6000)throw new Error('Invalid subtitle text');
    previous=cue.end;
  }
  if(!isNativeSubtitle(input))embedSource(input,'https://example.test');
  const watch=new URL(input.watchUrl);
  if(watch.protocol!=='https:'||watch.username||watch.password||watch.port||!['www.youtube.com','youtube.com','youtu.be','vimeo.com','www.vimeo.com','t.me','www.bitchute.com','bitchute.com'].includes(watch.hostname))throw new Error('Invalid original link');
  if(input.platform==='Bitchute'){
    const id=watch.pathname.match(/^\/video\/([a-zA-Z0-9]{8,24})\/?$/)?.[1],embed=new URL(input.embedUrl);
    if(!id||!['bitchute.com','www.bitchute.com'].includes(watch.hostname)||embed.protocol!=='https:'||embed.username||embed.password||embed.port||!['bitchute.com','www.bitchute.com'].includes(embed.hostname)||embed.pathname.replace(/\/$/,'')!=='/embed/'+id)throw new Error('Invalid BitChute source');
  }
  return input;
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
