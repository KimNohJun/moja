"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AUDIENCE_LABEL,
  REGIONS,
  TOPIC_LABEL,
  TOPICS,
  type Audience,
  type Topic,
} from "../lib/programs";
import { loadProfile, saveProfile } from "../lib/profileStore";

export default function FilterForm() {
  const router = useRouter();
  const [audience, setAudience] = useState<Audience>("prepared");
  const [birthMonth, setBirthMonth] = useState("");
  const [exitMonth, setExitMonth] = useState("");
  const [region, setRegion] = useState("전국");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 이전에 입력한 값이 있으면 다시 채워준다 (localStorage)
  useEffect(() => {
    const saved = loadProfile();
    if (!saved) return;
    setAudience(saved.audience);
    setBirthMonth(saved.birthMonth);
    setExitMonth(saved.exitMonth);
    setRegion(saved.region);
    setTopics(saved.topics);
  }, []);

  function toggleTopic(topic: Topic) {
    setTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!birthMonth) {
      setError("태어난 연월을 선택해주세요.");
      return;
    }
    if (!exitMonth) {
      setError(
        audience === "protected"
          ? "보호가 끝날 예정인 연월을 선택해주세요. 정확히 모르면 대략적인 시기로 두어도 괜찮아요."
          : "보호가 끝난 연월을 선택해주세요.",
      );
      return;
    }

    const birthYear = Number(birthMonth.slice(0, 4));
    if (birthYear < 1960 || birthYear > new Date().getFullYear()) {
      setError("태어난 연월을 다시 확인해주세요.");
      return;
    }

    saveProfile({ audience, birthMonth, exitMonth, region, topics });
    router.push("/result");
  }

  return (
    <form className="stack" style={{ gap: 20 }} onSubmit={handleSubmit}>
      <div className="card stack">
        <div className="field">
          <label>지금 어떤 상황인가요?</label>
          <div className="chips">
            {(["protected", "prepared"] as Audience[]).map((a) => (
              <button
                key={a}
                type="button"
                className="chip"
                aria-pressed={audience === a}
                onClick={() => setAudience(a)}
              >
                {AUDIENCE_LABEL[a]}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="birthMonth">태어난 연월</label>
          <input
            id="birthMonth"
            type="month"
            value={birthMonth}
            max={`${new Date().getFullYear()}-12`}
            onChange={(e) => setBirthMonth(e.target.value)}
          />
          <small>날짜까지는 묻지 않아요. 나이 조건을 확인하는 데만 씁니다.</small>
        </div>

        <div className="field">
          <label htmlFor="exitMonth">
            {audience === "protected" ? "보호가 끝날 예정인 연월" : "보호가 끝난 연월"}
          </label>
          <input
            id="exitMonth"
            type="month"
            value={exitMonth}
            onChange={(e) => setExitMonth(e.target.value)}
          />
          <small>
            대부분의 제도가 이 시점을 기준으로 신청 기간을 정해요. 가장 중요한 항목입니다.
          </small>
        </div>

        <div className="field">
          <label htmlFor="region">사는 지역</label>
          <select id="region" value={region} onChange={(e) => setRegion(e.target.value)}>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <small>지자체마다 지원 금액이 다른 제도가 있어요.</small>
        </div>
      </div>

      <div className="card stack">
        <div className="field">
          <label>어떤 게 궁금하세요? (여러 개 선택 가능)</label>
          <div className="chips">
            {TOPICS.map((t) => (
              <button
                key={t}
                type="button"
                className="chip"
                aria-pressed={topics.includes(t)}
                onClick={() => toggleTopic(t)}
              >
                {TOPIC_LABEL[t]}
              </button>
            ))}
          </div>
          <small>선택하지 않으면 모든 주제를 보여드려요.</small>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <button type="submit" className="btn">
        내게 맞는 제도 보기
      </button>

      <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
        입력한 내용은 이 기기(브라우저)에만 저장되고 서버로 전송되지 않습니다. 주소창에도
        남지 않습니다.
      </p>
    </form>
  );
}
