// Provider commands and events: https://rutube.ru/info/embed/
const providerOrigin='https://rutube.ru';
export function createRutubeAdapter(iframe,options={},events=window){
 let disposed=false,loaded=false,pendingTime=options.start||0,pendingPlay=false;
 function send(type,data={}){if(!disposed)iframe.contentWindow?.postMessage(JSON.stringify({type,data}),providerOrigin);}
 function receive(event){
  if(disposed||event.origin!==providerOrigin||event.source!==iframe.contentWindow)return;
  let message;try{message=typeof event.data==='string'?JSON.parse(event.data):event.data;}catch{return;}
  if(!message||typeof message!=='object')return;
  if(message.type==='player:ready'&&!loaded){loaded=true;if(options.muted)send('player:mute');send('player:setCurrentTime',{time:pendingTime});options.onReady?.();if(pendingPlay)send('player:play');}
  else if(message.type==='player:currentTime'&&Number.isFinite(message.data?.time)&&message.data.time>=0&&message.data.time<=86400)options.onTime?.(message.data.time);
  else if(message.type==='player:changeState'&&['playing','paused','stopped'].includes(message.data?.state))options.onState?.(message.data.state);
  else if(message.type==='player:error')options.onError?.();
 }
 events.addEventListener('message',receive);
 return{
  async seek(seconds){if(!Number.isFinite(seconds)||seconds<0||seconds>86400)throw new Error('Invalid playback time');pendingTime=seconds;if(loaded)send('player:setCurrentTime',{time:seconds});},
  async play(){pendingPlay=true;if(loaded)send('player:play');},
  pause(){pendingPlay=false;if(loaded)send('player:pause');},
  destroy(){if(disposed)return;if(loaded)send('player:pause');disposed=true;events.removeEventListener('message',receive);}
 };
}
