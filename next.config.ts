import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages 용 완전 정적 export → out/ 에 HTML/CSS/JS 생성
  output: "export",

  // 프로젝트 사이트(username.github.io/<repo>)면 "/<repo>" 를 주입 (deploy.yml 이 자동 설정)
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,

  // /publications/ → publications/index.html 형태로 출력 (Pages 정적 서빙과 궁합)
  trailingSlash: true,

  // 정적 export 에는 이미지 최적화 서버가 없음
  images: { unoptimized: true },
};

export default nextConfig;
