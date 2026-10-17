// Source links are optional: a summary-only case remains a valid entry.
const categoryAliases = {
  '뇌':'뇌·두통', '두통':'뇌·두통',
  '관절·무릎':'다리·무릎', '보행·다리':'다리·무릎',
  '보행·균형':'다리·무릎', '움직임·균형':'다리·무릎',
  '사용 편의':'사용감·불편', '소화·식욕':'소화·배변',
  '야간뇨·배뇨':'비뇨·야간뇨', '피부·사용감':'피부'
};
export function normalizeCases(input) {
  if (!Array.isArray(input)) throw new Error('Invalid case catalog');
  return input.flatMap(item => {
    if (!item || typeof item.id !== 'string' || typeof item.title !== 'string' || !item.title.trim()) return [];
    const summary = typeof item.summary === 'string' ? item.summary.trim() : '';
    let url = '';
    try {
      if (typeof item.url === 'string' && item.url.trim()) {
        const candidate = new URL(item.url.trim());
        if (candidate.protocol === 'https:' && !candidate.username && !candidate.password) url = candidate.href;
      }
    } catch {}
    if (!summary && !url) return [];
    const categories = [...new Set((Array.isArray(item.categories) ? item.categories : typeof item.category === 'string' ? [item.category] : [])
      .filter(value => typeof value === 'string' && value.trim()).map(value => categoryAliases[value.trim()] ?? value.trim()))];
    return [{id:item.id, title:item.title.trim(), country:typeof item.country === 'string' ? item.country : '',
      language:typeof item.language === 'string' ? item.language : '', categories, summary, url,
      media_type:item.media_type==='video'?'video':'document',visibility:item.visibility==='public'?'public':'admin',
      video_url:typeof item.video_url==='string'&&/^https:\/\//.test(item.video_url)?item.video_url:'',
      review_status:typeof item.review_status==='string'?item.review_status:''}];
  });
}

export function caseWriteRow(input, forcePrivate=false) {
  const row=normalizeCases([input])[0];
  if(!row || !/^[a-zA-Z0-9_-]{1,100}$/.test(row.id) || row.title.length>300 || row.summary.length>20000 || row.url.length>2000 || row.categories.length>30 || row.categories.some(x=>x.length>100) || row.country.length>100 || row.language.length>100 || row.review_status.length>2000) throw new Error('사례 내용을 확인하세요.');
  if(input.url && !row.url) throw new Error('원문 링크는 https:// 주소를 입력하세요.');
  if(input.video_url){let u;try{u=new URL(input.video_url);}catch{}if(!u||u.protocol!=='https:'||u.username||u.password||input.video_url.length>2000)throw new Error('영상 링크는 https:// 주소를 입력하세요.');row.video_url=u.href;}
  row.visibility=forcePrivate?'admin':row.visibility;
  return row;
}

export function importCaseRows(input) {
  const records=Array.isArray(input)?input:input?.cards;
  if(!Array.isArray(records)||!records.length||records.length>1000)throw new Error('1~1000건의 JSON 사례 자료를 선택하세요.');
  const seen=new Set();
  return records.map(x=>{
    const row=caseWriteRow({id:x.id,title:x.title??x.title_ko,summary:x.summary??x.summary_ko,url:x.url??x.source_url??'',video_url:x.video_url??x.videos?.[0]?.watch_url??'',country:x.country??'',language:x.language??'',categories:x.categories??x.patterns??[],media_type:x.media_type,review_status:x.review_status??x.access_status??''},true);
    if(seen.has(row.id))throw new Error('중복 사례 ID: '+row.id);seen.add(row.id);return row;
  });
}
