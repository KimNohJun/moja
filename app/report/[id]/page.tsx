import Link from "next/link";
import { notFound } from "next/navigation";
import { decodeReportId } from "../../lib/reportCodec";
import { lookupMarketData } from "../../lib/mockMarket";
import { evaluateJeonseRatio, REGISTRY_CHECKPOINTS, type RiskLevel } from "../../lib/risk";

const LEVEL_STYLE: Record<RiskLevel, { bg: string; color: string }> = {
  safe: { bg: "var(--safe-bg)", color: "var(--safe)" },
  warning: { bg: "var(--warn-bg)", color: "var(--warn)" },
  danger: { bg: "var(--danger-bg)", color: "var(--danger)" },
};

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const input = decodeReportId(id);

  if (!input) {
    notFound();
  }

  const { address, deposit, marketPrice } = input;

  let market;
  try {
    market = await lookupMarketData(address);
  } catch {
    market = { found: false, estimatedMarketPrice: null, nearbyTrades: [] };
  }

  const risk = evaluateJeonseRatio(deposit, marketPrice);
  const style = LEVEL_STYLE[risk.level];
  const shareUrl = `/report/${id}`;

  return (
    <main className="page">
      <div className="stack" style={{ gap: 24 }}>
        <Link href="/diagnose" style={{ color: "var(--muted)", fontSize: 13, textDecoration: "none" }}>
          ← 다시 진단하기
        </Link>

        <section className="card stack">
          <span className="badge" style={{ background: style.bg, color: style.color }}>
            {risk.label}
          </span>
          <h1 style={{ margin: 0, fontSize: 28 }}>전세가율 {risk.ratio.toFixed(1)}%</h1>
          <p style={{ margin: 0, color: "var(--muted)" }}>{address}</p>
          <p style={{ margin: 0 }}>{risk.message}</p>

          <div style={{ display: "flex", gap: 24, marginTop: 8 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>보증금</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{deposit.toLocaleString()}만원</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>입력한 매매시세</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{marketPrice.toLocaleString()}만원</div>
            </div>
          </div>
        </section>

        <section className="card stack">
          <h2 style={{ margin: 0, fontSize: 16 }}>인근 실거래가 비교 (국토교통부 Open API 연동 예정 · 현재는 mock 데이터)</h2>
          {!market.found || market.nearbyTrades.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 14 }}>
              인근 실거래가 정보를 불러오지 못했습니다. 안심전세앱 또는 국토부 실거래가 공개시스템에서
              직접 확인해보세요.
            </p>
          ) : (
            <div className="stack" style={{ gap: 8 }}>
              {market.estimatedMarketPrice && (
                <p style={{ fontSize: 14, color: "var(--muted)" }}>
                  이 지역 추정 시세: 약 {market.estimatedMarketPrice.toLocaleString()}만원
                </p>
              )}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                    <th style={{ padding: "6px 0" }}>위치</th>
                    <th>유형</th>
                    <th>거래가</th>
                    <th>거래월</th>
                  </tr>
                </thead>
                <tbody>
                  {market.nearbyTrades.map((trade, i) => (
                    <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                      <td style={{ padding: "8px 0" }}>{trade.address}</td>
                      <td>{trade.buildingType}</td>
                      <td>{trade.price.toLocaleString()}만원</td>
                      <td>{trade.tradedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card stack">
          <h2 style={{ margin: 0, fontSize: 16 }}>등기부등본 열람 체크포인트</h2>
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
            직접 발급을 대신하지는 않지만, 등기부등본에서 무엇을 봐야 하는지 안내합니다.
          </p>
          <div className="stack" style={{ gap: 12 }}>
            {REGISTRY_CHECKPOINTS.map((cp) => (
              <div key={cp.title} style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{cp.title}</div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>{cp.detail}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card stack">
          <h2 style={{ margin: 0, fontSize: 16 }}>이 리포트 공유하기</h2>
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
            아래 링크를 저장하면 언제든 같은 결과를 다시 볼 수 있어요.
          </p>
          <code style={{ fontSize: 12, background: "#f3f4f6", padding: "8px 10px", borderRadius: 8, wordBreak: "break-all" }}>
            {shareUrl}
          </code>
        </section>
      </div>
    </main>
  );
}
