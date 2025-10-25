# Cloud Run 배포 가이드

이 문서는 AI Interview 프론트엔드를 Google Cloud Run에 배포하는 방법을 설명합니다.

## 사전 요구사항

1. **Google Cloud SDK 설치**
   ```bash
   # macOS
   brew install google-cloud-sdk
   
   # 또는 공식 설치 스크립트
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   ```

2. **Docker 설치**
   ```bash
   # macOS
   brew install --cask docker
   ```

3. **Google Cloud 프로젝트 설정**
   ```bash
   # gcloud 초기화
   gcloud init
   
   # 프로젝트 설정
   gcloud config set project YOUR_PROJECT_ID
   
   # 인증
   gcloud auth login
   gcloud auth configure-docker
   ```

4. **필요한 API 활성화**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

## 배포 방법

### 방법 1: 배포 스크립트 사용 (권장)

```bash
# 스크립트에 실행 권한 부여
chmod +x deploy.sh

# 배포 실행
./deploy.sh YOUR_PROJECT_ID asia-northeast3
```

### 방법 2: 수동 배포

```bash
# 1. Docker 이미지 빌드
docker build -t gcr.io/YOUR_PROJECT_ID/ai-interview-frontend:latest .

# 2. Container Registry에 푸시
docker push gcr.io/YOUR_PROJECT_ID/ai-interview-frontend:latest

# 3. Cloud Run에 배포
gcloud run deploy ai-interview-frontend \
  --image gcr.io/YOUR_PROJECT_ID/ai-interview-frontend:latest \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0 \
  --port 8080
```

### 방법 3: Cloud Build 사용 (CI/CD)

```bash
# Cloud Build로 빌드 및 배포
gcloud builds submit --config cloudbuild.yaml
```

## 로컬 테스트

배포 전 로컬에서 Docker 이미지를 테스트할 수 있습니다:

```bash
# 이미지 빌드
docker build -t ai-interview-frontend .

# 컨테이너 실행
docker run -p 8080:8080 ai-interview-frontend

# 브라우저에서 http://localhost:8080 접속
```

## 환경 변수 설정

백엔드 API URL 등의 환경 변수가 필요한 경우:

```bash
gcloud run deploy ai-interview-frontend \
  --image gcr.io/YOUR_PROJECT_ID/ai-interview-frontend:latest \
  --platform managed \
  --region asia-northeast3 \
  --set-env-vars "VITE_API_URL=https://your-backend-api.com"
```

## 모니터링

### 로그 확인

```bash
# 실시간 로그 스트리밍
gcloud run logs tail ai-interview-frontend --region asia-northeast3

# 최근 로그 조회
gcloud run logs read ai-interview-frontend --region asia-northeast3 --limit 50
```

### 서비스 상태 확인

```bash
gcloud run services describe ai-interview-frontend \
  --platform managed \
  --region asia-northeast3
```

## 비용 최적화

- **최소 인스턴스**: 0으로 설정하여 트래픽이 없을 때 비용 절감
- **메모리**: 512Mi로 충분 (필요시 조정)
- **CPU**: 1 코어로 충분
- **최대 인스턴스**: 10으로 제한하여 예상치 못한 비용 방지

## 보안 설정

### 인증이 필요한 경우

```bash
gcloud run deploy ai-interview-frontend \
  --image gcr.io/YOUR_PROJECT_ID/ai-interview-frontend:latest \
  --platform managed \
  --region asia-northeast3 \
  --no-allow-unauthenticated
```

### 커스텀 도메인 연결

```bash
gcloud run domain-mappings create \
  --service ai-interview-frontend \
  --domain your-domain.com \
  --region asia-northeast3
```

## 문제 해결

### 빌드 실패

- `docker build` 로그 확인
- 노드 버전 확인 (Node 20 사용)
- 의존성 설치 문제 확인

### 배포 실패

- IAM 권한 확인
- API 활성화 상태 확인
- 리소스 쿼터 확인

### 런타임 오류

- Cloud Run 로그 확인
- nginx 설정 확인
- 포트 설정 확인 (8080)

## 추가 리소스

- [Cloud Run 공식 문서](https://cloud.google.com/run/docs)
- [Container Registry 문서](https://cloud.google.com/container-registry/docs)
- [Cloud Build 문서](https://cloud.google.com/build/docs)

