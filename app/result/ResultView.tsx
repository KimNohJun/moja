"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  judgeAll,
  monthsSinceExit,
  ageFrom,
  VERDICT_LABEL,
  type Judgement,
  type UserProfile,
  type Verdict,
} from "../lib/eligibility";
import { AUDIENCE_LABEL, PROGRAMS, TOPIC_LABEL } from "../lib/programs";
import { clearProfile, loadProfile } from "../lib/profileStore";

const VERDICT_CLASS: Record<Verdict, string> = {
  eligible: "verdict-eligible",
  notYet: "verdict-notyet",
  check: "verdict-check",
  expired: "verdict-expired",
};

const SECTION_ORDER: Verdict[] = ["eligible", "notYet", "check", "expired"];

const SECTION_HINT: Record<Verdict, string> = {
  eligible: "나이·기간·지역 조건이 맞아요. 상세에서 확인 사항만 보고 신청하면 돼요.",
  notYet: "지금은 아니지만 앞으로 신청할 수 있어요. 미리 알아두면 놓치지 않아요.",
  check: "저희가 이 제도의 조건 원문을 아직 확인하지 못했어요. 담당 기관에 물어봐 주세요.",
  expired: "나이나 신청 기간 기준을 넘었어요. 참고로 남겨둡니다.",
};

function Timeline({ profile }: { profile: UserProfile }) {
  const now = new Date();
  const age = ageFrom(profile.birthMonth, now);
  const elapsed = monthsSinceExit(profile.exitMonth, now);

  if (elapsed === null) return null;

  const beforeExit = elapsed < 0;
  const abs = Math.abs(elapsed);
  const years = Math.floor(abs / 12);
  const months = abs % 12;
  const duration = years > 0 ? `${years}년 ${months}개월` : `${months}개월`;

  return (
    <section className="timeline stack" style={{ gap: 6 }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#6366f1" }}>
        {beforeExit ? "보호종료까지" : "보호종료 후"}
      </p>
      <p className="timeline-figure">
        {beforeExit ? `${duration} 남았어요` : `${duration} 지났어요`}
      </p>
      <p style={{ margin: 0, fontSize: 14, color: "#4b5563" }}>
        {age !== null && `만 ${age}세 · `}
        {beforeExit
          ? "보호가 끝나기 전에 미리 준비할 수 있는 제도도 있어요."
          : "대부분의 제도는 보호종료 후 5년 안에 신청할 수 있어요."}
      </p>
    </section>
  );
}

export default function ResultView() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setReady(true);
  }, []);

  const judgements = useMemo(() => {
    if (!profile) return [];
    return judgeAll(PROGRAMS, profile, new Date());
  }, [profile]);

  const grouped = useMemo(() => {
    const map: Record<Verdict, Judgement[]> = {
      eligible: [],
      notYet: [],
      check: [],
      expired: [],
    };
    for (const j of judgements) map[j.verdict].push(j);
    return map;
  }, [judgements]);

  if (!ready) {
    return (
      <p style={{ color: "var(--muted)" }}>불러오는 중...</p>
    );
  }

  if (!profile) {
    return (
      <section className="card stack">
        <h2 style={{ margin: 0, fontSize: 18 }}>입력한 정보가 없어요</h2>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: 15 }}>
          내 상황을 먼저 입력하면 맞는 제도를 골라드릴 수 있어요.
        </p>
        <Link href="/filter" className="btn" style={{ alignSelf: "flex-start" }}>
          상황 입력하기
        </Link>
      </section>
    );
  }

  return (
    <div className="stack" style={{ gap: 24 }}>
      <Timeline profile={profile} />

      <section className="card stack" style={{ gap: 10 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
          이렇게 찾았어요
        </p>
        <p style={{ margin: 0, fontSize: 14.5 }}>
          {AUDIENCE_LABEL[profile.audience]} · {profile.region}
          {profile.topics.length > 0 && (
            <> · {profile.topics.map((t) => TOPIC_LABEL[t]).join(", ")}</>
          )}
        </p>
        <p style={{ margin: 0, fontSize: 14 }}>
          제도 {judgements.length}개 중{" "}
          <strong style={{ color: "var(--safe)" }}>
            신청 대상 {grouped.eligible.length}개
          </strong>
          , 앞으로 가능 {grouped.notYet.length}개, 확인 필요 {grouped.check.length}개, 기간
          지남 {grouped.expired.length}개
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
          <Link href="/filter" className="btn secondary" style={{ fontSize: 14 }}>
            조건 다시 입력
          </Link>
          <button
            type="button"
            className="btn secondary"
            style={{ fontSize: 14, borderColor: "var(--border)", color: "var(--muted)" }}
            onClick={() => {
              clearProfile();
              setProfile(null);
            }}
          >
            내 정보 지우기
          </button>
        </div>
      </section>

      {SECTION_ORDER.map((verdict) => {
        const list = grouped[verdict];
        if (list.length === 0) return null;
        return (
          <section key={verdict} className="stack" style={{ gap: 12 }}>
            <div className="stack" style={{ gap: 4 }}>
              <h2 className="section-head">
                <span className={`badge ${VERDICT_CLASS[verdict]}`}>
                  {VERDICT_LABEL[verdict]}
                </span>
                <span className="count-pill">{list.length}개</span>
              </h2>
              <p style={{ margin: 0, fontSize: 13.5, color: "var(--muted)" }}>
                {SECTION_HINT[verdict]}
              </p>
            </div>

            <div className="stack" style={{ gap: 10 }}>
              {list.map(({ program, monthsLeft }) => (
                <Link
                  key={program.id}
                  href={`/program/${program.id}`}
                  className={`program-card stack${verdict === "expired" ? " is-expired" : ""}`}
                  style={{ gap: 8 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    <h3 className="program-name">{program.name}</h3>
                    {monthsLeft !== null && monthsLeft <= 12 && verdict !== "expired" && (
                      <span className="badge verdict-check" style={{ flexShrink: 0 }}>
                        {monthsLeft}개월 남음
                      </span>
                    )}
                  </div>
                  <p className="program-meta">
                    {program.agency}
                    {program.amountNote && ` · ${program.amountNote}`}
                  </p>
                  <p style={{ margin: 0, fontSize: 14, color: "#374151" }}>
                    {program.aiSummary.length > 90
                      ? `${program.aiSummary.slice(0, 90)}...`
                      : program.aiSummary}
                  </p>
                  <span style={{ fontSize: 13.5, color: "var(--primary)", fontWeight: 600 }}>
                    자세히 보기 →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <p className="disclaimer">
        이 결과는 참고용입니다. 조건을 모두 확인할 수 없는 항목이 있으니,{" "}
        <strong>최종 확인은 담당 기관과 공고 원문에서 해주세요.</strong> 모자는 신청을
        대행하지 않습니다.
      </p>
    </div>
  );
}
