// DB 없이 리포트를 "저장/공유"하기 위해, 입력값 자체를 URL-safe base64로 인코딩해 id로 사용한다.
// 실제 서비스에서는 이 id를 Supabase 등 DB의 row id로 교체하면 된다.

export interface DiagnoseInput {
  address: string;
  deposit: number; // 만원
  marketPrice: number; // 만원
}

export function encodeReportId(input: DiagnoseInput): string {
  const json = JSON.stringify(input);
  const base64 = Buffer.from(json, "utf-8").toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeReportId(id: string): DiagnoseInput | null {
  try {
    const base64 = id.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "===".slice((base64.length + 3) % 4);
    const json = Buffer.from(padded, "base64").toString("utf-8");
    const parsed = JSON.parse(json);
    if (
      typeof parsed.address === "string" &&
      typeof parsed.deposit === "number" &&
      typeof parsed.marketPrice === "number"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
