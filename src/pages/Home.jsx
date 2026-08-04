import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <section className="hero-section">
        <h2>아이와 함께<br />한적한 역사여행을<br />떠나보세요</h2>
        <p className="hero-desc">
          AI가 아이의 나이와 관심사에 맞춰<br />
          붐비지 않는 역사 명소를 추천합니다
        </p>
        <button
          className="btn-primary"
          onClick={() => navigate('/planner')}
        >
          여행 코스 만들기
        </button>
      </section>

      <section className="features">
        <div className="feature-card">
          <span className="feature-icon">👶</span>
          <h3>아이 맞춤</h3>
          <p>나이별 눈높이 역사 해설과 유모차 이동 가능 경로</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🗺️</span>
          <h3>혼잡도 분산</h3>
          <p>인기 관광지 대신 주변 숨은 역사 명소 추천</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🚶</span>
          <h3>슬로 워킹</h3>
          <p>평탄한 경로, 쉼터·화장실 포함 느린 산책 코스</p>
        </div>
      </section>
    </div>
  );
}
