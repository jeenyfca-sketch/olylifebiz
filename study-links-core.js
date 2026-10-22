export const CATEGORY_ORDER=['뇌·두통','치매','눈·시야','얼굴·귀·코·턱','어깨·목','손·팔','허리·등','고관절','다리','무릎','파킨슨 관련','수면','온감·냉감','순환·붓기','혈압·혈당·대사','소화·배변','신장·방광','비뇨·야간뇨','정력·성기능','여성 요실금','피부','다이어트','연전현상','비즈니스 플랜'];
export function validEntry(x){
 if(!x||!/^[-\w]{11}$/.test(x.id)||typeof x.title!=='string'||!x.title.trim()||typeof x.channel!=='string'||!Array.isArray(x.categories)||!x.categories.length||!x.categories.every(c=>typeof c==='string'&&c.trim())||x.captionStatus!=='korean-translation-available')return false;
 try{const u=new URL(x.url);return u.protocol==='https:'&&u.hostname==='www.youtube.com'&&!u.username&&!u.password&&!u.port&&u.pathname==='/watch'&&u.searchParams.get('v')===x.id;}catch{return false;}
}
export function selectEntries(entries,category='',query=''){
 const q=query.trim().toLocaleLowerCase();
 return entries.filter(x=>(!category||x.categories.includes(category))&&(!q||[x.title,x.channel,...x.categories].join(' ').toLocaleLowerCase().includes(q)));
}
export function categoryCounts(entries){
 const counts=new Map();for(const x of entries)for(const c of new Set(x.categories))counts.set(c,(counts.get(c)||0)+1);
 return [...counts].sort((a,b)=>{const i=CATEGORY_ORDER.indexOf(a[0]),j=CATEGORY_ORDER.indexOf(b[0]);return (i<0?999:i)-(j<0?999:j)||a[0].localeCompare(b[0],'ko');});
}
export function shareUrl(base,category='',query='',collection=''){
 const url=new URL(base);url.search='';url.hash='';if(category)url.searchParams.set('category',category);if(query.trim())url.searchParams.set('q',query.trim());if(collection)url.searchParams.set('collection',collection);return url.href;
}
