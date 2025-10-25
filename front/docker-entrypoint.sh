#!/bin/sh

# Cloud Run의 PORT 환경 변수를 사용하여 nginx 설정 업데이트
if [ -n "$PORT" ]; then
    sed -i "s/listen 8080;/listen $PORT;/g" /etc/nginx/conf.d/default.conf
fi

# nginx 시작
nginx -g 'daemon off;'

