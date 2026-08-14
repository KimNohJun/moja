"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { encodeReportId } from "../lib/reportCodec";

export default function DiagnoseForm() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [deposit, setDeposit] = useState("");
  const [marketPrice, setMarketPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!address.trim()) {
      setError("주소를 입력해주세요.");
      return;
    }
    const depositNum = Number(deposit);
    const marketNum = Number(marketPrice);

    if (!deposit || Number.isNaN(depositNum) || depositNum <= 0) {
      setError("보증금을 올바른 숫자로 입력해주세요.");
      return;
    }
    if (!marketPrice || Number.isNaN(marketNum) || marketNum <= 0) {
      setError("매매시세(또는 KB 시세 참고치)를 올바른 숫자로 입력해주세요.");
      return;
    }

    setSubmitting(true);
    const id = encodeReportId({ address: address.trim(), deposit: depositNum, marketPrice: marketNum });
    router.push(`/report/${id}`);
  }

  return (
    <form className="card stack" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="address">주소</label>
        <input
          id="address"
          placeholder="예: 서울시 강남구 역삼동 123-45"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <small>도로명주소 API 연동 자리 — MVP에서는 텍스트로 입력받아 인근 시세를 추정합니다.</small>
      </div>

      <div className="field">
        <label htmlFor="deposit">보증금 (만원)</label>
        <input
          id="deposit"
          type="number"
          inputMode="numeric"
          placeholder="예: 20000"
          value={deposit}
          onChange={(e) => setDeposit(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="marketPrice">매매시세 / KB 시세 참고치 (만원)</label>
        <input
          id="marketPrice"
          type="number"
          inputMode="numeric"
          placeholder="예: 25000"
          value={marketPrice}
          onChange={(e) => setMarketPrice(e.target.value)}
        />
        <small>모르신다면 다음 화면에서 인근 실거래가 추정치를 참고할 수 있어요.</small>
      </div>

      {error && <p className="error-text">{error}</p>}

      <button type="submit" className="btn" disabled={submitting}>
        {submitting ? "진단 중..." : "위험도 진단하기"}
      </button>
    </form>
  );
}
