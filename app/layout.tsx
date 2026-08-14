import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "모자 | 모아보자, 자립청년",
  description:
    "흩어진 자립지원 제도를 한곳에 모으고, 내 보호종료 시점을 기준으로 지금 신청할 수 있는 것과 남은 기간을 알려주는 서비스입니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
