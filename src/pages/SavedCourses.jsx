import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function SavedCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('slow_heritage_courses') || '[]');
      setCourses(saved);
    } catch { setCourses([]); }
  }, []);

  const deleteCourse = (id) => {
    const updated = courses.filter(c => c.id !== id);
    setCourses(updated);
    localStorage.setItem('slow_heritage_courses', JSON.stringify(updated));
  };

  return (
    <div className="saved-courses">
      <button className="btn-back" onClick={() => navigate(-1)}>← 뒤로</button>
      <h2>📋 저장된 코스</h2>

      {courses.length === 0 ? (
        <div className="empty-saved">
          <p>아직 저장된 코스가 없습니다.</p>
          <Link to="/planner" className="btn-primary" style={{ display: 'inline-block', width: 'auto', padding: '12px 24px', marginTop: '1rem' }}>
            코스 만들러 가기
          </Link>
        </div>
      ) : (
        <div className="saved-list">
          {courses.map(course => (
            <div key={course.id} className="saved-card">
              <div className="saved-header">
                <div>
                  <strong>{course.region} {course.courseType === 'full' ? '하루' : '반나절'} 코스</strong>
                  <span className="saved-date">{course.date}</span>
                </div>
                <button className="saved-delete" onClick={() => deleteCourse(course.id)} title="삭제">✕</button>
              </div>
              <div className="saved-meta">
                {course.interests?.length > 0 && <span>{course.interests.join(', ')}</span>}
                <span>{course.totalDist}km · 약 {course.totalTime}분</span>
              </div>
              <div className="saved-places">
                {course.places?.map((p, i) => (
                  <span key={i} className="saved-place">{i + 1}. {p.title}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
