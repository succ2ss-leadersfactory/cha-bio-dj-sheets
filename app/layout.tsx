import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "업무관리 Decision Journey MVP",
  description: "교육생 모바일 앱과 강사용 PC 대시보드 디자인 MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
