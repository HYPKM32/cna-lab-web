// 정적 배포 경로 헬퍼
// - GitHub Pages 프로젝트 사이트(username.github.io/repo)는 basePath 프리픽스가 필요
// - PDF 원문은 용량(수백 MB) 때문에 저장소에 번들하지 않음:
//   NEXT_PUBLIC_PDF_BASE_URL 이 설정된 경우에만 View 버튼 노출
//   ("/" = 같은 오리진에서 서빙, 그 외 = 외부 파일 호스트 오리진)

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** public/ 하위 정적 파일 경로에 basePath 프리픽스를 붙인다 */
export function asset(path: string) {
  return `${BASE}${path}`;
}

const PDF_RAW = process.env.NEXT_PUBLIC_PDF_BASE_URL ?? "";

/** PDF 뷰어 활성화 여부 (미설정이면 View 버튼 숨김) */
export const PDF_ENABLED = PDF_RAW !== "";

/** storage_key('file/...') → 실제 PDF URL */
export function pdfUrl(storageKey: string) {
  const base = PDF_RAW === "/" ? BASE : PDF_RAW.replace(/\/+$/, "");
  return `${base}/uploads/${storageKey}`;
}
