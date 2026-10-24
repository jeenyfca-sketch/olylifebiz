// The caption clock stays on the original source timeline when a private file is a short excerpt.
export function createNativeSubtitleAdapter(video,data,events={}){
  const offset=data.mediaStart??0;
  if(!Number.isFinite(offset)||offset<0||offset>data.start)throw new Error('Invalid private media source offset');
  let disposed=false;
  const listeners=[];
  const on=(name,listener)=>{const guarded=event=>{if(!disposed)listener(event);};video.addEventListener(name,guarded);listeners.push([name,guarded]);};
  on('loadedmetadata',()=>{
    if(offset>0&&(!Number.isFinite(video.duration)||video.duration+offset<data.end-.25)){events.onError?.('Private excerpt does not cover the selected source interval');return;}
    video.currentTime=Math.min(Math.max(0,data.start-offset),video.duration);events.onReady?.();
  });
  on('timeupdate',()=>events.onTime?.(video.currentTime+offset));
  on('seeking',()=>events.onTime?.(video.currentTime+offset));
  on('play',()=>events.onPlay?.());on('pause',()=>events.onPause?.());on('ended',()=>events.onEnd?.());on('error',()=>events.onError?.('Private media playback failed'));
  return{
    seek:async seconds=>{if(!Number.isFinite(seconds))throw new Error('Invalid source seek time');if(!disposed)video.currentTime=Math.max(0,seconds-offset);},
    play:()=>disposed?undefined:video.play(),pause:()=>{if(!disposed)video.pause();},
    destroy(){if(disposed)return;disposed=true;for(const[name,listener]of listeners)video.removeEventListener(name,listener);video.pause();video.removeAttribute('src');video.load();}
  };
}
