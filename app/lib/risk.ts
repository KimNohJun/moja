export type RiskLevel = "safe" | "warning" | "danger";

export interface RiskResult {
  ratio: number; // 전세가율 (%)
  level: RiskLevel;
  label: string;
  message: string;
}

/**
 * 전세가율 = 보증금 / 매매시세 * 100
 * 구간 기준(국토부·HUG 가이드 통용치): 70% 미만 안전, 70~80% 주의, 80% 이상 위험
 */
export function evaluateJeonseRatio(deposit: number, marketPrice: number): RiskResult {
  const ratio = marketPrice > 0 ? (deposit / marketPrice) * 100 : 0;

  if (ratio >= 80) {
    return {
      ratio,
      level: "danger",
      label: "위험",
      message:
        "전세가율이 80% 이상입니다. 매매가 하락 시 보증금을 전액 돌려받지 못할 가능성이 큽니다. 계약 전 등기부등본과 근저당 설정을 반드시 확인하세요.",
    };
  }
  if (ratio >= 70) {
    return {
      ratio,
      level: "warning",
      label: "주의",
      message:
        "전세가율이 70~80% 구간입니다. 안전 범위이지만 시세 하락기에는 위험해질 수 있으니 전세보증금반환보증 가입을 검토하세요.",
    };
  }
  return {
    ratio,
    level: "safe",
    label: "안전",
    message:
      "전세가율이 70% 미만으로 상대적으로 안전한 구간입니다. 다만 등기부등본상 권리관계는 별도로 꼭 확인하세요.",
  };
}

export const REGISTRY_CHECKPOINTS = [
  {
    title: "근저당권·가압류 등 채무 총액",
    detail: "등기부등본 '을구'에서 근저당권 채권최고액을 확인하고, 보증금과 합산해 매매시세를 초과하지 않는지 확인하세요.",
  },
  {
    title: "소유자와 임대인 일치 여부",
    detail: "등기부등본 '갑구'의 소유자 이름과 계약서상 임대인이 동일한지 확인하세요. 대리 계약 시 위임장·인감증명서를 반드시 확인하세요.",
  },
  {
    title: "신탁 등기 여부",
    detail: "신탁 등기가 있다면 수탁자(신탁회사) 동의 없는 계약은 임대차보호법 적용을 받지 못할 수 있습니다.",
  },
  {
    title: "압류·경매개시 이력",
    detail: "경매개시결정 등기가 있는 주택은 계약을 피하는 것이 원칙입니다.",
  },
] as const;
