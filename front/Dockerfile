# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
RUN npm ci

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드된 파일 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# Cloud Run은 PORT 환경 변수를 제공하므로 이를 사용
EXPOSE 8080

# Cloud Run을 위한 nginx 시작 스크립트
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]

