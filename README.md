# 응급실 병원 추천 MVP (부산 수영구)

공공데이터포털 **전국 응급의료기관 정보 조회** API에서 부산광역시 수영구 응급실 실시간 가용 병상 정보를 가져와 브라우저에 카드로 표시합니다.

## 실행 방법

```bash
npm install
npm start
```

브라우저에서 http://localhost:3000 을 엽니다.

## 환경 변수

`.env.example`을 복사해 `.env`를 만들고 `DATA_GO_KR_SERVICE_KEY`에 [공공데이터포털](https://www.data.go.kr)에서 발급한 인증키를 넣습니다.

| 변수 | 설명 |
|------|------|
| `DATA_GO_KR_SERVICE_KEY` | API 인증키 |
| `EMERGENCY_API_URL` | API 엔드포인트 |
| `STAGE1` | 시도 (기본: 부산광역시) |
| `STAGE2` | 시군구 (기본: 수영구) |
| `PORT` | 서버 포트 (기본: 3000) |

## API 출처

- [국립중앙의료원_전국 응급의료기관 정보 조회 서비스](https://www.data.go.kr/data/15000563/openapi.do)
- 오퍼레이션: `getEmrrmRltmUsefulSckbdInfoInqire` (응급실 실시간 가용병상정보)
