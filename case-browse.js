function topic(id, labels, legacy = [], words = null) {
  const [label, ...translations] = labels;
  return {id, label, translations, legacy, words};
}

function group(id, labels, details, legacy = [], words = null) {
  return {...topic(id, labels, [...new Set([...legacy, ...details.flatMap(detail => detail.legacy)])], words), details};
}

export const caseBrowseGroups = [
  group('pain', ['통증·움직임', 'Pain & movement', '痛み・動き', '疼痛与活动'], [
    topic('neck-shoulder', ['목·어깨', 'Neck & shoulders', '首・肩', '颈肩'], ['어깨·목'], /목 움직임|어깨 (?:움직임|통증|긴장)|견갑골/),
    topic('back', ['허리·등', 'Back & lower back', '腰・背中', '腰背'], ['허리·등']),
    topic('hand-arm', ['손·팔', 'Hands & arms', '手・腕', '手臂与手部'], ['손·팔'], /손 통증|악력|팔 (?:부상|통증|움직임)/),
    topic('hip', ['엉덩이·고관절', 'Hips', 'お尻・股関節', '臀部与髋关节'], ['고관절']),
    topic('leg-foot', ['무릎·다리·발', 'Knees, legs & feet', '膝・脚・足', '膝腿与足部'], ['무릎', '다리'], /(?:다리|발목|발)이? (?:신경 )?통증|발이 아프|무릎 통증|발목 붓기/),
    topic('whole-body', ['여러 관절·전신', 'Multiple joints & whole body', '複数の関節・全身', '多关节与全身'], ['관절·통증'], /몸 곳곳이 아프|몸이 아플 때|몸의 뻐근함|여러 관절|모든 관절/)
  ], ['류마티스', '운동·회복'], /통증|두통|생리통|쑤시|욱신|뻐근/),
  group('senses', ['머리·눈·감각', 'Head, eyes & senses', '頭・目・感覚', '头部、眼睛与感觉'], [
    topic('headache', ['두통·어지럼', 'Headache & dizziness', '頭痛・めまい', '头痛与头晕'], ['뇌·두통'], /두통|어지럼/),
    topic('focus-memory', ['집중·기억', 'Focus & memory', '集中・記憶', '专注与记忆'], ['기억·인지', '치매']),
    topic('vision', ['눈·시야', 'Eyes & vision', '目・視界', '眼睛与视野'], ['눈·시야']),
    topic('tingling-tremor', ['손발 저림·떨림', 'Tingling & tremors', '手足のしびれ・震え', '手脚麻木与颤抖'], ['신경·저림·경련', '파킨슨 관련'])
  ], ['얼굴·귀·코·턱']),
  group('sleep-mood', ['잠·기운·마음', 'Sleep, energy & mood', '睡眠・活力・気分', '睡眠、精力与情绪'], [
    topic('falling-asleep', ['수면', 'Sleep', '睡眠', '睡眠'], ['잠들기 어려움'], /잠들기|잠이 (?:안|잘 안) |불면|잠이 들기|숙면|수면/),
    topic('waking', ['자주 깸', 'Waking often', '何度も目が覚める', '频繁夜醒'], ['비뇨·야간뇨'], /밤.{0,5}(?:화장실|깼|깨는)|자주 깸|자다 깨|수면 시간/),
    topic('energy', ['피로·기운 저하', 'Fatigue & low energy', '疲れ・活力低下', '疲劳与精力不足'], ['기분·활력'], /피로|기운 저하|피곤|활력/),
    topic('stress', ['스트레스', 'Stress', 'ストレス', '压力'], ['스트레스'])
  ], ['수면']),
  group('breath-swelling', ['숨참·붓기·냉감', 'Breathing, swelling & coldness', '息切れ・むくみ・冷え', '气短、肿胀与发冷'], [
    topic('breathing', ['숨참·기침', 'Breathlessness & coughing', '息切れ・せき', '气短与咳嗽'], ['호흡·기침']),
    topic('swelling', ['부종·붓기', 'Swelling', 'むくみ・腫れ', '水肿与肿胀'], ['다리·발 붓기'], /붓기|부종|(?:다리|발목|발|무릎|손|팔|얼굴).{0,8}(?:부기|부어|부었)/),
    topic('cold-hands-feet', ['손발 차가움', 'Cold hands & feet', '手足の冷え', '手脚冰冷'], [], /손발 차가움|(?:손발|손과 발|발이|손이).{0,8}차가|냉감/),
    topic('warmth', ['몸의 온감', 'Feeling warmer', '体の温かさ', '身体暖感'], [], /온감|따뜻|온기/)
  ], ['순환·붓기', '온감·냉감']),
  group('digestion', ['소화·대장', 'Digestion & bowel', '消化・大腸', '消化与大肠'], [
    topic('digestion-discomfort', ['속 불편', 'Digestive discomfort', '胃腸の不快感', '消化不适'], [], /소화 상태|소화 불편|속이 (?:불편|메스껍)|배가 (?:불편|편안)/),
    topic('bowel', ['배변 불편', 'Bowel discomfort', '排便の悩み', '排便不适'], [], /배변|변비|설사/),
    topic('urination', ['소변 불편', 'Urinary discomfort', '排尿の悩み', '排尿不适'], ['여성 요실금'], /소변 불편|방광 불편|배뇨 불편/),
    topic('night-urination', ['밤에 자주 소변 봄', 'Frequent nighttime urination', '夜中に何度も排尿', '夜尿频繁'], ['비뇨·야간뇨'], /야간뇨|밤중 화장실|밤에.{0,7}소변/)
  ], ['소화·배변', '신장·방광', '정력·성기능']),
  group('women', ['여성 건강', 'Women’s health', '女性の健康', '女性健康'], [
    topic('menstrual', ['생리 때 불편', 'Menstrual discomfort', '生理の悩み', '月经不适'], ['생리 관련']),
    topic('leakage', ['소변이 새는 불편', 'Urine leakage', '尿もれ', '漏尿'], ['여성 요실금'])
  ]),
  group('measurements', ['혈당·혈압·체중', 'Blood sugar, blood pressure & weight', '血糖・血圧・体重', '血糖、血压与体重'], [
    topic('blood-sugar', ['혈당(당뇨)', 'Blood sugar (diabetes)', '血糖（糖尿病）', '血糖（糖尿病）'], ['혈당'], /^[^\n]*(?:혈당|당뇨|당화혈색소)/),
    topic('blood-pressure', ['혈압', 'Blood pressure', '血圧', '血压'], [], /^[^\n]*혈압/),
    topic('weight', ['체중 변화', 'Weight changes', '体重の変化', '体重变化'], ['다이어트']),
    topic('rouleaux', ['연전현상', 'Red blood cell stacking', '赤血球の連銭形成', '红细胞缗钱状排列'], ['연전현상'])
  ], ['혈압·혈당·대사', '혈액검사·수치']),
  group('skin', ['피부', 'Skin', '肌', '皮肤'], [
    topic('skin-changes', ['피부 변화', 'Skin changes', '肌の変化', '皮肤变化'], ['피부']),
    topic('wrinkles', ['주름', 'Wrinkles', 'しわ', '皱纹'], [], /주름/)
  ])
];

export const allCaseVideos = topic('', ['전체 영상', 'All videos', 'すべての動画', '全部视频']);
export const productUseCases = topic('product-use', ['제품 사용 후기', 'Product experiences', '製品の使用体験', '产品使用体验'], ['사용감·불편']);
export const allGroupCases = topic('', ['이 분류 전체', 'All in this category', 'この分類のすべて', '此类别全部']);

const searchableTopics = [...caseBrowseGroups.flatMap(entry => [entry, ...entry.details]), productUseCases];
export const caseBrowseTranslations = Object.fromEntries(
  [...searchableTopics, allCaseVideos, allGroupCases].map(({label, translations}) => [label, translations])
);

function hasTopic(item, entry, text) {
  return item.categories.includes(entry.label) ||
    entry.legacy.some(label => item.categories.includes(label)) ||
    Boolean(entry.words?.test(text));
}

export function getCaseBrowseTags(item, reviewedDetails = {}) {
  const text = item.title + '\n' + item.summary;
  const tags = new Set();
  for (const entry of caseBrowseGroups) {
    const details = entry.details.filter(detail => {
      const reviewed = reviewedDetails[detail.id];
      return reviewed ? reviewed.includes(item.id) : hasTopic(item, detail, text);
    });
    if (details.length || hasTopic(item, entry, text)) tags.add(entry.id);
    for (const detail of details) tags.add(detail.id);
  }
  if (hasTopic(item, productUseCases, text)) tags.add(productUseCases.id);
  return tags;
}

export function getCaseBrowseSearchLabels(tags) {
  return searchableTopics.filter(entry => tags.has(entry.id)).map(entry => entry.label);
}

export function getCaseBrowseScope(groupId, detailId) {
  if (groupId === productUseCases.id) return productUseCases;
  const entry = caseBrowseGroups.find(group => group.id === groupId);
  return entry?.details.find(detail => detail.id === detailId) ?? entry;
}
