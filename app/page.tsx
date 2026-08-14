import Link from "next/link";
import { PROGRAMS } from "./lib/programs";

export default function HomePage() {
  const verifiedCount = PROGRAMS.filter((p) => p.verified).length;

  return (
    <main className="page">
      <div className="stack" style={{ gap: 32 }}>
        <header className="stack" style={{ gap: 12 }}>
          <span className="badge" style={{ background: "#eef2ff", color: "#4338ca" }}>
            모아보자, 자립청년
          </span>
          <h1 style={{ fontSize: 34, margin: 0, letterSpacing: "-0.02em" }}>모자</h1>
          <p style={{ color: "var(--muted)", margin: 0, fontSize: 16 }}>
            자립지원 제도는 부처·지자체·기관에 흩어져 있고, 대부분 <strong>나이와 보호종료
            후 지난 기간</strong>에 따라 신청 기간이 끝납니다. 모자는 흩어진 제도를 모아
            지금 나에게 맞는 것만 골라 보여줍니다.
          </p>
        </header>

        <section className="card stack">
          <h2 style={{ margin: 0, fontSize: 18 }}>이렇게 알려드려요</h2>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.9 }}>
            <li>
              <strong>신청 대상이에요 / 아직은 아니에요 / 확인이 필요해요 / 기간이 지났어요</strong>{" "}
              네 가지로 나눠서 보여줍니다
            </li>
            <li>
              제도마다 <strong>남은 신청 기간</strong>을 알려주고, 보호가 끝나기 전이라면
              <strong> 앞으로 신청할 것</strong>을 미리 챙겨줍니다
            </li>
            <li>필요한 서류와 쉬운 말 요약, 그리고 <strong>신청 사이트 링크</strong>를 함께 줍니다</li>
            <li>판정 근거가 된 <strong>공고 원문 문장</strong>을 그대로 보여줍니다</li>
          </ul>
        </section>

        <section className="card stack" style={{ gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>물어보는 것은 네 가지뿐이에요</h2>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 14.5 }}>
            지금 보호 중인지 · 태어난 연월 · 보호가 끝난(끝날) 연월 · 사는 지역.
            <br />
            <strong>이름, 연락처, 생년월일은 묻지 않습니다.</strong> 입력한 내용은 이 기기
            안에만 저장되고 저희 서버로 전송되지 않습니다.
          </p>
        </section>

        <Link href="/filter" className="btn" style={{ alignSelf: "flex-start" }}>
          내게 맞는 제도 찾아보기 →
        </Link>

        <p className="disclaimer">
          현재 제도 {PROGRAMS.length}개를 담고 있고, 이 중 {verifiedCount}개는 저희가 조건
          원문을 직접 확인했습니다. 나머지는 <strong>&lsquo;확인이 필요해요&rsquo;</strong>로
          표시됩니다. 이 결과는 참고용이며, 최종 확인은 담당 기관과 공고 원문에서 해주세요.
        </p>
      </div>
    </main>
  );
}
