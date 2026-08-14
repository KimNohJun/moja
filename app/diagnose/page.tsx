import Link from "next/link";
import DiagnoseForm from "./DiagnoseForm";

export default function DiagnosePage() {
  return (
    <main className="page">
      <div className="stack" style={{ gap: 24 }}>
        <div className="stack" style={{ gap: 8 }}>
          <Link href="/" style={{ color: "var(--muted)", fontSize: 13, textDecoration: "none" }}>
            ← 홈으로
          </Link>
          <h1 style={{ margin: 0, fontSize: 24 }}>계약 전 위험 자가진단</h1>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            주소와 보증금, 매매시세를 입력하면 전세가율과 위험 등급을 바로 확인할 수 있어요.
          </p>
        </div>
        <DiagnoseForm />
      </div>
    </main>
  );
}
