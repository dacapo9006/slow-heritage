/**
 * 목업 데이터 — API 활성화 전 UI 테스트용
 * API 연결 후 삭제 예정
 */

export const MOCK_PLACES = [
  {
    contentid: '126508',
    contenttypeid: '12',
    title: '경복궁',
    addr1: '서울특별시 종로구 사직로 161',
    firstimage: 'https://tong.visitkorea.or.kr/cms/resource/49/2947649_image2_1.jpg',
    mapx: '126.9769930325',
    mapy: '37.5788222356',
    tel: '02-3700-3900',
    overview: '경복궁은 1395년(태조 4년)에 창건된 조선 왕조의 법궁(정궁)입니다. 근정전, 경회루, 향원정 등 볼거리가 풍부하며, 수문장 교대의식도 관람할 수 있습니다.',
    childTip: '유모차 대여 가능, 수문장 교대의식 관람 추천 (10:00, 14:00)',
    crowdLevel: 'high',
    altSpots: ['창경궁', '종묘'],
  },
  {
    contentid: '126535',
    contenttypeid: '12',
    title: '창경궁',
    addr1: '서울특별시 종로구 창경궁로 185',
    firstimage: 'https://tong.visitkorea.or.kr/cms/resource/06/1567006_image2_1.jpg',
    mapx: '126.9951580780',
    mapy: '37.5787220537',
    tel: '02-762-4868',
    overview: '창경궁은 성종 14년(1483)에 세 분의 대비를 모시기 위해 건립된 궁궐입니다. 경복궁보다 한적하고 아이들이 뛰놀기 좋은 넓은 잔디밭이 있습니다.',
    childTip: '넓은 잔디밭에서 아이가 자유롭게 놀 수 있음, 대온실 관람 추천',
    crowdLevel: 'low',
    altSpots: [],
  },
  {
    contentid: '126537',
    contenttypeid: '12',
    title: '종묘',
    addr1: '서울특별시 종로구 종로 157',
    firstimage: 'https://tong.visitkorea.or.kr/cms/resource/23/2678623_image2_1.jpg',
    mapx: '126.9941790000',
    mapy: '37.5743360000',
    tel: '02-765-0195',
    overview: '종묘는 조선 왕조 역대 왕과 왕비의 신위를 모신 유교 사당으로, 유네스코 세계유산입니다. 고요하고 장엄한 분위기에서 역사를 느낄 수 있습니다.',
    childTip: '해설사 동반 관람 권장 (매시 정각), 산책로가 평탄하여 유모차 이동 가능',
    crowdLevel: 'low',
    altSpots: [],
  },
  {
    contentid: '264570',
    contenttypeid: '14',
    title: '국립고궁박물관',
    addr1: '서울특별시 종로구 효자로 12',
    firstimage: 'https://tong.visitkorea.or.kr/cms/resource/86/2695086_image2_1.jpg',
    mapx: '126.9748000000',
    mapy: '37.5764000000',
    tel: '02-3701-7500',
    overview: '국립고궁박물관은 조선 왕실의 문화와 역사를 소개하는 박물관입니다. 무료 입장이며 아이 눈높이 전시가 잘 되어 있습니다.',
    childTip: '무료 입장, 아이용 오디오 가이드 제공, 왕실 체험 프로그램 운영',
    crowdLevel: 'medium',
    altSpots: [],
  },
  {
    contentid: '789012',
    contenttypeid: '12',
    title: '수원화성',
    addr1: '경기도 수원시 팔달구 정조로 825',
    firstimage: 'https://tong.visitkorea.or.kr/cms/resource/30/2026330_image2_1.jpg',
    mapx: '127.0131000000',
    mapy: '37.2867000000',
    tel: '031-228-4480',
    overview: '수원화성은 정조대왕이 아버지 사도세자를 기리며 축조한 성곽으로, 유네스코 세계유산입니다. 성곽길 산책과 화성열차 탑승이 인기입니다.',
    childTip: '화성열차 탑승 가능 (유모차 접근 편리), 성곽 일부 구간 평탄',
    crowdLevel: 'medium',
    altSpots: ['화성행궁'],
  },
  {
    contentid: '345678',
    contenttypeid: '12',
    title: '불국사',
    addr1: '경상북도 경주시 불국로 385',
    firstimage: 'https://tong.visitkorea.or.kr/cms/resource/33/2678633_image2_1.jpg',
    mapx: '129.3323000000',
    mapy: '35.7897000000',
    tel: '054-746-9913',
    overview: '불국사는 신라 시대 751년 김대성이 창건한 사찰로, 석가탑과 다보탑이 유명합니다. 유네스코 세계유산입니다.',
    childTip: '계단이 많으니 유아는 업고 이동 권장, 돌담길 산책은 평탄',
    crowdLevel: 'medium',
    altSpots: ['석굴암'],
  },
];

/** 혼잡도 레벨별 표시 */
export const CROWD_LABELS = {
  low: { text: '한적', color: '#2d5016', bg: '#e8f5e0' },
  medium: { text: '보통', color: '#8b6914', bg: '#fef3c7' },
  high: { text: '혼잡', color: '#991b1b', bg: '#fee2e2' },
};

/** 지역 코드 → 지역명 매핑 */
export const AREA_NAMES = {
  '1': '서울', '2': '인천', '3': '대전', '4': '대구',
  '5': '광주', '6': '부산', '7': '울산', '8': '세종',
  '31': '경기', '32': '강원', '33': '충북', '34': '충남',
  '35': '경북', '36': '경남', '37': '전북', '38': '전남', '39': '제주',
};
