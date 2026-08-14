"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { judge, VERDICT_LABEL, type Reason, type Verdict } from "../../lib/eligibility";
import { TOPIC_LABEL, type Program } from "../../lib/programs";
import { loadProfile } from "../../lib/profileStore";

const VERDICT_CLASS: Record<Verdict, string> = {
  eligible: "verdict-eligible",
  notYet: "verdict-notyet",
  check: "verdict-check",
  expired: "verdict-expired",
};

const ICON: Record<Reason["state"], { mark: string; bg: string; color: string }> = {
  pass: { mark: "✓", bg: "var(--safe-bg)", color: "var(--safe)" },
  fail: { mark: "!", bg: "var(--danger-bg)", color: "var(--danger)" },
  unknown: { mark: "?", bg: "var(--warn-bg)", color: "var(--warn)" },
};

export default function ProgramDetail({ program }: { program: Program }) {
  const [profile, setProfile] = useState<ReturnType<typeof loadProfile>>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setReady(true);
  }, []);

  const judgement = useMemo(() => {
    if (!profile) return null;
    return judge(program, profile, new Date());
  }, [profile, program]);

  return (
    <div className="stack" style={{ gap: 22 }}>
      <header className="stack" style={{ gap: 10 }}>
        {ready && judgement && (
          <span className={`badge ${VERDICT_CLASS[judgement.verdict]}`}>
            {VERDICT_LABEL[judgement.verdict]}
          </span>
        )}
        <h1 style={{ fontSize: 27, margin: 0, letterSpacing: "-0.01em" }}>{program.name}</h1>
        <p className="program-meta">
          {program.agency} · {program.topics.map((t) => TOPIC_LABEL[t]).join(", ")}
        </p>
        {program.amountNote && (
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#4338ca" }}>
            {program.amountNote}
          </p>
        )}
      </header>

      {/* 쉬운 말 요약 */}
      <section className="card stack" style={{ gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 16 }}>쉬운 말로 요약하면</h2>
        <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.75 }}>{program.aiSummary}</p>
        <p style={{ margin: 0, fontSize: 12.5, color: "var(--muted)" }}>
          ※ 제도 원문을 AI로 미리 요약해 저장한 내용입니다. 정확한 내용은 아래 원문을 확인해
          주세요.
        </p>
      </section>

      {/* 내 조건과 대조 */}
      {ready && (
        <section className="card stack" style={{ gap: 6 }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>내 조건과 맞춰보면</h2>
          {judgement ? (
            <div>
              {judgement.reasons.map((r, i) => {
                const icon = ICON[r.state];
                return (
                  <div className="reason-row" key={`${r.label}-${i}`}>
                    <span
                      className="reason-icon"
                      style={{ background: icon.bg, color: icon.color }}
                      aria-hidden="true"
                    >
                      {icon.mark}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p className="reason-label">{r.label}</p>
                      <p className="reason-detail">{r.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="stack" style={{ gap: 10 }}>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: 14.5 }}>
                내 상황을 입력하면 이 제도가 나에게 해당하는지 맞춰볼 수 있어요.
              </p>
              <Link href="/filter" className="btn secondary" style={{ alignSelf: "flex-start" }}>
                상황 입력하기
              </Link>
            </div>
          )}
        </section>
      )}

      {/* 신청 전 확인할 것 (판정과 분리) */}
      {judgement && judgement.checklist.length > 0 && (
        <section className="card stack" style={{ gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>신청 전에 이것만 확인해 주세요</h2>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--muted)" }}>
            저희가 대신 확인할 수 없는 조건이에요. 아래가 맞는지 확인하면 신청 준비가 끝납니다.
          </p>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.9, fontSize: 15 }}>
            {judgement.checklist.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
      )}

      {/* 필요 서류 */}
      <section className="card stack" style={{ gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 16 }}>필요한 서류</h2>
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.9, fontSize: 15 }}>
          {program.documents.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </section>

      {/* 근거 원문 */}
      <section className="card stack" style={{ gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 16 }}>판정 근거 (공고 원문)</h2>
        {program.verified ? (
          <blockquote className="quote">{program.sourceQuote}</blockquote>
        ) : (
          <p style={{ margin: 0, fontSize: 14.5, color: "var(--warn)" }}>
            저희가 이 제도의 자격 조건 원문을 아직 확인하지 못했습니다. 아래 링크에서 직접
            확인해 주세요.
          </p>
        )}
      </section>

      {/* 신청 사이트 링크 */}
      <a
        href={program.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn"
        style={{ alignSelf: "stretch" }}
      >
        {program.sourceLabel} 열기 ↗
      </a>

      <p className="disclaimer">
        이 결과는 참고용입니다. 신청 자격은 담당 기관이 최종 판단하니,{" "}
        <strong>반드시 위 원문과 담당 기관에서 확인해 주세요.</strong> 모자는 신청을 대행하지
        않습니다.
      </p>

      <Link href="/result" className="link-back">
        ← 제도 목록으로
      </Link>
    </div>
  );
}
