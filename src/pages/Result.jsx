import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { areaBasedList, searchKeyword, locationBasedList } from '../api/tourApi';

const AREA_NAMES = {
  '1': 'ìì¸', '2': 'ì¸ì²', '3': 'ëì ', '4': 'ëêµ¬', '5': 'ê´ì£¼',
  '6': 'ë¶ì°', '7': 'ì¸ì°', '8': 'ì¸ì¢', '31': 'ê²½ê¸°', '32': 'ê°ì',
  '33': 'ì¶©ë¶', '34': 'ì¶©ë¨', '35': 'ê²½ë¶', '36': 'ê²½ë¨', '37': 'ì ë¶',
  '38': 'ì ë¨', '39': 'ì ì£¼',
};

const AGE_LABELS = {
  baby: '0~2ì¸ ì ì', toddler: '3~5È¸ ê±±ìë§',
  child: '6~9ì¸ ì´ë± ì ', upper: '10~13ì¸ ì´ë± ê³ ',
};

const AGE_CONFIG = {
  baby:    { maxStops: 2, maxWalk: 15, tip: 'ì ëª¨ì°¨ ì´ë ê°ë¥ ì¬ë¶ë¥¼ íì¸íì¸ì. ì§§ì ì½ì¤ê° ì¢ìµëë¤.' },
  toddler: { maxStops: 3, maxWalk: 25, tip: '30ë¶ ì´ì´ëë³´ ê±´ë¦¬ë¥¼ ì¶ì²í©ëë¤. ì´ ê³³ì´ ìëì§ íì¸íì¸ì.' },
  child:   { maxStops: 4, maxWalk: 40, tip: 'ì­ì¬ í´ì¢ì ë¯¸ìì¼ë¡ ìì´ì í¤ë¯¸ë¥¼ ì ì§íì¸ì!' },
  upper:   { maxStops: 5, maxWalk: 60, tip: 'ê¹ì´ ìë ì­ì¬ í´ì¤ì í¨ê» ì½ì´ë³´ë©´ ì¢ìµëë¤.' },
};

const INTEREST_KEYWORDS = {
  'ê¶ê¶': 'ê¶µê©P', 'ì¬ì°°': 'ì¬ì°°', 'ì±ê³½': 'ì±æ¤ô', 'ê³ ë¶': 'ê³ ë¶',
  'ììÂ·í¥êµ': 'ìì', 'ë°ë¬¼ê´': 'ë°ë®¼ê´', 'ì íµë§ì': 'ì íµë§ì', 'ê·¼íëì­ì¬': 'ê·¼ëì­ì¬',
};

/** ë ì¢í ì¬ì´ ê±°ë¦¬(km) */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

/** ê±´ë¦¬(km) â ëë³´ ìê°(ë¶) ì´ë¦¬ì´ ê¸°ì¢ /
function walkMinutes(km) {
  return Math.round(km / 2.5 * 60); // ì´ë¦°ì´ ë³´íìë 2.5km/h
}

/** ê°ëí greedy nearest-neighbor ê²½ë¡ ì ë ¬ */
function sortByRoute(places) {
  if (places.length <= 1) return places;
  const result = [places[0]];
  const remaining = [...places.slice(1)];
  while (remaining.length > 0) {
    const last = result[result.length - 1];
    let minDist = Infinity, minIdx = 0;
    remaining.forEach((p, i) => {
      const d = haversine(
        parseFloat(last.mapy), parseFloat(last.mapx),
        parseFloat(p.mapy), parseFloat(p.mapx)
      );
      if (d < minDist) { minDist = d; minIdx = i; }
    });
    result.push(remaining.splice(minIdx, 1)[0]);
  }
  return result;
}

export default function Result() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const region = searchParams.get('region');
  const childAge = searchParams.get('childAge') || 'child';
  const courseType = searchParams.get('courseType') || 'half';
  const interests = searchParams.get('interests')?.split(',').filter(Boolean) || [];

  const ageConf = AGE_CONFIG[childAge] || AGE_CONFIG.child;
  const maxStops = courseType === 'full'
    ? Math.min(ageConf.maxStops + 2, 6)
    : Math.min(ageConf.maxStops, 4);

  useEffect(() => {
    async function buildCourse() {
      setLoading(true);
      setError(null);
      try {
        let items = [];

        // 1) ê´ì¬ë¶ì¼ í¤ìë ê²ì
        if (interests.length > 0) {
          const searches = interests.map(i =>
            searchKeyword(INTEREST_KEYWORDS[i] || i, '12', region, 1, 15)
          );
          const results = await Promise.all(searches);
          const seen = new Set();
          for (const arr of results) {
            for (const item of arr) {
              if (!seen.has(item.contentid)) { seen.add(item.contentid); items.push(item); }
            }
          }
        }

        // 2) ì§ì­ ê¸°ë° ê´ê´ì§ ë³´ì
        if (items.length < maxStops + 5) {
          const areaItems = await areaBasedList(region, '', '12', 1, 20);
          const seen = new Set(items.map(i => i.contentid));
          for (const item of areaItems) {
            if (!seen.has(item.contentid)) { seen.add(item.contentid); items.push(item); }
          }
        }

        // 3) ë¬¸íìì¤(14) ì¶ê°
        const culture = await areaBasedList(region, '', '14', 1, 10);
        const seen3 = new Set(items.map(i => i.contentid));
        for (const item of culture) {
          if (!seen3.has(item.contentid)) items.push(item);
        }

        // 4) ì¢í + ì´ë¯¸ì§ ìë ê²ë§ íí°
        items = items.filter(i => i.firstimage && i.mapx && i.mapy);

        // 5) ê²½ë¡ ì ë ¬ í maxStopsë§í¼ ìë¥´ê¸°
        if (items.length > maxStops) {
          items = sortByRoute(items).slice(0, maxStops);
        } else {
          items = sortByRoute(items);
        }

        setCourse(items);
      } catch (err) {
        console.error('ì½ì¤ ìì± ì¤í¨:', err);
        setError('ì½ì¤ë¥¼ ìì±íë ë° ì¤í¨íìµëë¤. ë¤ì ìëí´ì£¼ì¸ì.');
      } finally {
        setLoading(false);
      }
    }
    if (region) buildCourse();
  }, [region, childAge, courseType, interests.join(',')]);

  // ì½ì¤ ì´ ê±°ë¦¬/ìê° ê³ì°
  let totalDist = 0;
  const segments = [];
  for (let i = 1; i < course.length; i++) {
    const d = haversine(
      parseFloat(course[i-1].mapy), parseFloat(course[i-1].mapx),
      parseFloat(course[i].mapy), parseFloat(course[i].mapx)
    );
    totalDist += d;
    segments.push({ dist: d, walk: walkMinutes(d) });
  }
  const totalWalk = segments.reduce((s, seg) => s + seg.walk, 0);
  const totalTime = totalWalk + course.length * 30; // ë°©ë¬¸ì§ë¹ 30ë¶ ì²´ë¥

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>AIê° ë§ì¶¤ ì½ì¤ë¥¼ ë§ë¤ê³  ììµëë¤...</p>
        <p className="loading-sub">
          {childAge === 'baby' ? 'ì ëª¨ì°¨ ê²½ë¡ë¥¼ íì¸íë ì¤' :
           childAge === 'toddler' ? 'ì§§ì ê±°ë¦¬ ìì£¼ë¡ ì ë³ ì¤' :
           'ì­ì¬ ëªìë¥¼ ì°ê²°íë ì¤'}
        </p>
      </div>
    );
  }

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="result">
      <button className="btn-back" onClick={() => navigate(-1)}>â ë¤ì ì¤ì </button>

      <h2>{courseType === 'full' ? 'íë£¨' : 'ë°ëì '} ì­ì¬ì¬í ì½ì¤</h2>
      <p className="result-meta">
        {AREA_NAMES[region]} Â· {AGE_LABELS[childAge]}
        {interests.length > 0 && ` Â· ${interests.join(', ')}`}
      </p>

      {/* ì½ì¤ ìì½ */}
      <div className="course-summary">
        <div className="summary-item">
          <span className="summary-num">{course.length}</span>
          <span className="summary-label">ë°©ë¬¸ì§</span>
        </div>
        <div className="summary-item">
          <span className="summary-num">{totalDist < 1 ? `${Math.round(totalDist*1000)}m` : `${totalDist.toFixed(1)}km`}</span>
          <span className="summary-label">ì´ ê±°ë¦¬</span>
        </div>
        <div className="summary-item">
          <span className="summary-num">{totalTime < 60 ? `${totalTime}ë¶` : `${Math.floor(totalTime/60)}ìê° ${totalTime%60}ë¶`}</span>
          <span className="summary-label">ìì ìì</span>
        </div>
      </div>

      {/* ì°ë ¹ë³ í */}
      <div className="result-tip">
        <span className="tip-icon">ð¡</span>
        <span>{ageConf.tip}</span>
      </div>

      {course.length === 0 ? (
        <p className="no-result">ì¡°ê±´ì ë§ë ê´ê´ì§ë¥¼ ì°¾ì§ ëª»íìµëë¤. ë¤ë¥¸ ì§ì­ì´ë ê´ì¬ë¶ì¼ë¥¼ ì íí´ë³´ì¸ì.</p>
      ) : (
        <div className="course-timeline">
          {course.map((place, idx) => (
            <div key={place.contentid} className="course-stop">
              {/* ì´ë êµ¬ê° íì (ì²« ë²ì§¸ ì ì¸) */}
              {idx > 0 && segments[idx-1] && (
                <div className="course-travel">
                  <div className="travel-line" />
                  <span className="travel-info">
                    ð¶ ëë³´ {segments[idx-1].walk}ë¶ ({segments[idx-1].dist < 1 ? `${Math.round(segments[idx-1].dist*1000)}m` : `${segments[idx-1].dist.toFixed(1)}km`})
                    {segments[idx-1].dist > 3 && ' Â· ð ì°¨ë ì´ë ì¶ì²'}
                  </span>
                </div>
              )}

              <Link
                to={`/detail/${place.contentid}?typeId=${place.contenttypeid}&childAge=${childAge}`}
                className="stop-card"
              >
                <div className="stop-number">{idx + 1}</div>
                {place.firstimage && (
                  <img src={place.firstimage} alt={place.title} className="stop-img" loading="lazy" />
                )}
                <div className="stop-info">
                  <h3>{place.title}</h3>
                  <p className="stop-addr">{place.addr1}</p>
                  <p className="stop-time">â± ì¶ì² ì²´ë¥ {childAge === 'baby' ? '20ë¶' : '30~40ë¶'}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      <p className="data-source">ì¶ì²: âíêµ­ê´ê´ê³µì¬</p>
    </div>
  );
}
