// 자립준비청년 지원제도 시드 데이터
//
// [출처 원칙]
// - 게이트 검증(2026-08-14)에서 원문을 직접 확인한 제도만 verified: true
// - 조건을 확인하지 못한 제도는 verified: false → 판정 엔진이 무조건 "확인 필요"로 분류
// - 확인 안 된 것을 확인된 것처럼 표시하지 않는다
//
// [AI 사용 원칙]
// aiSummary는 사전에 생성해 여기 저장한다. 런타임에 AI를 호출하지 않는다.
// → 원가가 사용자 수가 아니라 제도 수에만 비례하고, 같은 입력이면 항상 같은 결과가 나온다.

export type Audience = "protected" | "prepared";
export type Topic = "economy" | "housing" | "career" | "health" | "legal";

export const AUDIENCE_LABEL: Record<Audience, string> = {
  protected: "보호아동 (보호 중 · 종료 예정)",
  prepared: "자립준비청년 (보호종료 후)",
};

export const TOPIC_LABEL: Record<Topic, string> = {
  economy: "생활비 · 자산",
  housing: "주거",
  career: "학업 · 진로",
  health: "건강 · 마음",
  legal: "법률",
};

export const TOPICS: Topic[] = ["economy", "housing", "career", "health", "legal"];

export const REGIONS = [
  "전국",
  "서울",
  "부산",
  "대구",
  "인천",
  "광주",
  "대전",
  "울산",
  "세종",
  "경기",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
] as const;

export type Program = {
  id: string;
  name: string;
  agency: string;
  topics: Topic[];
  audiences: Audience[];

  /** 신청 가능 최소 만 나이 */
  minAge?: number;
  /** 신청 가능 최대 만 나이 */
  maxAge?: number;

  /** 보호종료 후 신청 가능 기간(년). 예: 5 → 5년 이내 */
  yearsAfterExitMax?: number;
  /**
   * 위 기간을 세는 기준점.
   * "exit"  = 보호종료일부터
   * "age18" = 만 18세가 된 날부터 (만 15세 이후 조기종료자 케이스)
   */
  exitBaseline?: "exit" | "age18";

  /** 지역 제한. 없으면 전국 */
  regions?: string[];

  /** 금액 안내 (지자체별 차이 등) */
  amountNote?: string;

  /** 우리가 알 수 없어서 사용자가 직접 확인해야 하는 조건들 */
  unknownConditions?: string[];

  /** 사전 생성된 요약 (런타임 AI 호출 없음) */
  aiSummary: string;
  /** 신청에 필요한 서류 */
  documents: string[];

  /** 자격 요건 근거 원문 인용 */
  sourceQuote: string;
  /** 원문·신청 사이트 URL */
  sourceUrl: string;
  sourceLabel: string;

  /** 게이트 검증에서 조건 원문을 직접 확인했는지 */
  verified: boolean;
};

export const PROGRAMS: Program[] = [
  {
    id: "jarip-allowance",
    name: "자립수당",
    agency: "보건복지부",
    topics: ["economy"],
    audiences: ["prepared"],
    yearsAfterExitMax: 5,
    exitBaseline: "exit",
    amountNote: "매월 지급 (금액은 연도별 고시 기준)",
    unknownConditions: [
      "보호종료일 기준 과거 2년 이상 연속으로 보호를 받았는지",
      "만 15세 이후 조기 종료된 경우라면, 기준일이 보호종료일이 아니라 만 18세가 된 날로 바뀝니다",
      "다른 법령에 따라 유사한 수당을 이미 받고 있지 않은지",
    ],
    aiSummary:
      "보호가 끝난 뒤 매달 현금으로 받는 기본 지원입니다. 보호종료 후 5년 안에 신청할 수 있고, 만 15세 이후에 일찍 보호가 끝난 경우에는 만 18세가 된 날부터 5년을 셉니다. 원가정으로 돌아간 경우와 다른 법의 비슷한 수당을 받고 있는 경우는 대상이 아닙니다.",
    documents: ["신분증", "통장 사본", "보호종료 확인 서류 (시설·위탁기관 발급)"],
    sourceQuote:
      "만 18세 이후 만기 또는 연장 보호종료된 자로서 보호종료 5년 이내인 자 / 만 15세 이후 보호조치가 조기 종료된 자로서 만 18세가 된 때로부터 5년 이내인 자",
    sourceUrl: "https://www.mohw.go.kr/menu.es?mid=a10711040900",
    sourceLabel: "보건복지부 자립수당 안내",
    verified: true,
  },
  {
    id: "settlement-fund",
    name: "자립정착금",
    agency: "지방자치단체",
    topics: ["economy", "housing"],
    audiences: ["prepared"],
    yearsAfterExitMax: 2,
    exitBaseline: "exit",
    amountNote: "지자체별로 총 1,000만 ~ 2,000만원 (퇴소한 해와 다음 해에 나누어 지급)",
    unknownConditions: [
      "거주 지자체의 지급 기준과 금액 (지역마다 다릅니다)",
      "자립정착금 사용계획서 제출 및 심사 통과 여부",
    ],
    aiSummary:
      "보호가 끝난 직후 자립 준비 비용으로 받는 목돈입니다. 퇴소한 해와 그 다음 해에 나누어 지급되며, 총액은 사는 지역에 따라 1,000만원에서 2,000만원까지 차이가 납니다. 사용계획서를 써서 시설이나 위탁지원센터를 통해 신청합니다.",
    documents: [
      "자립정착금 사용계획서",
      "본인 명의 통장 사본",
      "신분증",
      "보호종료 확인 서류",
    ],
    sourceQuote:
      "보호종료일을 기준으로 과거 2년 이상 연속하여 보호를 받은 만 18세 이후 보호종료된 아동 / 자립정착금은 각 지방자치단체에서 지원하며, 거주지에 따라 금액이 다를 수 있음",
    sourceUrl:
      "https://www.easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=2619&ccfNo=2&cciNo=1&cnpClsNo=1",
    sourceLabel: "찾기쉬운 생활법령정보 · 자립수당 및 자립정착금",
    verified: true,
  },
  {
    id: "lh-jeonse",
    name: "LH 전세임대주택 (자립준비청년 유형)",
    agency: "한국토지주택공사(LH)",
    topics: ["housing"],
    audiences: ["protected", "prepared"],
    minAge: 19,
    maxAge: 39,
    yearsAfterExitMax: 5,
    exitBaseline: "exit",
    amountNote: "임대보증금 100만원, 만 22세 이하는 월 임대료 무이자",
    unknownConditions: [
      "신청일 현재 무주택자인지",
      "대학생 · 취업준비생 · 생계·의료·주거급여 수급자 · 한부모가족 · 차상위계층 중 하나에 해당하는지",
    ],
    aiSummary:
      "LH가 집주인과 전세 계약을 맺고 저렴하게 재임대해주는 제도입니다. 보증금 100만원만 내고 들어갈 수 있고, 만 22세 이하면 월 임대료 이자도 없습니다. 보호종료 5년 안에, 만 19세부터 39세까지 신청할 수 있으며 보호가 아직 끝나지 않은 종료 예정자도 신청 대상에 포함됩니다.",
    documents: [
      "신분증",
      "주민등록등본",
      "보호종료(예정) 확인 서류",
      "무주택 확인 서류",
      "해당 자격(재학·구직·수급 등) 증빙 서류",
    ],
    sourceQuote:
      "신청일 현재 무주택자로서 「아동복지법」 제16조 및 제16조의3에 따라 가정위탁 보호조치가 종료되거나 아동복지시설에서 퇴소한지 5년 이내인 사람(보호조치를 연장한 자, 보호조치 종료 예정자, 시설 퇴소 예정자 포함) / 19세 이상 39세 이하",
    sourceUrl: "https://www.lh.or.kr/menu.es?mid=a10401020800",
    sourceLabel: "LH 자립준비청년 및 가정 밖 청소년 임대주택",
    verified: true,
  },
  {
    id: "medical-support",
    name: "자립준비청년 의료비 지원",
    agency: "보건복지부",
    topics: ["health"],
    audiences: ["prepared"],
    yearsAfterExitMax: 5,
    exitBaseline: "exit",
    amountNote: "본인부담금 경감",
    unknownConditions: [
      "건강보험 직장·지역가입자 또는 직장가입자의 피부양자인지",
      "차상위 본인부담경감 대상자는 제외됩니다",
    ],
    aiSummary:
      "병원비 본인부담을 줄여주는 제도입니다. 보호종료 후 5년 안에 있고 건강보험에 가입되어 있으면 대상이 됩니다. 이미 차상위 본인부담경감을 받고 있으면 중복으로 받을 수 없습니다.",
    documents: ["신분증", "건강보험 자격확인서", "보호종료 확인 서류"],
    sourceQuote:
      "아동복지시설, 가정위탁 보호종료 후 5년 이내 자립준비청년 중 건강보험 직장·지역가입자, 직장가입자의 피부양자 (차상위 본인부담 경감대상자는 제외)",
    sourceUrl:
      "https://www.easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=2619&ccfNo=4&cciNo=1&cnpClsNo=1",
    sourceLabel: "찾기쉬운 생활법령정보 · 의료 지원",
    verified: true,
  },

  // ── 아래부터는 조건 원문을 아직 확인하지 못한 제도 (verified: false) ──
  // 판정 엔진이 무조건 "확인 필요"로 분류한다.
  {
    id: "didim-seed",
    name: "디딤씨앗통장 (아동발달지원계좌)",
    agency: "보건복지부",
    topics: ["economy"],
    audiences: ["protected", "prepared"],
    unknownConditions: ["가입 연령 기준", "적립 및 지원 조건", "해지·수령 가능 시점"],
    aiSummary:
      "내가 저축하면 정부가 같은 금액을 얹어주는 자산 형성 통장입니다. 아직 저희가 정확한 가입·수령 조건을 확인하지 못했으니 담당 기관에서 꼭 확인해 주세요.",
    documents: ["미확인 — 담당 기관 확인 필요"],
    sourceQuote: "조건 원문 미확인",
    sourceUrl:
      "https://www.easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=2619&ccfNo=2&cciNo=1&cnpClsNo=1",
    sourceLabel: "찾기쉬운 생활법령정보 · 자산형성 및 자산관리",
    verified: false,
  },
  {
    id: "college-tuition",
    name: "대학 입학금 · 학자금 지원",
    agency: "교육부 · 한국장학재단",
    topics: ["career"],
    audiences: ["protected", "prepared"],
    unknownConditions: ["연령 기준", "보호종료 후 경과 기간 기준", "성적·소득 기준 유무"],
    aiSummary:
      "대학 등록금과 생활비를 지원받을 수 있는 제도입니다. 아직 저희가 자격 조건 원문을 확인하지 못했습니다.",
    documents: ["미확인 — 담당 기관 확인 필요"],
    sourceQuote: "조건 원문 미확인",
    sourceUrl:
      "https://www.easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=2619&ccfNo=3&cciNo=1&cnpClsNo=1",
    sourceLabel: "찾기쉬운 생활법령정보 · 대학 입학 및 학자금",
    verified: false,
  },
  {
    id: "jarip-facility",
    name: "자립지원시설 입소",
    agency: "지방자치단체",
    topics: ["housing"],
    audiences: ["prepared"],
    unknownConditions: ["입소 가능 연령", "보호종료 후 경과 기간 기준", "지역별 시설 현황"],
    aiSummary:
      "보호가 끝난 뒤 일정 기간 머물 수 있는 거주 시설입니다. 아직 저희가 입소 조건을 확인하지 못했습니다.",
    documents: ["미확인 — 담당 기관 확인 필요"],
    sourceQuote: "조건 원문 미확인",
    sourceUrl:
      "https://www.easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=2619&ccfNo=2&cciNo=1&cnpClsNo=1",
    sourceLabel: "찾기쉬운 생활법령정보 · 자립지원시설 및 청년임대주택",
    verified: false,
  },
  {
    id: "counseling",
    name: "심리상담 지원",
    agency: "보건복지부 · 아동권리보장원",
    topics: ["health"],
    audiences: ["protected", "prepared"],
    unknownConditions: ["지원 횟수·기간", "보호종료 후 경과 기간 기준"],
    aiSummary:
      "마음이 힘들 때 전문 상담을 받을 수 있도록 지원하는 제도입니다. 아직 저희가 지원 조건을 확인하지 못했습니다.",
    documents: ["미확인 — 담당 기관 확인 필요"],
    sourceQuote: "조건 원문 미확인",
    sourceUrl:
      "https://www.easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=2619&ccfNo=4&cciNo=1&cnpClsNo=1",
    sourceLabel: "찾기쉬운 생활법령정보 · 심리상담 지원",
    verified: false,
  },
  {
    id: "legal-aid",
    name: "법률 상담 및 교육",
    agency: "법무부 · 대한법률구조공단",
    topics: ["legal"],
    audiences: ["protected", "prepared"],
    unknownConditions: ["지원 범위", "소득 기준 유무"],
    aiSummary:
      "계약 문제나 사기 피해 등 법적 문제가 생겼을 때 무료로 상담받을 수 있는 제도입니다. 아직 저희가 지원 조건을 확인하지 못했습니다.",
    documents: ["미확인 — 담당 기관 확인 필요"],
    sourceQuote: "조건 원문 미확인",
    sourceUrl:
      "https://www.easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=2619&ccfNo=4&cciNo=1&cnpClsNo=1",
    sourceLabel: "찾기쉬운 생활법령정보 · 법률 상담 및 교육",
    verified: false,
  },
];

export function findProgram(id: string): Program | undefined {
  return PROGRAMS.find((p) => p.id === id);
}
