import Link from "next/link";
import ResultView from "./ResultView";

export default function ResultPage() {
  return (
    <main className="page">
      <div className="stack" style={{ gap: 24 }}>
        <Link href="/" className="link-back">
          ← 처음으로
        </Link>

        <header className="stack" style={{ gap: 8 }}>
          <h1 style={{ fontSize: 26, margin: 0 }}>내게 맞는 제도</h1>
        </header>

        <ResultView />
      </div>
    </main>
  );
}
