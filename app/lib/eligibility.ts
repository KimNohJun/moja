// 자격 판정 엔진
//
// [원칙] 결정론적 룰 매칭. AI를 호출하지 않는다.
// 같은 입력이면 항상 같은 결과가 나와야 한다 (데모 안정성 + 재현성).
//
// [판정 4구역]
//   eligible : 우리가 확인할 수 있는 조건(대상구분·나이·기간·지역)을 모두 통과
//   notYet   : 아직 때가 아님 (보호 중인데 보호종료자 전용 제도, 나이 미달 등)
//   check    : 제도의 자격 조건 원문 자체를 우리가 확인하지 못함 (verified: false)
//   expired  : 신청 기회가 지남 (기간 초과, 나이 초과, 보호 중 전용 제도인데 이미 종료)
//
// notYet과 expired를 반드시 구분한다. 보호아동에게 "신청 기간이 지났어요"라고 하면
// 정반대 정보가 되고, 보호아동은 "앞으로 무엇을 준비해야 하나"를 알아야 하는
// 이 서비스의 핵심 사용자층이다.
//
// [checklist vs 판정을 나누는 기준]
// program.unknownConditions("2년 이상 연속 보호받았는지" 등)는 판정을 막지 않는다.
// 이건 우리가 판정 불가한 조건이 아니라 **사용자 본인이 아는 정보**이므로,
// 판정과 분리해 "신청 전 확인할 것"으로 안내한다.
// 이 조건들까지 check로 내리면 검증된 제도가 전부 check로 떨어져
// eligible 구역이 항상 비게 되고, 정작 유용한 정보를 못 준다.
//
// 단, eligible 라벨은 "신청할 수 있어요"가 아니라 "신청 대상이에요"로 두고
// 체크리스트를 항상 함께 노출해 과대 판정을 막는다.

import type { Audience, Program, Topic } from "./programs";

export type Verdict = "eligible" | "notYet" | "check" | "expired";

export const VERDICT_LABEL: Record<Verdict, string> = {
  eligible: "신청 대상이에요",
  notYet: "아직은 대상이 아니에요",
  check: "조건 확인이 필요해요",
  expired: "신청 기간이 지났어요",
};

/** 사용자가 입력하는 값. 일 단위는 받지 않는다 (개인정보 최소 수집) */
export type UserProfile = {
  audience: Audience;
  /** 태어난 연월. "YYYY-MM" */
  birthMonth: string;
  /** 보호종료(예정) 연월. "YYYY-MM" */
  exitMonth: string;
  /** 거주 지역 */
  region: string;
  /** 관심 주제 (비어 있으면 전체) */
  topics: Topic[];
};

export type Reason = {
  label: string;
  /** 통과 / 미충족 / 확인 필요 */
  state: "pass" | "fail" | "unknown";
  detail: string;
};

export type Judgement = {
  program: Program;
  verdict: Verdict;
  /** 우리가 대조한 조건들 (대상구분·나이·기간·지역) */
  reasons: Reason[];
  /** 판정과 별개로, 신청 전에 사용자가 직접 확인할 것들 */
  checklist: string[];
  /** 신청 가능 기간이 끝나기까지 남은 개월 수. 기간 제한이 없거나 이미 지났으면 null */
  monthsLeft: number | null;
};

// ── 날짜 유틸 (연월 단위) ─────────────────────────────

/** "YYYY-MM" → 1970-01부터의 총 개월 수. 파싱 실패 시 null */
function toMonthIndex(yyyymm: string): number | null {
  const m = /^(\d{4})-(\d{1,2})$/.exec(yyyymm.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (month < 1 || month > 12) return null;
  return year * 12 + (month - 1);
}

function currentMonthIndex(now: Date): number {
  return now.getFullYear() * 12 + now.getMonth();
}

/** 연월 기준 만 나이. 생일이 지났는지는 월 단위로만 판단한다 */
export function ageFrom(birthMonth: string, now: Date): number | null {
  const b = toMonthIndex(birthMonth);
  if (b === null) return null;
  const diff = currentMonthIndex(now) - b;
  if (diff < 0) return null;
  return Math.floor(diff / 12);
}

/**
 * 보호종료 기준 경과 개월 수.
 * 음수면 아직 보호종료 전(예정)이라는 뜻이다.
 */
export function monthsSinceExit(exitMonth: string, now: Date): number | null {
  const e = toMonthIndex(exitMonth);
  if (e === null) return null;
  return currentMonthIndex(now) - e;
}

/** 만 18세가 되는 연월의 인덱스 */
function age18MonthIndex(birthMonth: string): number | null {
  const b = toMonthIndex(birthMonth);
  if (b === null) return null;
  return b + 18 * 12;
}

// ── 판정 ─────────────────────────────────────────────

export function judge(program: Program, profile: UserProfile, now: Date): Judgement {
  const reasons: Reason[] = [];
  let hasFail = false;
  let hasUnknown = false;
  /** 실패 사유가 "아직 때가 아님"인지 (true) "기회가 지났음"인지 (false) */
  let failIsNotYet = false;
  let monthsLeft: number | null = null;

  // 1. 대상 구분 (보호아동 / 자립준비청년)
  if (!program.audiences.includes(profile.audience)) {
    const notYet = profile.audience === "protected";
    reasons.push({
      label: "대상 구분",
      state: "fail",
      detail: notYet
        ? "보호가 끝난 뒤에 신청할 수 있는 제도예요. 지금 미리 알아두면 좋아요."
        : "보호 중일 때 신청하는 제도예요.",
    });
    hasFail = true;
    if (notYet) failIsNotYet = true;
  } else {
    reasons.push({
      label: "대상 구분",
      state: "pass",
      detail: "대상 구분이 맞아요.",
    });
  }

  // 2. 나이
  const age = ageFrom(profile.birthMonth, now);
  if (program.minAge !== undefined || program.maxAge !== undefined) {
    const min = program.minAge ?? 0;
    const max = program.maxAge ?? 200;
    const range = `${program.minAge ?? "제한 없음"}${
      program.maxAge !== undefined ? ` ~ 만 ${program.maxAge}세` : "세 이상"
    }`;
    if (age === null) {
      reasons.push({ label: "나이", state: "unknown", detail: `기준: 만 ${range}` });
      hasUnknown = true;
    } else if (age < min || age > max) {
      const tooYoung = age < min;
      reasons.push({
        label: "나이",
        state: "fail",
        detail: tooYoung
          ? `기준은 만 ${range}이고 지금 만 ${age}세예요. 만 ${min}세가 되면 신청할 수 있어요.`
          : `현재 만 ${age}세 · 기준은 만 ${range}예요.`,
      });
      hasFail = true;
      if (tooYoung) failIsNotYet = true;
    } else {
      reasons.push({
        label: "나이",
        state: "pass",
        detail: `현재 만 ${age}세 · 기준은 만 ${range}예요.`,
      });
    }
  }

  // 3. 신청 가능 기간 (보호종료 후 N년)
  if (program.yearsAfterExitMax !== undefined) {
    const limitMonths = program.yearsAfterExitMax * 12;

    // 기준점: 보호종료일 또는 만 18세 도달 시점
    let baselineIndex: number | null;
    let baselineLabel: string;
    if (program.exitBaseline === "age18") {
      baselineIndex = age18MonthIndex(profile.birthMonth);
      baselineLabel = "만 18세가 된 때";
    } else {
      baselineIndex = toMonthIndex(profile.exitMonth);
      baselineLabel = "보호종료";
    }

    if (baselineIndex === null) {
      reasons.push({
        label: "신청 가능 기간",
        state: "unknown",
        detail: `${baselineLabel}부터 ${program.yearsAfterExitMax}년 이내`,
      });
      hasUnknown = true;
    } else {
      const elapsed = currentMonthIndex(now) - baselineIndex;

      if (elapsed > limitMonths) {
        const over = elapsed - limitMonths;
        reasons.push({
          label: "신청 가능 기간",
          state: "fail",
          detail: `${baselineLabel}부터 ${program.yearsAfterExitMax}년 이내가 기준인데, ${Math.floor(
            over / 12,
          )}년 ${over % 12}개월 지났어요.`,
        });
        hasFail = true;
      } else {
        monthsLeft = limitMonths - elapsed;
        const detail =
          elapsed < 0
            ? `아직 ${baselineLabel} 전이에요. ${baselineLabel} 후 ${program.yearsAfterExitMax}년 안에 신청할 수 있어요.`
            : `${baselineLabel} 후 ${program.yearsAfterExitMax}년 이내 · ${Math.floor(
                monthsLeft / 12,
              )}년 ${monthsLeft % 12}개월 남았어요.`;
        reasons.push({ label: "신청 가능 기간", state: "pass", detail });
      }
    }
  }

  // 4. 지역
  if (program.regions && program.regions.length > 0) {
    if (profile.region === "전국" || program.regions.includes(profile.region)) {
      reasons.push({
        label: "지역",
        state: "pass",
        detail: `${program.regions.join(", ")} 대상이에요.`,
      });
    } else {
      reasons.push({
        label: "지역",
        state: "fail",
        detail: `${program.regions.join(", ")}에서만 신청할 수 있어요.`,
      });
      hasFail = true;
    }
  }

  // 5. 제도 조건 자체가 미검증이면 판정을 내리지 않는다
  if (!program.verified) {
    reasons.push({
      label: "자격 조건 확인 상태",
      state: "unknown",
      detail: "저희가 이 제도의 조건 원문을 아직 확인하지 못했어요. 담당 기관에서 확인해 주세요.",
    });
    hasUnknown = true;
  }

  // 6. 판정과 분리된 체크리스트 (판정을 막지 않음)
  const checklist = program.unknownConditions ?? [];

  const verdict: Verdict = hasFail
    ? failIsNotYet
      ? "notYet"
      : "expired"
    : hasUnknown
      ? "check"
      : "eligible";

  return { program, verdict, reasons, checklist, monthsLeft: hasFail ? null : monthsLeft };
}

/** 전체 제도를 판정하고, 관심 주제로 필터링한다 */
export function judgeAll(
  programs: Program[],
  profile: UserProfile,
  now: Date,
): Judgement[] {
  const filtered =
    profile.topics.length === 0
      ? programs
      : programs.filter((p) => p.topics.some((t) => profile.topics.includes(t)));

  const order: Record<Verdict, number> = { eligible: 0, notYet: 1, check: 2, expired: 3 };
  return filtered
    .map((p) => judge(p, profile, now))
    .sort((a, b) => {
      const byVerdict = order[a.verdict] - order[b.verdict];
      if (byVerdict !== 0) return byVerdict;
      // 같은 구역 안에서는 남은 기간이 짧은 것부터 (놓치기 쉬운 것 먼저)
      const am = a.monthsLeft ?? Number.MAX_SAFE_INTEGER;
      const bm = b.monthsLeft ?? Number.MAX_SAFE_INTEGER;
      return am - bm;
    });
}
