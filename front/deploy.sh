#!/bin/bash

# Cloud Run 배포 스크립트
# 사용법: ./deploy.sh [PROJECT_ID] [REGION]

set -e

# 기본 값 설정 (gcloud 설정에서 프로젝트 ID 가져오기)
DEFAULT_PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")
PROJECT_ID=${1:-$DEFAULT_PROJECT}
REGION=${2:-"asia-northeast3"}
SERVICE_NAME="ai-interview-frontend"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

# 프로젝트 ID 검증
if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "your-project-id" ]; then
  echo "❌ 에러: 프로젝트 ID가 설정되지 않았습니다."
  echo "사용법: ./deploy.sh [PROJECT_ID] [REGION]"
  echo "또는 gcloud config set project YOUR_PROJECT_ID 로 기본 프로젝트를 설정하세요."
  exit 1
fi

echo "🚀 Cloud Run 배포 시작..."
echo "프로젝트: $PROJECT_ID"
echo "리전: $REGION"
echo "서비스명: $SERVICE_NAME"
echo ""

# 1. Docker 이미지 빌드 (amd64 플랫폼으로)
echo "📦 Docker 이미지 빌드 중..."
docker build --platform linux/amd64 -t $IMAGE_NAME:latest .

# 2. Docker 이미지를 Google Container Registry에 푸시
echo "⬆️  이미지를 Container Registry에 푸시 중..."
docker push $IMAGE_NAME:latest

# 3. Cloud Run에 배포
echo "🌐 Cloud Run에 배포 중..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME:latest \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0 \
  --port 8080

echo ""
echo "✅ 배포가 완료되었습니다!"
echo ""
echo "서비스 URL 확인:"
gcloud run services describe $SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --format 'value(status.url)'

