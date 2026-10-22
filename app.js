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
const {normalizeCases} = await import(new URL('./case-catalog.js?v=categories5',document.baseURI));
const {caseCuration,getCaseCuration,curateCases,curationCounts} = await import(new URL('./case-curation.js?v=20261022-topic-adjustment',document.baseURI));
const {sourceWatchUrl} = await import(new URL('./subtitle-data.js?v=20261022-source-start',document.baseURI));
const {getMaterialVideos} = await import(new URL('./material-videos.js?v=1',document.baseURI));
const {groupMeetings} = await import(new URL('./meeting-schedule.js?v=1',document.baseURI));
const adminMode = new URLSearchParams(location.search).get('admin') === '1';
const root=document.getElementById('ulilife-preview'), $=s=>root.querySelector(s);
const inquiryUrl = $('.ul-direct-inquiry').href;
const translations={
 '안드로이드 앱 설치':['Install Android app','Androidアプリをインストール','安装安卓应用'],
 '안드로이드 10 이상 · APK 파일 다운로드':['Android 10 or later · Download APK','Android 10以降 · APKをダウンロード','安卓10及以上 · 下载APK文件'],
 'QR 보기':['Show QR','QRを表示','显示二维码'],
 'QR 닫기':['Close QR','QRを閉じる','关闭二维码'],
 '카카오톡 문의 QR코드':['KakaoTalk contact QR code','カカオトークお問い合わせ用QRコード','KakaoTalk咨询二维码'],
 '휴대폰 카메라로 QR코드를 스캔해 주세요.':['Scan the QR code with your phone camera.','スマートフォンのカメラでQRコードを読み取ってください。','请使用手机相机扫描二维码。'],
 '처음 오셨나요?':['New to OlyLINK?','初めてご利用ですか？','初次使用？'],
 '자료실에서 사업 소개를 살펴보세요. 설명회에 참여하거나 카카오톡으로 궁금한 점을 물어볼 수 있습니다.':['Explore the business introduction in the library. Join a session or ask your questions on KakaoTalk.','資料室でビジネスの紹介をご覧ください。説明会への参加や、カカオトークでのご質問もできます。','在资料库了解事业介绍。您可以参加说明会，或通过KakaoTalk咨询。'],
 '자료실부터 둘러보기':['Explore the library first','まず資料室を見る','先浏览资料库'],
 '자료를 보고 궁금한 점이 생기셨나요?':['Questions about this material?','この資料についてご質問はありますか？','对这份资料有疑问？'],
 '이 자료 문의하기':['Ask about this material','この資料について問い合わせる','咨询这份资料'],
 '오늘·예정 일정':['Today & upcoming','本日・今後の予定','今天与未来日程'],
 '지난 일정 보기':['View past sessions','過去の日程を見る','查看往期日程'],
 '지난 일정':['Past session','過去の日程','往期日程'],
 '예정된 일정이 없습니다. 새 설명회 일정은 카카오톡으로 문의해 주세요.':['No upcoming sessions. Ask about the next session on KakaoTalk.','今後の予定はありません。次回の説明会はカカオトークでお問い合わせください。','暂无未来日程。请通过KakaoTalk咨询下次说明会。'],
 '참여 링크를 준비하고 있습니다. 참여 방법은 카카오톡으로 문의해 주세요.':['The join link is being prepared. Ask how to join on KakaoTalk.','参加リンクは準備中です。参加方法はカカオトークでお問い合わせください。','参会链接正在准备中。请通过KakaoTalk咨询参与方式。'],
 '참여 방법 문의':['Ask how to join','参加方法を問い合わせる','咨询参与方式'],
 '일정 확인 필요':['Schedule to be confirmed','日程の確認が必要です','日程待确认'],
"홈":["Home","ホーム","首页"],
"Olylife 비지니스를 하나의 앱으로.":["Olylife business in one app.","Olylifeビジネスをひとつのアプリで。","Olylife事业，尽在一个应用。"],
"구글미팅":["Google Meet","Google Meet","Google Meet"],
"설명회":["Sessions","説明会","说明会"],
"교육":["Learning","教育","培训"],
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
 '관리자 전용':['Administrators only','管理者専用','仅限管理员'],
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
 'Google 계정으로 로그인':['Sign in with Google','Google でログイン','使用 Google 登录'],
 '개인정보 안내':['Privacy','プライバシー','隐私说明'],
 '구글 계정으로 간편하게 로그인하세요.':['Sign in with your Google account.','Google アカウントでログインしてください。','使用 Google 账号登录。'],
 '이 계정에는 관리자 권한이 없습니다.':['This account does not have administrator access.','このアカウントには管理者権限がありません。','此账号没有管理员权限。'],
 '구글 로그인이 취소되었거나 완료되지 않았습니다.':['Google sign-in was cancelled or could not be completed.','Google ログインがキャンセルされたか、完了しませんでした。','Google 登录已取消或未完成。'],
 '구글 로그인을 다시 시작해 주세요.':['Please start Google sign-in again.','Google ログインをもう一度開始してください。','请重新开始 Google 登录。'],
 '구글 로그인을 완료하지 못했습니다. 다시 시도해 주세요.':['Google sign-in could not be completed. Please try again.','Google ログインを完了できませんでした。もう一度お試しください。','无法完成 Google 登录，请重试。'],
 '구글 로그인을 사용하려면 최신 앱으로 업데이트하거나 웹 브라우저에서 열어 주세요.':['Update the app or open OlyLINK in your web browser to use Google sign-in.','Google ログインには、アプリを更新するかブラウザで開いてください。','请更新应用或在浏览器打开，以使用 Google 登录。'],
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
 '원문 보기':['View original','原文を見る','查看原文'], '한국어 요약':['Korean summary','韓国語の要約','韩语摘要'], '원문 링크복사':['Copy source link','原文リンクをコピー','复制原文链接'], '원문 영상':['Original video','元の動画','原始视频'],
 '링크를 복사했습니다.':['Link copied.','リンクをコピーしました。','链接已复制。'],
 '사례를 불러오는 중입니다.':['Loading experiences…','体験談を読み込み中…','正在加载体验案例…'],
 '사례를 불러오지 못했습니다.':['Could not load experiences.','体験談を読み込めませんでした。','无法加载体验案例。']
});
const t=key=>locale==='ko'?key:(translations[key]?.[{en:0,ja:1,zh:2}[locale]]??key);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const knownLocales=['ko','en','ja','zh'];
let locale='ko';try { const saved=localStorage.getItem('olylife_locale');if(knownLocales.includes(saved))locale=saved; } catch {}
let experiences=[],experiencesLoaded=false,experiencesLoading=false,experiencesFailed=false,experienceCategory='',caseEditId=null,caseRequest=0;
let caseCurationView='representative';
const defaultExperienceCategories=Object.keys(caseCuration);
let materials=[],meetings=[],auth={initialized:!!backend,authenticated:false,signedIn:false},section='home',editId=null,meetingEditId=null,detailId=null,authRequest=0;
let preparedPublishController=null;
const textNodes=[],attrs=[];
const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
while(walker.nextNode()){const node=walker.currentNode;if(node.parentElement.closest('script,style,option'))continue;const key=node.textContent.trim();if(translations[key])textNodes.push({node,key});}
root.querySelectorAll('[placeholder],[aria-label]').forEach(el=>{for(const name of ['placeholder','aria-label']){const key=el.getAttribute(name);if(translations[key])attrs.push({el,name,key});}});
async function api(url,body){if(backend)return backend.api(url,body);const res=await fetch(url,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{});const data=await res.json();if(!res.ok){const error=new Error(data.error||'Request failed');error.status=res.status;throw error;}return data;}
function show(value){if(value==='experiences'&&!(auth.authenticated||experiences.some(x=>x.visibility==='public')))value=adminMode?'auth':'home';if(value==='experiences')loadExperiences();if(!adminMode&&(['admin','meeting-admin'].includes(value)||(value==='auth'&&!auth.googleEnabled)))value='library';section=value;if(section==='meetings'&&auth.authenticated)section='meeting-admin';if(['admin','meeting-admin'].includes(section)&&!auth.authenticated)section='auth';root.querySelectorAll('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==section);root.querySelectorAll('.ul-app-nav [data-section]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.section===section)));}
function applyLocale(){
$('#ul-kakao-qr-toggle').textContent=t($('#ul-kakao-qr-panel').hidden?'QR 보기':'QR 닫기');
$('#ul-kakao-qr-panel img').alt=t('카카오톡 문의 QR코드');
$('#ul-email-label').hidden=!backend;
$('#ul-auth-form').elements.email.required=!!backend;
$('#ul-auth-form').elements.password.minLength=backend?6:10;
$('#ul-import-local').hidden=!backend||!auth.authenticated||!['127.0.0.1','localhost'].includes(location.hostname);
const preparedPublish=$('#ul-prepared-publish');if(preparedPublish){preparedPublish.hidden=!auth.authenticated;$('#ul-prepared-publish-notice').hidden=!auth.authenticated;}
root.lang=locale;document.documentElement.lang=locale;$('#ul-locale').value=locale;textNodes.forEach(({node,key})=>node.textContent=t(key));attrs.forEach(({el,name,key})=>el.setAttribute(name,t(key)));$('#ul-auth-title').textContent=t(auth.initialized?'관리자 로그인':'관리자 비밀번호 설정');$('#ul-auth-submit').textContent=t(auth.initialized?'로그인':'설정하고 시작하기');$('#ul-auth-description').textContent=t(auth.initialized?'설정한 관리자 비밀번호를 입력하세요.':'비밀번호를 10자 이상으로 정하세요. 이 컴퓨터의 관리자 계정에만 사용됩니다.');$('#ul-auth-form').elements.password.autocomplete=auth.initialized?'current-password':'new-password';$('#ul-form-title').textContent=t(editId?'자료 수정':'새 자료 등록');$('#ul-save').textContent=t(editId?'저장하기':'등록하기');$('#ul-file-label').textContent=t(editId?'등록된 PDF를 유지합니다. 새 파일을 선택하면 교체됩니다.':'PDF 최대 15MB · 이 컴퓨터에 저장합니다.');if(backend){$('#ul-auth-description').textContent=locale==='ko'?'수파베이스에서 만든 관리자 이메일과 비밀번호를 입력하세요.':'Sign in with your administrator email and password.';$('#ul-file-label').textContent=locale==='ko'?'PDF 최대 15MB':'PDF · Max 15MB';}
$('#ul-auth-form').hidden=!adminMode;
if(!adminMode){$('#ul-auth-title').textContent=t('로그인');$('#ul-auth-description').textContent=t('구글 계정으로 간편하게 로그인하세요.');}
$('#ul-google-login').hidden=!backend||!auth.googleEnabled;
$('#ul-google-login').disabled=!auth.googleSupported;
$('#ul-google-help').hidden=!backend||!auth.googleEnabled||auth.googleSupported;
$('#ul-google-help').textContent=t('구글 로그인을 사용하려면 최신 앱으로 업데이트하거나 웹 브라우저에서 열어 주세요.');
$('#ul-admin-nav').hidden=!auth.authenticated;
$('#ul-login').hidden=!adminMode||auth.authenticated;
$('#ul-user-login').hidden=adminMode||!backend||!auth.googleEnabled||auth.signedIn;
$('#ul-logout').hidden=!(auth.authenticated||auth.signedIn);
$('footer').hidden=$('#ul-login').hidden&&$('#ul-user-login').hidden&&$('#ul-logout').hidden;
render();renderMeetings();renderExperiences();if(detailId)detail(detailId);}
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
 const videos=getMaterialVideos(id);
 if(videos.length)panel.innerHTML+='<section class="ul-material-videos" aria-label="비지니스 플랜 영상"><h4>비지니스 플랜 · 원본영상 '+videos.length+'개</h4><p class="ul-meta">유튜브 설정 → 자막 → 자동번역 → 한국어로 시청할 수 있습니다.</p>'+videos.map(v=>'<article class="ul-material-video"><span class="ul-tag">'+esc(v.channel)+'</span><p class="ul-material-original">'+esc(v.title)+'</p><span class="ul-meta">한국어 제목 번역</span><h4>'+esc(v.titleKo)+'</h4><p>'+esc(v.summaryKo)+'</p><p class="ul-meta">게시자 설명 기준 요약 · 영상 전체 발언 번역은 아닙니다.</p><a class="ul-kakao-link" href="'+esc(v.url)+'" target="_blank" rel="noopener noreferrer">원본 영상 보기 ↗</a></article>').join('')+'</section>';
 panel.innerHTML+='<div class="ul-material-inquiry"><p>'+t('자료를 보고 궁금한 점이 생기셨나요?')+'</p><a class="ul-kakao-link" href="'+esc(inquiryUrl)+'" target="_blank" rel="noopener noreferrer">'+t('이 자료 문의하기')+'</a></div>';
}
function clearCases(){closeSubtitles();++caseRequest;experiences=[];experiencesLoaded=false;experiencesLoading=false;$('#ul-case-form').reset();$('#ul-case-form').hidden=true;$('#ul-experience-list').replaceChildren();$('#ul-case-tools').hidden=true;$('#ul-cases-nav').hidden=true;$('#ul-home-cases').hidden=true;}
async function refresh(){const request=++authRequest;clearCases();const results=await Promise.all([api('/api/auth/status'),api('/api/materials'),api('/api/meetings')]);if(request!==authRequest)return;[auth,materials,meetings]=results;if(!adminMode)auth.authenticated=false;applyLocale();if(auth.loginError){$('#ul-auth-notice').textContent=t(auth.loginError);show('auth');}else if(adminMode&&auth.signedIn&&!auth.authenticated){$('#ul-auth-notice').textContent=t('이 계정에는 관리자 권한이 없습니다.');}await loadExperiences();if(adminMode&&section==='auth'&&auth.authenticated)show('admin');if(section==='experiences'&&!auth.authenticated&&!experiences.length)show('home');}
root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.section)show(b.dataset.section);if(['ul-login','ul-user-login'].includes(b.id)){show('auth');$('#ul-auth-notice').textContent='';}if(b.dataset.view)detail(b.dataset.view,true);if(b.dataset.edit){const x=materials.find(x=>x.id===b.dataset.edit);editId=x.id;for(const key of ['title','language','description','source'])$('#ul-form').elements.namedItem(key).value=x[key];$('#ul-form').elements.file.value='';$('#ul-cancel').hidden=false;applyLocale();$('#ul-form').scrollIntoView({block:'start',behavior:'smooth'});}});
$('#ul-locale').addEventListener('change',e=>{locale=e.target.value;try {localStorage.setItem('olylife_locale',locale);}catch {}applyLocale();});
$('#ul-kakao-qr-toggle').addEventListener('click',()=>{const panel=$('#ul-kakao-qr-panel'),button=$('#ul-kakao-qr-toggle'),expanded=panel.hidden;panel.hidden=!expanded;button.setAttribute('aria-expanded',String(expanded));button.textContent=t(expanded?'QR 닫기':'QR 보기');});
$('#ul-search').addEventListener('input',()=>{render();detailId=null;$('#ul-detail').hidden=true;});
function reset(){editId=null;$('#ul-form').reset();$('#ul-cancel').hidden=true;applyLocale();}
$('#ul-cancel').addEventListener('click',reset);
$('#ul-auth-form').addEventListener('submit',async e=>{e.preventDefault();const button=$('#ul-auth-submit');button.disabled=true;$('#ul-auth-notice').textContent='';try {await api(auth.initialized?'/api/auth/login':'/api/auth/setup',{email:e.target.elements.email.value,password:e.target.elements.password.value});e.target.reset();await refresh();show('admin');}catch(error){$('#ul-auth-notice').textContent=t(error.message);}finally{button.disabled=false;}});
$('#ul-google-login').addEventListener('click',async()=>{const button=$('#ul-google-login');button.disabled=true;$('#ul-auth-notice').textContent='';try{const result=await api('/api/auth/google',{});location.assign(result.url);}catch(error){$('#ul-auth-notice').textContent=t(error.message);button.disabled=!auth.googleSupported;}});
$('#ul-logout').addEventListener('click',async()=>{++authRequest;clearCases();auth.authenticated=false;auth.signedIn=false;auth.user=null;applyLocale();show('home');try{await api('/api/auth/logout',{});await refresh();reset();show('home');}catch(error){$('#ul-notice').textContent=t(error.message);}});
function fileBase64(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error('Could not read file'));reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.readAsDataURL(file);});}
$('#ul-form').addEventListener('submit',async e=>{e.preventDefault();const button=$('#ul-save'),form=e.target,file=form.elements.file.files[0];$('#ul-notice').textContent='';button.disabled=true;button.textContent=t('저장 중…');try{if(!editId&&!file)throw new Error('파일을 선택하세요.');if(file&&(!/\.pdf$/i.test(file.name)))throw new Error('PDF 파일만 등록할 수 있습니다.');if(file&&file.size>15*1024*1024)throw new Error('PDF 최대 크기는 15MB입니다.');const input={};for(const key of ['title','language','description','source'])input[key]=form.elements.namedItem(key).value;if(editId)input.id=editId;if(file){input.filename=file.name;input.fileBase64=await fileBase64(file);}await api('/api/materials',input);detailId=null;$('#ul-detail').hidden=true;await refresh();reset();$('#ul-notice').textContent=t('자료를 저장했습니다.');}catch(error){if(error.status===401){auth.authenticated=false;applyLocale();show('auth');$('#ul-auth-notice').textContent=t(error.message);}else $('#ul-notice').textContent=t(error.message);}finally{button.disabled=false;button.textContent=t(editId?'저장하기':'등록하기');}});
function renderMeetings(){
 const formatter=new Intl.DateTimeFormat({ko:'ko-KR',en:'en-US',ja:'ja-JP',zh:'zh-CN'}[locale],{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Seoul'});
 const date=x=>Number.isFinite(new Date(x.starts).getTime())?esc(formatter.format(new Date(x.starts)))+' · KST (UTC+9)':t('일정 확인 필요');
 const {upcoming,past}=groupMeetings(meetings);
 const inquiry='<a class="ul-kakao-link" href="'+esc(inquiryUrl)+'" target="_blank" rel="noopener noreferrer">'+t('참여 방법 문의')+'</a>';
 const card=(x,archived=false)=>'<article class="ul-item ul-meeting"><span class="ul-tag">'+esc(x.language)+'</span><h3>'+esc(x.title)+'</h3><p class="ul-meta">'+date(x)+'</p>'+(archived?'<p class="ul-meta">'+t('지난 일정')+'</p>':x.link?'<a class="ul-kakao-link" href="'+esc(x.link)+'" target="_blank" rel="noopener noreferrer">'+t('참여하기')+'</a>':'<p class="ul-meta">'+t('참여 링크를 준비하고 있습니다. 참여 방법은 카카오톡으로 문의해 주세요.')+'</p>'+inquiry)+'</article>';
 $('#ul-meetings').innerHTML='<h3 class="ul-schedule-heading">'+t('오늘·예정 일정')+'</h3>'+(upcoming.length?upcoming.map(x=>card(x)).join(''):'<p class="ul-sub">'+t('예정된 일정이 없습니다. 새 설명회 일정은 카카오톡으로 문의해 주세요.')+'</p>'+inquiry)+(past.length?'<details class="ul-past-meetings"><summary>'+t('지난 일정 보기')+' ('+past.length+')</summary>'+past.map(x=>card(x,true)).join('')+'</details>':'');
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
 const request=++caseRequest;
 experiencesLoading=true;experiencesFailed=false;renderExperiences();
 try{const data=await api(auth.authenticated?'/api/experiences/admin':'/api/experiences');if(request!==caseRequest)return;if(!Array.isArray(data))throw new Error('catalog');experiences=normalizeCases(data);experiencesLoaded=true;
 }catch{if(request===caseRequest){experiences=[];experiencesFailed=true;}}finally{if(request===caseRequest){experiencesLoading=false;renderExperiences();}}
}
function renderExperiences(){
 const available=auth.authenticated||experiences.some(x=>x.visibility==='public');
 $('#ul-cases-nav').hidden=!available;$('#ul-home-cases').hidden=!available;$('#ul-case-tools').hidden=!auth.authenticated;
 $('#ul-home-title').textContent=t('Olylife 비지니스를 하나의 앱으로.');
 root.querySelectorAll('.ul-app-nav button:not([hidden])').forEach(b=>b.style.flexBasis=available?'calc((100% - 24px)/4)':'calc((100% - 16px)/3)');
 const used=new Set(experiences.flatMap(x=>x.categories));const categories=[...new Set([...defaultExperienceCategories.filter(x=>used.has(x)||['치매','신장·방광','정력·성기능','여성 요실금'].includes(x)),...used])];
 $('#ul-experience-categories').innerHTML=[['','전체'],...categories.map(value=>[value,value])].map(([value,label])=>'<button type="button" data-case-category="'+esc(value)+'" aria-pressed="'+String(value===experienceCategory)+'">'+esc(t(label))+'</button>').join('');

 const country=$('#ul-experience-country'),language=$('#ul-experience-language');
 for(const [select,key,label] of [[country,'country','전체 국가'],[language,'language','전체 언어']]){const selected=select.value;select.innerHTML='<option value="">'+t(label)+'</option>'+[...new Set(experiences.map(x=>x[key]).filter(Boolean))].sort().map(value=>'<option value="'+esc(value)+'">'+esc(value)+'</option>').join('');select.value=selected;}
 const query=$('#ul-experience-search').value.trim().toLowerCase();
 const media=$('#ul-case-media').value,visibility=auth.authenticated?$('#ul-case-visibility').value:'public';
 const matching=experiences.filter(x=>(!visibility||x.visibility===visibility)&&(!media||x.media_type===media)&&(!experienceCategory||x.categories.includes(experienceCategory))&&(!country.value||x.country===country.value)&&(!language.value||x.language===language.value)&&(!query||[x.id,x.title,x.country,x.summary,...x.categories].join(' ').toLowerCase().includes(query)));
 const selection=curationCounts(matching,experienceCategory);
 $('#ul-case-curation').hidden=!selection;
 $('#ul-case-curation-label').hidden=!auth.authenticated;
 $('#ul-case-curation-view').value=auth.authenticated?caseCurationView:'representative';
 $('#ul-case-curation-summary').textContent=selection?(locale==='ko'?'대표 '+selection.representative+'건'+(selection.retained?' · 등 자료 '+selection.retained+'건':'')+(auth.authenticated?' · 후보 '+selection.candidate+'건 · 후보는 삭제하지 않고 보관합니다.':''):selection.representative+' selected'+(auth.authenticated?' · '+selection.candidate+' candidates':'')):'';
 const list=curateCases(matching,experienceCategory,caseCurationView,auth.authenticated);
 $('#ul-case-count').textContent=locale==='ko'?'사례 '+list.length+'건 · 영상 '+list.filter(x=>x.media_type==='video').length+'건 · 글 '+list.filter(x=>x.media_type!=='video').length+'건':list.length+' cases';
 $('#ul-experience-list').innerHTML=experiencesLoading?'<p class="ul-sub">'+t('사례를 불러오는 중입니다.')+'</p>':experiencesFailed?'<p class="ul-sub">'+t('사례를 불러오지 못했습니다.')+'</p>':list.length?list.map(x=>'<article class="ul-item"><span class="ul-tag">'+esc([x.country,x.language].filter(Boolean).join(' · '))+'</span><h3>'+esc(x.title)+'</h3>'+(auth.authenticated?'<p class="ul-meta">'+esc(x.id)+' · '+esc(x.visibility==='public'?'공개':'관리자 전용')+'</p>':'')+(x.summary?'<span class="ul-tag">'+t('한국어 요약')+'</span><p class="ul-case-summary">'+esc(x.summary)+'</p>':'')+(x.video_url?(auth.authenticated&&/^OLY-\d{3}$/.test(x.id)?'<button type="button" data-case-subtitle="'+esc(x.id)+'">한국어 자막영상</button>':'')+'<a class="ul-kakao-link" href="'+esc(x.video_url)+'" target="_blank" rel="noopener noreferrer">'+t('원문 영상')+'</a>':'')+(x.url?'<button type="button" data-copy-experience="'+esc(x.id)+'">'+t('원문 링크복사')+'</button>':'')+(auth.authenticated?'<p class="ul-meta">'+esc(x.review_status)+'</p><button type="button" data-case-edit="'+esc(x.id)+'">사례 수정 · 공개 설정</button>':'')+'</article>').join(''):'<p class="ul-sub">'+t(experiences.length?'조건에 맞는 사례가 없습니다.':'등록된 사례가 없습니다.')+'</p>';
 showCurationLabels(list);
}
function showCurationLabels(list) {
 if(!experienceCategory)return;
 $('#ul-experience-list').querySelectorAll('article').forEach((article,index)=>{
  const selected=getCaseCuration(list[index].id,experienceCategory);if(!selected)return;
  const label=selected.state==='representative'?'대표 '+selected.rank+(selected.label?' · '+selected.label:''):selected.state==='retained'?'등 자료':'후보 자료';
  const badge=document.createElement('span');badge.className='ul-tag';badge.textContent=label;
  article.querySelector('h3').before(badge);
  if(selected.excerpt){
   const originalLink=article.querySelector('a.ul-kakao-link');
   if(originalLink)originalLink.href=sourceWatchUrl(originalLink.href,selected.excerpt.start);
   const clock=value=>{const seconds=Math.floor(value);return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');};
   const range=document.createElement('p');range.className='ul-sub';
   range.textContent='이 분류의 선정 구간: '+clock(selected.excerpt.start)+'–'+clock(selected.excerpt.end)+' · 한국어 자막영상에서 해당 구간의 대본을 확인할 수 있습니다.';
   article.querySelector('h3').after(range);
  }
  if(auth.authenticated&&selected.state==='candidate'){
   const reason=document.createElement('p');reason.className='ul-sub';reason.textContent='후보 보관 이유: '+selected.reason;
   article.querySelector('h3').after(reason);
  }
 });
}
$('#ul-experience-search').addEventListener('input',renderExperiences);
$('#ul-experience-country').addEventListener('change',renderExperiences);
$('#ul-experience-language').addEventListener('change',renderExperiences);
$('#ul-case-media').addEventListener('change',renderExperiences);
$('#ul-case-visibility').addEventListener('change',renderExperiences);
$('#ul-case-curation-view').addEventListener('change',e=>{caseCurationView=e.target.value;renderExperiences();});
function openCaseForm(item){if(!auth.authenticated)return;caseEditId=item?.id??null;const form=$('#ul-case-form');form.reset();if(item)for(const key of ['title','summary','country','language','url','video_url','media_type','review_status','visibility'])form.elements.namedItem(key).value=item[key];form.elements.categories.value=item?.categories.join(', ')??'';if(!item){form.elements.visibility.value='admin';form.elements.media_type.value='document';}$('#ul-case-playback-files').hidden=!backend||!/^OLY-\d{3}$/.test(caseEditId||'');$('#ul-case-playback-files').open=false;$('#ul-case-playback-notice').textContent='';form.hidden=false;form.scrollIntoView({block:'start',behavior:'smooth'});}
$('#ul-case-new').addEventListener('click',()=>openCaseForm());
$('#ul-case-cancel').addEventListener('click',()=>{$('#ul-case-form').hidden=true;caseEditId=null;});
$('#ul-case-playback-upload').addEventListener('click',async()=>{
 if(!auth.authenticated||!backend||!/^OLY-\d{3}$/.test(caseEditId||''))return;
 const id=caseEditId,file=$('#ul-case-playback-file').files[0],button=$('#ul-case-playback-upload'),notice=$('#ul-case-playback-notice');
 if(!file){notice.textContent='MP4 영상 파일을 선택해주세요.';return;}
 if(!/\.mp4$/i.test(file.name)||!file.size||file.size>50*1024*1024){notice.textContent='50MB 이하 MP4 영상을 선택해주세요.';return;}
 button.disabled=true;notice.textContent='비공개 재생 파일을 등록하고 있습니다…';
 try{await api('/api/subtitles/media/import',{files:[new File([file],id+'.mp4',{type:'video/mp4'})]});notice.textContent='비공개 재생 파일을 연결했습니다. 창을 닫고 한국어 자막영상을 열어주세요.';}
 catch(error){notice.textContent=error.message;}finally{button.disabled=false;}
});
$('#ul-case-form').addEventListener('submit',async e=>{e.preventDefault();if(!auth.authenticated)return;const form=e.target,button=form.querySelector('[type="submit"]'),notice=$('#ul-case-notice');button.disabled=true;try{const input={id:caseEditId??crypto.randomUUID()};for(const key of ['title','summary','country','language','url','video_url','media_type','review_status','visibility'])input[key]=form.elements.namedItem(key).value;input.categories=form.elements.categories.value.split(/[,，]/).map(x=>x.trim()).filter(Boolean);await api('/api/experiences/admin',input);await refresh();notice.textContent=input.visibility==='public'?'공개로 저장했습니다.':'관리자 전용으로 저장했습니다.';}catch(error){notice.textContent=error.message;}finally{button.disabled=false;}});
root.addEventListener('click',e=>{const button=e.target.closest('[data-case-edit]');if(button&&auth.authenticated)openCaseForm(experiences.find(x=>x.id===button.dataset.caseEdit));});
root.addEventListener('click',async e=>{const category=e.target.closest('[data-case-category]');if(category){experienceCategory=category.dataset.caseCategory;caseCurationView='representative';renderExperiences();return;}const button=e.target.closest('[data-copy-experience]');if(!button)return;const item=experiences.find(x=>x.id===button.dataset.copyExperience);if(!item)return;const selected=getCaseCuration(item.id,experienceCategory),source=sourceWatchUrl(item.url,selected?.excerpt?.start);try{await navigator.clipboard.writeText(source);button.textContent=t('링크를 복사했습니다.');}catch{button.textContent=source;}});
$('#ul-import-local').addEventListener('click',async()=>{
 const button=$('#ul-import-local'),notice=$('#ul-import-notice');button.disabled=true;notice.textContent='기존 자료와 미팅을 옮기는 중입니다…';
 try{const {data,error}=await backend.client.auth.getSession();if(error)throw error;const res=await fetch('/api/migrate-cloud',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({accessToken:data.session?.access_token})});const result=await res.json();if(!res.ok)throw new Error(result.error);await refresh();notice.textContent='완료: 자료 '+result.materials+'개, 미팅 '+result.meetings+'개를 옮겼습니다.';}
 catch(error){notice.textContent=error.message;}finally{button.disabled=false;}
});

let subtitlePlayer=null,subtitleRequest=0,subtitleDialog=null,subtitleFocus=null;
function closeSubtitles(){++subtitleRequest;try{subtitlePlayer?.destroy();}catch{}subtitlePlayer=null;if(subtitleDialog){subtitleDialog.close();subtitleDialog.remove();subtitleDialog=null;}subtitleFocus?.focus();subtitleFocus=null;}
async function openSubtitles(id,button){
 if(!auth.authenticated)return;closeSubtitles();const request=++subtitleRequest;subtitleFocus=button;
 const selection=getCaseCuration(id,experienceCategory),excerpt=selection?.excerpt;
 const dialog=document.createElement('dialog');dialog.className='oly-subtitle-dialog';dialog.setAttribute('aria-label','한국어 자막 영상');
 const close=document.createElement('button');close.type='button';close.textContent='닫기';close.className='os-close';
 const content=document.createElement('div');content.textContent='한국어 자막을 불러오고 있습니다.';dialog.append(close,content);document.body.append(dialog);subtitleDialog=dialog;dialog.showModal();close.focus();
 close.addEventListener('click',closeSubtitles);dialog.addEventListener('cancel',event=>{event.preventDefault();closeSubtitles();});
 try{const [data,module]=await Promise.all([api('/api/experiences/'+id+'/subtitles'),import(new URL('./subtitle-player.js?v=20261022-click-connect-v2',document.baseURI))]);if(request!==subtitleRequest||!auth.authenticated)return;subtitlePlayer=module.mountSubtitlePlayer(content,data,{mediaUrl:data.mediaUrl,excerpt,selectionLabel:selection?.label});}
 catch(error){if(request===subtitleRequest){content.textContent=error.message;if(error.status===401){clearCases();auth.authenticated=false;applyLocale();show('auth');}}}
}
root.addEventListener('click',event=>{const button=event.target.closest('[data-case-subtitle]');if(button&&auth.authenticated)openSubtitles(button.dataset.caseSubtitle,button);});

if(adminMode&&new URLSearchParams(location.search).get('playback-audit')==='1'){
 const {installPlaybackAudit}=await import('./playback-audit.js?v=20261022-audit3');
 installPlaybackAudit($('#ul-experience-list').parentElement,{api,getCases:()=>experiences,isAdmin:()=>auth.authenticated});
}

if(backend&&['127.0.0.1','localhost'].includes(location.hostname)){
 const button=document.createElement('button'),notice=document.createElement('p');
 button.id='ul-prepared-publish';button.type='button';button.hidden=true;button.textContent='준비된80개 온라인 등록';
 notice.id='ul-prepared-publish-notice';notice.hidden=true;notice.setAttribute('role','status');
 $('#ul-import-local').after(button,notice);
 button.addEventListener('click',async()=>{
  if(!auth.authenticated||preparedPublishController)return;
  const generation=authRequest,controller=new AbortController();preparedPublishController=controller;button.disabled=true;
  notice.textContent='관리자 권한과80개 등록 자료를 확인하고 있습니다.';
  try{
   const {data,error}=await backend.client.auth.getSession();if(error)throw error;
   if(!data.session?.access_token||generation!==authRequest||!auth.authenticated)throw new Error('관리자로 다시 로그인해 주세요.');
   const response=await fetch('/api/subtitles/prepared/publish',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({accessToken:data.session.access_token}),signal:controller.signal});
   if(!response.ok){const error=await response.json();throw new Error(error.error||'등록을 시작하지 못했습니다.');}
   const reader=response.body.getReader(),decoder=new TextDecoder();let pending='',complete=false;
   const progress=line=>{
    const value=JSON.parse(line);if(value.phase==='error')throw new Error(value.error);
    if(generation!==authRequest||!auth.authenticated){controller.abort();return;}
    if(value.phase==='catalog')notice.textContent='80개 자막 자료를 관리자 전용으로 등록합니다.';
    if(value.phase==='media')notice.textContent='영상 등록 '+value.completed+' / '+value.total+' · 기존 파일은 유지합니다.';
    if(value.phase==='verify')notice.textContent='등록 결과와 비공개 접근 설정을 확인하고 있습니다.';
    if(value.phase==='complete'){complete=true;notice.textContent='온라인80개 등록 완료 · 영상 '+value.media+'개 · 관리자 전용';}
   };
   try{while(true){const {value,done}=await reader.read();pending+=decoder.decode(value||new Uint8Array(),{stream:!done});let end;while((end=pending.indexOf('\n'))>=0){const line=pending.slice(0,end);pending=pending.slice(end+1);if(line.trim())progress(line);}if(done)break;}if(pending.trim())progress(pending);}finally{reader.releaseLock();}
   if(!complete)throw new Error('등록 연결이 끊겼습니다. 다시 누르면 완료된 파일은 유지하고 이어갑니다.');
   if(generation===authRequest&&auth.authenticated){experiencesLoaded=false;await loadExperiences();}
  }catch(error){if(generation===authRequest&&auth.authenticated)notice.textContent=error.name==='AbortError'?'등록을 중단했습니다. 다시 실행하면 이어갑니다.':error.message;}
  finally{if(preparedPublishController===controller)preparedPublishController=null;button.disabled=false;}
 });
}
if(backend)backend.client.auth.onAuthStateChange((event,session)=>{if(!session&&(auth.authenticated||auth.signedIn)){preparedPublishController?.abort();++authRequest;clearCases();auth.authenticated=false;auth.signedIn=false;auth.user=null;const preparedNotice=$('#ul-prepared-publish-notice');if(preparedNotice)preparedNotice.textContent='';applyLocale();show(adminMode?'auth':'home');}});
show(adminMode?'auth':'home');applyLocale();refresh().catch(error=>{$('#ul-list').textContent=error.message;});
})();

