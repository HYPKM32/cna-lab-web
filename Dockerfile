# ---- 정적 사이트 데모용: next build(export) → nginx 서빙 ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# 데모는 같은 오리진(/uploads 마운트)에서 PDF 서빙 → View 버튼 활성화
ARG NEXT_PUBLIC_PDF_BASE_URL=/
ENV NEXT_PUBLIC_PDF_BASE_URL=${NEXT_PUBLIC_PDF_BASE_URL}
# basePath 검증용 (기본 데모는 루트 서빙이라 비움)
ARG NEXT_PUBLIC_BASE_PATH=
ENV NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH}
RUN npm run build

FROM nginx:alpine
COPY nginx.demo.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html
