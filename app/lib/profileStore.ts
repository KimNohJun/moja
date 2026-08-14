// 프로필 저장소
//
// [개인정보 원칙]
// 보호종료 시점 + 나이 + 지역 조합은 자립준비청년 신분을 특정할 수 있는 정보다.
// 모집단이 약 1만 명 규모라 재식별 위험이 크다. 그래서:
//   - 서버로 전송하지 않는다 (API 라우트 없음, DB 없음, 계정 없음)
//   - URL 쿼리·경로에 넣지 않는다 (브라우저 히스토리·서버 로그·공유 링크에 남기 때문)
//   - localStorage에만 저장하고, 사용자가 직접 지울 수 있게 한다
//
// 1회차 전세레이더는 입력값을 URL에 인코딩했지만(app/lib/reportCodec.ts),
// 이 주제에서는 같은 방식을 쓰지 않는다.

import type { UserProfile } from "./eligibility";

const KEY = "moja.profile.v1";

export function saveProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    // 사파리 프라이빗 모드 등에서 저장이 막힐 수 있다. 조용히 넘어간다.
  }
}

export function loadProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    if (
      !parsed ||
      (parsed.audience !== "protected" && parsed.audience !== "prepared") ||
      typeof parsed.birthMonth !== "string" ||
      typeof parsed.exitMonth !== "string"
    ) {
      return null;
    }
    return {
      audience: parsed.audience,
      birthMonth: parsed.birthMonth,
      exitMonth: parsed.exitMonth,
      region: typeof parsed.region === "string" ? parsed.region : "전국",
      topics: Array.isArray(parsed.topics) ? parsed.topics : [],
    };
  } catch {
    return null;
  }
}

export function clearProfile(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // noop
  }
}
