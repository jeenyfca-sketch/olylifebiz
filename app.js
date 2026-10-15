function normalizeMeetingLink(raw) {
 const value=String(raw??'').trim();
 if (/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i.test(value)) return 'https://meet.google.com/'+value.toLowerCase();
 if (/^meet\.google\.com\//i.test(value)) return 'https://'+value;
 if (/^https?:\/{2}meet\.google\.com\//i.test(value)) return value.replace(/^http:/i,'https:');
 if (/^https?\/{2}meet\.google\.com\//i.test(value)) return value.replace(/^https?\/{2}/i,'https://');
 return value;
}
(async () => {
const backend = await window.olyCloudReady;
const {normalizeCases} = await import(new URL('./case-catalog.js?v=topics',document.baseURI));
const adminMode = new URLSearchParams(location.search).get('admin') === '1';
const root=document.getElementById('ulilife-preview'), $=s=>root.querySelector(s);
const translations={
"홈":["Home","ホーム","首页"],
"설명회·교육":["Sessions & learning","説明会・教育","说明会与培训"],
"사례·교육·설명회를 하나의 앱으로.":["Stories, learning and sessions in one app.","事例・学び・説明会をひとつのアプリで。","案例、学习与说明会，尽在一个应用。"],
"찾아보고, 배우고, 공유하고.":["Explore, learn and share.","探して、学んで、共有する。","探索、学习、分享。"],
"사업의 첫 만남부터 함께하는 앱, 올리링크.":["OlyLINK, with you from your first business connection.","ビジネスの最初の出会いから、ともに歩むOlyLINK。","OlyLINK，从初次了解事业开始与您同行。"],
"글로벌 체험 사례를 한눈에":["Global experiences at a glance","世界の体験談をひと目で","全球体验案例，一目了然"],
"전 세계의 체험 이야기를 관심 주제별로.":["Explore personal experiences from around the world by topic.","世界の体験談を関心のあるテーマから。","按感兴趣的主题浏览世界各地的体验故事。"],
"연구와 교육자료를 손안에":["Research and learning at your fingertips","研究・教育資料を手元に","研究与学习资料，触手可及"],
"연구논문·임상자료를 바탕으로 한 사업 교육자료까지.":["Including business learning materials based on research papers and clinical data.","研究論文・臨床資料に基づくビジネス教育資料まで。","包括基于研究论文与临床资料的事业培训材料。"],
"온라인 설명회도 앱에서":["Online sessions, right from the app","オンライン説明会もアプリから","在线说明会，也能从应用参与"],
"일정을 확인하고 구글 미팅으로 바로 참여.":["Check the schedule and join through Google Meet.","日程を確認してGoogle Meetで参加。","查看日程，通过Google Meet直接参与。"],
"궁금할 땐 카카오톡으로":["Questions? Connect on KakaoTalk","質問はカカオトークで","有疑问，通过KakaoTalk联系"],
"시안 킴과 소통하며 함께 시작하기.":["Connect with Seean Kim and get started together.","Seean Kimと話して、一緒に始めましょう。","与Seean Kim交流，一起开始。"],
"앱으로 알아보고 → 톡으로 연결하고 → 함께 사업을 시작하세요.":["Explore in the app → Connect on KakaoTalk → Start your business together.","アプリで知る → トークでつながる → ともにビジネスを始める。","通过应用了解 → 通过聊天连接 → 一起开启事业。"],
"카카오톡으로 시작하기":["Get started on KakaoTalk","カカオトークで始める","通过KakaoTalk开始"],

 '이용자 자료실':['Library preview','利用者の資料室','用户资料库'],
 '선생님 관리자':['Admin preview','管理者画面','管理员预览'],
 '올리라이프비즈':['Olyliifebiz','Olyliifebiz','Olyliifebiz'],
 '카카오톡 문의':['Contact · KakaoTalk','お問い合わせ · KakaoTalk','联系咨询 · KakaoTalk'],
 '배우고, 이해하고, 함께 성장하기':['Learn, understand, grow together','学び、理解し、ともに成長する','学习、理解、共同成长'],
 '자료실':['Library','資料室','资料库'],
 '커뮤니케이션':['Communication','コミュニケーション','交流'],
 '함께 배우는 온라인 교육':['Learn together online','オンラインでともに学ぶ','一起在线学习'],
 '온라인 모임과 강의에 참여하세요.':['Join online meetings and classes.','オンラインの集まりと講義に参加しましょう。','参加在线聚会与课程。'],
 '구글 미팅방':['Google Meet rooms','Google Meet 会議室','Google Meet 会议室'],
 '국내':['Korea','韓国国内','韩国国内'],
 '국제':['International','国際','国际'],
 '국내 구글 미팅방':['Korea Google Meet room','韓国国内 Google Meet 会議室','韩国国内 Google Meet 会议室'],
 '국제 구글 미팅방':['International Google Meet room','国際 Google Meet 会議室','国际 Google Meet 会议室'],
 '한국어로 진행하는 모임과 강의입니다.':['Meetings and classes conducted in Korean.','韓国語で行う集まりと講義です。','以韩语进行的聚会与课程。'],
 '해외 이용자와 함께하는 모임과 강의입니다.':['Meetings and classes with international participants.','海外の参加者とともに学ぶ集まりと講義です。','与海外用户一起参与的聚会与课程。'],
 '모임 주제·일정 준비 중':['Topic and schedule to be announced','テーマ・日時は準備中','主题与时间待公布'],
 '진행 언어·통역 안내 준비 중':['Language and interpretation details to be announced','使用言語・通訳の案内は準備中','授课语言与翻译安排待公布'],
 '참여 링크 준비 중':['Join link not available yet','参加リンクは準備中','参会链接待公布'],
 '자료 언어':['Material language','資料の言語','资料语言'],
 '제품명 또는 강의 제목 검색':['Search product or lecture title','製品名・講義名で検索','搜索产品或课程名称'],
 'seean 전용':['For seean','seean 専用','seean 专用'],
 '자료 관리':['Manage materials','資料管理','资料管理'],
 '자료를 등록하고 내용을 수정합니다.':['Add materials and edit details.','資料の登録と内容の編集ができます。','添加资料并修改内容。'],
 '관리자 화면 미리보기 · 로그인 기능 연결 전':['Admin preview · Sign-in not connected','管理者プレビュー · ログイン未接続','管理员预览 · 尚未连接登录'],
 '새 자료 등록':['Add material','資料を追加','添加资料'],
 '자료 제목':['Material title','資料タイトル','资料标题'],
 '예: 비지니스 플랜':['Example: Business plan','例：ビジネスプラン','例如：商业计划'],
 '언어':['Language','言語','语言'],
 '자료 설명':['Description','資料の説明','资料说明'],
 '어떤 내용을 담은 자료인가요?':['What does this material cover?','どのような内容の資料ですか？','这份资料包含哪些内容？'],
 '출처·근거 범위':['Sources and evidence scope','出典・根拠の範囲','来源与证据范围'],
 '논문 출처와 설명 범위를 입력하세요.':['Enter sources and the scope of evidence.','論文の出典と説明の範囲を入力してください。','输入论文来源与说明范围。'],
 '자료 파일':['Material file','資料ファイル','资料文件'],
 '파일은 이 시안에서 서버로 전송하지 않습니다.':['Files are not uploaded to a server in this preview.','このプレビューではファイルをサーバーに送信しません。','此预览不会将文件上传到服务器。'],
 '시안에 등록':['Add to preview','プレビューに追加','添加到预览'],
 '수정 취소':['Cancel editing','編集をキャンセル','取消编辑'],
 '등록된 자료':['Registered materials','登録済み資料','已添加资料'],
 '교육·자료 안내 앱':['Education and resources','教育・資料案内アプリ','教育与资料应用'],
 '자료 보기':['View material','資料を見る','查看资料'],
 'PDF 열기':['Open PDF','PDFを開く','打开PDF'],
 'PDF 내려받기':['Download PDF','PDFをダウンロード','下载PDF'],
 '수정하기':['Edit','編集','编辑'],
 '검색 조건에 맞는 자료가 없습니다.':['No matching materials.','該当する資料がありません。','没有符合搜索条件的资料。'],
 '설명 미등록':['No description yet','説明は未登録です','尚无说明'],
 '출처 미등록':['No source registered','出典は未登録です','尚无来源'],
 '파일 미첨부':['No file attached','ファイル未添付','未附文件'],
 '선택한 파일 내려받기':['Download selected file','選択したファイルをダウンロード','下载所选文件'],
 '샘플 파일 · 다운로드 준비 중':['File not available yet','ファイル準備中','文件准备中'],
 '닫기':['Close','閉じる','关闭'],
 '자료 수정':['Edit material','資料を編集','编辑资料'],
 '시안에 수정 반영':['Save to preview','プレビューに保存','保存到预览'],
 '제목을 입력해 주세요.':['Enter a title.','タイトルを入力してください。','请输入标题。'],
 '시안에 반영했습니다. 상단의 이용자 자료실에서 확인하세요.':['Saved. Check the library preview above.','保存しました。上部の資料室で確認できます。','已保存。请在上方资料库预览中查看。'],
 '미첨부':['None','なし','无'],
 '비지니스 플랜':['Business plan','ビジネスプラン','商业计划'],
 'PEMF . THZ 논문 임상 자료':['PEMF . THZ Research & clinical materials','PEMF . THZ 論文・臨床資料','PEMF . THZ 论文与临床资料'],
 '비지니스 플랜 자료입니다. 실제 강의안은 추후 등록합니다.':['Business plan materials. The actual files will be added later.','ビジネスプラン資料です。実際の講義資料は後日登録します。','商业计划资料。实际课程文件将稍后添加。'],
 'PEMF와 THZ 관련 논문·임상 자료입니다. 실제 자료와 번역본은 추후 등록합니다.':['PEMF and THZ research and clinical materials. Actual files and translations will be added later.','PEMFとTHZに関する論文・臨床資料です。実際の資料と翻訳版は後日登録します。','PEMF与THZ相关论文及临床资料。实际资料与翻译版本将稍后添加。'],
 '실제 자료와 출처는 추후 등록합니다.':['Actual materials and sources will be added later.','実際の資料と出典は後日登録します。','实际资料与来源将稍后添加。'],
 '일반 기전과 특정 제품 효과의 근거를 구분해 기록합니다. 실제 논문은 미등록 상태입니다.':['General mechanisms and evidence for specific product effects are recorded separately. Papers are not uploaded yet.','一般的な機序と特定製品の効果の根拠を区別して記録します。実際の論文は未登録です。','一般机制与特定产品效果的证据分别记录。实际论文尚未上传。']
 };
 
Object.assign(translations, {
 '주소나 회의 코드만 붙여넣으세요. https://는 자동으로 추가됩니다.':['Paste an address or meeting code. https:// is added automatically.','アドレスまたは会議コードを貼り付けてください。https:// は自動追加されます。','粘贴地址或会议代码，系统会自动添加 https://。'],
 '구글 미팅 관리':['Manage Google Meet','Google Meet 管理','Google Meet 管理'],
 '구글 미팅':['Google Meet','Google Meet','Google Meet'],
 '관리':['Manage','管理','管理'],
 '새 미팅 등록':['Add meeting','ミーティングを追加','添加会议'],
 '미팅 수정':['Edit meeting','ミーティングを編集','编辑会议'],
 '모임 제목':['Meeting title','ミーティング名','会议标题'],
 '예: 비즈니스 플랜 설명회':['Example: Business plan session','例：ビジネスプラン説明会','例如：商业计划说明会'],
 '날짜·시간 (한국 기준)':['Date and time (Korea)','日時（韓国時間）','日期与时间（韩国时间）'],
 '진행 언어':['Meeting language','使用言語','会议语言'],
 '구글 미트 참여 링크':['Google Meet link','Google Meet 参加リンク','Google Meet 参会链接'],
 '링크가 없으면 비워두세요. 나중에 수정할 수 있습니다.':['Leave blank if the link is not ready. You can add it later.','リンクが未定の場合は空欄にしてください。後で編集できます。','链接未准备好时可留空，稍后修改。'],
 '등록된 미팅':['Registered meetings','登録済みミーティング','已添加会议'],
 '등록된 미팅이 없습니다.':['No meetings scheduled yet.','登録されたミーティングはありません。','尚无会议。'],
 '참여하기':['Join meeting','参加する','参加会议'],
 '미팅을 저장했습니다.':['Meeting saved.','ミーティングを保存しました。','会议已保存。'],
 '모임 제목을 입력하세요.':['Enter a meeting title.','ミーティング名を入力してください。','请输入会议标题。'],
 '진행 언어를 선택하세요.':['Select a meeting language.','使用言語を選択してください。','请选择会议语言。'],
 '한국 기준 날짜·시간을 입력하세요.':['Enter date and time in Korea time.','韓国時間で日時を入力してください。','请输入韩国时间的日期与时间。'],
 '올바른 날짜·시간을 입력하세요.':['Enter a valid date and time.','正しい日時を入力してください。','请输入有效日期与时间。'],
 '구글 미트 링크를 확인하세요.':['Check the Google Meet link.','Google Meet リンクを確認してください。','请检查Google Meet链接。'],
 'https://meet.google.com/ 형식의 참여 링크를 입력하세요.':['Enter a meeting link such as https://meet.google.com/abc-defg-hij.','https://meet.google.com/abc-defg-hij の形式で入力してください。','请输入 https://meet.google.com/abc-defg-hij 格式的参会链接。'],
 '관리자 로그인이 필요합니다.':['Administrator sign-in required.','管理者ログインが必要です。','需要管理员登录。'],
 '관리자 로그인':['Admin sign-in','管理者ログイン','管理员登录'],
 '관리자 비밀번호 설정':['Set administrator password','管理者パスワードの設定','设置管理员密码'],
 '비밀번호':['Password','パスワード','密码'],
 '로그인':['Sign in','ログイン','登录'],
 '설정하고 시작하기':['Set password and start','設定して開始','设置并开始'],
 '로그아웃':['Sign out','ログアウト','退出登录'],
 '등록하기':['Register','登録','添加'],
 '저장하기':['Save','保存','保存'],
 'PDF 최대 15MB · 이 컴퓨터에 저장합니다.':['PDF up to 15MB · Stored on this computer.','PDF最大15MB・このコンピューターに保存します。','PDF最大15MB · 保存在本机。'],
 '비밀번호를 10자 이상으로 정하세요. 이 컴퓨터의 관리자 계정에만 사용됩니다.':['Choose a password of at least 10 characters for this local administrator account.','この端末の管理者用に10文字以上のパスワードを設定してください。','请为本机管理员账户设置至少10个字符的密码。'],
 '설정한 관리자 비밀번호를 입력하세요.':['Enter your administrator password.','管理者パスワードを入力してください。','请输入管理员密码。'],
 '자료를 저장했습니다.':['Material saved.','資料を保存しました。','资料已保存。'],
 '저장 중…':['Saving…','保存中…','正在保存…'],
 '등록된 자료가 없습니다.':['No materials yet.','登録された資料はありません。','暂无资料。'],
 '파일을 선택하세요.':['Choose a file.','ファイルを選択してください。','请选择文件。'],
 'PDF 열기':['Open PDF','PDFを開く','打开PDF'],
 'PDF 내려받기':['Download PDF','PDFをダウンロード','下载PDF'],
 'PDF 파일만 등록할 수 있습니다.':['Only PDF files are supported.','PDFのみ登録できます。','仅支持PDF文件。'],
 'PDF 최대 크기는 15MB입니다.':['Maximum PDF size is 15MB.','PDFの最大サイズは15MBです。','PDF最大为15MB。'],
 '등록된 PDF를 유지합니다. 새 파일을 선택하면 교체됩니다.':['The current PDF is kept unless you choose a replacement.','新しいファイルを選択すると現在のPDFを置き換えます。','选择新文件时替换现有PDF。'],
});
Object.assign(translations,{
 '사례 분류':['Experience topics','体験談の分類','体验案例分类'], '전체':['All','すべて','全部'],
 '치매':['Dementia','認知症','认知症'], '파킨슨':['Parkinson’s','パーキンソン','帕金森'],
 '허리·요통':['Lower back','腰痛','腰痛'], '소화기':['Digestion','消化器','消化系统'], '통증':['Pain','痛み','疼痛'],
 '글로벌':['Global','グローバル','全球'], '체험 사례':['Experiences','体験談','体验案例'],
 '글로벌 체험 사례':['Global experiences','世界の体験談','全球体验案例'],
 '사례 검색':['Search experiences','体験談を検索','搜索体验案例'],
 '제목·국가·요약 검색':['Search title, country or summary','タイトル・国・要約を検索','搜索标题、国家或摘要'],
 '국가':['Country','国','国家'], '원문 언어':['Source language','原文の言語','原文语言'],
 '전체 국가':['All countries','すべての国','所有国家'], '전체 언어':['All languages','すべての言語','所有语言'],
 '등록된 사례가 없습니다.':['No experiences added yet.','登録された体験談はありません。','尚无体验案例。'],
 '조건에 맞는 사례가 없습니다.':['No matching experiences.','該当する体験談はありません。','没有匹配的体验案例。'],
 '원문 보기':['View original','原文を見る','查看原文'], '한국어 요약':['Korean summary','韓国語の要約','韩语摘要'], '링크 복사':['Copy link','リンクをコピー','复制链接'],
 '링크를 복사했습니다.':['Link copied.','リンクをコピーしました。','链接已复制。'],
 '사례를 불러오는 중입니다.':['Loading experiences…','体験談を読み込み中…','正在加载体验案例…'],
 '사례를 불러오지 못했습니다.':['Could not load experiences.','体験談を読み込めませんでした。','无法加载体验案例。']
});
const t=key=>locale==='ko'?key:(translations[key]?.[{en:0,ja:1,zh:2}[locale]]??key);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const knownLocales=['ko','en','ja','zh'];
let locale='ko';try { const saved=localStorage.getItem('olylife_locale');if(knownLocales.includes(saved))locale=saved; } catch {}
let experiences=[],experiencesLoaded=false,experiencesLoading=false,experiencesFailed=false,experienceCategory='';
const defaultExperienceCategories=['치매','파킨슨','허리·요통','소화기','통증'];
let materials=[],meetings=[],auth={initialized:!!backend,authenticated:false},section='home',editId=null,meetingEditId=null,detailId=null;
const textNodes=[],attrs=[];
const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
while(walker.nextNode()){const node=walker.currentNode;if(node.parentElement.closest('script,style,option'))continue;const key=node.textContent.trim();if(translations[key])textNodes.push({node,key});}
root.querySelectorAll('[placeholder],[aria-label]').forEach(el=>{for(const name of ['placeholder','aria-label']){const key=el.getAttribute(name);if(translations[key])attrs.push({el,name,key});}});
async function api(url,body){if(backend)return backend.api(url,body);const res=await fetch(url,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{});const data=await res.json();if(!res.ok){const error=new Error(data.error||'Request failed');error.status=res.status;throw error;}return data;}
function show(value){if(value==='experiences')loadExperiences();if(!adminMode&&['auth','admin','meeting-admin'].includes(value))value='library';section=value;if(section==='meetings'&&auth.authenticated)section='meeting-admin';if(['admin','meeting-admin'].includes(section)&&!auth.authenticated)section='auth';root.querySelectorAll('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==section);root.querySelectorAll('[data-section]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.section===section)));}
function applyLocale(){
$('#ul-email-label').hidden=!backend;
$('#ul-auth-form').elements.email.required=!!backend;
$('#ul-auth-form').elements.password.minLength=backend?6:10;
$('#ul-import-local').hidden=!backend||!auth.authenticated||!['127.0.0.1','localhost'].includes(location.hostname);
root.lang=locale;document.documentElement.lang=locale;$('#ul-locale').value=locale;textNodes.forEach(({node,key})=>node.textContent=t(key));attrs.forEach(({el,name,key})=>el.setAttribute(name,t(key)));$('#ul-auth-title').textContent=t(auth.initialized?'관리자 로그인':'관리자 비밀번호 설정');$('#ul-auth-submit').textContent=t(auth.initialized?'로그인':'설정하고 시작하기');$('#ul-auth-description').textContent=t(auth.initialized?'설정한 관리자 비밀번호를 입력하세요.':'비밀번호를 10자 이상으로 정하세요. 이 컴퓨터의 관리자 계정에만 사용됩니다.');$('#ul-auth-form').elements.password.autocomplete=auth.initialized?'current-password':'new-password';$('#ul-form-title').textContent=t(editId?'자료 수정':'새 자료 등록');$('#ul-save').textContent=t(editId?'저장하기':'등록하기');$('#ul-file-label').textContent=t(editId?'등록된 PDF를 유지합니다. 새 파일을 선택하면 교체됩니다.':'PDF 최대 15MB · 이 컴퓨터에 저장합니다.');if(backend){$('#ul-auth-description').textContent=locale==='ko'?'수파베이스에서 만든 관리자 이메일과 비밀번호를 입력하세요.':'Sign in with your administrator email and password.';$('#ul-file-label').textContent=locale==='ko'?'PDF 최대 15MB':'PDF · Max 15MB';}$('#ul-admin-nav').hidden=!auth.authenticated;$('#ul-login').hidden=!adminMode||auth.authenticated;$('#ul-logout').hidden=!auth.authenticated;$('footer').hidden=$('#ul-login').hidden&&$('#ul-logout').hidden;render();renderMeetings();renderExperiences();if(detailId)detail(detailId);}
function render(){const panel=$('#ul-detail');$('#ul-list').after(panel);const q=$('#ul-search').value.trim().toLowerCase();const list=materials.filter(x=>!q||x.title.toLowerCase().includes(q));$('#ul-count').textContent=locale==='ko'?'자료 '+list.length+'개':locale==='en'?list.length+' materials':locale==='ja'?'資料 '+list.length+'件':'资料 '+list.length+'份';$('#ul-list').innerHTML=list.length?list.map(x=>'<article class="ul-item"><span class="ul-tag">'+esc(x.language)+'</span><h3>'+esc(x.title)+'</h3><button type="button" data-view="'+esc(x.id)+'" aria-expanded="false" aria-controls="ul-detail">'+t('자료 보기')+'</button></article>').join(''):'<p class="ul-sub">'+t(q?'검색 조건에 맞는 자료가 없습니다.':'등록된 자료가 없습니다.')+'</p>';$('#ul-admin-list').innerHTML=auth.authenticated?materials.map(x=>'<article class="ul-item"><h3>'+esc(x.title)+'</h3><div class="ul-meta">'+esc(x.language)+'</div><button type="button" data-edit="'+esc(x.id)+'">'+t('수정하기')+'</button></article>').join(''):'';}
function detail(id,toggle=false){
 const x=materials.find(x=>x.id===id);if(!x)return;
 const button=[...$('#ul-list').querySelectorAll('[data-view]')].find(b=>b.dataset.view===id);
 if(!button)return;
 const panel=$('#ul-detail');
 if(toggle&&detailId===id&&!panel.hidden){detailId=null;panel.hidden=true;button.setAttribute('aria-expanded','false');return;}
 $('#ul-list').querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-expanded','false'));
 button.setAttribute('aria-expanded','true');
 detailId=id;button.closest('article').appendChild(panel);
 const url=backend?backend.fileUrl(x):'/materials/'+encodeURIComponent(id)+'.pdf';
 const downloadUrl=backend?backend.fileUrl(x,true):url+'?download=1';
 panel.hidden=false;
 panel.innerHTML='<div class="ul-meta">'+esc(x.filename)+'</div><div class="ul-actions"><a class="ul-kakao-link" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+t('PDF 열기')+'</a><a class="ul-kakao-link" href="'+esc(downloadUrl)+'">'+t('PDF 내려받기')+'</a></div>'+(x.description?'<p>'+esc(x.description)+'</p>':'')+(x.source?'<span class="ul-tag">'+t('출처·근거 범위')+'</span><p>'+esc(x.source)+'</p>':'');
}
async function refresh(){[auth,materials,meetings]=await Promise.all([api('/api/auth/status'),api('/api/materials'),api('/api/meetings')]);if(!adminMode)auth.authenticated=false;applyLocale();if(adminMode&&section==='auth'&&auth.authenticated)show('admin');}
root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.section)show(b.dataset.section);if(b.id==='ul-login'){show('auth');$('#ul-auth-notice').textContent='';}if(b.dataset.view)detail(b.dataset.view,true);if(b.dataset.edit){const x=materials.find(x=>x.id===b.dataset.edit);editId=x.id;for(const key of ['title','language','description','source'])$('#ul-form').elements.namedItem(key).value=x[key];$('#ul-form').elements.file.value='';$('#ul-cancel').hidden=false;applyLocale();$('#ul-form').scrollIntoView({block:'start',behavior:'smooth'});}});
$('#ul-locale').addEventListener('change',e=>{locale=e.target.value;try {localStorage.setItem('olylife_locale',locale);}catch {}applyLocale();});
$('#ul-search').addEventListener('input',()=>{render();detailId=null;$('#ul-detail').hidden=true;});
function reset(){editId=null;$('#ul-form').reset();$('#ul-cancel').hidden=true;applyLocale();}
$('#ul-cancel').addEventListener('click',reset);
$('#ul-auth-form').addEventListener('submit',async e=>{e.preventDefault();const button=$('#ul-auth-submit');button.disabled=true;$('#ul-auth-notice').textContent='';try {await api(auth.initialized?'/api/auth/login':'/api/auth/setup',{email:e.target.elements.email.value,password:e.target.elements.password.value});e.target.reset();await refresh();show('admin');}catch(error){$('#ul-auth-notice').textContent=t(error.message);}finally{button.disabled=false;}});
$('#ul-logout').addEventListener('click',async()=>{try{await api('/api/auth/logout',{});await refresh();reset();show('library');}catch(error){$('#ul-notice').textContent=t(error.message);}});
function fileBase64(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error('Could not read file'));reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.readAsDataURL(file);});}
$('#ul-form').addEventListener('submit',async e=>{e.preventDefault();const button=$('#ul-save'),form=e.target,file=form.elements.file.files[0];$('#ul-notice').textContent='';button.disabled=true;button.textContent=t('저장 중…');try{if(!editId&&!file)throw new Error('파일을 선택하세요.');if(file&&(!/\.pdf$/i.test(file.name)))throw new Error('PDF 파일만 등록할 수 있습니다.');if(file&&file.size>15*1024*1024)throw new Error('PDF 최대 크기는 15MB입니다.');const input={};for(const key of ['title','language','description','source'])input[key]=form.elements.namedItem(key).value;if(editId)input.id=editId;if(file){input.filename=file.name;input.fileBase64=await fileBase64(file);}await api('/api/materials',input);detailId=null;$('#ul-detail').hidden=true;await refresh();reset();$('#ul-notice').textContent=t('자료를 저장했습니다.');}catch(error){if(error.status===401){auth.authenticated=false;applyLocale();show('auth');$('#ul-auth-notice').textContent=t(error.message);}else $('#ul-notice').textContent=t(error.message);}finally{button.disabled=false;button.textContent=t(editId?'저장하기':'등록하기');}});
function renderMeetings(){
 const formatter=new Intl.DateTimeFormat({ko:'ko-KR',en:'en-US',ja:'ja-JP',zh:'zh-CN'}[locale],{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Seoul'});
 const date=x=>esc(formatter.format(new Date(x.starts)))+' · KST (UTC+9)';
 $('#ul-meetings').innerHTML=meetings.length?meetings.map(x=>'<article class="ul-item ul-meeting"><span class="ul-tag">'+esc(x.language)+'</span><h3>'+esc(x.title)+'</h3><p class="ul-meta">'+date(x)+'</p>'+(x.link?'<a class="ul-kakao-link" href="'+esc(x.link)+'" target="_blank" rel="noopener noreferrer">'+t('참여하기')+'</a>':'<button type="button" disabled>'+t('참여 링크 준비 중')+'</button>')+'</article>').join(''):'<p class="ul-sub">'+t('등록된 미팅이 없습니다.')+'</p>';
 $('#ul-meeting-admin-list').innerHTML=auth.authenticated?meetings.map(x=>'<article class="ul-item"><h3>'+esc(x.title)+'</h3><div class="ul-meta">'+date(x)+'<br>'+esc(x.language)+'</div><button type="button" data-meeting-edit="'+esc(x.id)+'">'+t('수정하기')+'</button></article>').join(''):'';
 $('#ul-meeting-admin-nav').hidden=!auth.authenticated;
 $('#ul-meetings-nav').hidden=auth.authenticated;
 $('#ul-meeting-form-title').textContent=t(meetingEditId?'미팅 수정':'새 미팅 등록');
 $('#ul-meeting-save').textContent=t(meetingEditId?'저장하기':'등록하기');
}
function resetMeeting(){meetingEditId=null;$('#ul-meeting-form').reset();$('#ul-meeting-cancel').hidden=true;renderMeetings();}
const meetingLinkInput=$('#ul-meeting-form').elements.link;
meetingLinkInput.addEventListener('blur',()=>{meetingLinkInput.value=normalizeMeetingLink(meetingLinkInput.value);});
meetingLinkInput.addEventListener('paste',e=>{const pasted=e.clipboardData?.getData('text');if(pasted){e.preventDefault();meetingLinkInput.value=normalizeMeetingLink(pasted);meetingLinkInput.dispatchEvent(new Event('input',{bubbles:true}));}});
root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.meetingEdit){const x=meetings.find(x=>x.id===b.dataset.meetingEdit);meetingEditId=x.id;const form=$('#ul-meeting-form');for(const key of ['title','language','link'])form.elements.namedItem(key).value=x[key];form.elements.starts.value=new Date(new Date(x.starts).getTime()+9*3600000).toISOString().slice(0,16);$('#ul-meeting-cancel').hidden=false;$('#ul-meeting-notice').textContent='';renderMeetings();form.scrollIntoView({block:'start',behavior:'smooth'});}if(b.id==='ul-meeting-cancel')resetMeeting();if(b.id==='ul-logout')resetMeeting();});
$('#ul-meeting-form').addEventListener('submit',async e=>{e.preventDefault();const form=e.target,button=$('#ul-meeting-save');button.disabled=true;button.textContent=t('저장 중…');$('#ul-meeting-notice').textContent='';try{const input={};for(const key of ['title','starts','language','link'])input[key]=form.elements.namedItem(key).value;input.link=normalizeMeetingLink(input.link);form.elements.link.value=input.link;if(meetingEditId)input.id=meetingEditId;await api('/api/meetings',input);await refresh();resetMeeting();$('#ul-meeting-notice').textContent=t('미팅을 저장했습니다.');}catch(error){if(error.status===401){auth.authenticated=false;applyLocale();show('auth');$('#ul-auth-notice').textContent=t(error.message);}else $('#ul-meeting-notice').textContent=t(error.message);}finally{button.disabled=false;button.textContent=t(meetingEditId?'저장하기':'등록하기');}});
async function loadExperiences(){
 if(experiencesLoaded||experiencesLoading)return;
 experiencesLoading=true;experiencesFailed=false;renderExperiences();
 try{const response=await fetch(new URL('./experiences.json',document.baseURI));if(!response.ok)throw new Error('catalog');const data=await response.json();if(!Array.isArray(data))throw new Error('catalog');
 experiences=normalizeCases(data);experiencesLoaded=true;
 }catch{experiencesFailed=true;}finally{experiencesLoading=false;renderExperiences();}
}
function renderExperiences(){
 const categories=[...new Set([...defaultExperienceCategories,...experiences.flatMap(x=>x.categories)])];
 $('#ul-experience-categories').innerHTML=[['','전체'],...categories.map(value=>[value,value])].map(([value,label])=>'<button type="button" data-case-category="'+esc(value)+'" aria-pressed="'+String(value===experienceCategory)+'">'+esc(t(label))+'</button>').join('');

 const country=$('#ul-experience-country'),language=$('#ul-experience-language');
 for(const [select,key,label] of [[country,'country','전체 국가'],[language,'language','전체 언어']]){const selected=select.value;select.innerHTML='<option value="">'+t(label)+'</option>'+[...new Set(experiences.map(x=>x[key]).filter(Boolean))].sort().map(value=>'<option value="'+esc(value)+'">'+esc(value)+'</option>').join('');select.value=selected;}
 const query=$('#ul-experience-search').value.trim().toLowerCase();
 const list=experiences.filter(x=>(!experienceCategory||x.categories.includes(experienceCategory))&&(!country.value||x.country===country.value)&&(!language.value||x.language===language.value)&&(!query||[x.title,x.country,x.summary,...x.categories].join(' ').toLowerCase().includes(query)));
 $('#ul-experience-list').innerHTML=experiencesLoading?'<p class="ul-sub">'+t('사례를 불러오는 중입니다.')+'</p>':experiencesFailed?'<p class="ul-sub">'+t('사례를 불러오지 못했습니다.')+'</p>':list.length?list.map(x=>'<article class="ul-item"><span class="ul-tag">'+esc([x.country,x.language].filter(Boolean).join(' · '))+'</span><h3>'+esc(x.title)+'</h3>'+(x.summary?'<span class="ul-tag">'+t('한국어 요약')+'</span><p class="ul-case-summary">'+esc(x.summary)+'</p>':'')+(x.url?'<a class="ul-kakao-link" href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">'+t('원문 보기')+'</a><button type="button" data-copy-experience="'+esc(x.id)+'">'+t('링크 복사')+'</button>':'')+'</article>').join(''):'<p class="ul-sub">'+t(experiences.length?'조건에 맞는 사례가 없습니다.':'등록된 사례가 없습니다.')+'</p>';
}
$('#ul-experience-search').addEventListener('input',renderExperiences);
$('#ul-experience-country').addEventListener('change',renderExperiences);
$('#ul-experience-language').addEventListener('change',renderExperiences);
root.addEventListener('click',async e=>{const category=e.target.closest('[data-case-category]');if(category){experienceCategory=category.dataset.caseCategory;renderExperiences();return;}const button=e.target.closest('[data-copy-experience]');if(!button)return;const item=experiences.find(x=>x.id===button.dataset.copyExperience);if(!item)return;try{await navigator.clipboard.writeText(item.url);button.textContent=t('링크를 복사했습니다.');}catch{button.textContent=item.url;}});
$('#ul-import-local').addEventListener('click',async()=>{
 const button=$('#ul-import-local'),notice=$('#ul-import-notice');button.disabled=true;notice.textContent='기존 자료와 미팅을 옮기는 중입니다…';
 try{const {data,error}=await backend.client.auth.getSession();if(error)throw error;const res=await fetch('/api/migrate-cloud',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({accessToken:data.session?.access_token})});const result=await res.json();if(!res.ok)throw new Error(result.error);await refresh();notice.textContent='완료: 자료 '+result.materials+'개, 미팅 '+result.meetings+'개를 옮겼습니다.';}
 catch(error){notice.textContent=error.message;}finally{button.disabled=false;}
});
show(adminMode?'auth':'home');applyLocale();refresh().catch(error=>{$('#ul-list').textContent=error.message;});
})();

