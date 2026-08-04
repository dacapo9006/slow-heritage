# 슬로 헤리티지 (Slow Heritage)

아이와 걷는 한적한 역사여행 AI 플래너

## 서비스 URL
https://slow-heritage.dacapo9006.workers.dev

## 기술 스택
- React + Vite (SPA, HashRouter)
- Cloudflare Workers (프론트엔드 + API 프록시 통합 배포)
- 한국관광공사 TourAPI 4.0 (실시간 API 호출)
- Kakao Maps JavaScript SDK

## 주요 기능
1. **AI 맞춤 코스 추천**: 아이 연령(0~13세 4단계) × 지역 × 관심분야로 최적 코스 생성
2. **경로 최적화**: Haversine 거리 계산 + Greedy Nearest-Neighbor 알고리즘
3. **반나절/하루 코스**: 코스 유형별 방문지 수 자동 조절
4. **역사 퀴즈**: 관광지 키워드 기반 연령 맞춤 퀴즈 (궁궐, 성곽, 사찰, 박물관 등)
5. **스토리텔링**: 연령별 눈높이 역사 해설
6. **카카오맵 연동**: 관광지 위치 지도 표시
7. **모바일 반응형**: 모바일 최적화 UI

## 데이터 활용
- TourAPI 4.0 실시간 호출 (areaBasedList2, searchKeyword2, detailCommon2, detailIntro2)
- contentTypeId 12(관광지), 14(문화시설) 활용
- 좌표 기반 거리 계산 및 경로 정렬

## 프로젝트 구조
```
src/
├── api/tourApi.js      # TourAPI 연동 모듈
├── components/Layout.jsx # 공통 레이아웃
├── pages/
│   ├── Home.jsx        # 메인 페이지
│   ├── Planner.jsx     # 여행 설정 (나이/지역/코스/관심사)
│   ├── Result.jsx      # AI 코스 결과 (타임라인 UI)
│   └── Detail.jsx      # 상세 정보 (퀴즈/스토리텔링/지도)
├── styles/global.css   # 전역 스타일
└── App.jsx             # 라우터 설정
```

## 출처
출처: ⓒ한국관광공사

## 브랜드
On AI Tourism Lab™ (다카포/박희진)

2026 관광데이터 활용 공모전 웹·앱 구현 부문
