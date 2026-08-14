import Link from "next/link";
import FilterForm from "./FilterForm";

export default function FilterPage() {
  return (
    <main className="page">
      <div className="stack" style={{ gap: 24 }}>
        <Link href="/" className="link-back">
          ← 처음으로
        </Link>

        <header className="stack" style={{ gap: 8 }}>
          <h1 style={{ fontSize: 26, margin: 0 }}>내 상황을 알려주세요</h1>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 15 }}>
            이름과 연락처는 묻지 않습니다. 아래 네 가지만으로 제도를 골라드려요.
          </p>
        </header>

        <FilterForm />
      </div>
    </main>
  );
}
