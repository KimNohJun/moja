// 국토교통부 실거래가 Open API 연동을 대체하는 가짜 데이터.
// 실제 서비스에서는 이 함수 내부만 실거래가 API 호출로 교체하면 된다.

export interface NearbyTrade {
  address: string;
  buildingType: string;
  price: number; // 만원
  tradedAt: string;
}

export interface MarketLookupResult {
  found: boolean;
  estimatedMarketPrice: number | null; // 만원, KB시세 참고치 대체
  nearbyTrades: NearbyTrade[];
}

const MOCK_AREAS: Array<{ keyword: string; base: number; buildingType: string }> = [
  { keyword: "역삼", base: 65000, buildingType: "오피스텔" },
  { keyword: "미추홀", base: 18000, buildingType: "다세대" },
  { keyword: "동탄", base: 24000, buildingType: "오피스텔" },
  { keyword: "화곡", base: 16000, buildingType: "다세대" },
  { keyword: "춘천", base: 14000, buildingType: "다가구" },
];

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) % 1_000_000;
  }
  return h;
}

/**
 * 도로명주소 검색 + 실거래가 조회를 흉내내는 가짜 API.
 * 입력 주소에 미리 정의된 지역 키워드가 포함되면 그 지역 시세를 기반으로,
 * 아니면 주소 문자열을 시드로 한 결정적(deterministic) 가짜 시세를 생성한다.
 */
export async function lookupMarketData(address: string): Promise<MarketLookupResult> {
  // 네트워크 API 호출을 흉내내기 위한 가벼운 지연
  await new Promise((resolve) => setTimeout(resolve, 300));

  const trimmed = address.trim();
  if (!trimmed) {
    return { found: false, estimatedMarketPrice: null, nearbyTrades: [] };
  }

  const matched = MOCK_AREAS.find((area) => trimmed.includes(area.keyword));
  const seed = hashSeed(trimmed);
  const base = matched?.base ?? 15000 + (seed % 40000);
  const buildingType = matched?.buildingType ?? ["다세대", "오피스텔", "다가구", "아파트"][seed % 4];

  const estimatedMarketPrice = Math.round(base + ((seed % 2000) - 1000));

  const nearbyTrades: NearbyTrade[] = Array.from({ length: 3 }).map((_, i) => {
    const variance = ((seed * (i + 1)) % 3000) - 1500;
    return {
      address: `${trimmed} 인근 ${i + 1}`,
      buildingType,
      price: Math.max(5000, Math.round(estimatedMarketPrice + variance)),
      tradedAt: `2026-0${((seed + i) % 6) + 1}`,
    };
  });

  return {
    found: true,
    estimatedMarketPrice,
    nearbyTrades,
  };
}
