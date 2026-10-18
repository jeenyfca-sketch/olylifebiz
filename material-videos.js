// Supplemental source links shown inside the existing business plan material.
const businessPlanId='3659d0b6-7e17-4a0e-a45c-f7979dd6a1bc';
const videos=[
 {id:'iPzfL-A2TDs',url:'https://www.youtube.com/watch?v=iPzfL-A2TDs',title:'Discover the Power of PEMF Therapy. The global wellness shift!',channel:'Team Impact',titleKo:'PEMF 요법의 힘을 알아보세요 — 세계적인 웰니스의 변화',summaryKo:'게시자는 PEMF의 원리와 순환·회복·일상 활력에 관한 설명, 개인 경험과 올리라이프 기기 선택 안내를 소개한다고 설명합니다. 약물이나 침습적 처치 없이 건강을 돕는다는 표현은 게시자의 제품 소개이며, 이 자료실에서 효과를 검증한 내용은 아닙니다.'},
 {id:'tZT3ZYxgbcw',url:'https://www.youtube.com/watch?v=tZT3ZYxgbcw',title:'🔥 HUGE OlyLife Updates from Thailand! ODC Recap | 24-Month Payments, New Products & 2-Year Warranty',channel:'Brian Ledford',titleKo:'태국에서 전한 올리라이프 주요 소식 — ODC 요약·24개월 결제·신제품·2년 보증',summaryKo:'태국 OlyLife Developers Conference(ODC)에 참석한 Mark Michaud와 Wayne Clark이 행사 발표와 10월 1일 온라인 설명회의 주요 내용을 전하는 영상입니다. 게시자 설명에는 최대 24개월로 연장될 수 있는 기기 구매 금융·분할결제, 신제품, 일부 기존 구매에도 소급 적용된다는 2년 보증 소식이 포함됩니다. 실제 적용 대상·시점·국내 이용 조건은 별도 확인이 필요합니다.'}
];
export function getMaterialVideos(materialId){return materialId===businessPlanId?videos.map(x=>({...x})):[];}
